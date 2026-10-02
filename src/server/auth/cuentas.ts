/**
 * Ciclos de contraseña por rol (INC1R-03, requerimiento §4).
 *
 * - ADMIN: primer ADMIN por seed; los demás por invitación de 24 h (reenviable).
 * - DOCENTE: contraseña temporal generada, cambio obligatorio en el primer ingreso.
 * - ESTUDIANTE: contraseña legible generada, visible/descargable una sola vez;
 *   la restablecen ADMIN o un DOCENTE autorizado (uno o varios a la vez).
 * - Recuperación por correo solo para ADMIN y DOCENTE activos.
 *
 * Nunca se guarda una contraseña ni un token en forma recuperable: bcrypt para
 * contraseñas y SHA-256 para tokens. Los triggers SQL revocan las sesiones al
 * cambiar `hashContrasena` o `estado`.
 *
 * Recibe Prisma y el notificador por parámetro para probarse contra una SQLite
 * temporal y usarse desde el seed (sin `server-only`).
 */
import type { PrismaClient } from "@/generated/prisma/client";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import {
  COSTO_BCRYPT,
  VIGENCIA_RESTABLECIMIENTO_MS,
  generarTokenRestablecimiento,
  hashearContrasena,
  hashearToken,
  verificarContrasena,
} from "./contrasena";
import { csvCredenciales, generarContrasenaEstudiante, generarContrasenaTemporal } from "./credenciales";

export type TipoToken = "RECUPERACION" | "INVITACION";
export type Notificar = (m: { para: string; asunto: string; texto: string }) => Promise<void>;
export type Actor = { id: string; roles: string[] };

type Opciones = { notificar: Notificar; urlBase: string; costo?: number; ahora?: () => Date };

const MAX_LOTE_ESTUDIANTES = 500;

