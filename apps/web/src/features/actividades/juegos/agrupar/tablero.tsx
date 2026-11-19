"use client";

import { ArrowRight, Check, Play, Send, Undo2, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as EventoPuntero } from "react";
import { barajar } from "../../tipos/contrato";
import { callarVozTarea } from "../comun/voz";
import { Escuchar } from "../comun/escuchar";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { aciertos, cabe, cupos, enGrupo, faltan, ordenRevelado, poner, type Lugares } from "./logica";
import s from "./agrupar.module.css";

/*
  Tablero «Agrupar» — la mecánica de la referencia (Cokitos → Wordwall,
  plantilla «Agrupar»; informe docs/investigacion/referencia-cokitos-seres-
  vivos-e-inertes.md): todas las tarjetas a la vista con imagen, palabra y
  altavoz; un grupo por columna con sus casillas; se llevan arrastrando y,
  al terminar, «Enviar respuestas» revela una por una con ✓ o ✗ y su sonido.

  Lo que MIDUHO añade para evaluar y para incluir a todos: además de
  arrastrar, tocar la tarjeta y luego el grupo (WCAG 2.5.7), todo con
  teclado; «Enviar» solo cuando no queda ninguna en la pila; sin reloj ni
  tabla de récords. La nota es la ubicación de cada tarjeta al enviar.
*/

type Elemento = { id: string; texto: string; categoria: string; audio?: string; imagen?: string; explicacion?: string };
type Contenido = { categorias: { id: string; nombre: string }[]; elementos: Elemento[] };
type Props = { contenido: Contenido; semilla: string; alTerminar: (respuestas: Record<string, unknown>) => void };
type Fase = "inicio" | "jugando" | "revelando" | "revelado";

const A = "/audio/juegos/agrupar/";
const SONIDOS = {
  inicio: [`${A}inicio.mp3`],
  levantar: [1, 2, 3].map((n) => `${A}levantar-${n}.mp3`),
  soltar: [1, 2, 3].map((n) => `${A}soltar-${n}.mp3`),
  acierto: [1, 2, 3].map((n) => `${A}acierto-${n}.mp3`),
  fallo: [1, 2, 3].map((n) => `${A}fallo-${n}.mp3`),
  revelar: [`${A}revelar.mp3`],
  fin: [`${A}fin.mp3`],
};
/** Pausa entre tarjeta y tarjeta al revelar (la referencia usa ~0,3 s; un poco más para 1.°). */
const PASO_REVELADO = 420;
/** Píxeles que debe moverse el dedo para que un toque se vuelva arrastre. */
const UMBRAL_ARRASTRE = 8;
const TINTES = 6;

type Arrastre = { id: string; x0: number; y0: number; dx: number; dy: number; activo: boolean; sobre: string | null };

