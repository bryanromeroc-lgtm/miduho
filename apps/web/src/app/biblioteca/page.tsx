"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CornerDownLeft, Search } from "lucide-react";
import { Marco, Migas } from "@/components/friso/marco";
import { useShell } from "@/components/shell/contexto";
import { Portada } from "@/features/biblioteca/components/portada";
import { TITULOS, type Titulo, type TipoRecurso, type RangoEdad, type Idioma } from "@/data/demo";
import { libroDeTitulo } from "@/features/biblioteca/libros";
import { buscar, indexar, sugerir } from "@/features/biblioteca/buscar";
import { contextoVisible } from "@/lib/navegacion";
import { cn } from "@/lib/utils";
import styles from "./biblioteca.module.css";

/*
  LITERATURA — biblioteca: se explora, no se recorre. Sin progresión.
  Un bloque para buscar y filtrar, y una cuadrícula de libros paginada en
  tandas de 12 (nunca cientos de fichas de una vez). «Leer» aparece solo en
  las obras con páginas digitalizadas: el estante no promete lo que no hay.
  El estudiante nunca ve las guías ni los recursos solo para docentes.
*/

const TIPOS: TipoRecurso[] = ["Libro", "Guía", "Catálogo", "Audiolibro"];
const EDADES: RangoEdad[] = ["0-5", "6-8", "9-11", "12-13", "+14"];
const IDIOMAS: Idioma[] = ["Español", "Inglés", "Francés"];
const POR_PAGINA = 12;
const ORDENES = { titulo: "Título", autor: "Autor" } as const;
type Orden = keyof typeof ORDENES;

/* El índice de búsqueda de una ficha. Se calcula una vez por título y no
   por pulsación: el catálogo no cambia mientras se escribe. */
