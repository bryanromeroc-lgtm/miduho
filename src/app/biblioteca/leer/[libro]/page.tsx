import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { Flipbook } from "@/components/biblioteca/flipbook";
import { LIBROS, buscarLibro, paginasDe } from "@/lib/libros";
import { AREAS } from "@/lib/datos";

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

const LIT = AREAS.literatura;

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
    <Marco>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <Link
          href="/biblioteca"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-gris hover:text-tinta"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al catálogo
        </Link>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: LIT.medio }}
        >
          Libro · {libro.edad} años · {libro.paginas} páginas
        </p>
      </div>

      <Flipbook
        paginas={paginas}
        titulo={libro.titulo}
        autor={`${libro.autor} · ${libro.editorial}`}
        razon={libro.razon}
      />

      <details className="group mt-4 rounded-[15px] bg-white p-4 shadow-[inset_0_0_0_1.5px_var(--color-linea)]">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] font-bold text-tinta">
          <Info size={16} aria-hidden="true" style={{ color: LIT.medio }} />
          Sobre este libro y cómo se lee
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="font-heading text-[19px] font-bold leading-[1.2] text-tinta">
              {libro.titulo}
            </h2>
            <p className="mt-1 text-[13px] italic text-gris">
              {libro.autor} · {libro.editorial}
            </p>
            <p className="mt-2 max-w-[68ch] text-[13.5px] leading-[1.55] text-gris">
              {libro.resumen}
            </p>
          </div>
          <p className="max-w-[68ch] text-[13px] leading-[1.6] text-gris">
            Pase las hojas arrastrando la esquina, con las flechas junto al
            libro o con las flechas del teclado. Escriba un número en el campo
            de páginas para abrir el libro por ahí, y use «Índice» para ver
            todas las páginas a la vez.
          </p>
        </div>
      </details>
    </Marco>
  );
}
