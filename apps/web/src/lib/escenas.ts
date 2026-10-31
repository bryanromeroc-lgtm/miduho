/**
 * Escena ilustrada y familia de color de cada asignatura (D4).
 * El nombre se normaliza (sin tildes, en minúsculas) y se busca primero en la
 * asignatura y luego en su área; si nada coincide, la escena es la genérica.
 */

export const ESCENAS = [
  "lectura",
  "matematicas",
  "naturales",
  "ingles",
  "robotica",
  "emprendimiento",
  "etica",
  "artistica",
  "fisica",
  "sociales",
  "generica",
] as const;

export type Escena = (typeof ESCENAS)[number];

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, " ")
    .trim();
}

/*
  Palabras clave por escena, en orden de prueba: lo más específico primero
  («ciencias sociales» antes que «ciencias», «educación física» antes que
  «física»). Se comparan como palabras completas sobre el texto normalizado.
*/
const CLAVES: [Escena, string[]][] = [
  ["emprendimiento", ["emprendimiento"]],
  ["robotica", ["robotica", "tecnologia", "informatica", "programacion"]],
  ["ingles", ["ingles", "english", "lengua extranjera", "idioma extranjero", "idiomas extranjeros"]],
  ["sociales", ["ciencias sociales", "sociales", "historia", "geografia", "constitucion", "democracia"]],
  ["fisica", ["educacion fisica", "recreacion", "deporte", "deportes"]],
  ["artistica", ["artistica", "artes", "arte", "musica", "danza", "teatro", "dibujo"]],
  ["etica", ["etica", "valores", "convivencia", "catedra de la paz"]],
  ["matematicas", ["matematicas", "matematica", "pensamiento numerico", "geometria", "estadistica", "aritmetica"]],
  ["naturales", ["ciencias naturales", "naturales", "biologia", "educacion ambiental", "ciencias"]],
  [
    "lectura",
    ["comprension lectora", "lectura", "plan lector", "lengua castellana", "castellano", "espanol", "literatura", "lenguaje", "humanidades"],
  ],
];

function buscar(texto: string): Escena | null {
  const t = ` ${normalizar(texto)} `;
  for (const [escena, claves] of CLAVES) {
    if (claves.some((c) => t.includes(` ${c} `))) return escena;
  }
  return null;
}

/** Escena de una asignatura: por su nombre, luego por su área, luego genérica. */
export function escenaDe(asignatura: string, area?: string | null): Escena {
  return buscar(asignatura) ?? (area ? buscar(area) : null) ?? "generica";
}

/** Descripción breve de la materia en el panel: qué se hace, sin cifras ni promesas de contenido. */
export const DESCRIPCION_ESCENA: Record<Escena, string> = {
  lectura: "Leer, escuchar y contar historias.",
  matematicas: "Contar, sumar, medir y resolver retos.",
  naturales: "Plantas, animales y experimentos sencillos.",
  ingles: "Palabras, canciones y saludos en inglés.",
  robotica: "Sensores, mecanismos y retos para aprender haciendo.",
  emprendimiento: "Ideas pequeñas que se vuelven proyectos.",
  etica: "Cuidarnos, compartir y resolver conflictos juntos.",
  artistica: "Colores, formas, ritmos y canciones.",
  fisica: "Juegos, equilibrio y trabajo en equipo.",
  sociales: "Mi familia, mi barrio, Madrid y Colombia.",
  generica: "Lo que aprendes en esta materia, en un solo lugar.",
};
