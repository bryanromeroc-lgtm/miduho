/*
  DATOS DE DEMOSTRACIÓN — TODOS FICTICIOS.

  No hay datos reales de estudiantes, docentes ni acudientes, y no deben
  inventarse datos personales de menores. Los nombres de estudiantes son
  evidentemente ficticios y existen solo para leer la estructura de la planilla.

  Los títulos de literatura son obras de dominio público (Grimm, Perrault,
  Carroll, Baum, Andersen, Doyle): referencias legítimas.

  Las unidades de Robótica y Emprendimiento reutilizan únicamente el ESQUEMA
  ESTRUCTURAL observado en la referencia (bloque → unidad → ruta didáctica de
  7 secciones). Ningún texto, imagen ni contenido de la referencia se copia:
  todo el contenido aquí es redacción propia para la maqueta.
*/

export type Area = "literatura" | "robotica" | "emprendimiento";

export const AREAS: Record<
  Area,
  {
    nombre: string;
    /* la plancha: fondo saturado que posee la región y carga texto blanco */
    plancha: string;
    planchaHonda: string;
    /* el pálido: fondo de ficha, carga la tinta del área */
    pale: string;
    /* la tinta del área: sobre blanco o sobre pálido, nunca sobre plancha */
    tinta: string;
    /* tono medio para metadatos secundarios sobre el pálido, verificado
       a ≥4.6:1. Nunca se atenúa texto con opacity: eso rompe AA. */
    medio: string;
  }
> = {
  literatura: {
    nombre: "Comprensión Lectora",
    plancha: "#aa461e",
    planchaHonda: "#903712",
    pale: "#fff0d9",
    tinta: "#79370f",
    medio: "#825325",
  },
  robotica: {
    nombre: "Robótica",
    plancha: "#24617f",
    planchaHonda: "#1c506b",
    pale: "#e9f3f9",
    tinta: "#20495f",
    medio: "#4d6b7c",
  },
  emprendimiento: {
    nombre: "Emprendimiento",
    plancha: "#466232",
    planchaHonda: "#384e28",
    pale: "#edf3e6",
    tinta: "#334a23",
    medio: "#586d47",
  },
};

/* ---------- LITERATURA: biblioteca, se explora, sin progresión ---------- */

export type TipoRecurso = "Libro" | "Guía" | "Catálogo" | "Audiolibro";
export type RangoEdad = "0-5" | "6-8" | "9-11" | "12-13" | "+14";
export type Idioma = "Español" | "Inglés" | "Francés";

export interface Titulo {
  id: string;
  titulo: string;
  autor: string;
  tipo: TipoRecurso;
  edad: RangoEdad;
  idioma: Idioma;
  /* obra + guía docente son recursos hermanos — el vínculo es explícito,
     no una coincidencia de título como en la referencia */
  hermanoDe?: string;
  soloDocente?: boolean;
}

