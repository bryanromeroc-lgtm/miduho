/**
 * Asignaturas de demostración cuyos nombres coinciden con las carpetas de
 * `curriculo/actividades/` (el catálogo busca por nombre normalizado). Las
 * usa `scripts/demo-quinto.ts`; la prueba de coherencia del módulo
 * `contenido` exige que cada carpeta tenga aquí su asignatura. Todo ficticio 🔶.
 */
/** Asignatura (nombre = carpeta del currículo) → área y docente demo que la dicta. */
export const ASIGNATURAS_CURRICULO = [
  { nombre: "Comprensión Lectora", area: "Humanidades: Lengua Castellana", orden: 1, docente: "claudia.rincon@miduho.test" },
  { nombre: "Ciencias Naturales", area: "Ciencias Naturales y Educación Ambiental", orden: 2, docente: "andres.moreno@miduho.test" },
  { nombre: "Robótica", area: "Tecnología e Informática", orden: 3, docente: "luz.castaneda@miduho.test" },
  { nombre: "Emprendimiento", area: "Emprendimiento", orden: 4, docente: "luz.castaneda@miduho.test" },
  { nombre: "Matemáticas", area: "Matemáticas", orden: 5, docente: "andres.moreno@miduho.test" },
  { nombre: "Ciencias Sociales", area: "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia", orden: 6, docente: "andres.moreno@miduho.test" },
  { nombre: "Inglés", area: "Humanidades: Idioma Extranjero (Inglés)", orden: 7, docente: "claudia.rincon@miduho.test" },
  { nombre: "Educación Artística", area: "Educación Artística y Cultural", orden: 8, docente: "luz.castaneda@miduho.test" },
  { nombre: "Educación Física", area: "Educación Física, Recreación y Deportes", orden: 9, docente: "andres.moreno@miduho.test" },
  { nombre: "Ética y Valores", area: "Educación Ética y en Valores Humanos", orden: 10, docente: "claudia.rincon@miduho.test" },
  { nombre: "Educación Religiosa", area: "Educación Religiosa", orden: 11, docente: "claudia.rincon@miduho.test" },
] as const;
