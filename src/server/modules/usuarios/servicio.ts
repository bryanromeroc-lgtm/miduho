/**
 * Administración individual de usuarios (INC1R-05, requerimiento §2, §4, §5,
 * §6 y §11). Solo ADMIN llega aquí: la autorización se verifica antes, en el
 * handler o en la página.
 *
 * Reglas que aplica:
 * - combinaciones válidas (ADMIN, DOCENTE, ESTUDIANTE, DOCENTE+ADMIN); una
 *   cuenta estudiantil y una del personal nunca se convierten entre sí;
 * - nunca se desactiva ni se retira el rol al último ADMIN activo;
 * - desactivar conserva el historial (no hay borrado físico) y los triggers SQL
 *   revocan las sesiones al cambiar estado o roles;
 * - un estudiante tiene un solo grupo activo por año; el traslado exige
 *   confirmación y cierra la asociación anterior en la misma transacción;
 * - un año CERRADO es de solo lectura.
 *
 * Recibe Prisma y el servicio de cuentas por parámetro para probarse contra
 * una SQLite temporal con las migraciones reales.
 */
import type { z } from "zod";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { etiquetaGrupo } from "@/lib/navegacion";
import { combinacionDe, esCambioDeCombinacionPermitido, rolesDeCombinacion, type Combinacion } from "@/lib/usuarios";
import type { ServicioCuentas } from "@/server/auth/cuentas";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import type * as E from "./esquemas";

type Entrada<T extends z.ZodType> = z.output<T>;
type Tx = Prisma.TransactionClient;
type CodigoRol = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

const ORDEN_ROLES: CodigoRol[] = ["ADMIN", "DOCENTE", "ESTUDIANTE"];

const seleccionGrupo = {
  id: true,
  identificador: true,
  grado: { select: { nombre: true, orden: true } },
  anioLectivo: { select: { id: true, anio: true, estado: true } },
} as const;

type GrupoSel = {
  id: string;
  identificador: string;
  grado: { nombre: string; orden: number };
  anioLectivo: { id: string; anio: number; estado: "ACTIVO" | "CERRADO" };
};

function grupoDto(g: GrupoSel) {
  return {
    id: g.id,
    etiqueta: etiquetaGrupo(g.grado.nombre, g.identificador),
    anio: g.anioLectivo.anio,
    anioLectivoId: g.anioLectivo.id,
    anioCerrado: g.anioLectivo.estado === "CERRADO",
  };
}

export type GrupoOpcion = ReturnType<typeof grupoDto>;

