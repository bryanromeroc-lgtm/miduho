"use client";

import { ArrowRight, Check, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../../tipos/contrato";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { avanzar, estadoInicial, responder, terminado, type EstadoCinta } from "./logica";
import s from "./cinta.module.css";

/*
  Cinta — la mecánica de la referencia (Cokitos → Wordwall; informe
  docs/investigacion/referencia-cokitos-rutinas-diarias.md): una tarjeta con
  imagen cuelga de una cuerda y se toca la ficha de texto que coincide; la
  ficha acertada sale del tablero y la tarjeta se desliza fuera para dar paso
  a la siguiente. Suenan los efectos de la referencia (tarjeta que entra,
  acierto, fallo, cierre); no hay voces porque la referencia no las tiene.

  Lo que MIDUHO añade para evaluar y para incluir a todos: botones HTML con
  teclado (la referencia es un canvas), sin corazones, reloj ni récords; dos
  intentos por tarjeta con una pista tras el primer fallo y la respuesta
  revelada tras el segundo. La nota es la primera ficha tocada en cada tarjeta.
*/

type Par = { id: string; izquierda: string; derecha: string; imagen?: string; pista?: string };
type Props = { contenido: { pares: Par[] }; semilla: string; alTerminar: (respuestas: Record<string, unknown>) => void };

const A = "/audio/juegos/cinta/";
const SONIDOS = {
  inicio: [`${A}inicio.mp3`],
  entrar: [`${A}entrar.mp3`],
  centrar: [`${A}centrar.mp3`],
  salir: [`${A}salir.mp3`],
  acierto: [1, 2, 3].map((n) => `${A}acierto-${n}.mp3`),
  fallo: [1, 2, 3].map((n) => `${A}fallo-${n}.mp3`),
  fin: [`${A}fin.mp3`],
};
/** Cuánto se ve la marca ✓ antes de que la tarjeta salga (la referencia ~1 s). */
const PAUSA_ACIERTO = 900;
/** Con la respuesta revelada se da más tiempo para leerla. */
const PAUSA_REVELADO = 2200;
const SALIDA = 450;
const TINTES = 6;

type Fase = "inicio" | "jugando" | "fin";
type Movimiento = "entra" | "queda" | "sale";

export function TableroCinta({ contenido, semilla, alTerminar }: Props) {
  const tarjetas = useMemo(() => barajar(contenido.pares, `${semilla}:cinta`), [contenido, semilla]);
  const fichas = useMemo(() => barajar(contenido.pares, `${semilla}:fichas`), [contenido, semilla]);
  const tinte = useMemo(() => Object.fromEntries(fichas.map((f, i) => [f.id, i % TINTES])), [fichas]);
  const total = tarjetas.length;

  const [fase, setFase] = useState<Fase>("inicio");
  const [estado, setEstado] = useState<EstadoCinta>(estadoInicial);
  const [movimiento, setMovimiento] = useState<Movimiento>("entra");
  const [marca, setMarca] = useState<{ ok: boolean; ficha: string } | null>(null);
  const [errada, setErrada] = useState<string | null>(null);
  const [revelada, setRevelada] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const efectos = useEfectosGrabados(SONIDOS);
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);
  const botones = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const actual = terminado(estado, total) ? null : tarjetas[estado.indice];
  const luego = (ms: number, fn: () => void) => {
    relojes.current.push(setTimeout(fn, ms));
  };

  // Al llegar una tarjeta nueva: suena «entrar», se asienta y se anuncia (lector de pantalla).
  useEffect(() => {
    if (fase !== "jugando" || !actual) return;
    efectos.tocar("entrar", 0.6);
    const t1 = setTimeout(() => efectos.tocar("centrar", 0.7), 380);
    const t2 = setTimeout(() => setMovimiento("queda"), 480);
    const primera = fichas.find((f) => !estado.quitadas.includes(f.id));
    const t3 = setTimeout(() => (primera ? botones.current.get(primera.id)?.focus({ preventScroll: true }) : undefined), 520);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // Solo al cambiar de tarjeta o de fase; el resto de `efectos`/`fichas` no debe repetir el efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, estado.indice]);

  // Precarga de la siguiente ilustración.
  useEffect(() => {
    const sig = tarjetas[estado.indice + 1]?.imagen;
    if (sig) new Image().src = sig;
  }, [tarjetas, estado.indice]);

  const anunciar = (i: number) => `Tarjeta ${i + 1} de ${total}: ${tarjetas[i].izquierda}. Toca la ficha que coincide.`;

  function empezar() {
    efectos.preparar();
    efectos.tocar("inicio", 0.7);
    setFase("jugando");
    setAviso(anunciar(0));
    setMovimiento("entra");
  }

  function pasar(tarjeta: string, nuevo: EstadoCinta) {
    setMovimiento("sale");
    efectos.tocar("salir", 0.6);
    luego(SALIDA, () => {
      const sig = avanzar(nuevo, tarjeta);
      setEstado(sig);
      setMarca(null);
      setErrada(null);
      setRevelada(null);
      setBloqueado(false);
      if (terminado(sig, total)) {
        setFase("fin");
        efectos.tocar("fin", 0.8);
        setAviso(`Terminaste las ${total} tarjetas. Acertaste ${sig.aciertos} a la primera.`);
      } else {
        setAviso(anunciar(sig.indice));
        setMovimiento("entra");
      }
    });
  }

  function tocar(ficha: string) {
    if (fase !== "jugando" || bloqueado || !actual) return;
    const { estado: nuevo, resultado } = responder(estado, actual.id, ficha);
    setEstado(nuevo);
    if (resultado === "acierto") {
      efectos.tocar("acierto");
      setBloqueado(true);
      setMarca({ ok: true, ficha });
      setAviso(`¡Correcto! ${actual.derecha}.`);
      luego(PAUSA_ACIERTO, () => pasar(actual.id, nuevo));
      return;
    }
    efectos.tocar("fallo");
    setMarca({ ok: false, ficha });
    setErrada(ficha);
    luego(700, () => setErrada(null));
    if (resultado === "pista") {
      setAviso(`Esa no es. ${actual.pista ?? "Mira bien la imagen e inténtalo otra vez."}`);
      return;
    }
    setBloqueado(true);
    setRevelada(actual.id);
    setAviso(`No era esa. La respuesta es: ${actual.derecha}.`);
    luego(PAUSA_REVELADO, () => pasar(actual.id, nuevo));
  }

  const fin = fase === "fin";
  return (
    <div className={s.tablero} data-fase={fase}>
      <div className={s.barra}>
        <button type="button" className={s.sonido} aria-pressed={efectos.activo} onClick={efectos.alternar}>
          {efectos.activo ? <Volume2 size={20} strokeWidth={2.6} aria-hidden="true" /> : <VolumeX size={20} strokeWidth={2.6} aria-hidden="true" />}
          Sonidos: {efectos.activo ? "sí" : "no"}
        </button>
        {fase !== "inicio" && (
          <p className={s.progreso}>
            <span>
              Tarjeta {Math.min(estado.indice + 1, total)} de {total}
            </span>
            <span className={s.aciertos} aria-label={`${estado.aciertos} a la primera`}>
              <Check size={20} strokeWidth={3.2} aria-hidden="true" />
              {estado.aciertos}
            </span>
          </p>
        )}
      </div>

      <div className={s.cuerda} aria-hidden="true" />

      {fase === "inicio" ? (
        <div className={s.portada}>
          <p className={s.portadaTexto}>{total} tarjetas con imagen. Toca la ficha que coincide con cada una.</p>
          <button type="button" className={s.empezar} onClick={empezar} autoFocus>
            <Play size={26} strokeWidth={2.8} aria-hidden="true" />
            Empezar
          </button>
        </div>
      ) : (
        <>
          <div className={s.escenario}>
            {actual && (
              <figure className={s.colgante} data-movimiento={movimiento} data-tinte={estado.indice % TINTES}>
                <span className={s.pinza} aria-hidden="true" />
                {actual.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element -- ilustración pequeña ya optimizada (webp)
                  <img src={actual.imagen} alt={actual.izquierda} width={320} height={320} className={s.imagen} draggable={false} />
                )}
                {marca && (
                  <span className={s.sello} data-ok={marca.ok ? "" : undefined} aria-hidden="true">
                    {marca.ok ? <Check size={64} strokeWidth={4} /> : <X size={64} strokeWidth={4} />}
                  </span>
                )}
              </figure>
            )}
            {fin && <p className={s.cierre}>¡Colgaste todas las tarjetas!</p>}
          </div>

          <ul className={s.fichas} aria-label="Fichas">
            {fichas.map((f) => {
              const fuera = estado.quitadas.includes(f.id);
              if (fuera)
                return <li key={f.id} className={s.hueco} aria-hidden="true" />;
              const esErrada = errada === f.id;
              const esRevelada = revelada === f.id;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) botones.current.set(f.id, el);
                      else botones.current.delete(f.id);
                    }}
                    className={s.ficha}
                    data-tinte={tinte[f.id]}
                    data-estado={esRevelada ? "revelada" : esErrada ? "no" : undefined}
                    disabled={fin}
                    aria-disabled={bloqueado || undefined}
                    onClick={() => tocar(f.id)}
                  >
                    <span className={s.chinche} aria-hidden="true" />
                    <span className={s.palabra}>{f.derecha}</span>
                    {esErrada && <X className={s.marcaFicha} size={34} strokeWidth={4} aria-hidden="true" />}
                    {esRevelada && <Check className={s.marcaFicha} size={34} strokeWidth={4} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className={s.aviso} role="status">
        {aviso}
      </p>

      {fin && (
        <div className={s.acciones}>
          <button type="button" className={s.empezar} onClick={() => alTerminar(estado.primeros)} autoFocus>
            Ver resultado
            <ArrowRight size={22} strokeWidth={2.8} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
