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
