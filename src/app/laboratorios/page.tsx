"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Play,
  Rocket,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { AvatarBoti, AvatarMia } from "@/components/laboratorios/ilustraciones";
import {
  PlanetaRobotica,
  PlanetaEmprendimiento,
} from "@/components/laboratorios/planetas";
import { Despegue } from "@/components/laboratorios/despegue";
import { MUNDOS, type Estacion, type MundoId } from "@/lib/laboratorios";

/*
  LABORATORIOS · «El Cielo de los Dos Mundos»

  CONTRATO DE DIRECCIÓN — solo esta vista

  THESIS: Laboratorios deja de ser una página con un recuadro de universo
  adentro y pasa a SER el universo. Una bóveda a pantalla completa, sin
  desplazamiento, donde Robótica y Emprendimiento coexisten como dos
  cuerpos celestes en un mismo cielo. Entrar a un mundo no es cambiar de
  pestaña: es volar hacia él, y el mundo que dejas sigue ahí, al fondo.

  MOMENTO FOCAL: el vuelo de cámara. Al elegir un planeta, la escena
  entera —ambos mundos y su campo de estrellas— se desplaza y escala
  1.15s con cubic-bezier(.16,1,.3,1), y al llegar se traza la ruta de
  estaciones y los nodos entran escalonados. Un solo momento autoral;
  todo lo demás es respuesta a una acción.

  ALCANCE: la clase .cosmos vive únicamente aquí. Al salir de esta ruta,
  el Marco vuelve a su friso de aula sin que nada más cambie.

  LÍMITE INNEGOCIABLE: el espectáculo nunca se come el contenido
  pedagógico. Todo texto es real, seleccionable y accesible; la ficha de
  misión es superficie clara de lectura; el menú sigue siendo un solo
  <nav> en el DOM.
*/

type Vista = "cielo" | "orbita";

/* Posición de cada planeta en la bóveda, y el encuadre de cámara que lo
   pone en el centro del escenario cuando se entra a su órbita. */
const GEOMETRIA = {
  robotica: {
    reposo: { left: "29%", top: "54%", size: "clamp(150px, 19.5vw, 262px)" },
    camara: "translate3d(0%, 30%, 0) scale(1.95)",
  },
  emprendimiento: {
    reposo: { left: "72%", top: "48%", size: "clamp(120px, 15vw, 200px)" },
    camara: "translate3d(-26%, 44%, 0) scale(2.2)",
  },
} as const;

const ACENTO: Record<MundoId, { claro: string; hondo: string; brillo: string; cta: string; ctaHover: string }> = {
  robotica: { claro: "#5cc8ff", hondo: "#1d6f96", brillo: "#a7e6ff", cta: "#1d6f96", ctaHover: "#14536f" },
  emprendimiento: { claro: "#7ddc8f", hondo: "#27804a", brillo: "#b6f0be", cta: "#27804a", ctaHover: "#1c6338" },
};

function Estrellitas({ ganadas, total }: { ganadas: number; total: number }) {
  return (
    <span className="cos-estacion-estrellas">
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          size={13}
          strokeWidth={2.2}
          className={i < ganadas ? "fill-[#ffcb52] text-[#ffcb52]" : "fill-transparent text-white/35"}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">
        {ganadas} de {total} estrellas
      </span>
    </span>
  );
}

function SelloEstado({ estado }: { estado: Estacion["estado"] }) {
  if (estado === "completada") return <Check size={17} strokeWidth={3.2} aria-hidden="true" />;
  if (estado === "actual") return <Play size={15} strokeWidth={3} className="fill-current" aria-hidden="true" />;
  return <Lock size={15} strokeWidth={2.8} aria-hidden="true" />;
}

