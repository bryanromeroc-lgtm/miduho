"use client";

/* eslint-disable @next/next/no-img-element -- las ilustraciones y poses ya son webp optimizados del currículo */

import { Volume2, VolumeX } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ContextoActividad, Escuchar, useLecturaAutomatica } from "../comun/escuchar";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import type { EscenaJuego } from "../comun/escena";
import { armarRondas, iniciarParejas, ubicar, type EstadoParejas } from "./logica";
import s from "./parejas.module.css";

type Elemento = { id: string; texto: string; categoria: string; pareja?: string; imagen?: string; audio?: string; lectura?: string; explicacion?: string };
type Contenido = { categorias: { id: string; nombre: string }[]; elementos: Elemento[]; escena?: EscenaJuego };
type Props = { contenido: Contenido; semilla: string; alTerminar: (r: Record<string, unknown>) => void };
type Momento = "reposo" | "anticipacion" | "accion" | "impacto" | "recuperacion";
const BASE = "/audio/juegos/parejas/";
const SONIDOS = { acierto: [`${BASE}acierto.mp3`], fallo: [`${BASE}fallo.mp3`], "fin-ronda": [`${BASE}fin-ronda.mp3`], fin: [`${BASE}fin.mp3`] };

function LecturaInicial() {
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  useLecturaAutomatica("parejas-consigna", instruccion ?? "", audioInstruccion);
  return null;
}

