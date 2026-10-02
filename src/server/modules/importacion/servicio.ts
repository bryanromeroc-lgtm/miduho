/**
 * Importación de usuarios por CSV (INC1R-06, requerimiento §9). Solo ADMIN.
 *
 * Flujo sin estado en el servidor:
 * 1. `vistaPrevia` valida el archivo completo y reporta, por fila, errores,
 *    correos ya existentes (se omiten) y cuentas que se crearían. No escribe.
 * 2. `importar` repite la validación con el mismo contenido; si queda algún
 *    error no escribe nada. Si no, crea todas las cuentas en UNA transacción
 *    y devuelve el CSV de credenciales iniciales.
 *
 * Las contraseñas en texto plano solo viven en la respuesta de `importar`; en
 * BD queda únicamente el hash. No existe operación para volver a obtenerlas:
 * si se pierden, se restablecen (§4.3).
 *
 * El CSV nunca crea ADMIN: el tipo de importación fija el rol (DOCENTE o
 * ESTUDIANTE) y el archivo no tiene columna de rol.
 */
import type { PrismaClient } from "@/generated/prisma/client";
import { COSTO_BCRYPT, hashearContrasena } from "@/server/auth/contrasena";
import { csvCredenciales, generarContrasenaEstudiante, generarContrasenaTemporal } from "@/server/auth/credenciales";
import { esquemaNuevaCuenta } from "@/server/auth/esquemas";
import { ErrorDominio } from "@/server/errores";
import {
  ENCABEZADOS,
  ErrorCsv,
  MAX_BYTES_IMPORTACION,
  MAX_FILAS_IMPORTACION,
  leerCsv,
  normalizarEncabezado,
  type TipoImportacion,
} from "./csv";

export type EstadoFila = "NUEVA" | "DUPLICADA" | "ERROR";

export type FilaRevisada = {
  /** Número de línea en el archivo (la 1 es el encabezado). */
  linea: number;
  nombres: string;
  apellidos: string;
  correo: string;
  /** Grupo legible («2°-01 · 2026»), solo estudiantes. */
  grupo?: string;
  estado: EstadoFila;
  errores: string[];
};

export type Revision = {
  tipo: TipoImportacion;
  filas: FilaRevisada[];
  resumen: { total: number; nuevas: number; duplicadas: number; conError: number };
  /** Error del archivo completo (encabezados, vacío, límite). Si existe, `filas` puede venir vacío. */
  errorArchivo: string | null;
};

type FilaInterna = FilaRevisada & {
  datos?: { nombres: string; apellidos: string; correo: string };
  asociacion?: { grupoId: string; anioLectivoId: string };
};

const clave = (v: string) => v.trim().toLowerCase();

