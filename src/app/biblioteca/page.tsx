"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Search } from "lucide-react";
import { Marco, Migas } from "@/components/friso/marco";
import { ValleDeCuentos } from "@/components/biblioteca/valle";
import { Portada, formato } from "@/components/biblioteca/portada";
import {
  TITULOS,
  TOTAL_TITULOS,
  type Titulo,
  type TipoRecurso,
  type RangoEdad,
  type Idioma,
} from "@/lib/datos";
import { LIBROS, libroDeTitulo } from "@/lib/libros";
import { cn } from "@/lib/utils";
import styles from "./biblioteca.module.css";

/*
  LITERATURA — biblioteca: se explora, no se recorre. Sin progresión.
  La biblioteca es un lugar —el valle de los cuentos— y los títulos son
  objetos de pie sobre estantes, no tarjetas. Filtrar es que los libros
  salgan y vuelvan a entrar al estante.
  Paginado: nunca cientos de fichas de una vez (defecto de la referencia,
  que cargaba 2.235 recursos en una sola página).
*/

const TIPOS: TipoRecurso[] = ["Libro", "Guía", "Catálogo", "Audiolibro"];
const EDADES: RangoEdad[] = ["0-5", "6-8", "9-11", "12-13", "+14"];
const IDIOMAS: Idioma[] = ["Español", "Inglés", "Francés"];
const POR_PAGINA = 12;

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

  const hayFiltro = Boolean(tipo || edad || idioma || busqueda.trim());
  /* la clave cambia con cada consulta: los libros vuelven a entrar al estante */
  const claveEstante = `${tipo}|${edad}|${idioma}|${busqueda.trim()}|${paginaActual}`;

  function limpiar() {
    setTipo(null);
    setEdad(null);
    setIdioma(null);
    setBusqueda("");
    setPagina(0);
  }

  /* Los dos libros con páginas: la mesa de lectura los muestra de frente. */
  const leibles = LIBROS.map((l) => ({
    libro: l,
    titulo: TITULOS.find((t) => t.id === l.tituloId)!,
  }));

  return (
    <Marco>
      <div className={styles.biblioteca}>
        <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Biblioteca" }]} />

        {/* EL VALLE DE LOS CUENTOS — el hero es el lugar; buscar es la acción. */}
        <section className={styles.valle} aria-labelledby="biblioteca-titulo">
          <ValleDeCuentos />
          <div className={styles.scrim} aria-hidden="true" />
          <div className={styles.copy}>
            <h1 id="biblioteca-titulo">
              Biblioteca
            </h1>
            <p className={styles.cifra}>
              {TOTAL_TITULOS} títulos · español, inglés y francés
            </p>
            <p className={styles.lema}>
              Un valle de cuentos para explorar sin orden: busca por título o
              autor, o recorre los estantes por tipo, edad e idioma.
            </p>
            <form
              role="search"
              className={styles.buscador}
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="busqueda" className="sr-only">
                Buscar por título o autor
              </label>
              <Search size={20} strokeWidth={2.3} aria-hidden="true" />
              <input
                id="busqueda"
                type="search"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(0);
                }}
                placeholder="Caperucita, Grimm, Sherlock…"
                autoComplete="off"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setPagina(0);
                  }}
                  className={styles.borrar}
                >
                  Borrar
                </button>
              )}
            </form>
          </div>
        </section>

        {/* MESA DE LECTURA — los libros que se pueden abrir hoy, con portada real. */}
        <section className={styles.mesa} aria-labelledby="mesa-titulo">
          <div className={styles.mesaCabecera}>
            <h2 id="mesa-titulo">Listos para leer</h2>
            <span>{leibles.length} obras con páginas digitalizadas</span>
          </div>
          <ul className={styles.mesaLista}>
            {leibles.map(({ libro, titulo }, i) => (
              <li key={libro.slug} style={{ "--i": i } as React.CSSProperties}>
                <article className={styles.mesaLibro}>
                  <Link
                    href={`/biblioteca/leer/${libro.slug}`}
                    className={`${styles.cuerpo} ${styles.mesaCuerpo}`}
                    aria-label={`Leer ${libro.titulo}`}
                    tabIndex={-1}
                    transitionTypes={["abrir-libro"]}
                  >
                      <span className={styles.ejemplar}>
                        <span className={styles.paginas} aria-hidden="true" />
                        <span className={styles.cubierta}>
                          <Portada titulo={titulo} libro={libro} prioridad />
                        </span>
                      </span>
                  </Link>
                  <div className={styles.mesaTexto}>
                    <h3>{libro.titulo}</h3>
                    <p className={styles.autor}>
                      {libro.autor} · {libro.editorial}
                    </p>
                    <p className={styles.resumen}>{libro.resumen}</p>
                    <p className={styles.datos}>
                      <span>{titulo.edad} años</span>
                      <span>{titulo.idioma}</span>
                      <span>{libro.paginas} páginas</span>
                    </p>
                    <Link
                      href={`/biblioteca/leer/${libro.slug}`}
                      className={styles.leer}
                      transitionTypes={["abrir-libro"]}
                    >
                      <BookOpen size={17} strokeWidth={2.3} aria-hidden="true" />
                      Leer el libro
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* CINTA DE FILTROS — una línea, sin plancha: el catálogo manda. */}
        <section className={styles.cinta} aria-label="Filtrar el catálogo">
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
            titulo="Edad"
            opciones={EDADES}
            valor={edad}
            onCambio={(v) => {
              setEdad(v);
              setPagina(0);
            }}
            sufijo=" años"
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
          {hayFiltro && (
            <button type="button" onClick={limpiar} className={styles.quitar}>
              Quitar filtros
            </button>
          )}
        </section>

        {/* LOS ESTANTES */}
        <section className={styles.estantes} aria-labelledby="estantes-titulo">
          <div className={styles.estantesCabecera}>
            <h2 id="estantes-titulo" aria-live="polite">
              {resultados.length === 0
                ? "Ningún título coincide"
                : hayFiltro
                  ? `${resultados.length} ${resultados.length === 1 ? "título" : "títulos"} en el estante`
                  : "Todos los estantes"}
            </h2>
            <span>
              {resultados.length > 0 && (
                <>
                  {paginaActual * POR_PAGINA + 1}–
                  {Math.min((paginaActual + 1) * POR_PAGINA, resultados.length)} de{" "}
                  {resultados.length} · página {paginaActual + 1} de {paginas}
                </>
              )}
            </span>
          </div>

          {resultados.length === 0 ? (
            /* ESTADO VACÍO QUE ORIENTA — el estante quedó libre, no en blanco */
            <div className={styles.vacio}>
              <Image
                src="/images/aventura-lectora-mundo.webp"
                alt=""
                width={1000}
                height={667}
                sizes="220px"
              />
              <div>
                <p className={styles.vacioTitulo}>Este estante quedó vacío</p>
                <p>
                  Ningún título del catálogo cumple todos los filtros a la vez.
                  Quite uno de ellos — el rango de edad suele ser el más
                  restrictivo.
                </p>
                <button type="button" onClick={limpiar} className={styles.quitarGrande}>
                  Quitar filtros
                </button>
              </div>
            </div>
          ) : (
            <ul key={claveEstante} className={styles.estante}>
              {visibles.map((t, i) => (
                <LibroEnEstante key={t.id} titulo={t} indice={i} />
              ))}
            </ul>
          )}

          {paginas > 1 && (
            <nav aria-label="Paginación del catálogo" className={styles.paginacion}>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={paginaActual === 0}
              >
                Estante anterior
              </button>
              <span>
                Página {paginaActual + 1} de {paginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
                disabled={paginaActual >= paginas - 1}
              >
                Estante siguiente
              </button>
            </nav>
          )}
        </section>

        <p className={styles.nota}>
          La obra y su guía docente son recursos hermanos: el vínculo es
          explícito, no una coincidencia de título. La maqueta muestra{" "}
          {TITULOS.length} fichas de ejemplo del corpus de {TOTAL_TITULOS}; en
          producción el listado se pagina en servidor y nunca se cargan cientos
          de fichas de una vez.
        </p>
      </div>
    </Marco>
  );
}

function LibroEnEstante({ titulo: t, indice }: { titulo: Titulo; indice: number }) {
  const hermano = t.hermanoDe ? TITULOS.find((o) => o.id === t.hermanoDe) : undefined;
  /* solo las obras con páginas digitalizadas ofrecen «Leer»:
     el estante no promete lo que la biblioteca no tiene */
  const leible = libroDeTitulo(t.id);
  const cuerpo = (
    <>
      <span className={styles.ejemplar}>
        <span className={styles.paginas} aria-hidden="true" />
        <span className={styles.cubierta}>
          <Portada titulo={t} libro={leible} />
        </span>
        {t.tipo !== "Libro" && <span className={styles.tipo}>{t.tipo}</span>}
        {t.soloDocente && <span className={styles.docente}>Solo docente</span>}
      </span>
    </>
  );

  return (
    <li className={styles.libro} style={{ "--i": indice } as React.CSSProperties}>
      <article>
        {leible ? (
          <Link
            href={`/biblioteca/leer/${leible.slug}`}
            className={styles.cuerpo}
            style={formato(t)}
            aria-label={`Leer ${t.titulo}`}
            tabIndex={-1}
          >
            {cuerpo}
          </Link>
        ) : (
          <div className={styles.cuerpo} style={formato(t)}>{cuerpo}</div>
        )}
        <div className={styles.ficha}>
          <h3>{t.titulo}</h3>
          <p className={styles.autor}>{t.autor}</p>
          <p className={styles.datos}>
            <span>{t.edad} años</span>
            <span>{t.idioma}</span>
          </p>
          {hermano && (
            <p className={styles.hermano}>
              Va con «{hermano.titulo}»
            </p>
          )}
          {leible && (
            <Link href={`/biblioteca/leer/${leible.slug}`} className={styles.leerChico}>
              <BookOpen size={15} strokeWidth={2.3} aria-hidden="true" />
              Leer el libro
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}

function GrupoFiltro<T extends string>({
  titulo,
  opciones,
  valor,
  onCambio,
  sufijo = "",
}: {
  titulo: string;
  opciones: readonly T[];
  valor: T | null;
  onCambio: (v: T | null) => void;
  sufijo?: string;
}) {
  return (
    <fieldset className={styles.grupo}>
      <legend>{titulo}</legend>
      <div>
        {opciones.map((o) => {
          const activa = valor === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={activa}
              onClick={() => onCambio(activa ? null : o)}
              className={cn("filter-chip", styles.chip, activa && styles.chipActiva)}
            >
              {activa && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
              {o}
              {sufijo}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