export function TableroParejas({ contenido, semilla, alTerminar }: Props) {
  const rondas = useMemo(() => armarRondas(contenido.elementos, semilla), [contenido.elementos, semilla]);
  const [estado, setEstado] = useState<EstadoParejas>(iniciarParejas);
  const [visible, setVisible] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aviso, setAviso] = useState("Elige una pieza y luego su recuadro.");
  const [momento, setMomento] = useState<Momento>("reposo");
  const [reaccion, setReaccion] = useState<"acierto" | "fallo" | null>(null);
  const [rechazada, setRechazada] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [guiaDisponible, setGuiaDisponible] = useState(true);
  const [imagenesFallidas, setImagenesFallidas] = useState<string[]>([]);
  const [arrastre, setArrastre] = useState<{ id: string; x: number; y: number; activo: boolean } | null>(null);
  const arrastreRef = useRef<typeof arrastre>(null);
  const ignorarClic = useRef(false);
  const tiempos = useRef<ReturnType<typeof setTimeout>[]>([]);
  const primera = useRef<HTMLButtonElement>(null);
  const estadoRef = useRef(estado);
  const efectos = useEfectosGrabados(SONIDOS);
  const porId = useMemo(() => new Map(contenido.elementos.map((e) => [e.id, e])), [contenido.elementos]);
  const ronda = rondas[visible];
  const colocadasVisibles = bloqueado ? ronda.piezas : estado.colocadas;
  const personaje = contenido.escena?.personaje;
  useEffect(() => () => tiempos.current.forEach(clearTimeout), []);
  function despues(fn: () => void, ms: number) { tiempos.current.push(setTimeout(fn, ms)); }
  function tomar(id: string) {
    if (bloqueado || estadoRef.current.colocadas.includes(id)) return;
    setElegida((actual) => actual === id ? null : id);
    setAviso(`Elegiste ${porId.get(id)?.texto}. Ahora elige un recuadro.`);
  }
  function soltar(id: string, categoria: string) {
    if (bloqueado) return;
    const pieza = porId.get(id);
    const destino = contenido.categorias.find((c) => c.id === categoria);
    if (!pieza || !destino) return;
    efectos.preparar();
    const resultado = ubicar(estadoRef.current, rondas, contenido.elementos, id, categoria);
    if (resultado.evento === "ignorado") return;
    estadoRef.current = resultado.estado;
    setEstado(resultado.estado);
    setElegida(null);
    const acierto = pieza.categoria === categoria;
    const categoriaReal = contenido.categorias.find((c) => c.id === pieza.categoria)!.nombre;
    setReaccion(acierto ? "acierto" : "fallo");
    setMomento("anticipacion");
    if (!acierto) setRechazada(id);
    const ubicacion = `${pieza.texto} va en ${categoriaReal}.`;
    const conExplicacion = `${ubicacion}${pieza.explicacion ? ` ${pieza.explicacion}` : ""}`;
    setAviso(acierto ? `¡Bien! ${conExplicacion}` : resultado.autocolocada ? conExplicacion : "Esa no va ahí, inténtalo otra vez.");
    despues(() => setMomento("accion"), 110);
    despues(() => { setMomento("impacto"); efectos.tocar(acierto ? "acierto" : "fallo"); }, 270);
    despues(() => setMomento("recuperacion"), 530);
    despues(() => { setMomento("reposo"); setReaccion(null); setRechazada(null); }, 850);
    if (resultado.evento === "fin-ronda" || resultado.evento === "fin") {
      setBloqueado(true);
      despues(() => efectos.tocar(resultado.evento === "fin" ? "fin" : "fin-ronda"), 900);
      despues(() => {
        if (resultado.evento === "fin") alTerminar(resultado.estado.primeras);
        else {
          setVisible(resultado.estado.ronda);
          setBloqueado(false);
          setAviso(`Ronda ${resultado.estado.ronda + 1} de ${rondas.length}. Elige una pieza.`);
          requestAnimationFrame(() => primera.current?.focus());
        }
      }, 1450);
    }
  }
  function bajar(e: PointerEvent<HTMLButtonElement>, id: string) {
    if (e.button !== 0 || bloqueado) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastreRef.current = { id, x: e.clientX, y: e.clientY, activo: false };
  }
  function mover(e: PointerEvent<HTMLButtonElement>) {
    const a = arrastreRef.current;
    if (!a) return;
    const activo = a.activo || Math.hypot(e.clientX - a.x, e.clientY - a.y) > 8;
    arrastreRef.current = { ...a, activo };
    setArrastre(arrastreRef.current);
  }
  function subir(e: PointerEvent<HTMLButtonElement>) {
    const a = arrastreRef.current;
    arrastreRef.current = null; setArrastre(null);
    if (!a?.activo) return;
    ignorarClic.current = true;
    const destino = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-destino]")?.dataset.destino;
    if (destino) soltar(a.id, destino);
    requestAnimationFrame(() => { ignorarClic.current = false; });
  }
  function tecla(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && elegida) { setElegida(null); setAviso("Selección cancelada."); }
    if (elegida && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const destino = e.key === "ArrowUp" ? contenido.categorias[0] : contenido.categorias[1];
      soltar(elegida, destino.id);
    }
  }
  return <div className={s.tablero} onKeyDown={tecla}>
    <LecturaInicial />
    <div className={s.barra}><strong>Ronda {visible + 1} / {rondas.length}</strong><button type="button" className={s.sonido} aria-pressed={efectos.activo} onClick={efectos.alternar}>{efectos.activo ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />} Sonidos: {efectos.activo ? "sí" : "no"}</button></div>
    <div className={s.escena} style={contenido.escena?.fondo ? { backgroundImage: `url("${contenido.escena.fondo}")` } : undefined}>
      <div className={s.destinos} aria-label="Recuadros">
        {contenido.categorias.map((c, i) => {
          const colocada = ronda.piezas.map((id) => porId.get(id)!).find((p) => p.categoria === c.id && colocadasVisibles.includes(p.id));
          return <button key={c.id} type="button" data-destino={c.id} data-orden={i} className={s.destino} disabled={bloqueado} aria-label={c.nombre} onClick={() => elegida ? soltar(elegida, c.id) : setAviso("Elige una pieza primero.")}>
            <span className={s.rotulo}>{c.nombre}</span>
            {colocada ? <span className={s.colocada}>{colocada.imagen && !imagenesFallidas.includes(colocada.id) && <img src={colocada.imagen} alt="" onError={() => setImagenesFallidas((x) => [...x, colocada.id])} />}<span>{colocada.texto}</span></span> : <span className={s.hueco}>Suelta aquí</span>}
          </button>;
        })}
      </div>
      <div className={s.piezas} aria-label="Piezas de esta ronda">
        {ronda.piezas.map((id, i) => {
          const p = porId.get(id)!;
          const puesta = colocadasVisibles.includes(id);
          return <div key={id} className={s.piezaLugar} data-posicion={i} data-puesta={puesta ? "" : undefined} data-rechazada={rechazada === id ? "" : undefined}>
            {!puesta && <><button ref={i === 0 ? primera : undefined} type="button" className={s.pieza} aria-label={p.texto} aria-pressed={elegida === id} disabled={bloqueado} onClick={() => { if (!ignorarClic.current) tomar(id); }} onPointerDown={(e) => bajar(e, id)} onPointerMove={mover} onPointerUp={subir} onPointerCancel={() => { arrastreRef.current = null; setArrastre(null); }}>
              {p.imagen && !imagenesFallidas.includes(id) && <img src={p.imagen} alt="" draggable={false} onError={() => setImagenesFallidas((x) => [...x, id])} />}
              <span>{p.texto}</span>
            </button><Escuchar texto={p.lectura ?? p.texto} audio={p.audio} soloIcono /></>}
          </div>;
        })}
      </div>
      {personaje && <div className={s.guia} data-reaccion={reaccion ?? undefined} data-momento={momento} aria-hidden="true">
        {guiaDisponible ? <img src={personaje[reaccion === "acierto" && (momento === "accion" || momento === "impacto") ? "senala" : reaccion === "fallo" && (momento === "accion" || momento === "impacto") ? "duda" : "reposo"]} alt="" onError={() => setGuiaDisponible(false)} /> : <span>{personaje.nombre}</span>}
      </div>}
      {arrastre?.activo && <span className={s.fantasma} aria-hidden="true">{porId.get(arrastre.id)?.texto}</span>}
    </div>
    <p role="status" className={s.aviso} data-reaccion={reaccion ?? undefined}>{aviso}</p>
  </div>;
}
