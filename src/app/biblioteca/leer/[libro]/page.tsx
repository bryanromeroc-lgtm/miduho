import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flipbook } from "@/components/biblioteca/flipbook";
import { LIBROS, buscarLibro, paginasDe } from "@/lib/libros";

/*
  LEER — la biblioteca se explora en el catálogo; aquí se lee.

  La pantalla entrega el alto útil al libro. Lo que antes ocupaba el tercio
  superior —ficha, resumen, migas— se reduce a una línea de vuelta y una
  ficha plegada bajo el lector: existe para quien la busca, no delante de
  quien vino a leer. El propio lector lleva el título en su barra, así que
  repetirlo arriba sería decir dos veces lo mismo y robarle sitio a la página.
*/

export function generateStaticParams() {
  return LIBROS.map((l) => ({ libro: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ libro: string }>;
}): Promise<Metadata> {
  const { libro: slug } = await params;
  const libro = buscarLibro(slug);
  if (!libro) return { title: "Libro no encontrado · MIDUHO" };
  return {
    title: `${libro.titulo} · Biblioteca MIDUHO`,
    description: libro.resumen,
  };
}

export default async function Leer({
  params,
}: {
  params: Promise<{ libro: string }>;
}) {
  const { libro: slug } = await params;
  const libro = buscarLibro(slug);
  if (!libro) notFound();

  const paginas = paginasDe(libro);

  return (
    <main id="contenido" aria-label={`Lectura de ${libro.titulo}`}>
      <Flipbook
        paginas={paginas}
        titulo={libro.titulo}
        autor={`${libro.autor} · ${libro.editorial}`}
        razon={libro.razon}
        dedicado
        volverHref="/biblioteca"
      />
    </main>
  );
}
