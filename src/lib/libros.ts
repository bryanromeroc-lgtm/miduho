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
    const miniatura = `/libros/${libro.slug}/t${n}.webp`;
    const compuesta = libro.contenido?.[i];
    return compuesta
      ? { numero: i + 1, miniatura, compuesta }
      : { numero: i + 1, miniatura, src: `/libros/${libro.slug}/p${n}.webp` };
  });
}
