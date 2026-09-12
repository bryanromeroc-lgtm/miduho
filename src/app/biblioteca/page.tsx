"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Check } from "lucide-react";
import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import {
  TITULOS,
  TOTAL_TITULOS,
  AREAS,
  type TipoRecurso,
  type RangoEdad,
  type Idioma,
} from "@/lib/datos";
import { libroDeTitulo } from "@/lib/libros";
import { cn } from "@/lib/utils";

/*
  LITERATURA — biblioteca: se explora, no se recorre. Sin progresión.
  Filtrar es que los trechos entren y salgan de la banda.
  Paginado: nunca cientos de fichas de una vez (defecto de la referencia,
  que cargaba 2.235 recursos en una sola página).
*/

const TIPOS: TipoRecurso[] = ["Libro", "Guía", "Catálogo", "Audiolibro"];
const EDADES: RangoEdad[] = ["0-5", "6-8", "9-11", "12-13", "+14"];
const IDIOMAS: Idioma[] = ["Español", "Inglés", "Francés"];
const POR_PAGINA = 12;

const LIT = AREAS.literatura;

export default function Biblioteca() {
  const [tipo, setTipo] = useState<TipoRecurso | null>(null);
  const [edad, setEdad] = useState<RangoEdad | null>(null);
  const [idioma, setIdioma] = useState<Idioma | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return TITULOS.filter(
      (t) =>
        (!tipo || t.tipo === tipo) &&
        (!edad || t.edad === edad) &&
        (!idioma || t.idioma === idioma) &&
        (!q ||
          t.titulo.toLowerCase().includes(q) ||
          t.autor.toLowerCase().includes(q))
    );
  }, [tipo, edad, idioma, busqueda]);

  const paginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas - 1);
  const visibles = resultados.slice(
    paginaActual * POR_PAGINA,
    paginaActual * POR_PAGINA + POR_PAGINA
  );

  const hayFiltro = tipo || edad || idioma || busqueda.trim();

  function limpiar() {
    setTipo(null);
    setEdad(null);
    setIdioma(null);
    setBusqueda("");
    setPagina(0);
  }

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Biblioteca" }]} />

      <Cabecera
        kicker={`${TOTAL_TITULOS} títulos · español, inglés y francés`}
        titulo="Biblioteca"
        nota="Se explora y se filtra — no tiene secuencia, porque una biblioteca no la tiene. La obra y su guía docente son recursos hermanos: el vínculo es explícito, no una coincidencia de título."
      />

      {/* La plancha de filtros: Literatura posee esta pantalla. */}
      <section
        className="plancha library-filters mb-5"
        style={{ background: LIT.plancha, color: "#fff" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-[22px] pb-3.5 pt-5">
          <h2 className="font-heading text-[19px] font-bold uppercase tracking-[0.05em]">
            Filtrar el catálogo
          </h2>
          {hayFiltro && (
            <button
              type="button"
              onClick={limpiar}
              className="rounded-full bg-white/20 px-4 py-1.5 text-[12.5px] font-bold text-white hover:bg-white/30"
            >
              Quitar filtros
            </button>
          )}
        </div>

        <div className="plancha-estante gap-4">
          <div>
            <label
              htmlFor="busqueda"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-gris"
            >
              Buscar por título o autor
            </label>
            <input
              id="busqueda"
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(0);
              }}
              placeholder="Caperucita, Grimm, Sherlock…"
              className="w-full max-w-[440px] rounded-full bg-hueso px-5 py-3 text-[14px] text-tinta shadow-[inset_0_0_0_1.5px_var(--color-linea)] placeholder:text-gris/70 focus:shadow-[inset_0_0_0_2px_var(--color-lit)]"
            />
          </div>

          <GrupoFiltro
            titulo="Tipo"
            opciones={TIPOS}
            valor={tipo}
            onCambio={(v) => {
              setTipo(v);
              setPagina(0);
            }}
          />
          <GrupoFiltro
            titulo="Rango de edad"
            opciones={EDADES}
            valor={edad}
            onCambio={(v) => {
              setEdad(v);
              setPagina(0);
            }}
          />
          <GrupoFiltro
            titulo="Idioma"
            opciones={IDIOMAS}
            valor={idioma}
            onCambio={(v) => {
              setIdioma(v);
              setPagina(0);
            }}
          />
        </div>
      </section>

      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          className="font-heading text-[17px] font-bold uppercase tracking-[0.08em] text-tinta"
          aria-live="polite"
        >
          {resultados.length === 0
            ? "Ningún título coincide"
            : `${resultados.length} ${resultados.length === 1 ? "título" : "títulos"}`}
        </h2>
        <span className="text-[13px] text-gris">
          Página {paginaActual + 1} de {paginas}
        </span>
      </div>

      {resultados.length === 0 ? (
        /* ESTADO VACÍO QUE ORIENTA — no una pantalla en blanco */
        <div className="rounded-[15px] bg-papel px-6 py-12 text-center">
          <p className="font-heading text-[22px] font-bold text-tinta">
            La banda quedó vacía
          </p>
          <p className="mx-auto mt-2 max-w-[50ch] text-[14px] leading-[1.6] text-gris">
            Ningún título del catálogo cumple todos los filtros a la vez. Quite uno de
            ellos — el rango de edad suele ser el más restrictivo.
          </p>
          <button
            type="button"
            onClick={limpiar}
            className="mt-5 rounded-full bg-tinta px-6 py-3 text-[14px] font-bold text-white hover:opacity-90"
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(228px,1fr))] gap-2.5">
          {visibles.map((t) => {
            const hermano = t.hermanoDe
              ? TITULOS.find((o) => o.id === t.hermanoDe)
              : undefined;
            /* solo las obras con páginas digitalizadas ofrecen «Leer»:
               la ficha no promete lo que la biblioteca no tiene */
            const leible = libroDeTitulo(t.id);
            return (
            <li key={t.id}>
              <article
                className="library-book trecho-entra flex h-full flex-col rounded-[11px] p-4"
                style={{ background: LIT.pale, color: LIT.tinta }}
              >
                <p
                  className="text-[10.5px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: LIT.medio }}
                >
                  {t.tipo}
                </p>
                <h3 className="mt-1.5 text-[15px] font-bold leading-[1.25] [text-wrap:balance]">
                  {t.titulo}
                </h3>
                <p
                  className="mt-1 text-[12.5px] italic leading-snug"
                  style={{ color: LIT.medio }}
                >
                  {t.autor}
                </p>

                {/* El pie se ancla abajo para que las fichas de una fila
                    alineen sus metadatos aunque tengan avisos distintos. */}
                <div className="mt-auto pt-3">
                  {(t.hermanoDe || t.soloDocente) && (
                    <p className="mb-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-snug">
                      {hermano && (
                        <span style={{ color: LIT.medio }}>
                          Va con «{hermano.titulo}»
                        </span>
                      )}
                      {t.soloDocente && (
                        <span
                          className="font-bold uppercase tracking-[0.06em]"
                          style={{ color: AREAS.robotica.tinta }}
                        >
                          Solo docente
                        </span>
                      )}
                    </p>
                  )}
                  <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                    <span className="rounded-full bg-white/70 px-2.5 py-1 tabular-nums">
                      {t.edad} años
                    </span>
                    <span className="rounded-full bg-white/70 px-2.5 py-1">
                      {t.idioma}
                    </span>
                  </p>

                  {leible && (
                    <Link
                      href={`/biblioteca/leer/${leible.slug}`}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold text-white hover:opacity-90"
                      style={{ background: LIT.plancha }}
                    >
                      <BookOpen size={16} strokeWidth={2.3} aria-hidden="true" />
                      Leer el libro
                    </Link>
                  )}
                </div>
              </article>
            </li>
            );
          })}
        </ul>
      )}

      {paginas > 1 && (
        <nav
          aria-label="Paginación del catálogo"
          className="mt-5 flex items-center justify-between gap-3 border-t border-linea pt-4"
        >
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={paginaActual === 0}
            className="rounded-full bg-papel px-5 py-2.5 text-[13px] font-bold text-tinta shadow-[inset_0_0_0_1.5px_var(--color-linea)] enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-gris/50"
          >
            Anterior
          </button>
          <span className="text-[13px] tabular-nums text-gris">
            {paginaActual * POR_PAGINA + 1}–
            {Math.min((paginaActual + 1) * POR_PAGINA, resultados.length)} de{" "}
            {resultados.length}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
            disabled={paginaActual >= paginas - 1}
            className="rounded-full bg-papel px-5 py-2.5 text-[13px] font-bold text-tinta shadow-[inset_0_0_0_1.5px_var(--color-linea)] enabled:hover:bg-white disabled:cursor-not-allowed disabled:text-gris/50"
          >
            Siguiente
          </button>
        </nav>
      )}

      <p className="mt-5 max-w-[80ch] text-[12.5px] leading-[1.6] text-gris">
        La maqueta muestra {TITULOS.length} fichas de ejemplo del corpus de{" "}
        {TOTAL_TITULOS}. En producción el listado se pagina en servidor: nunca se
        cargan cientos de fichas de una vez.
      </p>
    </Marco>
  );
}

function GrupoFiltro<T extends string>({
  titulo,
  opciones,
  valor,
  onCambio,
}: {
  titulo: string;
  opciones: readonly T[];
  valor: T | null;
  onCambio: (v: T | null) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gris">
        {titulo}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => {
          const activa = valor === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={activa}
              onClick={() => onCambio(activa ? null : o)}
              className={cn(
                "filter-chip inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                activa
                  ? "bg-tinta text-white"
                  : "bg-hueso text-gris shadow-[inset_0_0_0_1.5px_var(--color-linea)] hover:text-tinta"
              )}
            >
              {activa && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