export function crearServicioImportacion(db: PrismaClient, opciones: { costo?: number } = {}) {
  const costo = opciones.costo ?? COSTO_BCRYPT;

  /** Índice «año|grado|grupo» → grupo, con referencias legibles en vez de IDs. */
  async function indiceGrupos() {
    const grupos = await db.grupo.findMany({
      select: {
        id: true,
        identificador: true,
        grado: { select: { nombre: true } },
        anioLectivo: { select: { id: true, anio: true, estado: true } },
      },
    });
    const mapa = new Map<string, (typeof grupos)[number]>();
    for (const g of grupos) mapa.set(`${g.anioLectivo.anio}|${clave(g.grado.nombre)}|${clave(g.identificador)}`, g);
    return mapa;
  }

  async function revisar(tipo: TipoImportacion, contenido: string): Promise<Revision & { internas: FilaInterna[] }> {
    const vacia = (errorArchivo: string) => ({
      tipo,
      filas: [],
      internas: [],
      resumen: { total: 0, nuevas: 0, duplicadas: 0, conError: 0 },
      errorArchivo,
    });

    if (Buffer.byteLength(contenido, "utf8") > MAX_BYTES_IMPORTACION) {
      return vacia(`El archivo supera el tamaño máximo (${MAX_BYTES_IMPORTACION / 1024} KB).`);
    }
    let tabla: string[][];
    try {
      tabla = leerCsv(contenido);
    } catch (e) {
      if (e instanceof ErrorCsv) return vacia(e.message);
      throw e;
    }
    if (tabla.length === 0) return vacia("El archivo está vacío.");

    const esperados = ENCABEZADOS[tipo];
    const recibidos = tabla[0].map(normalizarEncabezado);
    if (recibidos.length !== esperados.length || recibidos.some((h, i) => h !== esperados[i])) {
      const extra = tipo === "docentes" && recibidos.some((h) => h === "rol") ? " El CSV no asigna roles ni crea administradores." : "";
      return vacia(`Los encabezados deben ser exactamente: ${esperados.join(",")}. Usa la plantilla de ${tipo}.${extra}`);
    }
    const cuerpo = tabla.slice(1);
    if (cuerpo.length === 0) return vacia("El archivo no tiene filas de datos.");
    if (cuerpo.length > MAX_FILAS_IMPORTACION) {
      return vacia(`El archivo tiene ${cuerpo.length} filas; el máximo es ${MAX_FILAS_IMPORTACION} por importación.`);
    }

    const grupos = tipo === "estudiantes" ? await indiceGrupos() : null;
    const internas: FilaInterna[] = [];
    const vistos = new Map<string, number>();

    // Primera pasada: formato de cada fila y duplicados dentro del archivo.
    for (let i = 0; i < cuerpo.length; i++) {
      const celdas = cuerpo[i];
      const linea = i + 2;
      const [nombres = "", apellidos = "", correo = "", anio = "", grado = "", grupo = ""] = celdas.map((c) => c.trim());
      const f: FilaInterna = { linea, nombres, apellidos, correo: correo.toLowerCase(), estado: "NUEVA", errores: [] };
      if (celdas.length !== esperados.length) {
        f.errores.push(`Se esperaban ${esperados.length} columnas y hay ${celdas.length}.`);
      }
      const p = esquemaNuevaCuenta.safeParse({ nombres, apellidos, correo });
      if (p.success) {
        f.datos = p.data;
        f.correo = p.data.correo;
        const previa = vistos.get(p.data.correo);
        if (previa) f.errores.push(`El correo se repite en el archivo (línea ${previa}).`);
        else vistos.set(p.data.correo, linea);
      } else {
        f.errores.push(...p.error.issues.map((x) => x.message));
      }

      if (grupos) {
        f.grupo = anio || grado || grupo ? `${grado}-${grupo} · ${anio}` : undefined;
        if (!anio || !grado || !grupo) {
          f.errores.push("Escribe año, grado y grupo.");
        } else if (!/^\d{4}$/.test(anio)) {
          f.errores.push("El año debe tener cuatro dígitos, p. ej. 2026.");
        } else {
          const g = grupos.get(`${anio}|${clave(grado)}|${clave(grupo)}`);
          if (!g) f.errores.push(`No existe el grupo ${grado}-${grupo} en el año ${anio}.`);
          else if (g.anioLectivo.estado === "CERRADO") f.errores.push(`El año ${anio} está cerrado y es de solo lectura.`);
          else {
            f.asociacion = { grupoId: g.id, anioLectivoId: g.anioLectivo.id };
            f.grupo = `${g.grado.nombre}-${g.identificador} · ${g.anioLectivo.anio}`;
          }
        }
      }
      internas.push(f);
    }

    // Segunda pasada: correos que ya tienen cuenta se omiten (no bloquean).
    const correos = [...vistos.keys()];
    const existentes = new Set(
      correos.length
        ? (await db.usuario.findMany({ where: { correo: { in: correos } }, select: { correo: true } })).map((u) => u.correo)
        : [],
    );
    for (const f of internas) {
      if (f.errores.length > 0) f.estado = "ERROR";
      else if (existentes.has(f.correo)) f.estado = "DUPLICADA";
    }

    const contar = (e: EstadoFila) => internas.filter((f) => f.estado === e).length;
    const filas = internas.map((f) => ({
      linea: f.linea,
      nombres: f.nombres,
      apellidos: f.apellidos,
      correo: f.correo,
      ...(f.grupo !== undefined ? { grupo: f.grupo } : {}),
      estado: f.estado,
      errores: f.errores,
    }));
    return {
      tipo,
      filas,
      internas,
      resumen: { total: internas.length, nuevas: contar("NUEVA"), duplicadas: contar("DUPLICADA"), conError: contar("ERROR") },
      errorArchivo: null,
    };
  }

  return {
    /** Valida sin escribir. */
    async vistaPrevia(tipo: TipoImportacion, contenido: string): Promise<Revision> {
      const { internas: _omitidas, ...revision } = await revisar(tipo, contenido);
      void _omitidas;
      return revision;
    },

    /**
     * Todo o nada: con cualquier error (archivo o fila) lanza IMPORTACION_INVALIDA
     * con la revisión completa y no crea ninguna cuenta.
     */
    async importar(tipo: TipoImportacion, contenido: string) {
      const { internas, ...revision } = await revisar(tipo, contenido);
      if (revision.errorArchivo || revision.resumen.conError > 0) {
        throw new ErrorImportacion(revision);
      }
      const nuevas = internas.filter((f) => f.estado === "NUEVA");
      if (nuevas.length === 0) {
        throw new ErrorDominio("SIN_CUENTAS_NUEVAS", "Todas las filas corresponden a correos que ya tienen cuenta; no hay cuentas por crear.", 409);
      }

      const codigoRol = tipo === "docentes" ? "DOCENTE" : "ESTUDIANTE";
      const rol = await db.rol.findUnique({ where: { codigo: codigoRol } });
      if (!rol) throw new ErrorDominio("ROL_INEXISTENTE", `El rol ${codigoRol} no está sembrado.`, 500);

      // Contraseñas y hashes antes de abrir la transacción (bcrypt es lento).
      const preparadas = await Promise.all(
        nuevas.map(async (f) => {
          const contrasena = tipo === "docentes" ? generarContrasenaTemporal() : generarContrasenaEstudiante();
          return { f, contrasena, hash: await hashearContrasena(contrasena, costo) };
        }),
      );

      try {
        await db.$transaction(
          async (tx) => {
            for (const { f, hash } of preparadas) {
              await tx.usuario.create({
                data: {
                  ...f.datos!,
                  estado: "ACTIVO",
                  hashContrasena: hash,
                  debeCambiarContrasena: tipo === "docentes",
                  roles: { create: { rolId: rol.id } },
                  ...(f.asociacion ? { asociacionesGrupo: { create: f.asociacion } } : {}),
                },
              });
            }
          },
          { timeout: 60_000 },
        );
      } catch (e) {
        // Un correo registrado entre la validación y la escritura revierte todo.
        if ((e as { code?: string })?.code === "P2002") {
          throw new ErrorDominio("CORREO_DUPLICADO", "Otro usuario registró uno de los correos mientras importabas. No se creó ninguna cuenta; vuelve a revisar el archivo.", 409);
        }
        throw e;
      }

      const credenciales = preparadas
        .map(({ f, contrasena }) => ({ correo: f.correo, contrasena }))
        .sort((a, b) => a.correo.localeCompare(b.correo));
      return {
        creadas: credenciales.length,
        duplicadas: revision.filas.filter((f) => f.estado === "DUPLICADA").map((f) => ({ linea: f.linea, correo: f.correo })),
        csv: csvCredenciales(credenciales),
      };
    },
  };
}

/** Error 422 que transporta el reporte por fila para mostrarlo en la UI. */
export class ErrorImportacion extends ErrorDominio {
  constructor(public readonly revision: Revision) {
    super(
      "IMPORTACION_INVALIDA",
      revision.errorArchivo ?? `Hay ${revision.resumen.conError} fila(s) con errores. No se creó ninguna cuenta; corrige el archivo y vuelve a intentarlo.`,
      422,
    );
  }
}

export type ServicioImportacion = ReturnType<typeof crearServicioImportacion>;
