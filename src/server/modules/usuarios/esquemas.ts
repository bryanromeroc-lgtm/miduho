import { z } from "zod";
import { COMBINACIONES, ESTADOS } from "@/lib/usuarios";
import { esquemaNuevaCuenta } from "@/server/auth/esquemas";

/**
 * Contratos de la administración individual de usuarios (INC1R-05,
 * requerimiento §2, §5, §6 y §11). Solo ADMIN los usa.
 */

/** Los filtros llegan por query string: "" equivale a "sin filtro". */
const vacioIndefinido = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const id = z.string({ error: "Falta el identificador." }).trim().min(1, "Falta el identificador.").max(64);

export const filtroUsuarios = z.object({
  q: z.preprocess(vacioIndefinido, z.string().trim().max(120, "La búsqueda es demasiado larga.").optional()),
  rol: z.preprocess(vacioIndefinido, z.enum(["ADMIN", "DOCENTE", "ESTUDIANTE"], { error: "Rol no válido." }).optional()),
  estado: z.preprocess(vacioIndefinido, z.enum(ESTADOS, { error: "Estado no válido." }).optional()),
  grupoId: z.preprocess(vacioIndefinido, id.optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type FiltroUsuarios = z.output<typeof filtroUsuarios>;

/** Alta individual. ADMIN puro queda pendiente de invitación; el grupo solo aplica a ESTUDIANTE. */
export const crearUsuario = esquemaNuevaCuenta
  .extend({
    combinacion: z.enum(COMBINACIONES, { error: "Elige un rol o combinación válida." }),
    grupoId: z.preprocess(vacioIndefinido, id.optional()),
  })
  .refine((d) => !d.grupoId || d.combinacion === "ESTUDIANTE", {
    message: "Solo una cuenta ESTUDIANTE se asocia con un grupo.",
    path: ["grupoId"],
  });

const texto = (campo: string) =>
  z.string({ error: `Escribe ${campo}.` }).trim().min(1, `Escribe ${campo}.`).max(120, `${campo} es demasiado largo.`);

/** Identidad y correo; todos opcionales, pero al menos uno. */
export const actualizarIdentidad = z
  .object({
    nombres: texto("los nombres").optional(),
    apellidos: texto("los apellidos").optional(),
    correo: esquemaNuevaCuenta.shape.correo.optional(),
  })
  .strict()
  .refine((d) => d.nombres !== undefined || d.apellidos !== undefined || d.correo !== undefined, {
    message: "No hay cambios para guardar.",
  });

export const cambiarEstado = z.object({
  estado: z.enum(["ACTIVO", "INACTIVO"], { error: "El estado debe ser ACTIVO o INACTIVO." }),
});

export const cambiarRoles = z.object({
  combinacion: z.enum(COMBINACIONES, { error: "Elige un rol o combinación válida." }),
});

/** `confirmarTraslado` es obligatorio cuando el estudiante ya tiene grupo activo en ese año. */
export const asignarGrupo = z.object({
  grupoId: id,
  confirmarTraslado: z.boolean().optional().default(false),
});
