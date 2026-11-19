"use client";

import { ArrowRight, Check, Play, RotateCcw, Send, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState, type PointerEvent as EventoPuntero } from "react";
import { ContextoActividad, Escuchar, useLecturaAutomatica } from "../comun/escuchar";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import type { EscenaJuego } from "../comun/escena";
import { aciertos, colocar, devolver, ordenRevelado, pila, vacias, type Casillas } from "./logica";
import s from "./casillas.module.css";

type Elemento = { id: string; texto: string; audio?: string };
type Props = { contenido: { semilla: string | number; escena?: EscenaJuego; elementos: Elemento[] }; semilla: string; alTerminar: (respuestas: Record<string, unknown>) => void };
type Fase = "inicio" | "jugando" | "revelando" | "revelado";
type Arrastre = { id: string; x: number; y: number; activo: boolean };
const A = "/audio/juegos/casillas/";
const SONIDOS = {
  inicio: [`${A}inicio.mp3`], levantar: [1, 2, 3].map((n) => `${A}levantar-${n}.mp3`),
  soltar: [1, 2, 3].map((n) => `${A}soltar-${n}.mp3`), revelar: [`${A}revelar.mp3`],
  acierto: [1, 2, 3].map((n) => `${A}acierto-${n}.mp3`),
  fallo: [1, 2, 3].map((n) => `${A}fallo-${n}.mp3`), fin: [`${A}fin.mp3`],
  reiniciar: [`${A}reiniciar.mp3`],
};
const PASO = 560;
const ordinal = (i: number) => `${i + 1}.°`;

function LecturaInicial() {
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  useLecturaAutomatica("casillas-consigna", instruccion ?? "", audioInstruccion);
  return null;
}