export const TITULOS: Titulo[] = [
  { id: "lit-001", titulo: "Caperucita Roja", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-002", titulo: "Caperucita Roja — Guía docente", autor: "MIDUHO", tipo: "Guía", edad: "6-8", idioma: "Español", hermanoDe: "lit-001", soloDocente: true },
  { id: "lit-003", titulo: "Hansel y Gretel", autor: "Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-004", titulo: "Hansel y Gretel — Guía docente", autor: "MIDUHO", tipo: "Guía", edad: "6-8", idioma: "Español", hermanoDe: "lit-003", soloDocente: true },
  { id: "lit-005", titulo: "Alicia en el País de las Maravillas", autor: "Lewis Carroll", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-006", titulo: "Alicia en el País de las Maravillas", autor: "Lewis Carroll", tipo: "Audiolibro", edad: "9-11", idioma: "Español", hermanoDe: "lit-005" },
  { id: "lit-007", titulo: "El Mago de Oz", autor: "L. Frank Baum", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-008", titulo: "El Patito Feo", autor: "Hans Christian Andersen", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-009", titulo: "El Patito Feo", autor: "Hans Christian Andersen", tipo: "Audiolibro", edad: "0-5", idioma: "Español", hermanoDe: "lit-008" },
  { id: "lit-010", titulo: "La Sirenita", autor: "Hans Christian Andersen", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-011", titulo: "Blancanieves", autor: "Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-012", titulo: "Blancanieves — Guía docente", autor: "MIDUHO", tipo: "Guía", edad: "6-8", idioma: "Español", hermanoDe: "lit-011", soloDocente: true },
  { id: "lit-013", titulo: "El Gato con Botas", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-014", titulo: "Little Red Riding Hood", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Inglés" },
  { id: "lit-015", titulo: "Le Petit Chaperon Rouge", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Francés" },
  { id: "lit-016", titulo: "Las Aventuras de Sherlock Holmes", autor: "Arthur Conan Doyle", tipo: "Libro", edad: "12-13", idioma: "Español" },
  { id: "lit-017", titulo: "Estudio en Escarlata", autor: "Arthur Conan Doyle", tipo: "Libro", edad: "+14", idioma: "Español" },
  { id: "lit-018", titulo: "Catálogo Plan Lector · Grado 1°", autor: "MIDUHO", tipo: "Catálogo", edad: "6-8", idioma: "Español", soloDocente: true },
  { id: "lit-019", titulo: "Los Músicos de Bremen", autor: "Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-020", titulo: "Pulgarcito", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-021", titulo: "La Cenicienta", autor: "Charles Perrault", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-022", titulo: "La Bella Durmiente", autor: "Charles Perrault", tipo: "Audiolibro", edad: "6-8", idioma: "Español" },
  { id: "lit-023", titulo: "Alice's Adventures in Wonderland", autor: "Lewis Carroll", tipo: "Libro", edad: "9-11", idioma: "Inglés" },
  { id: "lit-024", titulo: "El Sastrecillo Valiente", autor: "Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
];

/* Corpus real por encima de 300 títulos; la maqueta pagina en servidor
   y nunca renderiza cientos de tarjetas de una vez. */
export const TOTAL_TITULOS = 317;

/* ---------- LABORATORIOS: currículo secuenciado ---------- */

export interface Unidad {
  id: string;
  orden: number;
  titulo: string;
  area: Area;
  sesiones: number;
  estado: "dictada" | "activa" | "programada" | "sin-programar";
  liberacion?: string;
}

export interface Bloque {
  id: string;
  nombre: string;
  unidades: Unidad[];
}

export interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  bloques: Bloque[];
}

/*
  Kids 2 INTERCALA las dos áreas en los mismos bloques: el área es atributo
  de la unidad, no del programa. Robótica aporta la dimensión técnica a
  proyectos de emprendimiento. 12 de Emprendimiento + 4 de Robótica = 16.
*/
export const PROGRAMAS: Programa[] = [
  {
    id: "kids2",
    nombre: "Laboratorio Kids 2",
    descripcion:
      "Programa interdisciplinario: las unidades de Robótica aportan la dimensión técnica a los proyectos de Emprendimiento, dentro de los mismos bloques.",
    bloques: [
      {
        id: "kids2-b1",
        nombre: "Bloque 1 · Lo que necesita la gente",
        unidades: [
          { id: "u1", orden: 1, titulo: "¿Qué es una necesidad?", area: "emprendimiento", sesiones: 2, estado: "dictada" },
          { id: "u2", orden: 2, titulo: "Observar mi salón", area: "emprendimiento", sesiones: 2, estado: "dictada" },
          { id: "u3", orden: 3, titulo: "Máquinas que ayudan", area: "robotica", sesiones: 3, estado: "dictada" },
          { id: "u4", orden: 4, titulo: "Mi primera idea", area: "emprendimiento", sesiones: 2, estado: "dictada" },
        ],
      },
      {
        id: "kids2-b2",
        nombre: "Bloque 2 · Intercambiar y medir",
        unidades: [
          { id: "u5", orden: 5, titulo: "El trueque", area: "emprendimiento", sesiones: 2, estado: "dictada" },
          { id: "u6", orden: 6, titulo: "Contar lo que tengo", area: "emprendimiento", sesiones: 2, estado: "activa", liberacion: "Disponible desde el 3 de septiembre" },
          { id: "u7", orden: 7, titulo: "Sensores que miden", area: "robotica", sesiones: 3, estado: "programada", liberacion: "Se libera el 15 de septiembre, 07:00" },
          { id: "u8", orden: 8, titulo: "El precio justo", area: "emprendimiento", sesiones: 2, estado: "sin-programar" },
        ],
      },
      {
        id: "kids2-b3",
        nombre: "Bloque 3 · Construir el producto",
        unidades: [
          { id: "u9", orden: 9, titulo: "De la idea al prototipo", area: "emprendimiento", sesiones: 3, estado: "sin-programar" },
          { id: "u10", orden: 10, titulo: "Un mecanismo que se mueve", area: "robotica", sesiones: 3, estado: "sin-programar" },
          { id: "u11", orden: 11, titulo: "Probar con mis compañeros", area: "emprendimiento", sesiones: 2, estado: "sin-programar" },
          { id: "u12", orden: 12, titulo: "Mejorar lo que no funcionó", area: "emprendimiento", sesiones: 2, estado: "sin-programar" },
        ],
      },
      {
        id: "kids2-b4",
        nombre: "Bloque 4 · Mostrar el trabajo",
        unidades: [
          { id: "u13", orden: 13, titulo: "Contar mi proyecto", area: "emprendimiento", sesiones: 2, estado: "sin-programar" },
          { id: "u14", orden: 14, titulo: "El robot que presenta", area: "robotica", sesiones: 3, estado: "sin-programar" },
          { id: "u15", orden: 15, titulo: "La feria del salón", area: "emprendimiento", sesiones: 2, estado: "sin-programar" },
          { id: "u16", orden: 16, titulo: "¿Qué aprendí?", area: "emprendimiento", sesiones: 1, estado: "sin-programar" },
        ],
      },
    ],
  },
];

/* ---------- RUTA DIDÁCTICA: plantilla fija de 7 secciones ---------- */

export interface RutaDidactica {
  unidadId: string;
  titulo: string;
  area: Area;
  objetivo: string;
  evidencias: string[];
  profundizacion: string[];
  inicio: string;
  desarrollo: string;
  evaluacion: string;
  queCalificar: string[];
  estandares: string[];
  dba: string[];
}

export const RUTAS: Record<string, RutaDidactica> = {
  u7: {
    unidadId: "u7",
    titulo: "Sensores que miden",
    area: "robotica",
    objetivo:
      "Reconocer que una máquina necesita medir algo del mundo antes de poder responder, y usar un sensor sencillo para registrar una medida que le sirva a un proyecto del salón.",
    evidencias: [
      "Nombra al menos dos cosas que un sensor puede medir y da un ejemplo de cada una en su casa o en el colegio.",
      "Registra en una tabla tres medidas tomadas con el mismo sensor y explica en voz alta si son iguales o distintas.",
      "Explica con sus palabras por qué su proyecto de emprendimiento necesita esa medida.",
    ],
    profundizacion: [
      "Sensores en objetos que los niños ya usan: la puerta del supermercado, la luz del baño, el termómetro.",
      "La diferencia entre estimar y medir.",
      "Por qué repetimos una medida varias veces.",
    ],
    inicio:
      "Pida a los estudiantes que adivinen, sin tocar, cuál de dos recipientes de agua está más tibio. Anote las respuestas del curso en el tablero. Luego mida con el sensor de temperatura frente a ellos y compare el resultado con lo que adivinaron. La conversación que se busca es por qué adivinar no alcanza cuando alguien depende de esa medida.",
    desarrollo:
      "Organice el curso en cinco grupos y entregue un sensor por grupo. Cada grupo toma tres medidas del mismo objeto y las escribe en su tabla. Recorra los grupos preguntando qué cambió entre una medida y otra. Cierre pidiendo a dos grupos que expliquen al curso una medida que les haya sorprendido. Si el sensor no está disponible, la actividad funciona igual con un termómetro de pared y agua a distintas temperaturas.",
    evaluacion:
      "Cada estudiante completa su tabla de tres medidas y responde oralmente, en su grupo, para qué le serviría esa medida al proyecto que está construyendo. Observe si distingue entre lo que adivinó al inicio y lo que midió después.",
    queCalificar: [
      "Tabla de tres medidas, completa y legible.",
      "Explicación oral de la utilidad de la medida para su proyecto.",
      "Participación en la comparación inicial entre estimar y medir.",
    ],
    estandares: [
      "Me ubico en el universo y en la Tierra e identifico características de la materia.",
      "Reconozco en el entorno fenómenos físicos que me afectan y desarrollo habilidades para aproximarme a ellos.",
    ],
    dba: [
      "DBA 3 · Comprende que los objetos y las sustancias tienen propiedades que pueden medirse.",
      "DBA 4 · Explica cómo los instrumentos amplían lo que los sentidos pueden percibir.",
    ],
  },
};

/* ---------- CLASES DEL DÍA ---------- */

export interface TarjetaContenido {
  id: string;
  titulo: string;
  pie: string;
  area: Area;
}

export interface Clase {
  id: string;
  asignatura: string;
  /* lo que se dicta hoy en esa clase: el titular del trecho. La asignatura
     es la materia; el tema es la sesión concreta de la fecha. */
  tema?: string;
  grupo: string;
  hora: string;
  /* una clase sin material aún no tiene área de contenido asignada */
  area?: Area;
  /* la capacidad del trecho: cuántos puestos tiene la clase en el período */
  ranuras: number;
  contenidos: TarjetaContenido[];
  proximaEntrega?: { titulo: string; vence: string; entregadas: number; total: number };
}

export const HOY: Clase[] = [
  {
    id: "c1",
    asignatura: "Comprensión Lectora",
    tema: "El círculo de lectura",
    grupo: "1°-01",
    hora: "07:00",
    area: "literatura",
    ranuras: 5,
    contenidos: [
      { id: "t1", titulo: "Caperucita Roja", pie: "Libro · 6-8", area: "literatura" },
      { id: "t2", titulo: "Preguntas para el círculo", pie: "Guía · solo docente", area: "literatura" },
      { id: "t3", titulo: "Alicia en el País de las Maravillas", pie: "Audiolibro · 9-11", area: "literatura" },
      { id: "t4", titulo: "El Mago de Oz", pie: "Libro · 9-11", area: "literatura" },
    ],
    proximaEntrega: { titulo: "Ficha de lectura — Caperucita", vence: "en 2 días", entregadas: 12, total: 25 },
  },
  {
    id: "c2",
    asignatura: "Robótica",
    tema: "Sensores que miden",
    grupo: "1°-01",
    hora: "09:00",
    area: "robotica",
    ranuras: 4,
    contenidos: [
      { id: "t5", titulo: "Ruta didáctica de 7 secciones", pie: "Unidad 7 · Kids 2", area: "robotica" },
      { id: "t6", titulo: "Tabla de medidas", pie: "Material imprimible", area: "robotica" },
    ],
    proximaEntrega: { titulo: "Tabla de tres medidas", vence: "en 5 días", entregadas: 0, total: 25 },
  },
  {
    id: "c3",
    asignatura: "Emprendimiento",
    tema: "Contar lo que tengo",
    grupo: "1°-01",
    hora: "10:30",
    area: "emprendimiento",
    ranuras: 4,
    contenidos: [
      { id: "t7", titulo: "Ruta didáctica de 7 secciones", pie: "Unidad 6 · Kids 2", area: "emprendimiento" },
      { id: "t8", titulo: "El trueque", pie: "Unidad 5 · dictada", area: "emprendimiento" },
      { id: "t9", titulo: "Fichas de conteo", pie: "Material imprimible", area: "emprendimiento" },
    ],
  },
  /*
    La clase vacía. Es el hallazgo que define el producto —el aula de la
    referencia contenía únicamente el foro por defecto— y por eso aparece en
    la maqueta: un trecho sin material se reconoce vacío desde el fondo del
    salón, sin leer una cifra.
  */
  {
    id: "c4",
    asignatura: "Ética y Valores",
    grupo: "1°-01",
    hora: "11:30",
    ranuras: 4,
    contenidos: [],
  },
];

export const DOCENTE = {
  nombre: "Docente de ejemplo",
  grupo: "1°-01",
  periodo: "Período 3",
  clasesACargo: 14,
};
