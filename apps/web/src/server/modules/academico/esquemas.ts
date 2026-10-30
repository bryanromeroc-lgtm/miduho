import { z } from "zod";

/** Fecha calendario `AAAA-MM-DD`, guardada como medianoche UTC. */
export const fecha = z
  .iso.date({ error: "Usa una fecha válida con formato AAAA-MM-DD." })
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

const id = z.string({ error: "Falta el identificador." }).trim().min(1, "Falta el identificador.").max(64, "El identificador no es válido.");
const texto = (campo: string, max = 120) =>
  z.string({ error: `Escribe ${campo}.` }).trim().min(1, `Escribe ${campo}.`).max(max, `${campo} es demasiado largo.`);
const enteroPositivo = (campo: string) =>
  z.number({ error: `${campo} debe ser un número.` }).int(`${campo} debe ser un número entero.`).min(1, `${campo} debe ser mayor que cero.`);

/** Los filtros llegan por query string: "" equivale a "sin filtro". */
const vacioIndefinido = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const idFiltro = z.preprocess(vacioIndefinido, id.optional());

export const paginacion = z.object({
  page: z.coerce.number({ error: "La página debe ser un número." }).int("La página debe ser un número entero.").min(1, "La página debe ser 1 o mayor.").default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.preprocess(vacioIndefinido, z.string().trim().max(120, "La búsqueda es demasiado larga.").optional()),
});

/** Años lectivos: la búsqueda es por el número del año (ej. 2026). */
export const filtroAnios = paginacion.extend({
  q: z.preprocess(
    vacioIndefinido,
    z.coerce
      .number({ error: "Busca el año con cuatro cifras (ej. 2026)." })
      .int("Busca el año con cuatro cifras (ej. 2026).")
      .min(2000, "Busca un año entre 2000 y 2100.")
      .max(2100, "Busca un año entre 2000 y 2100.")
      .optional(),
  ),
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
export const filtroPeriodos = paginacion.extend({ anioLectivoId: idFiltro });

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

// ---------- Área ----------
export const tipoArea = z.enum(["AREA", "DIMENSION", "ENFOQUE"], {
  error: "El tipo debe ser ÁREA, DIMENSIÓN o ENFOQUE.",
});
export const crearArea = z.object({
  nombre: texto("el nombre del área", 120),
  tipo: tipoArea.default("AREA"),
  idioma: z.string().trim().min(2, "Escribe el idioma.").max(12, "El idioma es demasiado largo.").default("es"),
  orden: z.number().int().min(0, "El orden no puede ser negativo.").nullable().optional(),
});
export const actualizarArea = crearArea.partial().strict();

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
export const filtroGrupos = paginacion.extend({ anioLectivoId: idFiltro, gradoId: idFiltro });

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
export const filtroAsignaturas = paginacion.extend({ areaId: idFiltro, gradoId: idFiltro });

// ---------- Asignación docente ----------
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa una hora válida en formato HH:mm.");
export const bloqueHorario = z.object({
  dia: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]),
  horaInicio: hora,
  horaFin: hora,
}).refine((b) => b.horaInicio < b.horaFin, { message: "La hora final debe ser posterior a la inicial." });
const bloquesHorario = z.array(bloqueHorario).min(1, "Agrega al menos un bloque horario.").max(30).superRefine((bloques, ctx) => {
  for (let i = 0; i < bloques.length; i += 1) for (let j = i + 1; j < bloques.length; j += 1) {
    const a = bloques[i]; const b = bloques[j];
    if (a.dia === b.dia && a.horaInicio < b.horaFin && b.horaInicio < a.horaFin) {
      ctx.addIssue({ code: "custom", message: "Los bloques de la asignación no pueden cruzarse." });
      return;
    }
  }
});
export const crearAsignacionDocente = z.object({
  docenteId: id, asignaturaId: id, grupoId: id, anioLectivoId: id, bloques: bloquesHorario,
});
export const reasignarAsignacionDocente = z.object({ docenteId: id, bloques: bloquesHorario, confirmar: z.literal(true) });
export const accionAsignacionDocente = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("REACTIVAR") }),
  reasignarAsignacionDocente.extend({ accion: z.literal("REASIGNAR") }),
]);
export const filtroAsignacionesDocente = paginacion.extend({
  docenteId: idFiltro, grupoId: idFiltro, anioLectivoId: idFiltro,
  estado: z.preprocess(vacioIndefinido, z.enum(["ACTIVA", "INACTIVA"]).optional()),
});