export function crearServicioUsuarios(db: PrismaClient, cuentas: ServicioCuentas, opciones: { ahora?: () => Date } = {}) {
  const ahora = opciones.ahora ?? (() => new Date());

  async function anioActivo(tx: Tx | PrismaClient = db) {
    return tx.anioLectivo.findFirst({ where: { estado: "ACTIVO" }, select: { id: true, anio: true } });
  }

  async function cargar(tx: Tx | PrismaClient, id: string) {
    const u = await tx.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        correo: true,
        estado: true,
        hashContrasena: true,
        roles: { select: { rol: { select: { codigo: true } } } },
      },
    });
    if (!u) throw noEncontrado("La cuenta");
    const roles = u.roles.map((r) => r.rol.codigo);
    return { ...u, roles, combinacion: combinacionDe(roles) };
  }

  /** Otros ADMIN activos distintos de `excepto`. Se llama dentro de la transacción de escritura. */
  async function otrosAdminsActivos(tx: Tx, excepto: string) {
    return tx.usuario.count({
      where: { id: { not: excepto }, estado: "ACTIVO", roles: { some: { rol: { codigo: "ADMIN" } } } },
    });
  }

  async function grupoEditable(tx: Tx | PrismaClient, grupoId: string) {
    const g = await tx.grupo.findUnique({ where: { id: grupoId }, select: seleccionGrupo });
    if (!g) throw noEncontrado("El grupo");
    if (g.anioLectivo.estado === "CERRADO") {
      throw conflicto("ANIO_CERRADO", "El año lectivo de ese grupo está cerrado y es de solo lectura.");
    }
    return g;
  }

  async function exigirCorreoLibre(tx: Tx, correo: string, excepto: string) {
    const otro = await tx.usuario.findUnique({ where: { correo }, select: { id: true } });
    if (otro && otro.id !== excepto) throw conflicto("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo.");
  }

  return {
    /** Listado con búsqueda (nombre/correo), filtros y paginación (§11). */
    async listar(f: Entrada<typeof E.filtroUsuarios>) {
      const anio = await anioActivo();
      const y: Prisma.UsuarioWhereInput[] = [];
      if (f.q) {
        const palabras = f.q.split(/\s+/).filter(Boolean).slice(0, 5);
        for (const p of palabras) {
          y.push({ OR: [{ nombres: { contains: p } }, { apellidos: { contains: p } }, { correo: { contains: p } }] });
        }
      }
      if (f.rol) y.push({ roles: { some: { rol: { codigo: f.rol } } } });
      if (f.estado) y.push({ estado: f.estado });
      if (f.grupoId) y.push({ asociacionesGrupo: { some: { grupoId: f.grupoId, finEn: null } } });
      const where: Prisma.UsuarioWhereInput = y.length ? { AND: y } : {};

      const [filas, total] = await Promise.all([
        db.usuario.findMany({
          where,
          orderBy: [{ apellidos: "asc" }, { nombres: "asc" }, { correo: "asc" }],
          skip: (f.page - 1) * f.pageSize,
          take: f.pageSize,
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            correo: true,
            estado: true,
            roles: { select: { rol: { select: { codigo: true } } } },
            asociacionesGrupo: {
              where: { finEn: null, ...(anio ? { anioLectivoId: anio.id } : { id: "-" }) },
              select: { grupo: { select: seleccionGrupo } },
              take: 1,
            },
          },
        }),
        db.usuario.count({ where }),
      ]);

      const data = filas.map((u) => {
        const roles = ORDEN_ROLES.filter((r) => u.roles.some((x) => x.rol.codigo === r));
        const g = u.asociacionesGrupo[0]?.grupo;
        return {
          id: u.id,
          nombres: u.nombres,
          apellidos: u.apellidos,
          correo: u.correo,
          estado: u.estado,
          roles,
          combinacion: combinacionDe(roles),
          grupo: g ? grupoDto(g) : null,
        };
      });
      return { data, total, anioActivo: anio };
    },

    /** Ficha para edición: identidad, roles, estado, grupo actual e historial de grupos. */
    async obtener(id: string) {
      const u = await db.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          correo: true,
          estado: true,
          debeCambiarContrasena: true,
          ultimoAcceso: true,
          creadoEn: true,
          actualizadoEn: true,
          roles: { select: { rol: { select: { codigo: true } } } },
          asociacionesGrupo: {
            orderBy: [{ inicioEn: "desc" }],
            select: { id: true, inicioEn: true, finEn: true, grupo: { select: seleccionGrupo } },
          },
          _count: { select: { asignaciones: { where: { estado: "ACTIVA" } }, gruposDirigidos: true } },
        },
      });
      if (!u) throw noEncontrado("La cuenta");
      const roles = ORDEN_ROLES.filter((r) => u.roles.some((x) => x.rol.codigo === r));
      const historial = u.asociacionesGrupo.map((a) => ({
        id: a.id,
        inicioEn: a.inicioEn,
        finEn: a.finEn,
        grupo: grupoDto(a.grupo),
      }));
      const anio = await anioActivo();
      const actual = anio ? historial.find((h) => h.finEn === null && h.grupo.anioLectivoId === anio.id) ?? null : null;
      return {
        id: u.id,
        nombres: u.nombres,
        apellidos: u.apellidos,
        correo: u.correo,
        estado: u.estado,
        debeCambiarContrasena: u.debeCambiarContrasena,
        ultimoAcceso: u.ultimoAcceso,
        creadoEn: u.creadoEn,
        actualizadoEn: u.actualizadoEn,
        roles,
        combinacion: combinacionDe(roles),
        grupoActual: actual?.grupo ?? null,
        historialGrupos: historial,
        asignacionesActivas: u._count.asignaciones,
        gruposDirigidos: u._count.gruposDirigidos,
        anioActivo: anio,
      };
    },

    /** Grupos de años no cerrados, para asignar o filtrar. */
    async gruposDisponibles(): Promise<GrupoOpcion[]> {
      const grupos = await db.grupo.findMany({
        where: { anioLectivo: { estado: "ACTIVO" } },
        select: seleccionGrupo,
      });
      return grupos
        .map(grupoDto)
        .sort((a, b) => b.anio - a.anio || a.etiqueta.localeCompare(b.etiqueta, "es", { numeric: true }));
    },

    /**
     * Alta individual. Devuelve la credencial inicial una sola vez:
     * DOCENTE (y DOCENTE+ADMIN) → temporal con cambio obligatorio;
     * ESTUDIANTE → legible; ADMIN puro → invitación de 24 h, sin contraseña.
     */
    async crear(d: Entrada<typeof E.crearUsuario>) {
      const datos = { nombres: d.nombres, apellidos: d.apellidos, correo: d.correo };
      switch (d.combinacion) {
        case "ADMIN": {
          const r = await cuentas.invitarAdmin(datos);
          return { id: r.id, correo: datos.correo, combinacion: d.combinacion, invitacionEnviada: true as const };
        }
        case "DOCENTE":
        case "DOCENTE_ADMIN": {
          const r = await cuentas.crearDocente(datos, { tambienAdmin: d.combinacion === "DOCENTE_ADMIN" });
          return { id: r.id, correo: r.correo, combinacion: d.combinacion, contrasena: r.contrasenaTemporal, temporal: true as const };
        }
        case "ESTUDIANTE": {
          const g = d.grupoId ? await grupoEditable(db, d.grupoId) : null;
          const r = await cuentas.crearEstudiante(datos, g ? { grupoId: g.id, anioLectivoId: g.anioLectivo.id } : undefined);
          return { id: r.id, correo: r.correo, combinacion: d.combinacion, contrasena: r.contrasena, temporal: false as const };
        }
      }
    },

    /** Identidad y correo. El correo sigue siendo único. */
    async actualizarIdentidad(id: string, d: Entrada<typeof E.actualizarIdentidad>) {
      return db.$transaction(async (tx) => {
        await cargar(tx, id);
        if (d.correo !== undefined) await exigirCorreoLibre(tx, d.correo, id);
        const u = await tx.usuario.update({
          where: { id },
          data: d,
          select: { id: true, nombres: true, apellidos: true, correo: true },
        });
        return u;
      });
    },

    /**
     * Activar o desactivar. Desactivar conserva historial y revoca sesiones
     * (trigger). Nunca deja al colegio sin ADMIN activo ni se aplica a la propia cuenta.
     * Una cuenta sin contraseña (ADMIN invitado) vuelve a PENDIENTE_ACTIVACION al reactivarse.
     */
    async cambiarEstado(actorId: string, id: string, estado: "ACTIVO" | "INACTIVO") {
      return db.$transaction(async (tx) => {
        const u = await cargar(tx, id);
        if (estado === "INACTIVO") {
          if (id === actorId) {
            throw conflicto("AUTODESACTIVACION", "No puedes desactivar tu propia cuenta. Pide a otro administrador que lo haga.");
          }
          if (u.estado === "INACTIVO") return { id, estado: u.estado };
          if (u.roles.includes("ADMIN") && u.estado === "ACTIVO" && (await otrosAdminsActivos(tx, id)) === 0) {
            throw conflicto("ULTIMO_ADMIN", "Es el último administrador activo: no se puede desactivar.");
          }
          await tx.usuario.update({ where: { id }, data: { estado: "INACTIVO" } });
          // Un enlace de invitación o recuperación pendiente deja de servir.
          await tx.restablecimientoContrasena.deleteMany({ where: { usuarioId: id, usadoEn: null } });
          return { id, estado: "INACTIVO" as const };
        }
        if (u.estado !== "INACTIVO") return { id, estado: u.estado };
        if (u.combinacion === null) {
          throw conflicto("SIN_ROL", "Asigna un rol válido antes de reactivar la cuenta.");
        }
        const nuevo = u.hashContrasena ? ("ACTIVO" as const) : ("PENDIENTE_ACTIVACION" as const);
        await tx.usuario.update({ where: { id }, data: { estado: nuevo } });
        return { id, estado: nuevo };
      });
    },

    /**
     * Cambia la combinación de roles del personal (promover DOCENTE a ADMIN,
     * retirar ADMIN, etc.). Protege al último ADMIN, la propia cuenta del
     * administrador que opera y la carga docente activa.
     */
    async cambiarRoles(actorId: string, id: string, combinacion: Combinacion) {
      return db.$transaction(async (tx) => {
        const u = await cargar(tx, id);
        if (u.combinacion === combinacion) return { id, combinacion };
        if (!esCambioDeCombinacionPermitido(u.combinacion, combinacion)) {
          throw conflicto(
            "COMBINACION_NO_PERMITIDA",
            "Una cuenta de estudiante no puede convertirse en cuenta del personal, ni al revés. Crea una cuenta nueva.",
          );
        }
        if (u.estado === "PENDIENTE_ACTIVACION") {
          throw conflicto("CUENTA_PENDIENTE", "La cuenta aún no se ha activado; cambia sus roles después de que acepte la invitación.");
        }
        const nuevos = rolesDeCombinacion(combinacion);
        const quitar = u.roles.filter((r) => !(nuevos as string[]).includes(r));
        const agregar = nuevos.filter((r) => !u.roles.includes(r));

        if (quitar.includes("ADMIN") && id === actorId) {
          throw conflicto("AUTODEGRADACION", "No puedes retirarte el rol ADMIN. Pide a otro administrador que lo haga.");
        }
        if (quitar.includes("ADMIN") && u.estado === "ACTIVO" && (await otrosAdminsActivos(tx, id)) === 0) {
          throw conflicto("ULTIMO_ADMIN", "Es el último administrador activo: no se le puede retirar el rol ADMIN.");
        }
        if (quitar.includes("DOCENTE")) {
          const carga = await tx.usuario.findUnique({
            where: { id },
            select: { _count: { select: { asignaciones: { where: { estado: "ACTIVA" } }, gruposDirigidos: true } } },
          });
          if (carga && (carga._count.asignaciones > 0 || carga._count.gruposDirigidos > 0)) {
            throw conflicto(
              "CARGA_DOCENTE_ACTIVA",
              "Tiene asignaciones activas o dirige un grupo. Reasigna esa carga antes de retirarle el rol DOCENTE.",
            );
          }
        }

        const roles = await tx.rol.findMany({ where: { codigo: { in: [...quitar, ...agregar] } }, select: { id: true, codigo: true } });
        const idDe = (c: string) => {
          const r = roles.find((x) => x.codigo === c);
          if (!r) throw new ErrorDominio("ROL_INEXISTENTE", `El rol ${c} no está sembrado.`, 500);
          return r.id;
        };
        // Primero se agrega y luego se retira: la cuenta nunca queda sin rol a mitad de la operación.
        for (const c of agregar) await tx.usuarioRol.create({ data: { usuarioId: id, rolId: idDe(c) } });
        if (quitar.length) {
          await tx.usuarioRol.deleteMany({ where: { usuarioId: id, rolId: { in: quitar.map(idDe) } } });
        }
        return { id, combinacion };
      });
    },

    /**
     * Asocia un ESTUDIANTE con un grupo. Si ya tiene grupo activo en ese año, es
     * un traslado: exige confirmación, cierra la asociación anterior y crea la
     * nueva en la misma transacción (§6).
     */
    async asignarGrupo(id: string, d: Entrada<typeof E.asignarGrupo>) {
      return db.$transaction(async (tx) => {
        const u = await cargar(tx, id);
        if (u.combinacion !== "ESTUDIANTE") {
          throw conflicto("NO_ES_ESTUDIANTE", "Solo una cuenta de estudiante se asocia con un grupo.");
        }
        if (u.estado === "INACTIVO") {
          throw conflicto("CUENTA_INACTIVA", "La cuenta está inactiva. Actívala antes de asociarla con un grupo.");
        }
        const g = await grupoEditable(tx, d.grupoId);
        const actual = await tx.asociacionEstudianteGrupo.findFirst({
          where: { estudianteId: id, anioLectivoId: g.anioLectivo.id, finEn: null },
          select: { id: true, grupoId: true, inicioEn: true },
        });
        if (actual?.grupoId === g.id) {
          throw conflicto("MISMO_GRUPO", "El estudiante ya pertenece a ese grupo.");
        }
        if (actual && !d.confirmarTraslado) {
          throw conflicto(
            "TRASLADO_REQUIERE_CONFIRMACION",
            "El estudiante ya tiene un grupo en ese año. Confirma el traslado para cerrar la asociación anterior.",
          );
        }
        const momento = ahora();
        if (actual) {
          const fin = momento < actual.inicioEn ? actual.inicioEn : momento;
          await tx.asociacionEstudianteGrupo.update({ where: { id: actual.id }, data: { finEn: fin } });
        }
        await tx.asociacionEstudianteGrupo.create({
          data: { estudianteId: id, grupoId: g.id, anioLectivoId: g.anioLectivo.id, inicioEn: momento },
        });
        return { id, grupo: grupoDto(g), traslado: !!actual };
      });
    },
  };
}

export type ServicioUsuarios = ReturnType<typeof crearServicioUsuarios>;