export function TableroCasillas({ contenido, semilla, alTerminar }: Props) {
  const elementos = contenido.elementos;
  const personaje = contenido.escena?.personaje;
  const tarjetas = useMemo(() => pila(elementos, `${contenido.semilla}:${semilla}`), [elementos, contenido.semilla, semilla]);
  const porId = useMemo(() => new Map(elementos.map((e) => [e.id, e])), [elementos]);
  const [fase, setFase] = useState<Fase>("inicio");
  const [casillas, setCasillas] = useState<Casillas>(() => vacias(elementos.length));
  const [elegida, setElegida] = useState<string | null>(null);
  const [revelados, setRevelados] = useState(0);
  const [aviso, setAviso] = useState("");
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const [pose, setPose] = useState<"reposo" | "senala" | "duda">("reposo");
  const [tiempo, setTiempo] = useState<"lectura" | "anticipacion" | "accion" | "recuperacion">("lectura");
  const [imagenDisponible, setImagenDisponible] = useState(true);
  const efectos = useEfectosGrabados(SONIDOS);
  const reloj = useRef<ReturnType<typeof setTimeout>[]>([]);
  const foco = useRef<HTMLButtonElement>(null);
  const arrastreRef = useRef<Arrastre | null>(null);
  const ignorarClic = useRef(false);
  useEffect(() => () => reloj.current.forEach(clearTimeout), []);
  const orden = useMemo(() => ordenRevelado(elementos.length), [elementos.length]);
  const puestas = casillas.filter(Boolean).length;
  const disponibles = tarjetas.filter((t) => !casillas.includes(t.id));
  const nombre = (id: string | null) => id ? porId.get(id)?.texto ?? id : "vacía";

  function empezar() {
    efectos.preparar(); efectos.tocar("inicio", 0.75);
    setFase("jugando"); setAviso("Elige una ficha y luego una casilla numerada.");
    requestAnimationFrame(() => foco.current?.focus());
  }
  function elegir(id: string) {
    if (fase !== "jugando") return;
    if (elegida === id) { setElegida(null); setAviso("Selección cancelada."); return; }
    setElegida(id); efectos.tocar("levantar");
    setAviso(`Elegiste ${nombre(id)}. Toca la casilla donde va.`);
  }
  function poner(id: string, i: number) {
    if (fase !== "jugando") return;
    const anterior = casillas[i];
    setCasillas(colocar(casillas, id, i)); setElegida(null); efectos.tocar("soltar");
    setAviso(`${nombre(id)} quedó en ${ordinal(i)}.${anterior && anterior !== id ? ` ${nombre(anterior)} volvió a la pila.` : ""}`);
    requestAnimationFrame(() => foco.current?.focus());
  }
  function sacar(id: string) {
    if (fase !== "jugando") return;
    setCasillas(devolver(casillas, id)); setElegida(null); efectos.tocar("soltar");
    setAviso(`${nombre(id)} volvió a la pila.`);
    requestAnimationFrame(() => foco.current?.focus());
  }
  function enviar() {
    if (fase !== "jugando" || puestas === 0) return;
    setElegida(null); setFase("revelando"); setRevelados(0);
    efectos.tocar("revelar"); setAviso("Revisando las casillas desde la primera.");
    orden.forEach((i) => {
      const inicio = PASO * (i + 1);
      const ok = casillas[i] === elementos[i].id;
      reloj.current.push(setTimeout(() => { setPose("reposo"); setTiempo("lectura"); }, inicio));
      reloj.current.push(setTimeout(() => setTiempo("anticipacion"), inicio + 140));
      reloj.current.push(setTimeout(() => {
        setTiempo("accion"); setPose(ok ? "senala" : "duda");
        setRevelados(i + 1);
        efectos.tocar(ok ? "acierto" : "fallo");
        setAviso(`${ordinal(i)}: ${ok ? `${nombre(casillas[i])}, correcto` : `${nombre(casillas[i])}, aquí va ${elementos[i].texto}`}.`);
      }, inicio + 300));
      reloj.current.push(setTimeout(() => { setTiempo("recuperacion"); setPose("reposo"); }, inicio + 470));
    });
    reloj.current.push(setTimeout(() => {
      const bien = aciertos(elementos, casillas);
      setPose("reposo"); setFase("revelado"); efectos.tocar("fin");
      setAviso(`Lograste ${bien} de ${elementos.length} casillas. Las soluciones aparecen en las que faltaron.`);
      requestAnimationFrame(() => document.getElementById("casillas-resultado")?.focus());
    }, PASO * (elementos.length + 2)));
  }
  function bajar(e: EventoPuntero<HTMLButtonElement>, id: string) {
    if (fase !== "jugando" || e.button !== 0) return;
    const inicio = { id, x: e.clientX, y: e.clientY, activo: false };
    arrastreRef.current = inicio; setArrastre(inicio);
  }
  function mover(e: EventoPuntero<HTMLButtonElement>) {
    const a = arrastreRef.current;
    if (!a) return;
    const activo = a.activo || Math.hypot(e.clientX - a.x, e.clientY - a.y) > 8;
    if (activo && !a.activo) { e.currentTarget.setPointerCapture(e.pointerId); efectos.tocar("levantar"); }
    const siguiente = { ...a, activo };
    arrastreRef.current = siguiente; setArrastre(siguiente);
  }
  function subir(e: EventoPuntero<HTMLButtonElement>) {
    const a = arrastreRef.current;
    arrastreRef.current = null; setArrastre(null);
    if (!a?.activo) return;
    ignorarClic.current = true;
    const zona = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-casilla]");
    if (zona) poner(a.id, Number(zona.dataset.casilla));
    else if (document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-pila]")) sacar(a.id);
    requestAnimationFrame(() => { ignorarClic.current = false; });
  }
  function clic(id: string) { if (!ignorarClic.current) elegir(id); }
  function tecla(e: React.KeyboardEvent) { if (e.key === "Escape" && elegida) { setElegida(null); setAviso("Selección cancelada."); } }
  const bloqueado = fase !== "jugando";
  return (
    <div className={s.tablero} onKeyDown={tecla}>
      <div className={s.barra}>
        <button type="button" className={s.sonido} aria-pressed={efectos.activo} onClick={efectos.alternar}>
          {efectos.activo ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
          Sonidos: {efectos.activo ? "sí" : "no"}
        </button>
        {fase !== "inicio" && <span>{puestas} de {elementos.length} fichas colocadas</span>}
      </div>
      {fase === "inicio" ? (
        <div className={s.portada}>
          {personaje && <div className={s.personajePortada} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- pose provista por el contenido */}
            <img src={personaje.reposo} alt="" />
          </div>}
          <button type="button" className={s.accion} onClick={empezar} autoFocus><Play size={22} aria-hidden="true" /> Jugar</button>
        </div>
      ) : (
        <>
          <LecturaInicial />
          <div className={s.escena} data-con-guia={personaje ? "" : undefined} style={contenido.escena?.fondo ? { backgroundImage: `url("${contenido.escena.fondo}")` } : undefined}>
            {personaje && <div className={s.guia} aria-hidden="true" data-pose={pose} data-tiempo={tiempo}>
              {imagenDisponible && (
                // eslint-disable-next-line @next/next/no-img-element -- poses webp provistas por Gemini; respaldo si aún no existen
                <img src={personaje[pose]} alt="" onError={() => setImagenDisponible(false)} />
              )}
              {!imagenDisponible && <span className={s.guiaRespaldo}>{personaje.nombre}</span>}
            </div>}
            <div className={s.pila} data-pila="">
              <h2>Fichas para colocar</h2>
              <ul className={s.fichas}>
                {disponibles.map((t) => {
                  const i = tarjetas.indexOf(t);
                  return <li key={t.id} className={s.fichaLugar}>
                    <div className={s.ficha} data-tinte={i % 6} data-elegida={elegida === t.id ? "" : undefined}>
                      <button type="button" ref={t.id === disponibles[0]?.id ? foco : undefined} aria-pressed={elegida === t.id} disabled={bloqueado}
                        onClick={() => clic(t.id)} onPointerDown={(e) => bajar(e, t.id)} onPointerMove={mover} onPointerUp={subir} onPointerCancel={() => { arrastreRef.current = null; setArrastre(null); }}>
                        {t.texto}</button><Escuchar texto={t.texto} audio={t.audio} soloIcono />
                    </div>
                  </li>;
                })}
              </ul>
              {elegida && casillas.includes(elegida) && <button type="button" className={s.devolver} onClick={() => sacar(elegida)}><Undo2 size={18} aria-hidden="true" /> Devolver {nombre(elegida)} a la pila</button>}
              {arrastre?.activo && <span className={s.arrastre} aria-hidden="true">{nombre(arrastre.id)}</span>}
            </div>
            <div className={s.destinos}>
              <h2>Casillas en orden</h2>
              <ol className={s.casillas}>
                {orden.map((i) => {
                  const id = casillas[i]; const revelada = fase === "revelado" || (fase === "revelando" && i < revelados);
                  const ok = revelada && id === elementos[i].id;
                  const fallo = revelada && !ok;
                  return <li key={i} data-estado={revelada ? ok ? "ok" : "no" : undefined}>
                    <span className={s.numero}>{ordinal(i)}</span>
                    <button type="button" data-casilla={i} disabled={bloqueado} className={s.casilla}
                      onClick={() => elegida ? poner(elegida, i) : id ? elegir(id) : setAviso(`Casilla ${ordinal(i)} vacía. Elige una ficha primero.`)}
                      aria-label={`${ordinal(i)}, ${nombre(id)}${revelada ? ok ? ", correcta" : `, aquí va ${elementos[i].texto}` : ""}${!bloqueado ? ". Toca para colocar o mover una ficha" : ""}`}>
                      <span className={s.contenidoCasilla}><span>{id ? nombre(id) : "Vacía"}</span>{revelada && fallo && <span className={s.solucion}>Aquí va {elementos[i].texto}</span>}</span>
                      {revelada && <span className={s.marca} aria-hidden="true">{ok ? <Check size={22} /> : <X size={22} />}</span>}
                    </button>
                    {id && !bloqueado && <button type="button" className={s.quitar} aria-label={`Devolver ${nombre(id)} a la pila`} onClick={() => sacar(id)}><RotateCcw size={18} aria-hidden="true" /></button>}
                  </li>;
                })}
              </ol>
            </div>
          </div>
          <p className={s.aviso} role="status">{aviso}</p>
          {fase === "jugando" && <button type="button" className={s.accion} disabled={puestas === 0} onClick={enviar}><Send size={20} aria-hidden="true" /> Enviar respuestas</button>}
          {fase === "revelado" && <button id="casillas-resultado" type="button" className={s.accion} onClick={() => alTerminar({ orden: casillas })}>Ver resultado <ArrowRight size={20} aria-hidden="true" /></button>}
        </>
      )}
    </div>
  );
}
