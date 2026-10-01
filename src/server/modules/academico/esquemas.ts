import { z } from "zod";

/** Fecha calendario `AAAA-MM-DD`, guardada como medianoche UTC. */
export const fecha = z
  .iso.date({ error: "Usa una fecha válida con formato AAAA-MM-DD." })
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

const id = z.string({ error: "Falta el identificador." }).trim().min(1, "Falta el identificador.").max(64);
const texto = (campo: string, max = 120) =>
  z.string({ error: `Escribe ${campo}.` }).trim().min(1, `Escribe ${campo}.`).max(max, `${campo} es demasiado largo.`);
const enteroPositivo = (campo: string) =>
  z.number({ error: `${campo} debe ser un número.` }).int(`${campo} debe ser un número entero.`).min(1, `${campo} debe ser mayor que cero.`);

export const paginacion = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------- AnioLectivo ----------
export const crearAnioLectivo = z.object({
  anio: z.number({ error: "El año debe ser un número." }).int().min(2000, "Año fuera de rango.").max(2100, "Año fuera de rango."),
  fechaInicio: fecha,
  fechaFin: fecha,
  estado: z.enum(["ACTIVO", "CERRADO"]).default("ACTIVO"),
});
export const actualizarAnioLectivo = z
  .object({
    fechaInicio: fecha.optional(),
    fechaFin: fecha.optional(),
    estado: z.enum(["ACTIVO", "CERRADO"]).optional(),
  })
  .strict();

// ---------- Periodo ----------
const ponderacion = z
  .number({ error: "La ponderación debe ser un número." })
  .gt(0, "La ponderación debe ser mayor que cero.")
  .max(100, "La ponderación no puede superar 100 %.");

export const crearPeriodo = z.object({
  anioLectivoId: id,
  nombre: texto("el nombre del período", 60),
  orden: enteroPositivo("El orden"),
  fechaInicio: fecha,
  fechaFin: fecha,
  ponderacion,
});
export const actualizarPeriodo = z
  .object({
    nombre: texto("el nombre del período", 60).optional(),
    orden: enteroPositivo("El orden").optional(),
    fechaInicio: fecha.optional(),
    fechaFin: fecha.optional(),
    ponderacion: ponderacion.optional(),
  })
  .strict();
export const filtroPeriodos = paginacion.extend({ anioLectivoId: id.optional() });

// ---------- Grado ----------
export const nivelEducativo = z.enum(["PREESCOLAR", "PRIMARIA", "BACHILLERATO"], {
  error: "El nivel debe ser PREESCOLAR, PRIMARIA o BACHILLERATO.",
});
export const crearGrado = z.object({
  nombre: texto("el nombre del grado", 30),
  nivel: nivelEducativo,
  orden: z.number({ error: "El orden debe ser un número." }).int().min(0, "El orden no puede ser negativo."),
});
export const actualizarGrado = crearGrado.partial().strict();

// ---------- Grupo ----------
export const crearGrupo = z.object({
  gradoId: id,
  anioLectivoId: id,
  identificador: z
    .string({ error: "Escribe el identificador del grupo." })
    .trim()
    .regex(/^[0-9A-Za-z]{1,4}$/, "El identificador del grupo debe tener de 1 a 4 letras o números (ej. 01)."),
  directorId: id.nullable().optional(),
});
export const actualizarGrupo = z
  .object({
    identificador: crearGrupo.shape.identificador.optional(),
    directorId: id.nullable().optional(),
  })
  .strict();
export const filtroGrupos = paginacion.extend({ anioLectivoId: id.optional(), gradoId: id.optional() });

// ---------- Asignatura ----------
const asignaturaGrado = z.object({
  gradoId: id,
  intensidad: enteroPositivo("La intensidad").max(40, "Intensidad fuera de rango.").nullable().optional(),
});
const listaGrados = z
  .array(asignaturaGrado)
  .max(30)
  .refine((l) => new Set(l.map((g) => g.gradoId)).size === l.length, "Un grado aparece repetido.");

export const crearAsignatura = z.object({
  nombre: texto("el nombre de la asignatura", 80),
  areaId: id,
  intensidadHoraria: enteroPositivo("La intensidad horaria").max(40, "Intensidad fuera de rango.").nullable().optional(),
  grados: listaGrados.default([]),
});
export const actualizarAsignatura = z
  .object({
    nombre: crearAsignatura.shape.nombre.optional(),
    areaId: id.optional(),
    intensidadHoraria: crearAsignatura.shape.intensidadHoraria,
    grados: listaGrados.optional(),
  })
  .strict();
export const filtroAsignaturas = paginacion.extend({ areaId: id.optional(), gradoId: id.optional() });