export function crearServicioCuentas(db: PrismaClient, opciones: Opciones) {
  const { notificar } = opciones;
  const costo = opciones.costo ?? COSTO_BCRYPT;
  const ahora = opciones.ahora ?? (() => new Date());
  const base = opciones.urlBase.replace(/\/$/, "");

  async function emitirToken(usuarioId: string, tipo: TipoToken) {
    const token = generarTokenRestablecimiento();
    // Un enlace vigente por usuario: emitir uno nuevo invalida los anteriores sin usar.
    await db.$transaction([
      db.restablecimientoContrasena.deleteMany({ where: { usuarioId, usadoEn: null } }),
      db.restablecimientoContrasena.create({
        data: {
          usuarioId,
          tipo,
          tokenHash: hashearToken(token),
          expiraEn: new Date(ahora().getTime() + VIGENCIA_RESTABLECIMIENTO_MS),
        },
      }),
    ]);
    return `${base}/recuperar/nueva?token=${encodeURIComponent(token)}`;
  }

  async function rolesDe(usuarioId: string) {
    const filas = await db.usuarioRol.findMany({ where: { usuarioId }, select: { rol: { select: { codigo: true } } } });
    return filas.map((f) => f.rol.codigo);
  }

  async function rolId(codigo: "ADMIN" | "DOCENTE" | "ESTUDIANTE") {
    const rol = await db.rol.findUnique({ where: { codigo } });
    if (!rol) throw new ErrorDominio("ROL_INEXISTENTE", `El rol ${codigo} no está sembrado.`, 500);
    return rol.id;
  }

  async function exigirCorreoLibre(correo: string) {
    if (await db.usuario.findUnique({ where: { correo }, select: { id: true } })) {
      throw conflicto("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo.");
    }
  }

  async function enviarInvitacion(usuario: { id: string; correo: string; nombres: string }) {
    const enlace = await emitirToken(usuario.id, "INVITACION");
    await notificar({
      para: usuario.correo,
      asunto: "MIDUHO · Invitación como administrador",
      texto:
        `Hola, ${usuario.nombres}.\n\n` +
        `Te invitaron a administrar MIDUHO. Crea tu contraseña con este enlace en las próximas 24 horas:\n\n` +
        `${enlace}\n\n` +
        `Si no esperabas esta invitación, ignora este correo.`,
    });
  }

  /**
   * Estudiantes sobre los que un DOCENTE puede restablecer: estudiantes con
   * asociación activa en un grupo del año ACTIVO donde el docente tiene una
   * asignación ACTIVA o es director de grupo.
   */
  async function estudiantesAutorizados(actor: Actor, ids: string[]) {
    const esAdmin = actor.roles.includes("ADMIN");
    const where = {
      id: { in: ids },
      roles: { some: { rol: { codigo: "ESTUDIANTE" } } },
      ...(esAdmin
        ? {}
        : {
            asociacionesGrupo: {
              some: {
                finEn: null,
                anioLectivo: { estado: "ACTIVO" as const },
                grupo: {
                  OR: [
                    { directorId: actor.id },
                    { asignacionesDocente: { some: { docenteId: actor.id, estado: "ACTIVA" as const } } },
                  ],
                },
              },
            },
          }),
    };
    return db.usuario.findMany({ where, select: { id: true, correo: true, estado: true } });
  }

  return {
    /** Paso 1 de recuperación. Silencioso para cualquier caso no elegible. */
    async solicitarRecuperacion(correo: string) {
      const usuario = await db.usuario.findUnique({ where: { correo } });
      if (!usuario || usuario.estado !== "ACTIVO") return;
      const roles = await rolesDe(usuario.id);
      if (!roles.includes("ADMIN") && !roles.includes("DOCENTE")) return; // sin recuperación estudiantil
      const enlace = await emitirToken(usuario.id, "RECUPERACION");
      await notificar({
        para: usuario.correo,
        asunto: "MIDUHO · Restablecer tu contraseña",
        texto:
          `Hola, ${usuario.nombres}.\n\n` +
          `Recibimos una solicitud para restablecer tu contraseña. Abre este enlace en las próximas 24 horas:\n\n` +
          `${enlace}\n\n` +
          `Si no la pediste, ignora este correo: tu contraseña no cambia.`,
      });
    },

    /**
     * Paso 2 de recuperación o aceptación de invitación. Token de un solo uso:
     * RECUPERACION exige cuenta ACTIVA; INVITACION exige PENDIENTE_ACTIVACION y la activa.
     */
    async establecerConToken(token: string, nueva: string): Promise<{ ok: true } | { ok: false; motivo: "token-invalido" }> {
      const registro = await db.restablecimientoContrasena.findUnique({
        where: { tokenHash: hashearToken(token) },
        include: { usuario: true },
      });
      const estadoEsperado = registro?.tipo === "INVITACION" ? "PENDIENTE_ACTIVACION" : "ACTIVO";
      if (
        !registro ||
        registro.usadoEn ||
        registro.expiraEn.getTime() <= ahora().getTime() ||
        registro.usuario.estado !== estadoEsperado
      ) {
        return { ok: false, motivo: "token-invalido" };
      }
      const hash = await hashearContrasena(nueva, costo);
      const momento = ahora();
      const consumido = await db.$transaction(async (tx) => {
        // updateMany con usadoEn: null hace el consumo atómico ante envíos simultáneos.
        const r = await tx.restablecimientoContrasena.updateMany({
          where: { id: registro.id, usadoEn: null },
          data: { usadoEn: momento },
        });
        if (r.count !== 1) return false;
        await tx.usuario.update({
          where: { id: registro.usuarioId },
          data: { hashContrasena: hash, debeCambiarContrasena: false, estado: "ACTIVO" },
        });
        await tx.restablecimientoContrasena.deleteMany({ where: { usuarioId: registro.usuarioId, usadoEn: null } });
        return true;
      });
      return consumido ? { ok: true } : { ok: false, motivo: "token-invalido" };
    },

    /** ADMIN puro por invitación: cuenta PENDIENTE_ACTIVACION sin contraseña. */
    async invitarAdmin(datos: { nombres: string; apellidos: string; correo: string }) {
      await exigirCorreoLibre(datos.correo);
      const usuario = await db.usuario.create({
        data: {
          ...datos,
          estado: "PENDIENTE_ACTIVACION",
          roles: { create: { rolId: await rolId("ADMIN") } },
        },
      });
      await enviarInvitacion(usuario);
      return { id: usuario.id };
    },

    /** Reenvío: nuevo enlace de 24 h; el anterior deja de servir. */
    async reenviarInvitacion(usuarioId: string) {
      const usuario = await db.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario) throw noEncontrado("La cuenta");
      if (usuario.estado !== "PENDIENTE_ACTIVACION" || !(await rolesDe(usuarioId)).includes("ADMIN")) {
        throw conflicto("INVITACION_NO_APLICA", "Solo se reenvía la invitación de un ADMIN pendiente de activación.");
      }
      await enviarInvitacion(usuario);
    },

    /**
     * DOCENTE: ACTIVO con contraseña temporal; se devuelve una sola vez.
     * `tambienAdmin` crea la combinación DOCENTE + ADMIN en la misma escritura (INC1R-05).
     */
    async crearDocente(datos: { nombres: string; apellidos: string; correo: string }, extra: { tambienAdmin?: boolean } = {}) {
      await exigirCorreoLibre(datos.correo);
      const contrasena = generarContrasenaTemporal();
      const roles = [{ rolId: await rolId("DOCENTE") }];
      if (extra.tambienAdmin) roles.push({ rolId: await rolId("ADMIN") });
      const usuario = await db.usuario.create({
        data: {
          ...datos,
          estado: "ACTIVO",
          hashContrasena: await hashearContrasena(contrasena, costo),
          debeCambiarContrasena: true,
          roles: { create: roles },
        },
      });
      return { id: usuario.id, correo: usuario.correo, contrasenaTemporal: contrasena };
    },

    /**
     * ESTUDIANTE: ACTIVO con contraseña legible generada; se devuelve una sola vez.
     * `asociacion` lo vincula a un grupo en la misma escritura (INC1R-05); el
     * llamador valida antes que el grupo exista y que su año no esté cerrado.
     */
    async crearEstudiante(
      datos: { nombres: string; apellidos: string; correo: string },
      asociacion?: { grupoId: string; anioLectivoId: string },
    ) {
      await exigirCorreoLibre(datos.correo);
      const contrasena = generarContrasenaEstudiante();
      const usuario = await db.usuario.create({
        data: {
          ...datos,
          estado: "ACTIVO",
          hashContrasena: await hashearContrasena(contrasena, costo),
          roles: { create: { rolId: await rolId("ESTUDIANTE") } },
          ...(asociacion ? { asociacionesGrupo: { create: asociacion } } : {}),
        },
      });
      return { id: usuario.id, correo: usuario.correo, contrasena };
    },

    /**
     * Cambio de contraseña por el propio usuario (obligatorio para DOCENTE con
     * temporal). ESTUDIANTE no cambia su contraseña en este incremento.
     */
    async cambiarContrasena(usuarioId: string, actual: string, nueva: string) {
      const usuario = await db.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario || usuario.estado !== "ACTIVO" || !usuario.hashContrasena) throw noEncontrado("La cuenta");
      const roles = await rolesDe(usuarioId);
      if (!roles.includes("ADMIN") && !roles.includes("DOCENTE")) {
        throw new ErrorDominio("SIN_PERMISO", "Tu contraseña la restablece tu docente o la administración.", 403);
      }
      if (!(await verificarContrasena(actual, usuario.hashContrasena))) {
        throw new ErrorDominio("CONTRASENA_ACTUAL_INVALIDA", "La contraseña actual no es correcta.");
      }
      if (await verificarContrasena(nueva, usuario.hashContrasena)) {
        throw new ErrorDominio("CONTRASENA_REPETIDA", "La nueva contraseña debe ser distinta de la actual.");
      }
      await db.usuario.update({
        where: { id: usuarioId },
        data: { hashContrasena: await hashearContrasena(nueva, costo), debeCambiarContrasena: false },
      });
    },

    /**
     * Restablecimiento individual o múltiple de estudiantes. Todo o nada: si
     * algún id no existe, no es ESTUDIANTE o el DOCENTE no lo tiene a cargo, no
     * se cambia ninguna. Devuelve el CSV de nuevas credenciales (una sola vez).
     */
    async restablecerEstudiantes(actor: Actor, ids: string[]) {
      const unicos = [...new Set(ids)];
      if (unicos.length === 0) throw new ErrorDominio("SELECCION_VACIA", "Selecciona al menos un estudiante.");
      if (unicos.length > MAX_LOTE_ESTUDIANTES) {
        throw new ErrorDominio("LOTE_EXCEDIDO", `Selecciona como máximo ${MAX_LOTE_ESTUDIANTES} estudiantes.`);
      }
      if (!actor.roles.includes("ADMIN") && !actor.roles.includes("DOCENTE")) {
        throw new ErrorDominio("SIN_PERMISO", "No tienes permiso para esta acción.", 403);
      }
      const permitidos = await estudiantesAutorizados(actor, unicos);
      if (permitidos.length !== unicos.length) {
        // Mismo mensaje para inexistente y ajeno: no revela cuentas fuera del alcance.
        throw new ErrorDominio("SIN_PERMISO", "Uno o más estudiantes no están a tu cargo.", 403);
      }
      const inactivo = permitidos.find((e) => e.estado !== "ACTIVO");
      if (inactivo) throw conflicto("ESTUDIANTE_INACTIVO", "No se restablece la contraseña de una cuenta inactiva.");

      const nuevas = await Promise.all(
        permitidos.map(async (e) => {
          const contrasena = generarContrasenaEstudiante();
          return { id: e.id, correo: e.correo, contrasena, hash: await hashearContrasena(contrasena, costo) };
        }),
      );
      await db.$transaction(
        nuevas.map((n) => db.usuario.update({ where: { id: n.id }, data: { hashContrasena: n.hash } })),
      );
      nuevas.sort((a, b) => a.correo.localeCompare(b.correo));
      return { total: nuevas.length, csv: csvCredenciales(nuevas) };
    },
  };
}

export type ServicioCuentas = ReturnType<typeof crearServicioCuentas>;
