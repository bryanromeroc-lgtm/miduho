/*
  LIBROS LEÍBLES — el catálogo de la biblioteca lista títulos; esto declara
  cuáles de ellos tienen páginas digitalizadas y pueden abrirse en el lector.
  Un título sin entrada aquí simplemente no muestra el botón «Leer»: la
  biblioteca no promete lo que no puede cumplir.

  Hay dos formatos de origen:
  · Páginas escaneadas: /public/libros/<slug>/pNN.webp (1000×1000) con
    miniatura tNN.webp (200×200). Una imagen por página, sin más.
  · Páginas compuestas: ilustración + texto real declarados en
    lib/paginas/<slug>.ts. Se usa cuando el original trae el texto pequeño
    junto a ilustraciones grandes (StoryWeaver): rasterizado quedaría
    ilegible, compuesto se lee con tipografía a la medida de la hoja.
  El orden es el del libro impreso: la primera es la portada y la última la
  contraportada, por eso el lector usa showCover.
*/

export type Disposicion =
  | "portada" /* ilustración apaisada arriba; título y créditos debajo */
  | "lado" /* ilustración vertical a la izquierda; texto a la derecha */
  | "arriba" /* ilustración apaisada arriba; texto debajo */
  | "fondo" /* ilustración de página completa; texto en su hueco superior */
  | "pasos" /* ilustración de viñetas apiladas; lista de pasos al lado */
  | "creditos"
  | "contraportada";

export interface PaginaCompuesta {
  disposicion: Disposicion;
  ilustracion?: string;
  titulo?: string;
  parrafos?: string[];
  /* solo para «fondo»: en qué lado del hueco blanco cae el texto */
  textoAlineado?: "izquierda" | "derecha";
  /* solo para «pasos»: número del primer paso cuando la lista sigue de la
     página anterior */
  inicio?: number;
}

import { PAGINAS_SONRISA } from "@/lib/paginas/una-sonrisa-de-mariposa";

export interface Libro {
  slug: string;
  /* id del título en TITULOS — vínculo explícito con el catálogo */
  tituloId: string;
  titulo: string;
  autor: string;
  editorial: string;
  paginas: number;
  /* relación de aspecto de la página impresa (ancho/alto) */
  razon: number;
  /* Pares de hojas que en el original eran un solo pliego ilustrado. Vienen
     del conversor (flipbook-forge), que parte en dos las páginas dobles del
     PDF, y dicen dónde el dibujo cruza de una hoja a la siguiente.

     El lector no los consulta: le basta con que cada par caiga en la misma
     pantalla, y de eso se encarga la numeración. Se declaran porque son la
     estructura real del libro —quien vuelva a convertirlo sabrá si la
     alineación sigue siendo la buena— y porque un par cuyos números no sean
     consecutivos y en el mismo pliego del lector delata un desfase. */
  pliegos?: [number, number][];
  edad: string;
  resumen: string;
  /* presente solo en los libros compuestos; su longitud es `paginas` */
  contenido?: PaginaCompuesta[];
}

export interface PaginaLibro {
  numero: number;
  miniatura: string;
  /* página escaneada: una sola imagen */
  src?: string;
  /* página compuesta: ilustración + texto que el lector maqueta */
  compuesta?: PaginaCompuesta;
}

