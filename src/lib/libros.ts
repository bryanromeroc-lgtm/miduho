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
  {
    /* Un cuento de Amalia Low - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/obra-rani/
       Convertido con flipbook-forge desde obra-rani.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "obra-rani",
    tituloId: "lit-133",
    titulo: "La obra de Rani",
    autor: "Amalia Low",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Rani, la gran actriz de La Ceiba, ha preparado una emocionante obra de teatro para todos los habitantes. Escribe los textos, prepara disfraces, monta el escenario e invita al público. Tú también estás invitado, así que no te pierdas este espectáculo con su inesperado desenlace...",
  },
  {
    /* Un cuento de María del Sol Peralta e Irene Vasco - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/resfrio/
       Convertido con flipbook-forge desde resfrio.pdf:
       14 páginas de PDF → 28 hojas, 13 pliegos.

       El PDF es entero de dobles planas, portada incluida: se convirtió con
       --doble-plana. La mitad derecha de la primera página es la tapa y
       abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "resfrio",
    tituloId: "lit-134",
    titulo: "El resfrío",
    autor: "María del Sol Peralta, Irene Vasco",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7745,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27],
    ],
    edad: "6-8",
    resumen: "Cuando Maya se enferma es un gran problema para todos porque las noticias se ponen al verés, ¡perdón al revés! Los vecinos protestan enfurecidos, mientras Maya va perdiendo su voz con cada mensaje. Rani resuelve organizar a toda la comunidad. ¿Podrá Rani cumplir su misión de poner a todos en paz? ¡Hagan sus apuestas!",
  },
  {
    /* Un cuento de Amalia Low - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/gran-tormenta/
       Convertido con flipbook-forge desde gran-tormenta.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "gran-tormenta",
    tituloId: "lit-135",
    titulo: "La gran tormenta",
    autor: "Amalia Low",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "En este libro conocerás las grandes dificultades que pasaron nuestros amigos antes de llegar a La Ceiba. Tras los desastres que trajo una avalancha, descubrirás cómo los animales lograron salir de la deriva para refugiarse en el majestuoso árbol que ahora es su hogar. Prepara un pañuelo pues es posible que lo necesites para secar tus lágrimas…",
  },
  {
    /* Escrito e ilustrado por Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/ver-estrellas/
       Convertido con flipbook-forge desde ver-estrellas.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "ver-estrellas",
    tituloId: "lit-136",
    titulo: "Para ver las estrellas",
    autor: "Amalia Satizábal",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Bertilda ha tenido un sueño para construir una gran red... ¿una red? y ¿para qué una red? Descubran en este cuento lo que cada uno de los amigos de La Ceiba aportó para cumplir el sueño… ¿tú qué llevarías?",
  },
  {
    /* Un cuento de María del Sol Peralta e Irene Vasco - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/libro-todos/
       Convertido con flipbook-forge desde libro-todos.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "libro-todos",
    tituloId: "lit-137",
    titulo: "El libro de todos",
    autor: "María del Sol Peralta, Irene Vasco",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Gildardo es un gran pregonero: saca coplas de su carriel, mientras vende objetos mágicos y sueños y deseos. Pero, un buen día, al volver a la Ceiba después de un largo viaje, encuentra un extraño silencio. Nadie juega y pocos se comunican entre sí. Todos están gruñones, con el ceño fruncido. ¿Habrá pasado mucho tiempo por fuera? ¿Cómo volver a unir a la comunidad con canciones, juegos y tradiciones?",
  },
  {
    /* Maguaré - Estrategia Digital de Cultura y Primera Infancia, Ministerio de Cultura
       —
       Maguaré · https://maguare.gov.co/descubre-imagina-crea-molas/
       Convertido con flipbook-forge desde descubre-imagina-crea-molas.pdf:
       9 páginas de PDF → 9 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "descubre-imagina-crea-molas",
    tituloId: "lit-138",
    titulo: "Descubre, imagina y crea con Molas",
    autor: "Maguaré",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 9,
    razon: 0.7727,
    edad: "6-8",
    resumen: "Saimiri, Gildardo y Maya le hacen un homenaje a la cultura tule, cuna o gunadule que habita en los departamentos de Antioquia y Chocó con este librillo coloreable de molas. ¡Llena de luz y color a tus personajes favoritos!",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-12-derecho-al-juego-y-al-arte/
       Convertido con flipbook-forge desde cuento-12-derecho-al-juego-y-al-arte.pdf:
       8 páginas de PDF → 8 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-12-derecho-al-juego-y-al-arte",
    tituloId: "lit-139",
    titulo: "Cuento 12: Derecho al juego y al arte",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 8,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Manolo es el único niño de una colonia de galápagos ancianos que solo comen y duermen. Para no aburrirse inventa juegos e imita a las tortugas mayores, hasta que un día sus ocurrencias despiertan a todos y les enseñan lo mucho que vale jugar.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-11-derecho-a-la-educacion/
       Convertido con flipbook-forge desde cuento-11-derecho-a-la-educacion.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-11-derecho-a-la-educacion",
    tituloId: "lit-140",
    titulo: "Cuento 11: Derecho a la educación",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Ágata es una araña curiosa que se aburre tejiendo siempre la misma tela y experimenta con hilos y formas nuevas, aunque las arañas mayores la miren con recelo. Sus experimentos terminan cambiando la manera de aprender de todo el pastizal.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-10-derecho-a-la-atencion-especial-en-discapacidad/
       Convertido con flipbook-forge desde cuento-10-derecho-a-la-atencion-especial-en-discapacidad.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-10-derecho-a-la-atencion-especial-en-discapacidad",
    tituloId: "lit-141",
    titulo: "Cuento 10: Derecho a la atención especial en discapacidad",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Enrique es un elefantito distinto: camina a su ritmo, se distrae con facilidad y le cuesta hablar. En la larga marcha hacia los depósitos de agua, toda la manada aprende a esperarlo, entenderlo y cuidarlo.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-9-derecho-a-la-salud/
       Convertido con flipbook-forge desde cuento-9-derecho-a-la-salud.pdf:
       8 páginas de PDF → 8 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-9-derecho-a-la-salud",
    tituloId: "lit-142",
    titulo: "Cuento 9: Derecho a la salud",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 8,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Anastasia, la más pequeña de unas muñecas rusas de madera, siente un dolor que nadie sabe explicar. Sus hermanas harán todo lo posible para que su dueño, distraído con su teléfono, se dé cuenta y la lleve a curar.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-8-derecho-a-que-se-respete-su-cultura/
       Convertido con flipbook-forge desde cuento-8-derecho-a-que-se-respete-su-cultura.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-8-derecho-a-que-se-respete-su-cultura",
    tituloId: "lit-143",
    titulo: "Cuento 8: Derecho a que se respete su cultura",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Leonardo, un pulpo de aguas cálidas, llega a un colegio de la Antártida con su acento, sus colores y su baile. Sus compañeros se burlan de él hasta que un experimento en clase los pone en su lugar y descubren lo que cada cultura puede enseñar.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-7-derecho-a-acceder-a-la-informacion/
       Convertido con flipbook-forge desde cuento-7-derecho-a-acceder-a-la-informacion.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-7-derecho-a-acceder-a-la-informacion",
    tituloId: "lit-144",
    titulo: "Cuento 7: Derecho a acceder a la información",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Silvia es una chimpancé pequeña y muy hábil que no deja de hacer preguntas sobre el mundo y sobre los humanos. Buscar respuestas la llevará a descubrir que no todo lo que cuentan los líderes de la tropa es cierto.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-6-derecho-a-expresarse/
       Convertido con flipbook-forge desde cuento-6-derecho-a-expresarse.pdf:
       8 páginas de PDF → 8 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-6-derecho-a-expresarse",
    tituloId: "lit-145",
    titulo: "Cuento 6: Derecho a expresarse",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 8,
    razon: 0.7273,
    edad: "6-8",
    resumen: "En una jaula llena de pájaros de todas partes reina el caos. Martín, un diminuto zunzuncito, y los más pequeños encuentran la forma de hacerse oír, y su plan termina llevando a todos a la libertad.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-5-derecho-a-la-libertad/
       Convertido con flipbook-forge desde cuento-5-derecho-a-la-libertad.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-5-derecho-a-la-libertad",
    tituloId: "lit-146",
    titulo: "Cuento 5: Derecho a la libertad",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Carlota, una canguro que acaba de salir de la bolsa de su madre, quiere explorar el mundo por su cuenta. Su mamá aprende a dejarla dar sus primeros saltos y a tomar sus propias decisiones.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-4-derecho-a-vivir-con-su-familia/
       Convertido con flipbook-forge desde cuento-4-derecho-a-vivir-con-su-familia.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-4-derecho-a-vivir-con-su-familia",
    tituloId: "lit-147",
    titulo: "Cuento 4: Derecho a vivir con su familia",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Mateo es un cachorro que crece feliz con su mamá, su abuela y sus hermanos, hasta que la familia está a punto de separarse. Una historia sobre la importancia de crecer junto a los tuyos.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-3-derecho-a-un-nombre-y-a-una-nacionalidad/
       Convertido con flipbook-forge desde cuento-3-derecho-a-un-nombre-y-a-una-nacionalidad.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-3-derecho-a-un-nombre-y-a-una-nacionalidad",
    tituloId: "lit-148",
    titulo: "Cuento 3: Derecho a un nombre y a una nacionalidad",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "En una caja de juguetes cada uno guarda la historia del lugar donde nació. Solo Volqueta, un camión de madera, no recuerda de dónde viene, y sus compañeros la ayudan a recuperar su nombre y su origen.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-2-derecho-a-la-vida-la-supervivencia-y-el-desarrollo/
       Convertido con flipbook-forge desde cuento-2-derecho-a-la-vida-la-supervivencia-y-el-desarrollo.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-2-derecho-a-la-vida-la-supervivencia-y-el-desarrollo",
    tituloId: "lit-149",
    titulo: "Cuento 2: Derecho a la vida, la supervivencia y el desarrollo",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "A Carlos, un renacuajo, le están saliendo patas. Con su familia y toda la charca descubre qué es la metamorfosis y lo que significa crecer, hasta encontrar lo que de verdad quiere ser: cantante.",
  },
  {
    /* Redacción: Claudia Patricia Bautista Arias - Idea original: Lina Salas Ramírez, Sergio Rozo Roa - Ilustraciones de niñas y niños lectores
       —
       Maguaré · https://maguare.gov.co/cuento-1-derecho-a-ser-cuidados-defendidos-y-protegidos/
       Convertido con flipbook-forge desde cuento-1-derecho-a-ser-cuidados-defendidos-y-protegidos.pdf:
       10 páginas de PDF → 10 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "cuento-1-derecho-a-ser-cuidados-defendidos-y-protegidos",
    tituloId: "lit-150",
    titulo: "Cuento 1: Derecho a ser cuidados, defendidos y protegidos",
    autor: "Claudia Patricia Bautista Arias",
    editorial: "Ministerio de Cultura · Universidad Nacional",
    paginas: 10,
    razon: 0.7273,
    edad: "6-8",
    resumen: "Hortensia crece en un jardín lleno de flores, rodeada de plantas mayores que la cuidan. Cuando aparece un peligro, el jardín entero aprende a organizarse para proteger a los más pequeños.",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/el-frenetico-baile-de-chip/
       Convertido con flipbook-forge desde el-frenetico-baile-de-chip.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-frenetico-baile-de-chip",
    tituloId: "lit-151",
    titulo: "El frenético baile de Chip",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Chip la perezosa se levantó muy dispuesta para dar su clase de aeróbicos y para hacer deporte se mantiene muy bien hidratada. Pero Chip ha tomado más agua de la cuenta… ¡Un baño, por favor!",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/el-cumpleanos-de-rosalinda/
       Convertido con flipbook-forge desde el-cumpleanos-de-rosalinda.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-cumpleanos-de-rosalinda",
    tituloId: "lit-152",
    titulo: "El cumpleaños de Rosalinda",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Rosalinda la camaleona cambia de color según como se sienta y hoy está azul porque parece que todos olvidaron su cumpleaños. En todo el día no ha recibido ni un abrazo ni un",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/la-memoria-del-abuelo/
       Convertido con flipbook-forge desde la-memoria-del-abuelo.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "la-memoria-del-abuelo",
    tituloId: "lit-153",
    titulo: "La memoria del abuelo",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "El abuelo Emiliano lo olvida todo, todo, todo… bueno no se le olvidan las cosas que avergüenzan a Rani y a Gildardo. ¡Abuelo Emiliano ejercita tu memoria con un sudoku!",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/una-sopa-para-la-fiesta/
       Convertido con flipbook-forge desde una-sopa-para-la-fiesta.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "una-sopa-para-la-fiesta",
    tituloId: "lit-154",
    titulo: "Una sopa para la fiesta",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "¡Las trillizas Adriana, Juliana y Eliana son terribles!. No se quedan quietas nunca y sus travesuras desesperan a más de uno en la Ceiba. Sin embargo parecen tener un don especial para transformar cualquier situación por crítica que parezca. ¿Qué hicieron ahora estas Terrillizas?",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/el-libro-perdido-de-gigi/
       Convertido con flipbook-forge desde el-libro-perdido-de-gigi.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-libro-perdido-de-gigi",
    tituloId: "lit-155",
    titulo: "El libro perdido de Gigi",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "Saimiri es un gran lector y quiere terminar de leer una historia, pero no aparece el segundo libro que cuenta el final. Con la ayuda de Gigi la tortuga emprenden la aventura de encontrar el libro perdido.",
  },
  {
    /* Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García - Ilustraciones: Amalia Satizábal
       —
       Maguaré · https://maguare.gov.co/el-viaje-de-la-familia-cuy/
       Convertido con flipbook-forge desde el-viaje-de-la-familia-cuy.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-viaje-de-la-familia-cuy",
    tituloId: "lit-156",
    titulo: "El viaje de la familia Cuy",
    autor: "Maritza Sanchez, Carlos Millán, Lizardo Carvajal, Oscar García",
    editorial: "Maguaré · Ministerio de Culturas",
    paginas: 28,
    razon: 0.7738,
    edad: "6-8",
    resumen: "¿Cómo hacen Linio y Tulita los dos papás cuyes para salir de paseo con sus hijos?. No debe ser nada fácil… porque son ¡27 cuyecitos!",
  },
  {
    /* Edición y adaptación de textos: Jesús Mario Girón Higuita - Recopilación: Claudia Rueda Gómez - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada
       —
       Maguaré · https://maguare.gov.co/los-arrullos-de-jaamo/
       Convertido con flipbook-forge desde los-arrullos-de-jaamo.pdf:
       36 páginas de PDF → 72 hojas, 35 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "los-arrullos-de-jaamo",
    tituloId: "lit-157",
    titulo: "Los arrullos de Jáamo",
    autor: "Tradición oral (ed. Jesús Mario Girón Higuita)",
    editorial: "ICBF · Fundalectura",
    paginas: 72,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67], [68, 69], [70, 71],
    ],
    edad: "0-5",
    resumen: "Este libro reúne los arrullos, relatos y juegos que acogen a los bebés y los niños en las familias de las comunidades nasa, inga, sikuani, cãacwa y totoró, cinco de los ciento dos pueblos indígenas colombianos. También comparte los recuerdos y la ternura de algunas abuelas indígenas que regalan a sus nietos y a los niños del país sus palabras, sus músicas y los juegos que alegraron su niñez.",
  },
  {
    /* Edición y adaptación de relatos: Alberto Aljure - Recopilación: María Fernanda Mantilla - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada
       —
       Maguaré · https://maguare.gov.co/patas-de-armadillo-dientes-de-raton/
       Convertido con flipbook-forge desde patas-de-armadillo-dientes-de-raton.pdf:
       36 páginas de PDF → 72 hojas, 35 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "patas-de-armadillo-dientes-de-raton",
    tituloId: "lit-158",
    titulo: "Patas de armadillo, dientes de ratón",
    autor: "Tradición oral (ed. Alberto Aljure)",
    editorial: "ICBF · Fundalectura",
    paginas: 72,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67], [68, 69], [70, 71],
    ],
    edad: "0-5",
    resumen: "Las canciones, juegos y relatos que los campesinos colombianos comparten con los niños en este volumen son un reconocimiento de las tradiciones y los modos de comprender y vivir la vida en diferentes contextos rurales del país. Resaltan el profundo vínculo que hay entre las palabras, las músicas, las creencias, la tierra y nuestras raíces hispana, indígena y afro.",
  },
  {
    /* Edición y selección: Iván Hernández - Ilustraciones: Silvana Giraldo
       —
       Maguaré · https://maguare.gov.co/canciones-rondas-nanas-retahilas-y-adivinanzas/
       Convertido con flipbook-forge desde canciones-rondas-nanas-retahilas-y-adivinanzas.pdf:
       35 páginas de PDF → 35 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "canciones-rondas-nanas-retahilas-y-adivinanzas",
    tituloId: "lit-159",
    titulo: "Canciones, rondas, nanas, retahílas y adivinanzas",
    autor: "Tradición oral (sel. Iván Hernández)",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 35,
    razon: 0.7717,
    edad: "0-5",
    resumen: "Una selección de canciones, rondas, nanas, retahílas y adivinanzas de la tradición oral para jugar con las palabras, cantarlas, trabar la lengua y destrabarla otra vez.",
  },
  {
    /* Rudyard Kipling
       —
       Maguaré · https://maguare.gov.co/por-que-el-elefante-tiene-la-trompa-asi/
       Convertido con flipbook-forge desde por-que-el-elefante-tiene-la-trompa-asi.pdf:
       35 páginas de PDF → 35 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "por-que-el-elefante-tiene-la-trompa-asi",
    tituloId: "lit-160",
    titulo: "Por qué el elefante tiene la trompa así",
    autor: "Rudyard Kipling",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 35,
    razon: 0.7717,
    edad: "6-8",
    resumen: "Hubo un tiempo en que el elefante tenía la nariz corta, y un elefantito muy curioso no paraba de hacer preguntas. Uno de los célebres cuentos de «Así fue» de Rudyard Kipling, que vivió muchos años en la India y escribió sobre sus gentes y sus animales.",
  },
  {
    /* Jeanne Marie Leprince de Beaumont
       —
       Maguaré · https://maguare.gov.co/la-bella-y-la-bestia/
       Convertido con flipbook-forge desde la-bella-y-la-bestia.pdf:
       34 páginas de PDF → 34 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "la-bella-y-la-bestia",
    tituloId: "lit-161",
    titulo: "La bella y la bestia",
    autor: "Jeanne Marie Leprince de Beaumont",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 34,
    razon: 0.7717,
    edad: "6-8",
    resumen: "Esta bella historia recuerda la tolerancia y la aceptación y habla sobre cómo la belleza de una persona no esta en su físico sino en su forma de ser, porque lo más importante es la belleza del corazón.",
  },
  {
    /* Félix María Samaniego - Ilustraciones: Daniela Gallego
       —
       Maguaré · https://maguare.gov.co/fabulas/
       Convertido con flipbook-forge desde fabulas.pdf:
       34 páginas de PDF → 34 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "fabulas",
    tituloId: "lit-162",
    titulo: "Fábulas",
    autor: "Félix María Samaniego",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 34,
    razon: 0.7717,
    edad: "6-8",
    resumen: "Encuentra 30 fábulas de Félix María Samaniego como La cigarra y la hormiga, El león y el ratón, El ciervo en la fuente y muchas otras. Se trata de pequeños cuentos en los que hablan y actúan los animales, y que llevan a conclusiones morales.",
  },
  {
    /* José Martí
       —
       Maguaré · https://maguare.gov.co/menique/
       Convertido con flipbook-forge desde menique.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "menique",
    tituloId: "lit-163",
    titulo: "Meñique",
    autor: "José Martí",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "Esta bella historia narra cómo los hermanos Pedro, Pablo y Juancito (al que conocían como Meñique porque era tan pequeño que se podía esconder en la bota de su padre) decidieron ir a probar suerte en un reino muy particular y las pruebas que Meñique deberá superar para ganarse el corazón de la princesa.",
  },
  {
    /* Hans Christian Andersen
       —
       Maguaré · https://maguare.gov.co/el-patito-feo/
       Convertido con flipbook-forge desde el-patito-feo.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-patito-feo",
    tituloId: "lit-164",
    titulo: "El patito feo",
    autor: "Hans Christian Andersen",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "Este cuento clásico de Hans Christian Andersen, ha sido leído desde hace muchos años con emoción por lectores de todas las edades y recuerda la necesidad de aceptar a quienes piensan diferente y pertenecen a otra raza, cultura o religión.",
  },
  {
    /* Horacio Benavides
       —
       Maguaré · https://maguare.gov.co/abrete-grano-pequeno/
       Convertido con flipbook-forge desde abrete-grano-pequeno.pdf:
       33 páginas de PDF → 33 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "abrete-grano-pequeno",
    tituloId: "lit-165",
    titulo: "Ábrete, grano pequeño",
    autor: "Horacio Benavides",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 33,
    razon: 0.7717,
    edad: "6-8",
    resumen: "Este libro es una recopilación de las mejores adivinanzas escritas por el poeta caucano Horacio Benavides, presentes en su primer libro y en Tapiz al revés ¿Dime quién es? (2014). Muchas de sus adivinanzas están relacionadas con mitologías o con historias antiguas.",
  },
  {
    /* María Eastman, Rafael Jaramillo Arango, Gabriela Mercedes Arciniegas, Santiago Pérez, Rocío Vélez de Piedrahíta
       —
       Maguaré · https://maguare.gov.co/de-animales-y-de-ninos/
       Convertido con flipbook-forge desde de-animales-y-de-ninos.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "de-animales-y-de-ninos",
    tituloId: "lit-166",
    titulo: "De animales y de niños",
    autor: "María Eastman, Rafael Jaramillo, Gabriela Mercedes Arciniegas, Santiago Pérez, Rocío Vélez",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.757,
    edad: "6-8",
    resumen: "Acá puedes encontrar Los caballos que no querían amo de María Eastman, Memorias de un niño embustero de Rafael Jaramillo Arango, Minisurumbullo y el dulce de icaco de Gabriela Mercedes Arciniegas, De cómo la familia Chimp vino a la ciudad de Santiago Pérez y La Cucarachita Martínez de Rocío Vélez de Piedrahita.",
  },
  {
    /* Charles Perrault, Hermanos Grimm
       —
       Maguaré · https://maguare.gov.co/barbas-pelos-y-cenizas/
       Convertido con flipbook-forge desde barbas-pelos-y-cenizas.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "barbas-pelos-y-cenizas",
    tituloId: "lit-167",
    titulo: "Barbas, pelos y cenizas",
    autor: "Charles Perrault, Hermanos Grimm",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "Historias de fantasía para disfrutar con los niños: «Barba Azul» de Charles Perrault, y «Los tres pelos de oro del diablo» y «La Cenicienta» de los Hermanos Grimm.",
  },
  {
    /* Textos de varios autores de dominio público - Ilustraciones: José Rosero, Rafael Yockteng
       —
       Maguaré · https://maguare.gov.co/canta-palabras/
       Convertido con flipbook-forge desde canta-palabras.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "canta-palabras",
    tituloId: "lit-168",
    titulo: "Canta palabras",
    autor: "Varios autores",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "Canta y juega con tus niños las canciones, rondas, poemas, trabalenguas, dichos, retahílas y repeticiones. Encontrarás relatos como En las mañanicas y Los ratones de Lope de Vega, El burro flautista de Tomás de Iriarte, ¿Qué es poesía? y Por una mirada un mundo de Gustavo Adolfo Bécquer, Canción del boga ausente de Candelario Obeso, Cultivo una rosa blanca de José Martí, Margarita de Rubén Darío e Historia de una tórtola de Epifanio Mejía.",
  },
  {
    /* Autora: Susana Aristizábal - Ilustraciones: Nel Correa
       —
       Maguaré · https://maguare.gov.co/un-castillo-de-libros/
       Convertido con flipbook-forge desde un-castillo-de-libros.pdf:
       28 páginas de PDF → 28 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "un-castillo-de-libros",
    tituloId: "lit-169",
    titulo: "Un castillo de libros",
    autor: "Susana Aristizábal",
    editorial: "Tragaluz Editores · Ministerio de Cultura",
    paginas: 28,
    razon: 0.9995,
    edad: "0-5",
    resumen: "Este relato infantil es publicación de la Fundación Taller de Letras Jordi Sierra Fabra para De Cero a Siempre e invita a despertar los sentidos a través de hermosas ilustraciones llenas de color en un lugar donde los secretos nunca acaban.",
  },
  {
    /* Edición y adaptación: María Cristina Rincón - Recopilación y traducción al rromanés: Ana Dalila Gómez Baos - Ilustración: Victoria Peters Rada
       —
       Maguaré · https://maguare.gov.co/tiki-tiki-tai-libro/
       Convertido con flipbook-forge desde tiki-tiki-tai-libro.pdf:
       36 páginas de PDF → 72 hojas, 35 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "tiki-tiki-tai-libro",
    tituloId: "lit-170",
    titulo: "Tiki, tiki, tai",
    autor: "Tradición oral rrom (ed. María Cristina Rincón)",
    editorial: "ICBF · Fundalectura",
    paginas: 72,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67], [68, 69], [70, 71],
    ],
    edad: "0-5",
    resumen: "En esta edición bilingüe se recopilan algunos arrullos, secretos y relatos con que papás, mamás y abuelos gitanos reciben a sus bebés y les acompañan durante la infancia. Puedes encontrarlos en español y rromanés, el idioma de los gitanos, una lengua que recuerda cada camino por el que este pueblo ha trasegado en su ir y venir por el mundo, amantes ante todo de la libertad y la vida.",
  },
  {
    /* Hans Christian Andersen, Alexander Pushkin, Joseph Jacobs, Oscar Wilde, Hermanos Grimm - Ilustración: Rafael Yockteng y Daniel Gómez.
       —
       Maguaré · https://maguare.gov.co/puro-cuento/
       Convertido con flipbook-forge desde puro-cuento.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "puro-cuento",
    tituloId: "lit-171",
    titulo: "Puro cuento",
    autor: "Hans Christian Andersen, Alexander Pushkin, Joseph Jacobs, Oscar Wilde, Hermanos Grimm",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7661,
    edad: "6-8",
    resumen: "Este título te invita a disfrutar con tus niños de historias que los hombres se contaban durante los fríos inviernos. Encuentra La princesa y la alverja de Hans Christian Andersen, El cuento de Alí el Persa de Las mil y una noches, El gallo de oro de Alexander Pushkin, Los tres cerditos de Joseph Jacobs, El gigante egoísta de Oscar Wilde y Los músicos de Bremen de los Hermanos Grimm.",
  },
  {
    /* Hermanos Grimm, Charles Perrault, Agustín Jaramillo Londoño, Infante Don Juan Manuel, Félix María Samaniego, Rafael Pombo, Rubén Darío, Víctor Eduardo Caro, Federico García Lorca
       —
       Maguaré · https://maguare.gov.co/de-viva-voz/
       Convertido con flipbook-forge desde de-viva-voz.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "de-viva-voz",
    tituloId: "lit-172",
    titulo: "De viva voz",
    autor: "Varios autores",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7687,
    edad: "6-8",
    resumen: "Los cuentos, poemas y fábulas que presentamos en este libro tienen como propósito hacer que los lectores, niños y grandes, adquieran el gusto por las palabras. En ellos están expresados algunos de los valores que han permitido a la humanidad sobrevivir.",
  },
  {
    /* Rafael Pombo
       —
       Maguaré · https://maguare.gov.co/con-pombo-y-platillos/
       Convertido con flipbook-forge desde con-pombo-y-platillos.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "con-pombo-y-platillos",
    tituloId: "lit-173",
    titulo: "Con Pombo y platillos",
    autor: "Rafael Pombo",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "Recuerda los cuentos de infancia y lee con tus niños: Mirringa Mirronga, El renacuajo paseador, Juan Chunguero, Pastorcita, Juan Matachín, Tía Pasitrote, Las siete vidas del gato, La pobre viejecita, Juaco el ballenero, El pardillo, La marrana peripuesta, Simón el Bobito y El niño y la mariposa.",
  },
  {
    /* Alejandro Dumas
       —
       Maguaré · https://maguare.gov.co/el-rey-de-los-topos-y-su-hija/
       Convertido con flipbook-forge desde el-rey-de-los-topos-y-su-hija.pdf:
       34 páginas de PDF → 34 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "el-rey-de-los-topos-y-su-hija",
    tituloId: "lit-174",
    titulo: "El rey de los topos y su hija",
    autor: "Alejandro Dumas",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 34,
    razon: 0.7717,
    edad: "6-8",
    resumen: "Una historia escrita por Alejandro Dumas que refleja el amor de una madre por su hijo al mismo tiempo que muestra que no hay límites cuando dos personas se enamoran.",
  },
  {
    /* Hermanos Grimm
       —
       Maguaré · https://maguare.gov.co/bosque-adentro/
       Convertido con flipbook-forge desde bosque-adentro.pdf:
       36 páginas de PDF → 36 hojas.

       El PDF viene en páginas sueltas, ya partidas por el editor: no hay
       pliegos que recomponer. Se revisó que con la portada sola cada
       doble plana cae en la misma pantalla del lector. */
    slug: "bosque-adentro",
    tituloId: "lit-175",
    titulo: "Bosque adentro",
    autor: "Hermanos Grimm",
    editorial: "Ministerio de Cultura · Leer es mi cuento",
    paginas: 36,
    razon: 0.7591,
    edad: "6-8",
    resumen: "En este libro te encontrará con los clásicos de Los Hermanos Grimm para niños: Caperucita Roja, Blanca Nieves, Hansel y Gretel, La bella durmiente para leer una y otra vez con tus niños.",
  },
  {
    /* Edición y adaptación: María Cristina Rincón - Recopilación e investigación: Pilar Posada, Moraima Simarra Hernández y otros
       —
       Maguaré · https://maguare.gov.co/una-morena-en-la-ronda/
       Convertido con flipbook-forge desde una-morena-en-la-ronda.pdf:
       36 páginas de PDF → 72 hojas, 35 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "una-morena-en-la-ronda",
    tituloId: "lit-176",
    titulo: "Una morena en la ronda",
    autor: "Tradición oral afrocolombiana (ed. María Cristina Rincón)",
    editorial: "ICBF · Fundalectura",
    paginas: 72,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67], [68, 69], [70, 71],
    ],
    edad: "0-5",
    resumen: "En esta edición multilingüe se recopilan algunos arrullos, juegos y relatos con los que papás, mamás y abuelos afrocolombianos reciben a sus bebés y les acompañan durante la infancia. Los ritmos de la lengua palenquera y del creole raizal se mezclan con los del español.",
  },
  {
    /* Edición y adaptación: María Cristina Rincón - Investigación y recopilación: Socorro Vásquez
       —
       Maguaré · https://maguare.gov.co/putunkaa-serruma-duermete-pajarito/
       Convertido con flipbook-forge desde putunkaa-serruma-duermete-pajarito.pdf:
       36 páginas de PDF → 72 hojas, 35 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "putunkaa-serruma-duermete-pajarito",
    tituloId: "lit-177",
    titulo: "Putunkaa serruma: duérmete, pajarito blanco",
    autor: "Tradición oral indígena (ed. María Cristina Rincón)",
    editorial: "ICBF · OIM · Fundalectura",
    paginas: 72,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67], [68, 69], [70, 71],
    ],
    edad: "0-5",
    resumen: "En esta edición bilingüe, el ICBF y Fundalectura recopilan algunos arrullos y cuentos con los que papás, mamás y abuelos de cinco etnias colombianas reciben a sus bebés y les acompañan durante la infancia. Encuentras relatos en español, piapoco, arhuaco, kamëntsá, uitoto y wayúu, lenguas que guardan la memoria.",
  },
  {
    /* Edición: Dipacho, María Fernanda Mantilla, Victoria Peters R., Marcela Tristancho - Ilustración: Daniel A. Fajardo Bautista, Victoria Peters Rada
       —
       Maguaré · https://maguare.gov.co/tortuguita-veni-baila-libro/
       Convertido con flipbook-forge desde tortuguita-veni-baila-libro.pdf:
       35 páginas de PDF → 69 hojas, 33 pliegos.

       El PDF es entero de dobles planas, portada envolvente incluida: se
       convirtió con --doble-plana. La mitad derecha de la primera página es
       la tapa y abre el libro; la izquierda es la contraportada y lo cierra. */
    slug: "tortuguita-veni-baila-libro",
    tituloId: "lit-178",
    titulo: "Tortuguita, vení bailá",
    autor: "Tradición oral indígena",
    editorial: "ICBF · Fundalectura",
    paginas: 69,
    razon: 0.9701,
    pliegos: [
      [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15],
      [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29],
      [30, 31], [32, 33], [34, 35], [36, 37], [38, 39], [40, 41], [42, 43],
      [44, 45], [46, 47], [48, 49], [50, 51], [52, 53], [54, 55], [56, 57],
      [58, 59], [60, 61], [62, 63], [64, 65], [66, 67],
    ],
    edad: "0-5",
    resumen: "Este libro te invita a disfrutar la voz y la música de los pueblos nativos de Colombia. En ¡Tortuguita, vení bailá!, se recogen las palabras y las melodías con las que en Colombia se le da la bienvenida a los hijos en cinco pueblos indígenas (piapoco, uitoto, wayúu, kamëntŝa, arhuaco), entre los Rrom, los afrodescendientes y los campesinos. ¡Encuentra también el audio en este portal!",
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