export function TableroAgrupar({ contenido, semilla, alTerminar }: Props) {
  const tarjetas = useMemo(() => barajar(contenido.elementos, semilla), [contenido, semilla]);
  const tinte = useMemo(() => Object.fromEntries(tarjetas.map((t, i) => [t.id, i % TINTES])), [tarjetas]);
  const porId = useMemo(() => new Map(contenido.elementos.map((e) => [e.id, e])), [contenido]);
  const cupo = useMemo(() => cupos(contenido.categorias, contenido.elementos), [contenido]);
  const nombre = (g: string) => contenido.categorias.find((k) => k.id === g)?.nombre ?? g;

  const [fase, setFase] = useState<Fase>("inicio");
  const [lugares, setLugares] = useState<Lugares>({});
  const [elegida, setElegida] = useState<string | null>(null);
  const [arrastre, setArrastre] = useState<Arrastre | null>(null);
  const [revelados, setRevelados] = useState(0);
  const [aviso, setAviso] = useState("");
  const efectos = useEfectosGrabados(SONIDOS);

  const zonas = useRef(new Map<string, HTMLElement>());
  const tarjetasRef = useRef(new Map<string, HTMLButtonElement>());
  const tragarClic = useRef(false);
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const pendientes = faltan(lugares, contenido.elementos);
  const orden = useMemo(() => ordenRevelado(contenido.categorias, lugares), [contenido, lugares]);
  const estadoDe = (id: string): "ok" | "no" | undefined => {
    const i = orden.findIndex((o) => o.id === id);
    if (fase === "jugando" || fase === "inicio" || i < 0 || i >= revelados) return undefined;
    return lugares[id] === porId.get(id)?.categoria ? "ok" : "no";
  };
  const bien = orden.slice(0, revelados).filter((o) => porId.get(o.id)?.categoria === o.grupo).length;

  function empezar() {
    efectos.preparar();
    efectos.tocar("inicio", 0.7);
    setFase("jugando");
    setAviso("Lleva cada tarjeta a su grupo.");
    requestAnimationFrame(() => tarjetasRef.current.get(tarjetas[0].id)?.focus());
  }

  /** Lleva una tarjeta a un grupo (o a la pila con null). Devuelve si se pudo. */
  function llevar(id: string, grupo: string | null): boolean {
    if (grupo !== null && !cabe(lugares, grupo, cupo[grupo], id)) {
      setAviso(`${nombre(grupo)} ya está lleno. Saca una tarjeta de ahí si quieres cambiarla.`);
      return false;
    }
    const nuevos = poner(lugares, id, grupo);
    setLugares(nuevos);
    setElegida(null);
    efectos.tocar("soltar");
    const resto = faltan(nuevos, contenido.elementos);
    const texto = porId.get(id)!.texto;
    setAviso(
      (grupo === null ? `${texto} volvió a las tarjetas.` : `${texto} quedó en ${nombre(grupo)}.`) +
        (resto === 0 ? " ¡Ya no quedan tarjetas! Toca «Enviar respuestas»." : resto === 1 ? " Falta 1 tarjeta." : ` Faltan ${resto} tarjetas.`),
    );
    // El foco sigue en la siguiente tarjeta de la pila, para jugar solo con teclado.
    const siguiente = tarjetas.find((t) => nuevos[t.id] === undefined && t.id !== id);
    if (grupo !== null && siguiente) requestAnimationFrame(() => tarjetasRef.current.get(siguiente.id)?.focus());
    return true;
  }

  function elegir(id: string) {
    if (fase !== "jugando") return;
    if (elegida === id) {
      setElegida(null);
      setAviso("Soltaste la tarjeta.");
      return;
    }
    setElegida(id);
    efectos.tocar("levantar");
    setAviso(`Tienes ${porId.get(id)!.texto}. Ahora toca su grupo.`);
  }

  // Arrastre con puntero (ratón, dedo o lápiz). Un toque sin moverse es «elegir».
  function bajar(e: EventoPuntero<HTMLButtonElement>, id: string) {
    if (fase !== "jugando" || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastre({ id, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, activo: false, sobre: null });
  }
  function mover(e: EventoPuntero<HTMLButtonElement>) {
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x0;
    const dy = e.clientY - arrastre.y0;
    const activo = arrastre.activo || Math.hypot(dx, dy) > UMBRAL_ARRASTRE;
    if (activo && !arrastre.activo) {
      efectos.tocar("levantar");
      setElegida(null);
    }
    let sobre: string | null = null;
    for (const [zona, el] of zonas.current) {
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) sobre = zona;
    }
    setArrastre({ ...arrastre, dx, dy, activo, sobre });
  }
  function subir() {
    if (!arrastre) return;
    if (arrastre.activo) {
      // El navegador puede o no mandar un clic tras soltar: se ignora solo el de este mismo gesto.
      tragarClic.current = true;
      setTimeout(() => (tragarClic.current = false), 0);
      if (arrastre.sobre === "pila") llevar(arrastre.id, null);
      else if (arrastre.sobre && arrastre.sobre !== lugares[arrastre.id]) llevar(arrastre.id, arrastre.sobre);
      else efectos.tocar("soltar");
    }
    setArrastre(null);
  }
  function clic(id: string) {
    if (tragarClic.current) {
      tragarClic.current = false;
      return;
    }
    elegir(id);
  }

  function enviar() {
    callarVozTarea();
    setElegida(null);
    setFase("revelando");
    setAviso("Revisando tus respuestas…");
    efectos.tocar("revelar", 0.6);
    orden.forEach((o, i) => {
      relojes.current.push(
        setTimeout(() => {
          setRevelados(i + 1);
          efectos.tocar(porId.get(o.id)?.categoria === o.grupo ? "acierto" : "fallo");
        }, 500 + i * PASO_REVELADO),
      );
    });
    relojes.current.push(
      setTimeout(
        () => {
          const total = aciertos(contenido.elementos, lugares);
          setFase("revelado");
          efectos.tocar("fin", 0.8);
          setAviso(
            total === contenido.elementos.length
              ? `¡Todas en su lugar! Acertaste ${total} de ${total}.`
              : `Acertaste ${total} de ${contenido.elementos.length}. Las tarjetas en gris van en el otro grupo.`,
          );
        },
        500 + orden.length * PASO_REVELADO + 300,
      ),
    );
  }

  const estiloArrastre = (id: string) =>
    arrastre?.activo && arrastre.id === id ? { transform: `translate(${arrastre.dx}px, ${arrastre.dy}px) rotate(-3deg) scale(1.06)` } : undefined;

  // Función de dibujo (no componente): así la tarjeta no se vuelve a montar en cada render y no pierde el puntero ni el foco.
  function tarjeta(id: string, compacta = false) {
    const t = porId.get(id)!;
    const estado = estadoDe(id);
    return (
      <div
        key={id}
        className={compacta ? s.ficha : s.tarjeta}
        data-tinte={tinte[id]}
        data-elegida={elegida === id ? "" : undefined}
        data-arrastrando={arrastre?.activo && arrastre.id === id ? "" : undefined}
        data-estado={estado}
        style={estiloArrastre(id)}
      >
        <button
          ref={(el) => {
            if (el) tarjetasRef.current.set(id, el);
            else tarjetasRef.current.delete(id);
          }}
          type="button"
          className={s.tarjetaBoton}
          aria-pressed={fase === "jugando" ? elegida === id : undefined}
          aria-label={
            estado
              ? `${t.texto}, en ${nombre(lugares[id])}: ${estado === "ok" ? "bien" : `va en ${nombre(t.categoria)}`}`
              : lugares[id]
                ? `${t.texto}, en ${nombre(lugares[id])}. Toca para moverla.`
                : t.texto
          }
          disabled={fase !== "jugando"}
          onClick={() => clic(id)}
          onPointerDown={(e) => bajar(e, id)}
          onPointerMove={mover}
          onPointerUp={subir}
          onPointerCancel={() => setArrastre(null)}
        >
          {t.imagen && (
            // eslint-disable-next-line @next/next/no-img-element -- ilustración pequeña ya optimizada (webp 320 px)
            <img src={t.imagen} alt="" width={160} height={160} className={s.imagen} draggable={false} />
          )}
          <span className={s.palabra}>{t.texto}</span>
        </button>
        {!compacta && (
          <span className={s.altavoz}>
            <Escuchar texto={t.texto} audio={t.audio} soloIcono />
          </span>
        )}
        {estado && (
          <span className={s.sello} data-estado={estado} aria-hidden="true">
            {estado === "ok" ? <Check size={20} strokeWidth={3.4} /> : <X size={20} strokeWidth={3.4} />}
          </span>
        )}
      </div>
    );
  }

  const enPila = tarjetas.filter((t) => lugares[t.id] === undefined);
  const elegidaPuesta = elegida !== null && lugares[elegida] !== undefined;

  return (
    <div className={s.tablero} data-fase={fase} data-arrastrando={arrastre?.activo ? "" : undefined}>
      <div className={s.barra}>
        <button type="button" className={s.sonido} aria-pressed={efectos.activo} onClick={efectos.alternar}>
          {efectos.activo ? <Volume2 size={20} strokeWidth={2.6} aria-hidden="true" /> : <VolumeX size={20} strokeWidth={2.6} aria-hidden="true" />}
          Sonidos: {efectos.activo ? "sí" : "no"}
        </button>
        {fase !== "inicio" && fase !== "jugando" && (
          <p className={s.cuenta} aria-label={`${bien} bien`}>
            <Check size={22} strokeWidth={3.2} aria-hidden="true" />
            {bien}
          </p>
        )}
      </div>

      {fase === "inicio" ? (
        <div className={s.portada}>
          <ul className={s.portadaGrupos} aria-label="Grupos">
            {contenido.categorias.map((g) => (
              <li key={g.id}>{g.nombre}</li>
            ))}
          </ul>
          <p className={s.portadaTexto}>{contenido.elementos.length} tarjetas para ordenar</p>
          <button type="button" className={s.empezar} onClick={empezar} autoFocus>
            <Play size={26} strokeWidth={2.8} aria-hidden="true" />
            Empezar
          </button>
        </div>
      ) : (
        <div className={s.mesa} data-pila-vacia={enPila.length === 0 && !elegidaPuesta ? "" : undefined}>
          <section
            className={s.pila}
            aria-label="Tarjetas por ubicar"
            ref={(el) => {
              if (el) zonas.current.set("pila", el);
            }}
            data-sobre={arrastre?.sobre === "pila" ? "" : undefined}
          >
            {enPila.length > 0 ? (
              <ul className={s.pilaLista}>
                {enPila.map((t) => (
                  <li key={t.id}>
                    {tarjeta(t.id)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.pilaVacia}>{fase === "jugando" ? "¡Ya ubicaste todas las tarjetas!" : "Así quedaron tus grupos."}</p>
            )}
            {elegidaPuesta && (
              <button type="button" className={s.devolver} onClick={() => llevar(elegida!, null)}>
                <Undo2 size={20} strokeWidth={2.6} aria-hidden="true" />
                Devolver {porId.get(elegida)!.texto} a las tarjetas
              </button>
            )}
          </section>

          <div className={s.grupos} data-tres={contenido.categorias.length === 3 ? "" : undefined}>
            {contenido.categorias.map((g) => {
              const dentro = enGrupo(lugares, g.id);
              const vacias = Math.max(0, cupo[g.id] - dentro.length);
              const destino = fase === "jugando" && elegida !== null && lugares[elegida] !== g.id;
              return (
                <section
                  key={g.id}
                  className={s.grupo}
                  aria-label={g.nombre}
                  ref={(el) => {
                    if (el) zonas.current.set(g.id, el);
                  }}
                  data-destino={destino ? "" : undefined}
                  data-sobre={arrastre?.sobre === g.id ? "" : undefined}
                >
                  <button
                    type="button"
                    className={s.grupoNombre}
                    disabled={!destino}
                    onClick={() => elegida && llevar(elegida, g.id)}
                    aria-label={destino ? `Poner ${porId.get(elegida!)!.texto} en ${g.nombre}` : g.nombre}
                  >
                    {g.nombre}
                    <span className={s.grupoCupo} aria-hidden="true">
                      {dentro.length}/{cupo[g.id]}
                    </span>
                  </button>
                  <ul className={s.casillas}>
                    {dentro.map((id) => (
                      <li key={id}>
                        {tarjeta(id, true)}
                      </li>
                    ))}
                    {Array.from({ length: vacias }, (_, i) => (
                      <li key={`v${i}`}>
                        <button
                          type="button"
                          className={s.casillaVacia}
                          tabIndex={-1}
                          aria-hidden="true"
                          disabled={!destino}
                          onClick={() => elegida && llevar(elegida, g.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}

      <p className={s.aviso} role="status">
        {aviso}
      </p>

      {fase === "jugando" && (
        <div className={s.acciones}>
          <button type="button" className={s.enviar} disabled={pendientes > 0} onClick={enviar}>
            <Send size={22} strokeWidth={2.6} aria-hidden="true" />
            Enviar respuestas
          </button>
        </div>
      )}
      {fase === "revelado" && (
        <div className={s.acciones}>
          <button type="button" className={s.enviar} onClick={() => alTerminar(lugares)} autoFocus>
            Ver resultado
            <ArrowRight size={22} strokeWidth={2.8} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
