"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { PageFlip } from "page-flip";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Disposicion, PaginaCompuesta, PaginaLibro } from "@/lib/libros";
import estilos from "./flipbook.module.css";

/*
  LECTOR DE LIBROS — StPageFlip (paquete `page-flip`, vanilla) sobre un
  envoltorio propio. Se usa la librería vanilla y no `react-pageflip`
  porque ese wrapper fija React ≤18 en sus peerDependencies y este proyecto
  va con React 19.

  La composición es la tesis: el pliego manda. El título, el salto de
  página, el índice y la pantalla completa viven en una barra delgada
  arriba; las flechas flotan junto al libro; el progreso queda al pie.
  Nada se apila debajo de la página compitiendo por la atención.

  La librería mide en píxeles, así que las medidas se calculan aquí y la
  instancia se recrea cuando cambian de verdad (resize con debounce),
  conservando la página abierta. El DOM de las páginas lo escribe React;
  `loadFromHTML` solo lo adopta.

  Una página puede ser una imagen escaneada o una página compuesta
  (ilustración + texto real). En el segundo caso el texto se maqueta aquí
  y su tamaño sale de `--pagina`, el ancho en píxeles de la hoja: la letra
  crece con el libro, en pantalla completa igual que en un móvil.
*/

const CLASE_DISPOSICION: Record<Disposicion, string> = {
  portada: estilos.portada,
  lado: estilos.lado,
  arriba: estilos.arriba,
  fondo: estilos.fondo,
  pasos: estilos.pasos,
  creditos: estilos.creditos,
  contraportada: estilos.contraportada,
};

/* Página compuesta. Nada de aquí lleva estado ni eventos: el nodo se clona
   y StPageFlip lo adopta fuera del árbol de React. */
