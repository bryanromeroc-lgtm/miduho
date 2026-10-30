/*
  DATOS DE MAQUETA Y CONTENIDO CURRICULAR PROPUESTO.

  No hay datos reales de estudiantes, docentes ni acudientes, y no deben
  inventarse datos personales de menores. Los nombres de estudiantes son
  evidentemente ficticios y existen solo para leer la estructura de la planilla.

  Los títulos de literatura son obras de dominio público (Grimm, Perrault,
  Carroll, Baum, Andersen, Doyle): referencias legítimas.

  Las unidades de Robótica y Emprendimiento reutilizan únicamente el ESQUEMA
  ESTRUCTURAL observado en la referencia (bloque → unidad → ruta didáctica de
  7 secciones). Ningún texto, imagen ni contenido de la referencia se copia:
  todo el contenido aquí es redacción propia pendiente de validación curricular
  por parte del colegio.
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
  /* Obras con páginas digitalizadas: se abren en el lector. El vínculo
     obra→páginas se declara en lib/libros.ts, no aquí. */
  { id: "lit-101", titulo: "¡Préstame tus ojos!", autor: "Gerardo Meneses Claros", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-102", titulo: "Una sonrisa de mariposa", autor: "Mathangi Subramanian", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-103", titulo: "Palabra última", autor: "Nicolás Buenaventura", tipo: "Libro", edad: "9-11", idioma: "Español" },
  /* De Maguaré (Ministerio de Culturas). La ficha de origen no publica
     rango de edad: el declarado aquí es una estimación a partir del texto
     y la maqueta de cada libro, y conviene revisarlo. */
  { id: "lit-104", titulo: "La muñeca negra", autor: "Mary Grueso Romero", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-105", titulo: "La voz de los hermanos mayores", autor: "Clarisa Ruíz", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-106", titulo: "Los héroes que vencieron todo menos el miedo", autor: "César Santiago Álvarez, Iván Darío Álvarez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-107", titulo: "Saltarines", autor: "Olga Cuellar", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-108", titulo: "Pijaraña, pijaraña, teje los versos la araña", autor: "Beatriz Helena Robledo (selección)", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-109", titulo: "El misterio de Villa Motor", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-110", titulo: "Un papá gritón", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-111", titulo: "Transformación en la montaña de las mariposas", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-112", titulo: "El carriel del señor Olvido", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-113", titulo: "La gallina Carlota", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-114", titulo: "Hay alguien nuevo en clase", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-115", titulo: "Girasoles para la abuela", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-116", titulo: "Gerard sin rumbo", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-117", titulo: "Un deseo y los señores anzuelo", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-118", titulo: "Free y la ruleta", autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez", tipo: "Libro", edad: "9-11", idioma: "Español" },
  { id: "lit-119", titulo: "Con sabor a hogar", autor: "Beatriz Helena Robledo", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-120", titulo: "Mi mascota", autor: "Yolanda Reyes", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-121", titulo: "Caterine Ibargüen", autor: "María Margarita Cabarcas", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-122", titulo: "Totó la Momposina", autor: "María Margarita Cabarcas", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-123", titulo: "Coco el Cocodrilo", autor: "María Margarita Cabarcas", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-124", titulo: "Samurai 8 bit infinito", autor: "Gabriel Cubillos Garzón", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-125", titulo: "Los nombres de las cosas", autor: "Antonia Torres Romero", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-126", titulo: "Historias de un virus", autor: "Ana Lucía Ariza y Dylan Riaño", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-127", titulo: "El pájaro consejero", autor: "Ian Yesid Guerrero", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-128", titulo: "El maestro Brícula", autor: "Alejandro López Lozano", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-129", titulo: "El ogro", autor: "Ana Sofía León Boyacá, Eileen Isabel León Boyacá, Samara Camila León Boyacá", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-130", titulo: "Camino de retacitos para echar a volar", autor: "Leonardo Gutiérrez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-131", titulo: "Mi mundo", autor: "Juan Franco", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-132", titulo: "Al ritmo del corazón", autor: "María del Sol Peralta, Irene Vasco", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-133", titulo: "La obra de Rani", autor: "Amalia Low", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-134", titulo: "El resfrío", autor: "María del Sol Peralta, Irene Vasco", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-135", titulo: "La gran tormenta", autor: "Amalia Low", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-136", titulo: "Para ver las estrellas", autor: "Amalia Satizábal", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-137", titulo: "El libro de todos", autor: "María del Sol Peralta, Irene Vasco", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-138", titulo: "Descubre, imagina y crea con Molas", autor: "Maguaré", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-139", titulo: "Cuento 12: Derecho al juego y al arte", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-140", titulo: "Cuento 11: Derecho a la educación", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-141", titulo: "Cuento 10: Derecho a la atención especial en discapacidad", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-142", titulo: "Cuento 9: Derecho a la salud", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-143", titulo: "Cuento 8: Derecho a que se respete su cultura", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-144", titulo: "Cuento 7: Derecho a acceder a la información", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-145", titulo: "Cuento 6: Derecho a expresarse", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-146", titulo: "Cuento 5: Derecho a la libertad", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-147", titulo: "Cuento 4: Derecho a vivir con su familia", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-148", titulo: "Cuento 3: Derecho a un nombre y a una nacionalidad", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-149", titulo: "Cuento 2: Derecho a la vida, la supervivencia y el desarrollo", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-150", titulo: "Cuento 1: Derecho a ser cuidados, defendidos y protegidos", autor: "Claudia Patricia Bautista Arias", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-151", titulo: "El frenético baile de Chip", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-152", titulo: "El cumpleaños de Rosalinda", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-153", titulo: "La memoria del abuelo", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-154", titulo: "Una sopa para la fiesta", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-155", titulo: "El libro perdido de Gigi", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-156", titulo: "El viaje de la familia Cuy", autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-157", titulo: "Los arrullos de Jáamo", autor: "Tradición oral (ed. Jesús Mario Girón Higuita)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-158", titulo: "Patas de armadillo, dientes de ratón", autor: "Tradición oral (ed. Alberto Aljure)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-159", titulo: "Canciones, rondas, nanas, retahílas y adivinanzas", autor: "Tradición oral (sel. Iván Hernández)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-160", titulo: "Por qué el elefante tiene la trompa así", autor: "Rudyard Kipling", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-161", titulo: "La bella y la bestia", autor: "Jeanne Marie Leprince de Beaumont", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-162", titulo: "Fábulas", autor: "Félix María Samaniego", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-163", titulo: "Meñique", autor: "José Martí", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-164", titulo: "El patito feo", autor: "Hans Christian Andersen", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-165", titulo: "Ábrete, grano pequeño", autor: "Horacio Benavides", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-166", titulo: "De animales y de niños", autor: "María Eastman, Rafael Jaramillo, Gabriela Mercedes Arciniegas, Santiago Pérez, Rocío Vélez", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-167", titulo: "Barbas, pelos y cenizas", autor: "Charles Perrault, Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-168", titulo: "Canta palabras", autor: "Varios autores", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-169", titulo: "Un castillo de libros", autor: "Susana Aristizábal", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-170", titulo: "Tiki, tiki, tai", autor: "Tradición oral rrom (ed. María Cristina Rincón)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-171", titulo: "Puro cuento", autor: "Hans Christian Andersen, Alexander Pushkin, Joseph Jacobs, Oscar Wilde, Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-172", titulo: "De viva voz", autor: "Varios autores", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-173", titulo: "Con Pombo y platillos", autor: "Rafael Pombo", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-174", titulo: "El rey de los topos y su hija", autor: "Alejandro Dumas", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-175", titulo: "Bosque adentro", autor: "Hermanos Grimm", tipo: "Libro", edad: "6-8", idioma: "Español" },
  { id: "lit-176", titulo: "Una morena en la ronda", autor: "Tradición oral afrocolombiana (ed. María Cristina Rincón)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-177", titulo: "Putunkaa serruma: duérmete, pajarito blanco", autor: "Tradición oral indígena (ed. María Cristina Rincón)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-178", titulo: "Tortuguita, vení bailá", autor: "Tradición oral indígena", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-179", titulo: "La liebre y la tortuga", autor: "Fábula tradicional (adaptación Mi Dulce Hogar)", tipo: "Libro", edad: "0-5", idioma: "Español" },
  { id: "lit-180", titulo: "Tula y el mural del bosque", autor: "Bryan Romero", tipo: "Libro", edad: "6-8", idioma: "Español" },
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
  Programa propio de MIDUHO para primaria. La referencia externa aportó solo
  temas generales y el esquema bloque → unidad → ruta de 7 secciones. Los
  nombres, instrucciones, actividades y criterios son redacción original.
*/
export const PROGRAMAS: Programa[] = [
  {
    id: "energia-proyectos-1",
    nombre: "Energía, creatividad y proyectos · 1.º",
    descripcion:
      "Diez rutas didácticas de MIDUHO: cinco de Robótica y cinco ejercicios de Emprendimiento para observar, experimentar, crear y comunicar.",
    bloques: [
      {
        id: "energia-proyectos-1-b1",
        nombre: "Bloque 1 · Energía y movimiento",
        unidades: [
          { id: "rob-energia-movimiento", orden: 1, titulo: "Energía para movernos", area: "robotica", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "rob-transformaciones", orden: 2, titulo: "Cuando la energía cambia", area: "robotica", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "rob-circuitos-seguros", orden: 3, titulo: "Circuitos seguros", area: "robotica", sesiones: 3, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "rob-camino-corriente", orden: 4, titulo: "El camino de la corriente", area: "robotica", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "rob-molino-movimiento", orden: 5, titulo: "Molino en movimiento", area: "robotica", sesiones: 3, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
        ],
      },
      {
        id: "energia-proyectos-1-b2",
        nombre: "Bloque 2 · Ideas que se convierten en proyectos",
        unidades: [
          { id: "emp-problema-oportunidad", orden: 6, titulo: "De un problema a una oportunidad", area: "emprendimiento", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "emp-preguntar-crear", orden: 7, titulo: "Preguntar antes de crear", area: "emprendimiento", sesiones: 3, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "emp-paso-a-paso", orden: 8, titulo: "Diseñar el paso a paso", area: "emprendimiento", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "emp-nombre-proyecto", orden: 9, titulo: "Un nombre que se recuerde", area: "emprendimiento", sesiones: 2, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
          { id: "emp-preparar-feria", orden: 10, titulo: "Preparar nuestra feria", area: "emprendimiento", sesiones: 3, estado: "activa", liberacion: "Disponible para docentes y estudiantes" },
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

const ALINEACION_ROBOTICA = [
  "🔶 Propuesta de alineación: observar fenómenos del entorno, formular preguntas y comunicar resultados de experiencias sencillas.",
  "🔶 Propuesta de alineación: reconocer usos responsables de artefactos, materiales y fuentes de energía en contextos cotidianos.",
];

const ALINEACION_EMPRENDIMIENTO = [
  "🔶 Propuesta institucional: reconocer necesidades del entorno y participar en soluciones colaborativas acordes con la edad.",
  "🔶 Propuesta institucional: comunicar ideas, escuchar otras perspectivas y tomar decisiones con información sencilla.",
];

const DBA_POR_CONFIRMAR = [
  "🔶 Por confirmar con el plan de área del colegio: no se asigna un código DBA hasta realizar la revisión curricular institucional.",
];

export const RUTAS: Record<string, RutaDidactica> = {
  "rob-energia-movimiento": {
    unidadId: "rob-energia-movimiento",
    titulo: "Energía para movernos",
    area: "robotica",
    objetivo: "Reconocer que los movimientos cotidianos necesitan energía e identificar fuentes como el cuerpo, el viento, el sol, una pila o la corriente eléctrica, sin confundir la fuente con el objeto que se mueve.",
    evidencias: [
      "Clasifica al menos cuatro situaciones según la fuente de energía que produce el movimiento.",
      "Explica con un dibujo de dónde sale la energía y qué objeto cambia o se mueve.",
      "Hace funcionar un prototipo liviano mediante empuje, aire o una banda elástica.",
    ],
    profundizacion: ["Fuente de energía y efecto observable.", "Energías renovables y no renovables en lenguaje introductorio.", "Uso responsable de la energía en el colegio y el hogar."],
    inicio: "Muestre un carrito quieto, un molinillo de papel y una linterna apagada. Pregunte qué necesita cada objeto para producir un cambio. Recoja las hipótesis sin calificarlas todavía y organícelas en un tablero con dos columnas: fuente y efecto.",
    desarrollo: "Prepare estaciones con un carrito impulsado por la mano, un molinillo movido con aire y una banda elástica que desplaza una figura de cartón. En equipos, los estudiantes hacen funcionar cada modelo, dibujan la fuente y el efecto, y comparan qué se conserva y qué cambia. Cierre con ejemplos del aula y una acción concreta para evitar desperdiciar energía.",
    evaluacion: "Entregue tres escenas nuevas para que cada estudiante una la fuente de energía con su efecto y justifique una elección oralmente. Valore la relación explicada, no la velocidad de respuesta.",
    queCalificar: ["Clasificación de fuentes y efectos.", "Dibujo con una relación comprensible entre origen y movimiento.", "Explicación oral y cuidado de los materiales."],
    estandares: ALINEACION_ROBOTICA,
    dba: DBA_POR_CONFIRMAR,
  },
  "rob-transformaciones": {
    unidadId: "rob-transformaciones",
    titulo: "Cuando la energía cambia",
    area: "robotica",
    objetivo: "Describir una transformación sencilla de energía siguiendo una cadena de tres momentos: fuente, mecanismo o artefacto y efecto observable.",
    evidencias: ["Ordena tarjetas para representar una transformación de energía.", "Distingue entre luz, sonido, calor y movimiento como efectos observables.", "Explica una cadena usando las palabras primero, después y al final."],
    profundizacion: ["Transformación de energía en artefactos cotidianos.", "Cadenas de causa y efecto.", "Diferencia entre la fuente y el efecto que observamos."],
    inicio: "Encienda una linterna de baja tensión y pregunte qué había antes de la luz. Dibuje una cadena vacía de tres cuadros y complete con el grupo: pila, circuito, luz. Repita oralmente la secuencia con conectores temporales.",
    desarrollo: "Cada equipo recibe tarjetas con fuentes, artefactos y efectos. Primero construye cadenas posibles; luego prueba una linterna, un juguete manual o un instrumento de percusión y corrige su cadena según lo observado. Finalmente crea un cartel de una transformación y marca con flechas el recorrido.",
    evaluacion: "Cada estudiante recibe una situación cotidiana diferente y completa una cadena de tres cuadros. Después explica al grupo cuál fue el cambio observable y qué evidencia le permitió reconocerlo.",
    queCalificar: ["Secuencia lógica de los tres momentos.", "Uso de vocabulario: fuente, transformación y efecto.", "Justificación basada en una observación."],
    estandares: ALINEACION_ROBOTICA,
    dba: DBA_POR_CONFIRMAR,
  },
  "rob-circuitos-seguros": {
    unidadId: "rob-circuitos-seguros",
    titulo: "Circuitos seguros",
    area: "robotica",
    objetivo: "Construir y representar un circuito cerrado de baja tensión que encienda una luz, aplicando acuerdos de seguridad y reconociendo la función de cada componente.",
    evidencias: ["Identifica pila, cables, interruptor y luz en un circuito escolar.", "Arma un recorrido cerrado con acompañamiento docente.", "Explica por qué solo se usan componentes de baja tensión y nunca tomacorrientes."],
    profundizacion: ["Circuito abierto y circuito cerrado.", "Componentes y función dentro del recorrido.", "Normas de cuidado durante una experiencia eléctrica."],
    inicio: "Presente los componentes desconectados y establezca el acuerdo central: en esta actividad nunca se manipulan enchufes ni tomacorrientes. Muestre un circuito abierto y pida al grupo predecir qué falta para que la luz encienda.",
    desarrollo: "En grupos pequeños y con supervisión, los estudiantes conectan una pila de baja tensión, cables y una luz LED preparada para uso escolar. Prueban abrir y cerrar el recorrido con un interruptor simple, dibujan las conexiones y explican la función de cada pieza. Si no hay componentes, use tarjetas y lana para simular el recorrido sin electricidad.",
    evaluacion: "El equipo recibe un circuito seguro con una conexión incompleta, identifica el punto abierto y propone cómo corregirlo. Cada integrante menciona una norma de seguridad y la razón para cumplirla.",
    queCalificar: ["Representación del circuito cerrado.", "Identificación de componentes y funciones.", "Aplicación y explicación de acuerdos de seguridad."],
    estandares: ALINEACION_ROBOTICA,
    dba: DBA_POR_CONFIRMAR,
  },
  "rob-camino-corriente": {
    unidadId: "rob-camino-corriente",
    titulo: "El camino de la corriente",
    area: "robotica",
    objetivo: "Comparar materiales cotidianos mediante un circuito comprobador de baja tensión y registrar cuáles permiten o interrumpen el recorrido eléctrico.",
    evidencias: ["Formula una predicción antes de probar cada material.", "Registra resultados en una tabla de conductor o aislante.", "Compara la predicción con la evidencia y cambia su respuesta cuando es necesario."],
    profundizacion: ["Conductores y aislantes.", "Predicción, prueba y resultado.", "Repetición de pruebas para confirmar un hallazgo."],
    inicio: "Muestre una cuchara metálica, un palito de madera y una tapa plástica. Pida predecir cuál podría completar un circuito comprobador. Registre votos y aclare que una predicción puede cambiar cuando aparece evidencia.",
    desarrollo: "La docente controla el circuito comprobador de baja tensión. Por turnos, los equipos prueban objetos seguros y secos, observan si la luz enciende y registran el resultado. Repiten una prueba dudosa y agrupan los materiales. No se prueban líquidos, tomacorrientes, dispositivos ni objetos conectados a la red.",
    evaluacion: "Cada estudiante interpreta una tabla de cinco pruebas, identifica un patrón y escribe o dicta una conclusión que incluya un resultado que contradijo su predicción inicial.",
    queCalificar: ["Tabla completa de predicción y resultado.", "Clasificación sustentada en las pruebas.", "Conclusión que diferencia lo pensado de lo observado."],
    estandares: ALINEACION_ROBOTICA,
    dba: DBA_POR_CONFIRMAR,
  },
  "rob-molino-movimiento": {
    unidadId: "rob-molino-movimiento",
    titulo: "Molino en movimiento",
    area: "robotica",
    objetivo: "Diseñar un molino sencillo de papel o cartulina, comparar el efecto de una variable en su movimiento y mejorar el prototipo a partir de resultados registrados.",
    evidencias: ["Construye un prototipo con aspas que puedan girar.", "Mantiene una condición igual mientras cambia una característica del diseño.", "Registra el resultado de dos pruebas y propone una mejora relacionada con la evidencia."],
    profundizacion: ["Movimiento producido por una corriente de aire.", "Prueba justa: cambiar una variable a la vez.", "Ciclo de diseño: construir, probar, revisar y mejorar."],
    inicio: "Muestre dos molinos con aspas diferentes y genere la misma corriente de aire para ambos. Pregunte cuál gira mejor y qué tendría que mantenerse igual para compararlos de manera justa.",
    desarrollo: "Cada equipo construye un molino con papel, un eje seguro preparado por la docente y una base reutilizable. Realiza una primera prueba frente a un ventilador en posición fija o con aire manual constante, cuenta giros durante diez segundos y registra. Después modifica solo el tamaño o la forma de las aspas, repite y compara.",
    evaluacion: "El equipo presenta las dos versiones, muestra su registro y completa la frase: cambiamos…, mantuvimos…, observamos… y por eso recomendamos…. La docente pregunta cómo harían una tercera prueba más confiable.",
    queCalificar: ["Prototipo funcional y manipulación cuidadosa.", "Registro comparable de dos pruebas.", "Mejora justificada con evidencia."],
    estandares: ALINEACION_ROBOTICA,
    dba: DBA_POR_CONFIRMAR,
  },
  "emp-problema-oportunidad": {
    unidadId: "emp-problema-oportunidad",
    titulo: "De un problema a una oportunidad",
    area: "emprendimiento",
    objetivo: "Observar una situación cercana, describir a quién afecta y convertirla en una oportunidad de mejora concreta, respetuosa y posible para el grupo.",
    evidencias: ["Registra una observación sin señalar ni culpar a una persona.", "Diferencia un deseo personal de una necesidad compartida.", "Formula una oportunidad con la estructura: ¿cómo podríamos…?"],
    profundizacion: ["Observación respetuosa del entorno.", "Necesidad, deseo y oportunidad.", "Preguntas que abren varias soluciones posibles."],
    inicio: "Presente una escena ficticia: después de una actividad quedan materiales mezclados y se pierde tiempo al buscarlos. Pregunte qué se observa, quién necesita ayuda y qué podría mejorar, evitando pasar de inmediato a una solución.",
    desarrollo: "Los equipos recorren zonas autorizadas del aula sin recoger nombres ni datos personales. Registran mediante dibujos tres situaciones, eligen una por frecuencia e impacto y completan: observamos…, esto dificulta… y ¿cómo podríamos…? Luego intercambian fichas para verificar que la pregunta no culpe a nadie ni incluya una solución escondida.",
    evaluacion: "Cada equipo presenta su oportunidad en un minuto. El grupo usa tres criterios visibles: se entiende, ayuda a alguien y puede trabajarse desde el aula. La propuesta se ajusta con la retroalimentación recibida.",
    queCalificar: ["Registro de una observación verificable.", "Diferenciación entre necesidad y deseo.", "Pregunta de oportunidad clara y respetuosa."],
    estandares: ALINEACION_EMPRENDIMIENTO,
    dba: DBA_POR_CONFIRMAR,
  },
  "emp-preguntar-crear": {
    unidadId: "emp-preguntar-crear",
    titulo: "Preguntar antes de crear",
    area: "emprendimiento",
    objetivo: "Diseñar una encuesta breve y anónima, organizar sus respuestas y utilizar el resultado para tomar una decisión inicial sobre una idea de proyecto.",
    evidencias: ["Redacta preguntas neutrales con opciones comprensibles.", "Registra respuestas sin nombres ni datos personales.", "Representa cantidades con marcas o pictogramas y decide según el resultado."],
    profundizacion: ["Preguntas abiertas y preguntas con opciones.", "Encuestas anónimas y cuidado de la información.", "Conteo, comparación y decisión basada en respuestas."],
    inicio: "Pregunte cuál de tres materiales sería más útil para organizar lápices. Haga una votación rápida y luego muestre cómo una pregunta que sugiere una respuesta puede alterar el resultado. Construyan juntos una versión neutral.",
    desarrollo: "Cada equipo redacta hasta tres preguntas sobre su oportunidad y las prueba con otro equipo. Después aplica la encuesta sin pedir nombres, teléfonos ni información familiar. Organiza las respuestas con palitos de conteo o pictogramas, identifica la opción más frecuente y escribe qué decisión puede tomar y cuál todavía no.",
    evaluacion: "El equipo entrega la encuesta, el registro y una conclusión de dos frases. Debe demostrar que la decisión se relaciona con los datos y reconocer si la cantidad de respuestas es insuficiente para afirmar algo sobre todo el colegio.",
    queCalificar: ["Claridad y neutralidad de las preguntas.", "Registro anónimo y organizado.", "Decisión coherente con los resultados."],
    estandares: ALINEACION_EMPRENDIMIENTO,
    dba: DBA_POR_CONFIRMAR,
  },
  "emp-paso-a-paso": {
    unidadId: "emp-paso-a-paso",
    titulo: "Diseñar el paso a paso",
    area: "emprendimiento",
    objetivo: "Crear, probar y mejorar una secuencia de instrucciones para que otra persona pueda elaborar o usar una solución sin recibir explicaciones adicionales.",
    evidencias: ["Ordena materiales y acciones antes de comenzar.", "Escribe o representa cada paso con un verbo y una acción.", "Modifica una instrucción después de observar la prueba de otro equipo."],
    profundizacion: ["Secuencias e instrucciones.", "Verbos de acción y apoyos visuales.", "Prueba con usuarios y mejora de un proceso."],
    inicio: "Entregue cuatro tarjetas desordenadas para armar una figura de papel sencilla. Pida seguirlas literalmente y converse sobre qué ocurre cuando falta un paso, una cantidad o una palabra precisa.",
    desarrollo: "El equipo elige una tarea segura de cinco pasos, lista materiales y crea instrucciones con dibujos y verbos. Otro equipo realiza la tarea sin preguntas mientras los autores observan en silencio. Después ambos señalan el punto confuso, corrigen la secuencia y hacen una segunda prueba corta.",
    evaluacion: "Compare la versión inicial y la corregida. Cada integrante explica qué cambió y qué comportamiento observado motivó la mejora. La secuencia final debe poder leerse de arriba abajo y tener materiales, orden y cierre.",
    queCalificar: ["Secuencia completa y ordenada.", "Claridad de verbos, cantidades o apoyos visuales.", "Mejora vinculada a una observación de la prueba."],
    estandares: ALINEACION_EMPRENDIMIENTO,
    dba: DBA_POR_CONFIRMAR,
  },
  "emp-nombre-proyecto": {
    unidadId: "emp-nombre-proyecto",
    titulo: "Un nombre que se recuerde",
    area: "emprendimiento",
    objetivo: "Crear y seleccionar un nombre original para el proyecto mediante criterios de claridad, relación con la solución, respeto y facilidad de pronunciación.",
    evidencias: ["Propone varias opciones relacionadas con el proyecto.", "Aplica una matriz sencilla de criterios sin votar por amistad.", "Explica por qué el nombre elegido representa la solución."],
    profundizacion: ["Nombre de proyecto e identidad.", "Criterios para comparar opciones.", "Respeto por nombres e identidades existentes."],
    inicio: "Muestre tres nombres ficticios para una caja organizadora y pregunte qué permite imaginar cada uno. Construya con el grupo los criterios: se entiende, se recuerda, se pronuncia con facilidad, se relaciona con la idea y es respetuoso.",
    desarrollo: "Cada integrante propone dos nombres. El equipo elimina los que incluyan nombres de compañeros, marcas conocidas o expresiones ofensivas. Luego puntúa las opciones con una matriz de sí o todavía no, selecciona dos finalistas, las prueba oralmente con otro equipo y toma una decisión argumentada.",
    evaluacion: "El equipo presenta el nombre, la matriz y una frase descriptiva. Debe explicar qué criterio fue decisivo y qué cambio hizo después de escuchar cómo otras personas comprendían la propuesta.",
    queCalificar: ["Variedad y pertinencia de las opciones.", "Uso consistente de los criterios.", "Argumento claro y trato respetuoso de las propuestas."],
    estandares: ALINEACION_EMPRENDIMIENTO,
    dba: DBA_POR_CONFIRMAR,
  },
  "emp-preparar-feria": {
    unidadId: "emp-preparar-feria",
    titulo: "Preparar nuestra feria",
    area: "emprendimiento",
    objetivo: "Planear una muestra escolar del proyecto distribuyendo responsabilidades, preparando un mensaje breve y registrando materiales e intercambios de manera sencilla.",
    evidencias: ["Organiza tareas, responsables y tiempos en una lista visible.", "Presenta problema, solución y aprendizaje en menos de dos minutos.", "Lleva un registro simple de materiales disponibles, usados y restantes."],
    profundizacion: ["Plan de trabajo y responsabilidades rotativas.", "Presentación breve de una idea.", "Registro básico de recursos e intercambios sin dinero real."],
    inicio: "Simule una feria que empieza en diez minutos y presente una caja con cartel, prototipo y materiales mezclados. Pregunte qué tendría que organizarse primero para recibir a una persona y explicar el proyecto con claridad.",
    desarrollo: "Los equipos crean un plan con montaje, bienvenida, demostración, registro y cierre. Preparan un cartel con texto grande, ensayan una presentación de dos minutos y usan fichas didácticas —nunca dinero real— para practicar el registro de intercambios. Rotan los roles para que todos conozcan el proceso y realizan un ensayo con otro equipo.",
    evaluacion: "En una muestra interna, la docente observa el cumplimiento del plan, la claridad del mensaje y el registro de recursos. El equipo realiza un cierre: qué funcionó, qué faltó y qué modificaría antes de una feria con familias.",
    queCalificar: ["Plan visible con tareas y responsables.", "Presentación que conecta necesidad, solución y aprendizaje.", "Registro correcto de materiales o fichas y reflexión final."],
    estandares: ALINEACION_EMPRENDIMIENTO,
    dba: DBA_POR_CONFIRMAR,
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
    tema: "Circuitos seguros",
    grupo: "1°-01",
    hora: "09:00",
    area: "robotica",
    ranuras: 4,
    contenidos: [
      { id: "t5", titulo: "Circuitos seguros", pie: "Ruta didáctica · Unidad 3", area: "robotica" },
      { id: "t6", titulo: "Registro de conexiones", pie: "Material imprimible", area: "robotica" },
    ],
    proximaEntrega: { titulo: "Dibujo del circuito seguro", vence: "en 5 días", entregadas: 0, total: 25 },
  },
  {
    id: "c3",
    asignatura: "Emprendimiento",
    tema: "Preguntar antes de crear",
    grupo: "1°-01",
    hora: "10:30",
    area: "emprendimiento",
    ranuras: 4,
    contenidos: [
      { id: "t7", titulo: "Preguntar antes de crear", pie: "Ruta didáctica · Unidad 7", area: "emprendimiento" },
      { id: "t8", titulo: "Encuesta breve y anónima", pie: "Actividad de aula", area: "emprendimiento" },
      { id: "t9", titulo: "Registro de respuestas", pie: "Material imprimible", area: "emprendimiento" },
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