export const LIBROS: Libro[] = [
  {
    slug: "prestame-tus-ojos",
    tituloId: "lit-101",
    titulo: "¡Préstame tus ojos!",
    autor: "Gerardo Meneses Claros",
    editorial: "Trend",
    paginas: 38,
    razon: 1,
    edad: "6-8",
    resumen:
      "Felipe es un niño alegre, curioso y buen estudiante. Vive con sus padres en un pueblo colombiano pero un día ocurre una tragedia que le cambia la vida a todos.",
  },
  {
    slug: "una-sonrisa-de-mariposa",
    tituloId: "lit-102",
    titulo: "Una sonrisa de mariposa",
    autor: "Mathangi Subramanian · il. Lavanya Naidu",
    editorial: "Pratham Books · StoryWeaver",
    paginas: PAGINAS_SONRISA.length,
    /* la de las ilustraciones de página completa del original (1073×771) */
    razon: 1073 / 771,
    edad: "6-8",
    resumen:
      "Kavya acaba de llegar del campo a la ruidosa Bangalore y aún no habla con nadie en su nueva escuela. Una salida al parque lleno de mariposas le da la ocasión de contar lo que sabe y de hacer su primera amiga.",
    contenido: PAGINAS_SONRISA,
  },
  {
    /* Convertido con flipbook-forge desde el PDF del Ministerio: 27 páginas
       —23 de ellas pliegos a doble plana— dieron 49 hojas de libro. Los datos
       de abajo salen tal cual de su libro.json.

       Se omitió la página 2 del PDF, una guarda editorial: con ella el primer
       pliego caía en número impar y, como el lector empareja 2-3, 4-5, 6-7…,
       todas las ilustraciones a doble plana se habrían partido entre dos
       pantallas. Sin ella los 23 pliegos cruzan enteros. */
    slug: "palabra-ultima",
    tituloId: "lit-103",
    titulo: "Palabra última",
    autor: "Nicolás Buenaventura · il. Valentina Toro",
    editorial: "Ministerio de Culturas · Biblioteca Nacional",
    paginas: 49,
    razon: 0.7026,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27],
      [28, 29], [30, 31], [32, 33], [34, 35], [36, 37], [38, 39],
      [40, 41], [42, 43], [44, 45], [46, 47],
    ],
    edad: "9-11",
    resumen:
      "Un viaje por las selvas colombianas y por la memoria que guardan: seres míticos, orígenes lejanos y los secretos que esconden las arrugas del tiempo.",
  },
  {
    /* Autora: Mary Grueso Romero - Ilustraciones: Natalia Rojas Castro
       —
       Maguaré · https://maguare.gov.co/la-muneca-negra/
       Convertido con flipbook-forge desde la-muneca-negra.pdf:
       27 páginas de PDF → 51 hojas, 23 pliegos.

       Alineado con una hoja en blanco tras la portada: la página 2 del
       PDF es un epígrafe y no se puede quitar, pero sin la
       hoja extra el primer pliego caía en impar y todas las ilustraciones
       a doble plana se partían entre dos pantallas. */
    slug: "la-muneca-negra",
    tituloId: "lit-104",
    titulo: "La muñeca negra",
    autor: "Mary Grueso Romero",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 51,
    razon: 0.7026,
    pliegos: [
      [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17],
      [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31],
      [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45],
      [46, 47], [48, 49],
    ],
    edad: "6-8",
    resumen: "A orillas del Pacífico surgió esta historia que se volvió cuento y poema, y que viaja por toda Colombia para hablarnos del sueño de una niña, un sueño simple pero poderoso.",
  },
  {
    /* Autora: Clarisa Ruíz - Ilustraciones: Juan Camilo Mayorga
       —
       Maguaré · https://maguare.gov.co/la-voz-de-los-hermanos-mayores/
       Convertido con flipbook-forge desde la-voz-de-los-hermanos-mayores.pdf:
       35 páginas de PDF → 68 hojas, 33 pliegos. */
    slug: "la-voz-de-los-hermanos-mayores",
    tituloId: "lit-105",
    titulo: "La voz de los hermanos mayores",
    autor: "Clarisa Ruíz",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 68,
    razon: 0.7026,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67],
    ],
    edad: "9-11",
    resumen: "En este libro las palabras son los personajes principales, porque las «palabras son como la gente, tienen una historia propia, tienen hermanas, primos, hijos y tatarabuelos. Algunas quieren convivir con varios sentidos, otras cambian de sentido de cuando en cuando. Las palabras no existen solas, pertenecen a familias, a comunidades, viven en el lenguaje, en la voz de los pueblos».",
  },
  {
    /* Autores: César Santiago Álvarez, Iván Darío Álvarez - Ilustraciones: Julián Ariza
       —
       Maguaré · https://maguare.gov.co/los-heroes-que-vencieron-todo-menos-el-miedo/
       Convertido con flipbook-forge desde los-heroes-que-vencieron-todo-menos-el-miedo.pdf:
       27 páginas de PDF → 51 hojas, 23 pliegos.

       Alineado con una hoja en blanco tras la portada: la página 2 del
       PDF es la dedicatoria a César Álvarez y no se puede quitar, pero sin la
       hoja extra el primer pliego caía en impar y todas las ilustraciones
       a doble plana se partían entre dos pantallas. */
    slug: "los-heroes-que-vencieron-todo-menos-el-miedo",
    tituloId: "lit-106",
    titulo: "Los héroes que vencieron todo menos el miedo",
    autor: "César Santiago Álvarez, Iván Darío Álvarez",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 51,
    razon: 0.7026,
    pliegos: [
      [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17],
      [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31],
      [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45],
      [46, 47], [48, 49],
    ],
    edad: "9-11",
    resumen: "Este libro se comenzó a gestar meses antes de que el maestro César Santiago Álvarez se fuera a compartir su magia a otros mundos. No nos queda más que un profundo e inmenso agradecimiento por todos los esfuerzos que tanto él como su hermano Iván Darío han hecho para que el teatro y la fantasía de los títeres sigan alimentando los corazones y la imaginación de niños y niñas.",
  },
  {
    /* Autora: Olga Cuellar
       —
       Maguaré · https://maguare.gov.co/saltarines/
       Convertido con flipbook-forge desde saltarines.pdf:
       17 páginas de PDF → 31 hojas, 13 pliegos.

       Alineado con una hoja en blanco tras la portada: la página 2 del
       PDF es el poema que abre el libro y no se puede quitar, pero sin la
       hoja extra el primer pliego caía en impar y todas las ilustraciones
       a doble plana se partían entre dos pantallas. */
    slug: "saltarines",
    tituloId: "lit-107",
    titulo: "Saltarines",
    autor: "Olga Cuellar",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 31,
    razon: 0.7026,
    pliegos: [
      [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17],
      [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
    ],
    edad: "0-5",
    resumen: "Con gracia y alegría, los personajes de este libro se fueron a jugar a otros parajes, quizá esta noche, mientras duermes, te inviten a formar parte de sus disparates.",
  },
  {
    /* Selección: Beatriz Helena Robledo - Ilustraciones: Gabriela Otálora
       —
       Maguaré · https://maguare.gov.co/pijarana-pijarana-teje-los-versos-la-arana/
       Convertido con flipbook-forge desde pijarana-pijarana-teje-los-versos-la-arana.pdf:
       27 páginas de PDF → 51 hojas, 23 pliegos.

       Alineado con una hoja en blanco tras la portada: la página 2 del
       PDF es un epígrafe y no se puede quitar, pero sin la
       hoja extra el primer pliego caía en impar y todas las ilustraciones
       a doble plana se partían entre dos pantallas. */
    slug: "pijarana-pijarana-teje-los-versos-la-arana",
    tituloId: "lit-108",
    titulo: "Pijaraña, pijaraña, teje los versos la araña",
    autor: "Beatriz Helena Robledo (selección)",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 51,
    razon: 0.7026,
    pliegos: [
      [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17],
      [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30, 31],
      [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43], [44, 45],
      [46, 47], [48, 49],
    ],
    edad: "6-8",
    resumen: "Entre versos, rondas, retahílas, canciones de cuna, poemas, adivinanzas y trabalenguas, la tradición oral nos permite jugar con las palabras, conocer el mundo, soñar e imaginar... He aquí una muestra de todo ello, para el deleite de los lectores.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/el-misterio-de-villa-motor/
       Convertido con flipbook-forge desde el-misterio-de-villa-motor.pdf:
       16 páginas de PDF → 30 hojas, 14 pliegos. */
    slug: "el-misterio-de-villa-motor",
    tituloId: "lit-109",
    titulo: "El misterio de Villa Motor",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 30,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
    ],
    edad: "9-11",
    resumen: "Brillo y sus amigos investigan extrañas desapariciones de carros en Villa Motor, descubriendo peligrosas redes ocultas y aprendiendo sobre valentía y la importancia de cuidarse mutuamente frente a las amenazas.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/un-papa-griton/
       Convertido con flipbook-forge desde un-papa-griton.pdf:
       16 páginas de PDF → 30 hojas, 14 pliegos. */
    slug: "un-papa-griton",
    tituloId: "lit-110",
    titulo: "Un papá gritón",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 30,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
    ],
    edad: "6-8",
    resumen: "Robin vive en un hogar violento. Con la ayuda de Aurora y su clase, intentará transformar a su padre agresivo con empatía y comprensión, revelando que el apoyo comunitario puede cambiar realidades difíciles.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/transformacion-en-la-montana-de-las-mariposas/
       Convertido con flipbook-forge desde transformacion-en-la-montana-de-las-mariposas.pdf:
       16 páginas de PDF → 30 hojas, 14 pliegos. */
    slug: "transformacion-en-la-montana-de-las-mariposas",
    tituloId: "lit-111",
    titulo: "Transformación en la montaña de las mariposas",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 30,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
    ],
    edad: "6-8",
    resumen: "Joselo, una oruga alegre, enfrenta ansiedad tras transformarse en mariposa. Apoyado por su madre y amigos, descubrirá que crecer y cambiar implica aceptar nuevas realidades y emociones.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/el-carriel-del-senor-olvido/
       Convertido con flipbook-forge desde el-carriel-del-senor-olvido.pdf:
       17 páginas de PDF → 32 hojas, 15 pliegos. */
    slug: "el-carriel-del-senor-olvido",
    tituloId: "lit-112",
    titulo: "El carriel del señor Olvido",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 32,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31],
    ],
    edad: "6-8",
    resumen: "En Jericó, el Señor Olvido carga objetos olvidados, intentando devolverlos a sus dueños. Crucita, una niña curiosa, lo ayudará a recuperar sus propios recuerdos en un emotivo viaje por la memoria.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/la-gallina-carlota/
       Convertido con flipbook-forge desde la-gallina-carlota.pdf:
       16 páginas de PDF → 30 hojas, 14 pliegos. */
    slug: "la-gallina-carlota",
    tituloId: "lit-113",
    titulo: "La gallina Carlota",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 30,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
    ],
    edad: "6-8",
    resumen: "Carlota vive tranquila en el campo hasta que conflictos violentos fuerzan a toda la comunidad a migrar a la ciudad. Allí enfrentará el reto de adaptarse mientras extraña su vida pacífica y rural.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/hay-alguien-nuevo-en-clase/
       Convertido con flipbook-forge desde hay-alguien-nuevo-en-clase.pdf:
       18 páginas de PDF → 34 hojas, 16 pliegos. */
    slug: "hay-alguien-nuevo-en-clase",
    tituloId: "lit-114",
    titulo: "Hay alguien nuevo en clase",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 34,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33],
    ],
    edad: "9-11",
    resumen: "Daniel, un chico solitario, conoce a Alex, el nuevo del salón, y descubre sentimientos inesperados. La llegada de Alex cambiará la vida escolar y personal de Daniel, enseñándole sobre amistad y autodescubrimiento.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/girasoles-para-la-abuela/
       Convertido con flipbook-forge desde girasoles-para-la-abuela.pdf:
       18 páginas de PDF → 34 hojas, 16 pliegos. */
    slug: "girasoles-para-la-abuela",
    tituloId: "lit-115",
    titulo: "Girasoles para la abuela",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 34,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33],
    ],
    edad: "6-8",
    resumen: "Sofía llena el jardín de girasoles para sorprender a su abuela, sin saber que despertará recuerdos dolorosos. Ambas descubrirán que cuidar de las flores puede sanar heridas profundas del pasado.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/gerard-sin-rumbo/
       Convertido con flipbook-forge desde gerard-sin-rumbo.pdf:
       24 páginas de PDF → 46 hojas, 22 pliegos. */
    slug: "gerard-sin-rumbo",
    tituloId: "lit-116",
    titulo: "Gerard sin rumbo",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 46,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45],
    ],
    edad: "9-11",
    resumen: "Gerard vive feliz hasta que una cuadrilla armada cambia su vida para siempre. Obligado a huir con su familia, enfrentará el desarraigo y aprenderá sobre la resiliencia al reconstruir su hogar en la ciudad.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/un-deseo-y-los-senores-anzuelo/
       Convertido con flipbook-forge desde un-deseo-y-los-senores-anzuelo.pdf:
       21 páginas de PDF → 40 hojas, 19 pliegos. */
    slug: "un-deseo-y-los-senores-anzuelo",
    tituloId: "lit-117",
    titulo: "Un deseo y los señores anzuelo",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 40,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39],
    ],
    edad: "9-11",
    resumen: "Mar busca mejorar la vida de su familia acudiendo a los Marengos, misteriosos pulpos del barrio La Internet. Descubrirá que no todos los deseos traen felicidad y que la ayuda puede esconder riesgos.",
  },
  {
    /* Museo Casa de la Memoria de Medellín. Escritura: María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez.
       —
       Maguaré · https://maguare.gov.co/free-y-la-ruleta/
       Convertido con flipbook-forge desde free-y-la-ruleta.pdf:
       19 páginas de PDF → 36 hojas, 17 pliegos. */
    slug: "free-y-la-ruleta",
    tituloId: "lit-118",
    titulo: "Free y la ruleta",
    autor: "María Clara Ramírez, Santiago Restrepo, Juan Fernando Jaramillo, Jessica Sepúlveda y Susana Velásquez",
    editorial: "Museo Casa de la Memoria de Medellín · Maguaré",
    paginas: 36,
    razon: 1.0002,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35],
    ],
    edad: "9-11",
    resumen: "Ney enfrenta el bullying de Free hasta que una clase de Filosofía cambia todo. Una ruleta decidirá si Ney puede salvar a sus agresores y enseñarles una valiosa lección sobre la empatía y la prudencia.",
  },
  {
    /* Beatriz Helena Robledo / Ilustraciones: Ana María Ardila
       —
       Maguaré · https://maguare.gov.co/con-sabor-a-hogar/
       Convertido con flipbook-forge desde con-sabor-a-hogar.pdf:
       48 páginas de PDF → 48 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "con-sabor-a-hogar",
    tituloId: "lit-119",
    titulo: "Con sabor a hogar",
    autor: "Beatriz Helena Robledo",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 48,
    razon: 0.7026,
    edad: "6-8",
    resumen: "Escuchar el murmullo de las palabras acunado por la musicalidad del lenguaje poético es lo que nos regala la poesía. Leída en voz alta, saboreada a solas o en compañía nos permite ver lo invisible y nombrar el mundo con mirada amorosa.",
  },
  {
    /* Autora: Yolanda Reyes / Ilustraciones: Rafael Yockteng
       —
       Maguaré · https://maguare.gov.co/mi-mascota/
       Convertido con flipbook-forge desde mi-mascota.pdf:
       40 páginas de PDF → 40 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "mi-mascota",
    tituloId: "lit-120",
    titulo: "Mi mascota",
    autor: "Yolanda Reyes",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 40,
    razon: 0.7026,
    edad: "0-5",
    resumen: "En este libro lleno de humor, el lector se encontrará con mascotas muy diversas: de tierra, de fuego, de aire y de mar. Pero la mascota preferida del niño de la casa, ¿quién será? Una aventura que divertirá a chicos y grandes.",
  },
  {
    /* Autor: María Margarita Cabarcas - Ilustrado por: María Margarita Cabarcas
       —
       Maguaré · https://maguare.gov.co/caterine-ibarguen/
       Convertido con flipbook-forge desde caterine-ibarguen.pdf:
       32 páginas de PDF → 32 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "caterine-ibarguen",
    tituloId: "lit-121",
    titulo: "Caterine Ibargüen",
    autor: "María Margarita Cabarcas",
    editorial: "Perezópolis · Maguaré",
    paginas: 32,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Esta es la historia de Caterine Ibargüen, una atleta colombiana que gracias a su disciplina ha llegado a ser reconocida a nivel mundial y con su carisma se ha ganado el corazón de los colombianos.",
  },
  {
    /* Autor: María Margarita Cabarcas - Ilustrado por: María Margarita Cabarcas
       —
       Maguaré · https://maguare.gov.co/toto-la-momposina/
       Convertido con flipbook-forge desde toto-la-momposina.pdf:
       32 páginas de PDF → 32 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "toto-la-momposina",
    tituloId: "lit-122",
    titulo: "Totó la Momposina",
    autor: "María Margarita Cabarcas",
    editorial: "Perezópolis · Maguaré",
    paginas: 32,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Esta es la historia de Totó la Momposina, una cantante, bailarina y maestra del folclor colombiano que ha logrado llegar a los más grandes escenarios a nivel mundial, llevando siempre sus raíces con orgullo y alegría.",
  },
  {
    /* Autor: María Margarita Cabarcas - Ilustrado por: María Margarita Cabarcas
       —
       Maguaré · https://maguare.gov.co/coco-el-cocodrilo/
       Convertido con flipbook-forge desde coco-el-cocodrilo.pdf:
       24 páginas de PDF → 24 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "coco-el-cocodrilo",
    tituloId: "lit-123",
    titulo: "Coco el Cocodrilo",
    autor: "María Margarita Cabarcas",
    editorial: "Perezópolis · Maguaré",
    paginas: 24,
    razon: 0.6471,
    edad: "0-5",
    resumen: "Coco el Cocodrilo es la historia de un tierno cocodrilo que tiene papás patos. Un cuento que nos enseña a querer y a valorar nuestras diferencias.",
  },
  {
    /* Gabriel Cubillos Garzón. Idea Original e ilustraciones: Gabriel Cubillos Garzón - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/samurai-8-bit-infinito/
       Convertido con flipbook-forge desde samurai-8-bit-infinito.pdf:
       16 páginas de PDF → 16 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "samurai-8-bit-infinito",
    tituloId: "lit-124",
    titulo: "Samurai 8 bit infinito",
    autor: "Gabriel Cubillos Garzón",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 16,
    razon: 0.7727,
    edad: "6-8",
    resumen: "En esta historia contada por Gabriel, un robot samurai es tocado por un rayo haciendo que este cambie de forma, gracias a un amigo científico recupera su forma original.",
  },
  {
    /* Antonia Torres Romero. Idea Original e ilustraciones: Antonia Torres Romero - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/los-nombres-de-las-cosas/
       Convertido con flipbook-forge desde los-nombres-de-las-cosas.pdf:
       20 páginas de PDF → 20 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "los-nombres-de-las-cosas",
    tituloId: "lit-125",
    titulo: "Los nombres de las cosas",
    autor: "Antonia Torres Romero",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 20,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Hace un año Antonia viajó lejos de Colombia, su país natal y al llegar a su nuevo hogar encuentra que las niñas y los niños llaman a las cosas, de manera diferente a como ella las conoce. Descubre los nuevos nombres tú también.",
  },
  {
    /* Ana Lucía Ariza y Dylan Riaño. Idea Original e ilustraciones: Ana Lucía Ariza y Dylan Riaño - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/historias-de-un-virus/
       Convertido con flipbook-forge desde historias-de-un-virus.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector.

       La ficha de Maguaré no trae resumen: el de abajo sale del libro. */
    slug: "historias-de-un-virus",
    tituloId: "lit-126",
    titulo: "Historias de un virus",
    autor: "Ana Lucía Ariza y Dylan Riaño",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 1.2941,
    edad: "6-8",
    resumen: "Dos historias escritas e ilustradas por niños sobre la pandemia. En «Había una vez un covid», Ana Lucía Ariza cuenta los días de encierro en casa, los tapabocas y la llegada de las vacunas; en «Batalla ganada», Dylan Riaño narra cómo la Tierra venció al malvado virus.",
  },
  {
    /* Ian Yesid Guerrero. Idea Original e ilustraciones: Ian Yesid Guerrero - Fotografías: Cincy Johanna Pulido - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/el-pajaro-consejero/
       Convertido con flipbook-forge desde el-pajaro-consejero.pdf:
       16 páginas de PDF → 16 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-pajaro-consejero",
    tituloId: "lit-127",
    titulo: "El pájaro consejero",
    autor: "Ian Yesid Guerrero",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 16,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Este pájaro, que se transforma en mil colores, aconseja a las niñas y los niños que están tristes, cambia su plumaje y recorre diferentes paisajes rurales. Te invitamos a ver esta historia.",
  },
  {
    /* Alejandro López Lozano. Idea Original e ilustraciones: Alejandro López Lozano - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/el-maestro-bricula/
       Convertido con flipbook-forge desde el-maestro-bricula.pdf:
       20 páginas de PDF → 20 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-maestro-bricula",
    tituloId: "lit-128",
    titulo: "El maestro Brícula",
    autor: "Alejandro López Lozano",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 20,
    razon: 0.7727,
    edad: "6-8",
    resumen: "El maestro Brícula es un monstruo que persigue y caza huellas. Al encontrarse con unas huellas desconocidas decide investigar para saber a quién pertenecen. Descubrelo tu también leyendo esta historia.",
  },
  {
    /* Ana Sofía León Boyacá, Eileen Isabel León Boyacá, Samara Camila León Boyacá. Idea Original e ilustraciones: Ana Sofía León Boyacá, Eileen Isabel León Boyacá, Samara Camila León Boyacá - Diseño: John Vela - Diagramación: Alejandra Forero
       —
       Maguaré · https://maguare.gov.co/el-ogro/
       Convertido con flipbook-forge desde el-ogro.pdf:
       16 páginas de PDF → 16 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-ogro",
    tituloId: "lit-129",
    titulo: "El ogro",
    autor: "Ana Sofía León Boyacá, Eileen Isabel León Boyacá, Samara Camila León Boyacá",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 16,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Un gatito en apuros encuentra a unos humanos que, al parecer, no son amigables; con el tiempo los conoce mejor y se convierte en parte de esta familia que lo acoge con amor. Lee para saber toda la historia.",
  },
  {
    /* Leonardo Gutiérrez. Ganador de la convocatoria para creación de libros digitales de relato corto para niños, niñas y adolescentes.
       —
       Maguaré · https://maguare.gov.co/camino-de-retacitos-para-echar-a-volar/
       Convertido con flipbook-forge desde camino-de-retacitos-para-echar-a-volar.pdf:
       18 páginas de PDF → 18 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "camino-de-retacitos-para-echar-a-volar",
    tituloId: "lit-130",
    titulo: "Camino de retacitos para echar a volar",
    autor: "Leonardo Gutiérrez",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 18,
    razon: 0.9999,
    edad: "6-8",
    resumen: "Acompañemos a Maikol, Juanita y Salvador a recorrer un camino lleno de retacitos, un poco frío, un poco triste, y muy silencioso, que con ayuda de Maite, este camino se transformará y todos juntos echarán a volar.",
  },
  {
    /* Juan Franco. Ganador de la convocatoria para creación de libros digitales de relato corto para niños, niñas y adolescentes.
       —
       Maguaré · https://maguare.gov.co/mi-mundo/
       Convertido con flipbook-forge desde mi-mundo.pdf:
       21 páginas de PDF → 21 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "mi-mundo",
    tituloId: "lit-131",
    titulo: "Mi mundo",
    autor: "Juan Franco",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 21,
    razon: 0.8889,
    edad: "0-5",
    resumen: "Mundo es mi punto, puntito, diminuto. Con él vivo aventuras donde encuentro muchas luces, sombras, texturas, sonidos y grandes emociones. Te invito a recorrer junto con Mundo, un espacio donde podamos descubrir asombrosas formas y figuras grandes y pequeñas llenas de hermosos colores.",
  },
  {
    /* Un cuento de María del Sol Peralta e Irene Vasco - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/ritmo-corazon/
       Convertido con flipbook-forge desde ritmo-corazon.pdf:
       14 páginas de PDF → 28 hojas, 13 pliegos.

       El PDF es entero de dobles planas, portada incluida: se convirtió con
       --doble-plana. La mitad derecha de la primera página es la tapa y
       abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "ritmo-corazon",
    tituloId: "lit-132",
    titulo: "Al ritmo del corazón",
    autor: "María del Sol Peralta, Irene Vasco",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7745,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27],
    ],
    edad: "6-8",
    resumen: "¿Alguna vez has sentido que pierdes tu ritmo? Cuando esto pasa, se vuelve difícil caminar, correr y encima de todo, cantar. Descubre cómo Arma - DJ resuelve sus dilemas a través del afecto de su más querida amiga, Chip. Si alguna vez tienes un problema parecido, esta puede ser una buena idea para resolverlo. ¡Uno nunca sabe!",
  },
];

export function buscarLibro(slug: string): Libro | undefined {
  return LIBROS.find((l) => l.slug === slug);
}

export function libroDeTitulo(tituloId: string): Libro | undefined {
  return LIBROS.find((l) => l.tituloId === tituloId);
}

/* Páginas de una obra, en orden de lectura. */
export function paginasDe(libro: Libro): PaginaLibro[] {
  return Array.from({ length: libro.paginas }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const numero = i + 1;
    const miniatura = `/libros/${libro.slug}/t${n}.webp`;
    const compuesta = libro.contenido?.[i];
    return compuesta
      ? { numero, miniatura, compuesta }
      : { numero, miniatura, src: `/libros/${libro.slug}/p${n}.webp` };
  });
}