const indiceDe = (t: Titulo) => indexar(t.titulo, t.autor);
const sinSigno = (s: string) => s.replace(/^[¡¿«"'\s]+/, "");

export default function Biblioteca() {
  const pathname = usePathname();
  const datos = useShell();
  const estudiante = !!datos && contextoVisible(datos.contexto, datos.roles, pathname) === "ESTUDIANTE";
  const catalogo = useMemo(() => (estudiante ? TITULOS.filter((t) => !t.soloDocente) : TITULOS), [estudiante]);
  const tipos = estudiante ? TIPOS.filter((t) => catalogo.some((c) => c.tipo === t)) : TIPOS;

  const [tipo, setTipo] = useState<TipoRecurso | "">("");
  const [edad, setEdad] = useState<RangoEdad | "">("");
  const [idioma, setIdioma] = useState<Idioma | "">("");
  const [soloLeer, setSoloLeer] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("titulo");
  const [pagina, setPagina] = useState(0);
  const resultadosRef = useRef<HTMLHeadingElement>(null);

  /* Los filtros se aplican antes de buscar, y se combinan entre sí (Y). */
  const enFiltros = useMemo(
    () =>
      catalogo.filter(
        (t) =>
          (!tipo || t.tipo === tipo) &&
          (!edad || t.edad === edad) &&
          (!idioma || t.idioma === idioma) &&
          (!soloLeer || !!libroDeTitulo(t.id)),
      ),
    [catalogo, tipo, edad, idioma, soloLeer],
  );
  const hallazgos = useMemo(() => buscar(busqueda, enFiltros, indiceDe), [busqueda, enFiltros]);
  /* ningún resultado exacto: lo que se muestra salió de corregir el tecleo */
  const corregido = hallazgos.length > 0 && hallazgos[0].aproximado;
  const resultados = useMemo(() => {
    const lista = hallazgos.map((h) => h.ficha);
    const clave = (t: Titulo) => sinSigno(orden === "autor" ? t.autor : t.titulo);
    return [...lista].sort((a, b) => clave(a).localeCompare(clave(b), "es") || a.titulo.localeCompare(b.titulo, "es"));
  }, [hallazgos, orden]);

  const paginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA));
  const actual = Math.min(pagina, paginas - 1);
  const desde = actual * POR_PAGINA;
  const visibles = resultados.slice(desde, desde + POR_PAGINA);
  const hayFiltro = Boolean(tipo || edad || idioma || soloLeer || busqueda.trim());

  function filtrar<T>(fijar: (v: T) => void) {
    return (v: T) => {
      fijar(v);
      setPagina(0);
    };
  }

  function limpiar() {
    setTipo("");
    setEdad("");
    setIdioma("");
    setSoloLeer(false);
    setBusqueda("");
    setPagina(0);
  }

  function irAPagina(p: number) {
    setPagina(p);
    resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    resultadosRef.current?.focus({ preventScroll: true });
  }

  return (
    <Marco dia>
      <div className={`superficie-dia ${styles.pagina}`}>
        <Migas pasos={[{ etiqueta: "Inicio", href: "/" }, { etiqueta: "Biblioteca" }]} />

        <header className={styles.cabecera}>
          <div>
            <h1 className={styles.titulo}>Biblioteca</h1>
            <p className={styles.lema}>Encuentra tu próxima historia</p>
            <p className={styles.cifra}>{catalogo.length} títulos para explorar</p>
          </div>
          <Image
            src="/images/biblioteca/bruno-lector.webp"
            alt=""
            width={520}
            height={295}
            sizes="(max-width: 699px) 0px, 240px"
            className={styles.bruno}
            loading="eager"
          />
        </header>

        <section className={styles.panel} aria-label="Buscar y filtrar">
          <Buscador
            valor={busqueda}
            onCambio={filtrar(setBusqueda)}
            candidatos={enFiltros}
            onBuscar={() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
          <div className={styles.filtros}>
            <Selector etiqueta="Tipo" valor={tipo} opciones={tipos} onCambio={filtrar(setTipo)} />
            <Selector etiqueta="Edad" valor={edad} opciones={EDADES} sufijo=" años" onCambio={filtrar(setEdad)} />
            <Selector etiqueta="Idioma" valor={idioma} opciones={IDIOMAS} onCambio={filtrar(setIdioma)} />
            <label className={styles.casilla}>
              <input type="checkbox" checked={soloLeer} onChange={(e) => filtrar(setSoloLeer)(e.target.checked)} />
              Disponibles para leer
            </label>
            {hayFiltro && (
              <button type="button" onClick={limpiar} className={styles.limpiar}>
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        <section className={styles.resultados} aria-labelledby="resultados-titulo">
          <div className={styles.resultadosCabecera}>
            <h2 id="resultados-titulo" ref={resultadosRef} tabIndex={-1}>
              Explora los libros
            </h2>
            <p className={styles.rango} aria-live="polite">
              {resultados.length > 0
                ? `${desde + 1}–${Math.min(desde + POR_PAGINA, resultados.length)} de ${resultados.length}`
                : "Sin resultados"}
            </p>
            <label className={styles.orden}>
              Ordenar:
              <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
                {Object.entries(ORDENES).map(([v, e]) => (
                  <option key={v} value={v}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {corregido && (
            /* la consulta no existía tal cual: se corrigió el tecleo y hay que
               decirlo, o parecería que el buscador ignoró lo escrito */
            <p className={styles.corregido}>
              No hay coincidencia exacta de «{busqueda.trim()}»: esto es lo más parecido.
            </p>
          )}

          {resultados.length === 0 ? (
            <div className={styles.vacio}>
              <p className={styles.vacioTitulo}>No encontramos libros con esos filtros</p>
              <p>
                {busqueda.trim()
                  ? "Prueba con una sola palabra del título o con el apellido del autor."
                  : "Quita alguno de los filtros: la edad suele ser el más estricto."}
              </p>
              <button type="button" onClick={limpiar} className={styles.vacioBoton}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <ul className={styles.rejilla}>
              {visibles.map((t, i) => (
                <TarjetaLibro key={t.id} titulo={t} prioridad={actual === 0 && i < 6} docente={!estudiante} />
              ))}
            </ul>
          )}

          {paginas > 1 && (
            <nav aria-label="Páginas del catálogo" className={styles.paginacion}>
              <button type="button" onClick={() => irAPagina(actual - 1)} disabled={actual === 0}>
                <ArrowLeft size={20} strokeWidth={2.6} aria-hidden="true" />
                Anteriores
              </button>
              <p>
                Página {actual + 1} de {paginas}
              </p>
              <button type="button" onClick={() => irAPagina(actual + 1)} disabled={actual >= paginas - 1}>
                Siguientes
                <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>
    </Marco>
  );
}

function TarjetaLibro({ titulo: t, prioridad, docente }: { titulo: Titulo; prioridad: boolean; docente: boolean }) {
  /* solo las obras con páginas digitalizadas ofrecen «Leer» */
  const leible = libroDeTitulo(t.id);
  const hermano = docente && t.hermanoDe ? TITULOS.find((o) => o.id === t.hermanoDe) : undefined;
  return (
    <li className={styles.libro}>
      <article>
        <div className={styles.tapa}>
          <div className={styles.cubierta}>
            <Portada titulo={t} libro={leible} prioridad={prioridad} />
          </div>
        </div>
        <h3 className={styles.libroTitulo}>{t.titulo}</h3>
        <p className={styles.autor}>{t.autor}</p>
        <p className={styles.etiquetas}>
          <span>{t.edad} años</span>
          <span>{t.idioma}</span>
          {t.tipo !== "Libro" && <span>{t.tipo}</span>}
          {docente && t.soloDocente && <span data-tono="docente">Solo docente</span>}
        </p>
        {hermano && <p className={styles.hermano}>Va con «{hermano.titulo}»</p>}
        {leible ? (
          <Link
            href={`/biblioteca/leer/${leible.slug}`}
            className={styles.leer}
            aria-label={`Leer ${t.titulo}`}
            transitionTypes={["abrir-libro"]}
          >
            <BookOpen size={18} strokeWidth={2.4} aria-hidden="true" />
            Leer
          </Link>
        ) : (
          <p className={styles.sinDigital}>Sin versión digital</p>
        )}
      </article>
    </li>
  );
}

function Selector<T extends string>({
  etiqueta,
  valor,
  opciones,
  sufijo = "",
  onCambio,
}: {
  etiqueta: string;
  valor: T | "";
  opciones: readonly T[];
  sufijo?: string;
  onCambio: (v: T | "") => void;
}) {
  const id = useId();
  return (
    <div className={styles.selector}>
      <label htmlFor={id}>{etiqueta}:</label>
      <select id={id} value={valor} onChange={(e) => onCambio(e.target.value as T | "")}>
        <option value="">{etiqueta === "Edad" ? "Todas" : "Todos"}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
            {sufijo}
          </option>
        ))}
      </select>
    </div>
  );
}

/*
  BUSCADOR CON SUGERENCIAS — combobox del patrón WAI-ARIA. Las sugerencias
  son títulos del catálogo filtrado; el teclado hace todo lo que hace el
  ratón. Enter (o «Buscar») confirma y lleva a los resultados.
*/
function Buscador({
  valor,
  onCambio,
  candidatos,
  onBuscar,
}: {
  valor: string;
  onCambio: (v: string) => void;
  candidatos: readonly Titulo[];
  onBuscar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(-1);
  const contenedor = useRef<HTMLDivElement>(null);
  const idLista = useId();

  const sugerencias = useMemo(
    () => (abierto ? sugerir(valor, candidatos, indiceDe, 6) : []),
    [abierto, valor, candidatos],
  );

  useEffect(() => {
    if (!abierto) return;
    const alTocarFuera = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocarFuera);
    return () => document.removeEventListener("pointerdown", alTocarFuera);
  }, [abierto]);

  function elegir(t: Titulo) {
    onCambio(t.titulo);
    setAbierto(false);
    setActiva(-1);
  }

  function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setAbierto(false);
      setActiva(-1);
      return;
    }
    if (!sugerencias.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiva((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiva((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter" && activa >= 0) {
      e.preventDefault();
      elegir(sugerencias[activa]);
    }
  }

  const idOpcion = (i: number) => `${idLista}-opcion-${i}`;

  return (
    <div className={styles.campo} ref={contenedor}>
      <form
        role="search"
        className={styles.buscador}
        onSubmit={(e) => {
          e.preventDefault();
          setAbierto(false);
          onBuscar();
        }}
      >
        <label htmlFor="busqueda" className="sr-only">
          Buscar por título o autor
        </label>
        <div className={styles.entrada}>
          <Search size={22} strokeWidth={2.4} aria-hidden="true" />
          <input
            id="busqueda"
            type="search"
            role="combobox"
            aria-expanded={sugerencias.length > 0}
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={activa >= 0 ? idOpcion(activa) : undefined}
            value={valor}
            onChange={(e) => {
              onCambio(e.target.value);
              setAbierto(true);
              setActiva(-1);
            }}
            onFocus={() => setAbierto(true)}
            onKeyDown={alTeclear}
            placeholder="Busca por título o autor"
            autoComplete="off"
          />
        </div>
        <button type="submit" className={styles.buscar}>
          Buscar
        </button>
      </form>

      {sugerencias.length > 0 && (
        <ul className={styles.sugerencias} role="listbox" id={idLista} aria-label="Sugerencias">
          {sugerencias.map((t, i) => (
            <li
              key={t.id}
              id={idOpcion(i)}
              role="option"
              aria-selected={i === activa}
              className={cn(styles.sugerencia, i === activa && styles.sugerenciaActiva)}
              /* el ratón no le roba el foco al campo */
              onPointerDown={(e) => {
                e.preventDefault();
                elegir(t);
              }}
              onPointerEnter={() => setActiva(i)}
            >
              <span className={styles.sugerenciaTitulo}>{t.titulo}</span>
              <span className={styles.sugerenciaAutor}>{t.autor}</span>
              <CornerDownLeft size={14} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