function Universo() {
  const searchParams = useSearchParams();
  const mundoInicial: MundoId | null =
    searchParams.get("mundo") === "emprendimiento"
      ? "emprendimiento"
      : searchParams.get("mundo") === "robotica"
        ? "robotica"
        : null;

  const [enfocado, setEnfocado] = useState<MundoId | null>(mundoInicial);
  const [abierta, setAbierta] = useState<Estacion | null>(null);
  const refEstaciones = useRef<HTMLDivElement>(null);
  const refVolver = useRef<HTMLButtonElement>(null);

  const vista: Vista = enfocado ? "orbita" : "cielo";
  const mundo = enfocado ? MUNDOS[enfocado] : null;
  const acento = ACENTO[enfocado ?? "robotica"];

  const volverAlCielo = useCallback(() => {
    setAbierta(null);
    setEnfocado(null);
  }, []);

  /* Escape retrocede un paso: primero cierra la ficha, luego sale de la
     órbita. Es la tecla que un niño y una docente prueban primero. */
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (abierta) setAbierta(null);
      else if (enfocado) volverAlCielo();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierta, enfocado, volverAlCielo]);

  /* Al aterrizar en un mundo, el foco viaja con la cámara: el teclado
     queda en la ruta de estaciones, no perdido en el planeta anterior. */
  useEffect(() => {
    if (!enfocado) {
      refVolver.current = null;
      return;
    }
    const t = window.setTimeout(() => {
      refEstaciones.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
    }, 1150);
    return () => window.clearTimeout(t);
  }, [enfocado]);

  const estaciones = mundo?.estaciones ?? [];
  const estrellasGanadas = estaciones.reduce((a, e) => a + e.estrellas, 0);
  const estrellasTotales = estaciones.reduce((a, e) => a + e.maxEstrellas, 0);
  const xp = estaciones.filter((e) => e.estado !== "bloqueada").reduce((a, e) => a + e.xp, 0);
  const completadas = estaciones.filter((e) => e.estado === "completada").length;
  const actual = estaciones.find((e) => e.estado === "actual");

  /* El tramo recorrido de la ruta llega hasta la estación en curso. */
  const indiceActual = estaciones.findIndex((e) => e.estado === "actual");
  const corte =
    estaciones.length > 1
      ? (indiceActual >= 0 ? indiceActual : completadas) / (estaciones.length - 1)
      : 0;

  const estiloCamara =
    enfocado ? GEOMETRIA[enfocado].camara : "translate3d(0, 0, 0) scale(1)";

  return (
    <div
      className="cosmos"
      style={
        {
          "--cos-acento": acento.claro,
          "--cos-brillo": acento.brillo,
          "--cos-cta-bg": acento.cta,
          "--cos-cta-hover": acento.ctaHover,
        } as React.CSSProperties
      }
    >
      <Marco>
        <div className="relative h-full w-full">
          {/* ── LA BÓVEDA ─────────────────────────────────────────── */}
          <div className="cos-boveda" aria-hidden="true">
            <div className="cos-cielo" data-mundo={enfocado ?? "robotica"} />
            <div
              className="cos-nebulosa cos-nebulosa-a"
              style={{ background: enfocado === "emprendimiento" ? "#17a06e" : "#2f7fd6" }}
            />
            <div
              className="cos-nebulosa cos-nebulosa-b"
              style={{ background: enfocado === "emprendimiento" ? "#b08a2a" : "#8a3fc0" }}
            />
            <div className="cos-estrellas" />
            <div className="cos-polvo" />
            <div className="cos-fugaz" />
            <div className="cos-fugaz cos-fugaz-b" />
          </div>

          {/* ── LA ESCENA: ambos mundos en un mismo cielo ──────────── */}
          <div className="cos-escena" data-vista={vista} style={{ transform: estiloCamara }}>
            {(Object.keys(GEOMETRIA) as MundoId[]).map((id) => {
              const geo = GEOMETRIA[id];
              const datos = MUNDOS[id];
              const esEnfocado = enfocado === id;
              const estado = enfocado === null ? "libre" : esEnfocado ? "enfocado" : "lejano";
              const col = ACENTO[id];
              const Planeta = id === "robotica" ? PlanetaRobotica : PlanetaEmprendimiento;
              const suyas = datos.estaciones;
              const suCompletadas = suyas.filter((e) => e.estado === "completada").length;

              return (
                <button
                  key={id}
                  type="button"
                  className="cos-planeta"
                  data-estado={estado}
                  disabled={esEnfocado}
                  onClick={() => {
                    setAbierta(null);
                    setEnfocado(id);
                  }}
                  style={{
                    left: geo.reposo.left,
                    top: geo.reposo.top,
                    width: geo.reposo.size,
                    height: geo.reposo.size,
                    transform: "translate(-50%, -50%)",
                    color: col.claro,
                  }}
                  aria-label={`Entrar al ${datos.nombre}: ${datos.lema}. ${suCompletadas} de ${suyas.length} misiones completadas.`}
                >
                  <span className="cos-planeta-cuerpo h-full w-full">
                    <span
                      className="cos-planeta-halo"
                      style={{ background: col.claro }}
                      aria-hidden="true"
                    />
                    <span className="cos-planeta-anillo" aria-hidden="true" />
                    <Planeta className="h-full w-full drop-shadow-[0_24px_60px_rgba(3,8,26,.7)]" />
                  </span>

                  <span className="cos-planeta-rotulo">
                    <strong>{datos.nombre}</strong>
                    <span>{datos.lema}</span>
                    <em>
                      <Rocket size={13} strokeWidth={2.6} aria-hidden="true" />
                      {suCompletadas} de {suyas.length} misiones
                    </em>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── BIENVENIDA DEL CIELO ───────────────────────────────── */}
          <div className="cos-intro" data-oculto={enfocado ? "si" : "no"}>
            <h1>Tu universo de laboratorios</h1>
            <p>
              Dos mundos te esperan en este cielo. Toca un planeta para viajar hasta él y
              descubrir sus misiones.
            </p>
          </div>

          {/* ── ÓRBITA: la ruta de estaciones del mundo enfocado ───── */}
          <div className="cos-ruta" data-abierta={enfocado && !abierta ? "si" : "no"}>
            {mundo && (
              <div className="cos-ruta-pista" style={{ color: acento.claro }}>
                <svg
                  className="cos-ruta-linea"
                  viewBox="0 0 100 4"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <line className="pendiente" x1="12.5" y1="2" x2="87.5" y2="2" />
                  <line
                    className="recorrido"
                    x1="12.5"
                    y1="2"
                    x2={12.5 + 75 * corte}
                    y2="2"
                    style={{ "--largo": 100 } as React.CSSProperties}
                  />
                </svg>

                <div className="cos-estaciones" ref={refEstaciones}>
                  {estaciones.map((est, i) => {
                    const { Ilustracion } = est;
                    return (
                      <button
                        key={est.id}
                        type="button"
                        className="cos-estacion"
                        data-estado={est.estado}
                        style={{ "--i": i } as React.CSSProperties}
                        onClick={() => setAbierta(est)}
                        aria-label={`Misión ${est.nivel}: ${est.titulo}. ${est.estadoEtiqueta}. ${est.estrellas} de ${est.maxEstrellas} estrellas. Ver detalles.`}
                      >
                        <span className="cos-estacion-disco">
                          <Ilustracion />
                          <span className="cos-estacion-sello">
                            <SelloEstado estado={est.estado} />
                          </span>
                        </span>
                        <span className="cos-estacion-nivel">Misión {est.nivel}</span>
                        <span className="cos-estacion-nombre">{est.titulo}</span>
                        <Estrellitas ganadas={est.estrellas} total={est.maxEstrellas} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── HUD ────────────────────────────────────────────────── */}
          <button
            type="button"
            ref={refVolver}
            className="cos-volver"
            data-oculto={enfocado ? "no" : "si"}
            onClick={volverAlCielo}
          >
            <ArrowLeft size={17} strokeWidth={2.6} aria-hidden="true" />
            Volver al cielo
          </button>

          <div className="cos-hud cos-hud-progreso" data-oculto={enfocado ? "no" : "si"}>
            <span className="cos-hud-dato">
              <Trophy size={15} strokeWidth={2.5} className="text-[#ffcb52]" aria-hidden="true" />
              Nivel 2 · Explorador
            </span>
            <span className="cos-hud-sep" aria-hidden="true" />
            <span className="cos-hud-dato">
              <Star size={15} strokeWidth={2.5} className="fill-[#ffcb52] text-[#ffcb52]" aria-hidden="true" />
              {estrellasGanadas} de {estrellasTotales} estrellas
            </span>
            <span className="cos-hud-sep" aria-hidden="true" />
            <span className="cos-hud-dato">
              <Zap size={15} strokeWidth={2.5} style={{ color: acento.claro }} aria-hidden="true" />
              {xp} XP
            </span>
          </div>

          {/* ── COPILOTO ───────────────────────────────────────────── */}
          {mundo && (
            <div className="cos-copiloto" data-oculto={enfocado && !abierta ? "no" : "si"}>
              <span className="cos-copiloto-avatar">
                {enfocado === "robotica" ? (
                  <AvatarBoti className="h-full w-full" />
                ) : (
                  <AvatarMia className="h-full w-full" />
                )}
              </span>
              <div className="cos-copiloto-burbuja">
                <strong>
                  {mundo.copiloto} · {mundo.copilotoRol}
                </strong>
                <p>
                  {actual ? (
                    <>
                      Ya superaste {completadas}{" "}
                      {completadas === 1 ? "misión" : "misiones"}. Ahora estamos en{" "}
                      <b>{actual.titulo}</b>. ¡Toca su estación para empezar!
                    </>
                  ) : (
                    <>¡Recorre las estaciones de este mundo y elige por dónde seguir!</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ── FICHA DE MISIÓN ────────────────────────────────────── */}
          {abierta && (
            <article className="cos-panel" aria-live="polite">
              <button
                type="button"
                className="cos-panel-cerrar"
                onClick={() => setAbierta(null)}
                aria-label="Cerrar la ficha de la misión"
              >
                <X size={19} strokeWidth={2.6} aria-hidden="true" />
              </button>

              <div className="cos-panel-cuerpo">
                <div className="cos-panel-arte">
                  <abierta.Ilustracion />
                </div>

                <div className="cos-panel-texto">
                  <div className="cos-panel-fila">
                    <span className="text-[11px] font-[850] uppercase tracking-[.1em] text-gris">
                      Misión {abierta.nivel} · {mundo?.area}
                    </span>
                    <span className="flex items-center gap-2">
                      <Estrellitas ganadas={abierta.estrellas} total={abierta.maxEstrellas} />
                      <span className="whitespace-nowrap rounded-full bg-[#fff4d9] px-2.5 py-1 text-[11px] font-[850] text-[#7a5410]">
                        +{abierta.xp} XP
                      </span>
                    </span>
                  </div>

                  <h2>{abierta.titulo}</h2>
                  <p className="cos-panel-sub">{abierta.subtitulo}</p>
                  <p className="cos-panel-copy">{abierta.misionCorta}</p>

                  <ul className="cos-panel-retos">
                    {abierta.retos.map((r) => (
                      <li key={r}>
                        <Check size={13} strokeWidth={3} aria-hidden="true" />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <div className="cos-panel-pie">
                    <p className="text-[12.5px] font-bold text-gris">
                      {abierta.duracion} · Insignia: {abierta.insignia}
                    </p>

                    {abierta.tieneRuta ? (
                      <Link href={abierta.rutaHref} className="cos-cta">
                        <Play size={16} strokeWidth={2.6} className="fill-current" aria-hidden="true" />
                        {abierta.ctaTexto}
                        <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span className="cos-cta" data-inerte="si">
                        {abierta.estado === "bloqueada" ? (
                          <Lock size={15} strokeWidth={2.6} aria-hidden="true" />
                        ) : (
                          <Check size={15} strokeWidth={2.8} aria-hidden="true" />
                        )}
                        {abierta.estado === "bloqueada" ? abierta.estadoEtiqueta : abierta.ctaTexto}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </Marco>
    </div>
  );
}

export default function LaboratoriosPage() {
  return (
    <Suspense fallback={<Despegue />}>
      <Universo />
    </Suspense>
  );
}