function Compuesta({
  pagina,
  numero,
  titulo,
  urgente,
}: {
  pagina: PaginaCompuesta;
  numero: number;
  titulo: string;
  urgente: boolean;
}) {
  const conTexto = pagina.titulo || pagina.parrafos?.length;
  const Lista = pagina.disposicion === "pasos" ? "ol" : "div";
  return (
    <div
      className={cn(estilos.compuesta, CLASE_DISPOSICION[pagina.disposicion])}
      data-alineado={pagina.textoAlineado}
    >
      {pagina.ilustracion && (
        // eslint-disable-next-line @next/next/no-img-element -- ver abajo
        <img
          className={estilos.ilustracion}
          src={pagina.ilustracion}
          alt={`${titulo}, ilustración de la página ${numero}`}
          loading={urgente ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      )}
      {conTexto ? (
        <div className={estilos.texto}>
          {pagina.titulo && <h2>{pagina.titulo}</h2>}
          {pagina.parrafos && (
            <Lista
              start={pagina.inicio}
              /* el número dibujado sale del contador CSS: se le da el
                 mismo punto de partida que al `start` */
              style={{ counterReset: `paso ${(pagina.inicio ?? 1) - 1}` }}
            >
              {pagina.parrafos.map((t, i) =>
                Lista === "ol" ? <li key={i}>{t}</li> : <p key={i}>{t}</p>
              )}
            </Lista>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* En tableta una sola hoja grande se lee mejor que dos miniaturas juntas.
   El pliego aparece cuando el ancho útil puede sostener dos páginas de
   lectura reales, no apenas cuando caben geométricamente. */
const ANCHO_DOBLE = 1040;

/* Medidas del pliego. La misma cuenta la usan el render —que fija el ancho
   del bloque— y el efecto que construye la instancia: StPageFlip pone su
   contenedor al 100% del padre y decide pliego doble u hoja suelta según ese
   ancho, así que el padre no puede quedar en `auto`. */
function dimensiones(
  medida: { w: number; h: number },
  razon: number,
  flexible: boolean
) {
  const doble = medida.w >= ANCHO_DOBLE;
  /* Un libro compuesto no tiene una hoja impresa que respetar: a hoja
     suelta (móvil) la hoja se estira hasta ocupar el alto disponible —como
     mucho en vertical 3:4— en vez de dejar media pantalla vacía bajo una
     hoja apaisada diminuta. A doble página conserva la razón del libro. */
  const r =
    flexible && !doble
      ? Math.min(razon, Math.max(0.75, medida.w / medida.h))
      : razon;
  const pagina = Math.floor(
    Math.min(doble ? medida.w / 2 : medida.w, medida.h * r)
  );
  return {
    doble,
    pagina,
    alto: Math.floor(pagina / r),
    bloque: doble ? pagina * 2 : pagina,
  };
}

export function Flipbook({
  paginas,
  titulo,
  autor,
  razon = 1,
  dedicado = false,
  volverHref,
}: {
  paginas: PaginaLibro[];
  titulo: string;
  autor?: string;
  razon?: number;
  dedicado?: boolean;
  volverHref?: string;
}) {
  const lectorRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const libroRef = useRef<HTMLDivElement>(null);
  /* StPageFlip adopta los nodos de las páginas y su destroy() los borra del
     DOM sin que React se entere. Por eso React conserva un original oculto
     y a la librería se le entregan clones: al recrear la instancia (un
     resize, entrar en pantalla completa) el original sigue intacto. */
  const fuenteRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  /* el índice vive también en una ref: el efecto que recrea la instancia lo
     necesita sin volver a dispararse cada vez que se pasa una página */
  const indiceRef = useRef(0);

  const [indice, setIndice] = useState(0);
  const [doble, setDoble] = useState(false);
  const [listo, setListo] = useState(false);
  const [pleno, setPleno] = useState(false);
  const [sonido, setSonido] = useState(false);
  const sonidoActivoRef = useRef(false);
  const [verIndice, setVerIndice] = useState(false);
  const [medida, setMedida] = useState<{ w: number; h: number } | null>(null);
  /* estado interno de StPageFlip: "read" es libro quieto, el resto son
     fases del volteo. Se usa para centrar la hoja suelta solo en reposo. */
  const [quieto, setQuieto] = useState(true);
  /* Borrador del campo «saltar a página». Se guarda aparte del índice real
     para que escribir «1» camino de «12» no mande el libro a la portada:
     el salto ocurre al confirmar, no en cada tecla. */
  const [borradorSalto, setBorradorSalto] = useState<string | null>(null);
  /* Copia del borrador que se consume al confirmar. Enter confirma y luego
     quita el foco, y ese blur vuelve a confirmar antes de que React haya
     vaciado el estado: sin esta ref el salto se ejecutaba dos veces y
     StPageFlip, con dos flipToPage encadenados, caía una hoja más allá. */
  const borradorRef = useRef<string | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const sonidoPagina = useCallback(() => {
    if (!sonidoActivoRef.current) return;
    if (!window.AudioContext) return;
    const ctx = audioRef.current ?? new window.AudioContext();
    audioRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();

    const duracion = 0.22;
    const cantidad = Math.floor(ctx.sampleRate * duracion);
    const buffer = ctx.createBuffer(1, cantidad, ctx.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < cantidad; i += 1) {
      const t = i / cantidad;
      datos[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * (1 - t) * 0.42;
    }
    const fuente = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const ganancia = ctx.createGain();
    filtro.type = "bandpass";
    filtro.frequency.setValueAtTime(1250, ctx.currentTime);
    filtro.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + duracion);
    filtro.Q.value = 0.7;
    ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.025);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracion);
    fuente.buffer = buffer;
    fuente.connect(filtro).connect(ganancia).connect(ctx.destination);
    fuente.start();
  }, []);

  const total = paginas.length;
  /* libro compuesto: sus hojas pueden cambiar de proporción (ver dimensiones) */
  const flexible = paginas.some((p) => p.compuesta);

  /* Medida disponible. La escena ya tiene su propio alto en CSS, así que
     aquí solo se lee: una sola fuente de verdad para la altura, y en
     pantalla completa el alto real de la ventana entra por el mismo sitio. */
  useEffect(() => {
    const escena = escenaRef.current;
    if (!escena) return;

    let temporizador: number | undefined;
    const medir = () => {
      const estilo = getComputedStyle(escena);
      const relleno =
        parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
      const rellenoV =
        parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom);
      const w = escena.clientWidth - relleno;
      const h = Math.max(260, escena.clientHeight - rellenoV);
      setMedida((prev) =>
        /* umbral de 2px: evita recrear la instancia por el temblor de la
           barra de scroll o del teclado virtual en móvil */
        prev && Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2
          ? prev
          : { w, h }
      );
    };

    const observador = new ResizeObserver(() => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(medir, 180);
    });
    observador.observe(escena);
    medir();

    return () => {
      observador.disconnect();
      window.clearTimeout(temporizador);
    };
  }, [pleno]);

  /* Creación de la instancia. Se rehace cuando cambian las medidas. */
  useEffect(() => {
    const contenedor = libroRef.current;
    if (!contenedor || !medida) return;
    /* el nodo se guarda en una variable: en la limpieza la ref ya podría
       apuntar a otro sitio */

    let anulado = false;
    let instancia: PageFlip | null = null;

    (async () => {
      const { PageFlip: Constructor } = await import("page-flip");
      if (anulado) return;

      /* StPageFlip escribe clases y vacía el nodo que se le entrega, y su
         destroy() lo deja irreconocible. Se le da un host propio, creado y
         tirado fuera de React, para que el árbol de React quede intacto. */
      const host = document.createElement("div");
      contenedor.replaceChildren(host);

      const { pagina: anchoPagina, alto: altoPagina } = dimensiones(
        medida,
        razon,
        flexible
      );

      instancia = new Constructor(host, {
        width: anchoPagina,
        height: altoPagina,
        size: "fixed",
        showCover: true, // portada y contraportada se leen solas
        usePortrait: true,
        mobileScrollSupport: false,
        maxShadowOpacity: 0.5,
        flippingTime: 700,
        startPage: indiceRef.current,
      });

      const hojas = Array.from(
        fuenteRef.current?.querySelectorAll<HTMLElement>("[data-pagina]") ?? []
      ).map((n) => n.cloneNode(true) as HTMLElement);
      if (hojas.length === 0) return;
      instancia.loadFromHTML(hojas);

      instancia.on("flip", (e) => {
        const n = e.data as number;
        indiceRef.current = n;
        setIndice(n);
        /* al pasar página el campo vuelve a reflejar el libro */
        borradorRef.current = null;
        setBorradorSalto(null);
        sonidoPagina();
      });
      instancia.on("changeOrientation", (e) => {
        setDoble(e.data === "landscape");
      });
      instancia.on("changeState", (e) => {
        setQuieto(e.data === "read");
      });

      setDoble(instancia.getOrientation() === "landscape");
      setListo(true);
      flipRef.current = instancia;
    })();

    return () => {
      anulado = true;
      try {
        instancia?.destroy();
      } catch {
        /* destroy lanza si el nodo ya se desmontó; no hay nada que limpiar */
      }
      contenedor.replaceChildren();
      if (flipRef.current === instancia) flipRef.current = null;
    };
  }, [medida, razon, flexible, sonidoPagina]);

  const siguiente = useCallback(() => flipRef.current?.flipNext(), []);
  const anterior = useCallback(() => flipRef.current?.flipPrev(), []);
  const irA = useCallback((n: number) => flipRef.current?.flip(n), []);

  /* Al abrir el índice, la página que se está leyendo tiene que estar a la
     vista: un índice de 38 miniaturas que empieza siempre en la portada
     obliga a buscar dónde se estaba. Se centra sin animar — el panel acaba
     de aparecer, así que no hay desplazamiento que el ojo pueda seguir. */
  const indicePanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!verIndice) return;
    indicePanelRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [verIndice]);

  /* Teclado: flechas para pasar, Escape para salir de pantalla completa. */
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const activo = document.activeElement;
      if (activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement)
        return;
      if (e.key === "ArrowRight") { e.preventDefault(); siguiente(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); anterior(); }
      else if (e.key === "Escape" && pleno) setPleno(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [siguiente, anterior, pleno]);

  /* En pantalla completa el fondo no debe desplazarse detrás del libro. */
  useEffect(() => {
    if (!pleno) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [pleno]);

  useEffect(() => {
    const alCambiar = () => setPleno(document.fullscreenElement === lectorRef.current);
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, []);

  const alternarPantalla = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await lectorRef.current?.requestFullscreen();
  }, []);

  const alternarSonido = useCallback(() => {
    setSonido((actual) => {
      sonidoActivoRef.current = !actual;
      return !actual;
    });
  }, []);

  const enPortada = indice === 0;
  const enFinal = indice >= total - 1;
  const hojaSuelta = doble && (enPortada || enFinal);
  /* Rótulo del pliego: «22-23» cuando se ven dos hojas, «1» cuando el libro
     muestra portada, contraportada o va a una sola página. */
  const rotuloPliego =
    doble && !hojaSuelta
      ? `${indice + 1}-${Math.min(indice + 2, total)}`
      : `${indice + 1}`;
  const etiquetaPagina =
    doble && !hojaSuelta
      ? `Páginas ${indice + 1}–${Math.min(indice + 2, total)} de ${total}`
      : `Página ${indice + 1} de ${total}`;

  /* Saltar a página. Acepta «22» y también «22-23»: el niño copia lo que ve
     en el campo. Se toma el primer número y se corrige al rango válido. */
  const confirmarSalto = useCallback(() => {
    const borrador = borradorRef.current;
    borradorRef.current = null;
    setBorradorSalto(null);
    if (borrador === null) return;
    const n = parseInt(borrador.replace(/[^0-9]/g, "").slice(0, 4), 10);
    if (!Number.isFinite(n)) return;
    irA(Math.min(Math.max(n, 1), total) - 1);
  }, [irA, total]);

  const descartarSalto = useCallback(() => {
    borradorRef.current = null;
    setBorradorSalto(null);
  }, []);

  /* La portada y la contraportada se leen solas: StPageFlip las deja en su
     mitad del pliego y queda medio libro vacío. Se desplaza el conjunto
     media página para que la hoja suelta caiga centrada, y solo con el
     libro quieto — durante el volteo estorbaría. */
  const desplazamiento =
    hojaSuelta && quieto ? (enPortada ? "-25%" : "25%") : "0%";

  const hoja = medida ? dimensiones(medida, razon, flexible) : null;

  return (
    <div
      ref={lectorRef}
      data-reader-ready={listo ? "true" : "false"}
      tabIndex={-1}
      className={cn(estilos.lector, dedicado && estilos.dedicado, pleno && estilos.pleno)}
      style={{ "--razon": razon } as CSSProperties}
    >
      <div className={estilos.cabecera}>
        {volverHref && (
          <Link href={volverHref} className={cn(estilos.herramienta, estilos.volver)}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span className={estilos.herramientaTexto}>Biblioteca</span>
          </Link>
        )}
        <div className={estilos.obra}>
          <span className={estilos.obraTitulo}>{titulo}</span>
          {autor && <span className={estilos.obraAutor}>{autor}</span>}
        </div>

        <div className={estilos.salto}>
          <label htmlFor="salto-pagina">Páginas</label>
          <input
            id="salto-pagina"
            className={estilos.saltoCampo}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={borradorSalto ?? rotuloPliego}
            aria-label={`Ir a una página. ${etiquetaPagina}`}
            onChange={(e) => {
              borradorRef.current = e.target.value;
              setBorradorSalto(e.target.value);
            }}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={confirmarSalto}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmarSalto();
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                descartarSalto();
                e.currentTarget.blur();
              }
            }}
          />
          <span className={estilos.saltoTotal}>/ {total}</span>
        </div>

        <div className={estilos.herramientas}>
          <button
            type="button"
            className={estilos.herramienta}
            aria-pressed={verIndice}
            onClick={() => setVerIndice((v) => !v)}
          >
            <LayoutGrid size={16} aria-hidden="true" />
            <span className={estilos.herramientaTexto}>Índice</span>
          </button>
          <button
            type="button"
            className={estilos.herramienta}
            aria-pressed={sonido}
            aria-label={sonido ? "Desactivar sonido de página" : "Activar sonido de página"}
            onClick={alternarSonido}
          >
            {sonido ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
            <span className={estilos.herramientaTexto}>{sonido ? "Sonido activo" : "Sonido"}</span>
          </button>
          <button
            type="button"
            className={estilos.herramienta}
            aria-pressed={pleno}
            onClick={alternarPantalla}
          >
            {pleno ? (
              <Minimize2 size={16} aria-hidden="true" />
            ) : (
              <Maximize2 size={16} aria-hidden="true" />
            )}
            <span className={estilos.herramientaTexto}>
              {pleno ? "Salir" : "Pantalla completa"}
            </span>
          </button>
        </div>
      </div>

      <div className={estilos.cuerpo}>
        <div ref={escenaRef} className={estilos.escena}>
          <button
            type="button"
            className={cn(estilos.paso, estilos.pasoAnterior)}
            onClick={anterior}
            disabled={enPortada}
            aria-label="Página anterior"
          >
            <ChevronLeft size={26} strokeWidth={2.5} aria-hidden="true" />
          </button>

          <div
            ref={libroRef}
            className={estilos.libro}
            style={
              {
                transform: `translateX(${desplazamiento})`,
                width: hoja?.bloque,
                "--pagina": hoja ? `${hoja.pagina}px` : undefined,
              } as CSSProperties
            }
            data-hoja={hoja?.doble ? "doble" : "suelta"}
            role="application"
            aria-roledescription="libro hojeable"
            aria-label={`${titulo} — ${etiquetaPagina}`}
          />

          <button
            type="button"
            className={cn(estilos.paso, estilos.pasoSiguiente)}
            onClick={siguiente}
            disabled={enFinal}
            aria-label="Página siguiente"
          >
            <ChevronRight size={26} strokeWidth={2.5} aria-hidden="true" />
          </button>

          {/* Original de las páginas: no se ve ni se anuncia; solo se clona. */}
          <div ref={fuenteRef} hidden aria-hidden="true">
            {paginas.map((p, i) => (
              <div
                key={p.numero}
                data-pagina={p.numero}
                data-density={i === 0 || i === total - 1 ? "hard" : "soft"}
                className={cn(
                  estilos.pagina,
                  i % 2 === 0 ? estilos.derecha : estilos.izquierda
                )}
              >
                {p.compuesta ? (
                  <Compuesta
                    pagina={p.compuesta}
                    numero={p.numero}
                    titulo={titulo}
                    urgente={i < 4}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     estos nodos se clonan y los inserta StPageFlip fuera del
                     árbol de React: un <Image /> perdería su runtime al clonarse.
                     Las páginas ya se sirven como WebP a su tamaño final. */
                  <img
                    src={p.src}
                    alt={`${titulo}, página ${p.numero}`}
                    width={1000}
                    height={Math.round(1000 / razon)}
                    /* las primeras hojas entran de inmediato; el resto espera a
                       que el navegador las necesite — 38 páginas son ~3 MB */
                    loading={i < 4 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>

          {!listo && <p className={estilos.cargando}>Abriendo el libro…</p>}
        </div>

        {verIndice && (
          <div className={estilos.indice} ref={indicePanelRef}>
            <ul className={estilos.indiceRejilla} aria-label="Ir a una página">
              {paginas.map((p, i) => (
                <li key={p.numero}>
                  <button
                    type="button"
                    className={estilos.miniatura}
                    aria-current={i === indice}
                    aria-label={`Ir a la página ${p.numero}`}
                    onClick={() => irA(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element --
                        miniatura WebP de 200 px ya optimizada en origen */}
                    <img src={p.miniatura} alt="" loading="lazy" />
                    <span className={estilos.miniaturaNumero}>{p.numero}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={estilos.pie}>
        <div
          className={estilos.progreso}
          role="progressbar"
          aria-label="Avance de lectura"
          aria-valuenow={indice + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuetext={etiquetaPagina}
        >
          <div
            className={estilos.progresoRelleno}
            style={{ transform: `scaleX(${(indice + 1) / total})` }}
          />
        </div>
        <span className={estilos.marcador} aria-live="polite">
          {etiquetaPagina}
        </span>
      </div>
    </div>
  );
}
