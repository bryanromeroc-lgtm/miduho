"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { estrellasDe } from "@/lib/estrellas";
import dynamic from "next/dynamic";
import { calificarIntento, type ResultadoIntento } from "../tipos/contrato";
import { definicionDe, nombreTipo } from "../tipos/registro";
import type { PropsJuego } from "./comun";
import { primeraRespuestaCuenta, textoReglas } from "./reglas";
import s from "./reproductor.module.css";

// Cada juego se descarga al abrirlo; la ruta inicial no incorpora los otros veinte.
const Quiz = dynamic(() => import("./juegos-preguntas").then((m) => m.Quiz), { loading: () => <p role="status">Cargando juego…</p> });
const Concurso = dynamic(() => import("./juegos-preguntas").then((m) => m.Concurso), { loading: () => <p role="status">Cargando juego…</p> });
const Completar = dynamic(() => import("./juegos-preguntas").then((m) => m.Completar), { loading: () => <p role="status">Cargando juego…</p> });
const Emparejar = dynamic(() => import("./juegos-relaciones").then((m) => m.Emparejar), { loading: () => <p role="status">Cargando juego…</p> });
const Ordenar = dynamic(() => import("./juegos-relaciones").then((m) => m.Ordenar), { loading: () => <p role="status">Cargando juego…</p> });
const Clasificar = dynamic(() => import("./juegos-relaciones").then((m) => m.Clasificar), { loading: () => <p role="status">Cargando juego…</p> });
const Memoria = dynamic(() => import("./juegos-relaciones").then((m) => m.Memoria), { loading: () => <p role="status">Cargando juego…</p> });
const SopaLetras = dynamic(() => import("./juegos-palabras").then((m) => m.SopaLetras), { loading: () => <p role="status">Cargando juego…</p> });
const PalabraSecreta = dynamic(() => import("./juegos-palabras").then((m) => m.PalabraSecreta), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoPancarta = dynamic(() => import("../juegos/pancarta/juego").then((m) => m.JuegoPancarta), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoPizarra = dynamic(() => import("../juegos/pizarra/juego").then((m) => m.JuegoPizarra), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoCorrector = dynamic(() => import("../juegos/corrector/juego").then((m) => m.JuegoCorrector), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoSello = dynamic(() => import("../juegos/sello/juego").then((m) => m.JuegoSello), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoDivision = dynamic(() => import("../juegos/division/juego").then((m) => m.JuegoDivision), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoRobots = dynamic(() => import("../juegos/robots/juego").then((m) => m.JuegoRobots), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoBocadillo = dynamic(() => import("../juegos/bocadillo/juego").then((m) => m.JuegoBocadillo), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoJarras = dynamic(() => import("../juegos/jarras/juego").then((m) => m.JuegoJarras), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoPorcentaje = dynamic(() => import("../juegos/porcentaje/juego").then((m) => m.JuegoPorcentaje), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoMultiplos = dynamic(() => import("../juegos/multiplos/juego").then((m) => m.JuegoMultiplos), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoOperaciones = dynamic(() => import("../juegos/operaciones/juego").then((m) => m.JuegoOperaciones), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoRectas = dynamic(() => import("../juegos/rectas/juego").then((m) => m.JuegoRectas), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoAngulos = dynamic(() => import("../juegos/angulos/juego").then((m) => m.JuegoAngulos), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoFracciones = dynamic(() => import("../juegos/fracciones/juego").then((m) => m.JuegoFracciones), { loading: () => <p role="status">Cargando juego…</p> });
const JuegoAventura = dynamic(() => import("../juegos/aventura/juego").then((m) => m.JuegoAventura), { loading: () => <p role="status">Cargando juego…</p> });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JUEGOS: Record<string, ComponentType<PropsJuego<any>>> = {
  "seleccion-multiple": Quiz,
  concurso: Concurso,
  completar: Completar,
  emparejar: Emparejar,
  ordenar: Ordenar,
  clasificar: Clasificar,
  memoria: Memoria,
  "sopa-letras": SopaLetras,
  "palabra-secreta": PalabraSecreta,
  pancarta: JuegoPancarta,
  "pizarra-decimales": JuegoPizarra,
  corrector: JuegoCorrector,
  sello: JuegoSello,
  division: JuegoDivision,
  "robots-divisiones": JuegoRobots,
  bocadillo: JuegoBocadillo,
  jarras: JuegoJarras,
  porcentaje: JuegoPorcentaje,
  multiplos: JuegoMultiplos,
  operaciones: JuegoOperaciones,
  rectas: JuegoRectas,
  angulos: JuegoAngulos,
  aventura: JuegoAventura,
  "taller-fracciones": JuegoFracciones,
};

export type ActividadParaJugar = { slug: string; titulo: string; tipo: string; instruccion: string; contenido: unknown };

/*
  REPRODUCTOR — práctica libre (🔶 hasta fundacion-actividades): se juega,
  se califica con la misma función pura del tipo y se muestra el resultado
  con su repaso. Nada se guarda todavía, y la pantalla lo dice.
*/
export function Reproductor({ actividad, materia, volverHref }: { actividad: ActividadParaJugar; materia: string; volverHref: string }) {
  const [partida, setPartida] = useState(1);
  const [resultado, setResultado] = useState<ResultadoIntento | null>(null);
  const definicion = definicionDe(actividad.tipo);
  const Juego = JUEGOS[actividad.tipo];
  if (!definicion || !Juego) throw new Error(`Tipo de actividad sin reproductor: ${actividad.tipo}`);

  return (
    <main className={s.reproductor} id="juego" tabIndex={-1}>
      <header className={s.barraJuego}>
        <Link href={volverHref} className={s.salir}>
          <ArrowLeft size={20} strokeWidth={2.8} aria-hidden="true" />
          Salir del juego
        </Link>
        <div className={s.cabeza}>
          <h1 className={s.titulo}>{actividad.titulo}</h1>
          <span className={s.tipo}>{nombreTipo(actividad.tipo)}</span>
        </div>
      </header>

      <div className={s.notas}>
        {!resultado && <p className={s.instruccion}>{actividad.instruccion}</p>}
        <p className={s.practica}>{textoReglas(actividad.tipo)}</p>
      </div>

      <section className={s.mesa} aria-label={resultado ? "Resultado" : "Juego"}>
        {resultado ? (
          <Resultado
            resultado={resultado}
            materia={materia}
            volverHref={volverHref}
            primeraCuenta={primeraRespuestaCuenta(actividad.tipo)}
            otraVez={() => {
              setResultado(null);
              setPartida((n) => n + 1);
            }}
          />
        ) : (
          <Juego
            key={partida}
            contenido={actividad.contenido}
            semilla={`${actividad.slug}:${partida}`}
            alTerminar={(respuestas) => setResultado(calificarIntento(definicion, actividad.contenido, respuestas, { soloRespondidos: actividad.tipo === "robots-divisiones" }))}
          />
        )}
      </section>

    </main>
  );
}

// estrellasDe nunca da 0 a un intento enviado: una estrella ya es «sigue practicando», sin hablar de fracaso.
const TITULO_ESTRELLAS = ["¡Sigue practicando!", "¡Sigue practicando!", "¡Muy bien!", "¡Excelente!"];

function Resultado({
  resultado,
  materia,
  volverHref,
  otraVez,
  primeraCuenta,
}: {
  resultado: ResultadoIntento;
  materia: string;
  volverHref: string;
  otraVez: () => void;
  primeraCuenta: boolean;
}) {
  const estrellas = estrellasDe(resultado.porcentaje);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);
  const varios = resultado.items.length > 1;
  const aciertos = resultado.items.filter((i) => i.correcta).length;

  return (
    <div className={s.resultado}>
      <h2 ref={titulo} tabIndex={-1} className={s.resultadoTitulo}>
        {TITULO_ESTRELLAS[estrellas]}
      </h2>
      <p className={s.resultadoEstrellas} aria-label={`${estrellas} de 3 estrellas`}>
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 24 24" data-llena={i < estrellas ? "" : undefined} aria-hidden="true">
            <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" />
          </svg>
        ))}
      </p>
      <p className={s.resultadoCifra}>
        {varios ? `Acertaste ${aciertos} de ${resultado.items.length}.` : `Lograste ${resultado.puntaje} de ${resultado.puntajeMaximo}.`}
      </p>
      {primeraCuenta && aciertos < resultado.items.length && (
        <p className={s.notaResultado}>Las estrellas muestran tus primeras respuestas. Las pistas y correcciones te ayudan a practicar.</p>
      )}

      <details className={s.repaso} open={estrellas < 3}>
        <summary>Repasa las respuestas</summary>
        <ul>
          {resultado.items.map((i) => (
            <li key={i.itemId} data-estado={i.correcta ? "ok" : "no"}>
              <span className={s.repasoMarca}>{i.correcta ? "Bien" : "Para repasar"}</span>
              <span className={s.repasoPregunta}>{i.pregunta}</span>
              <span className={s.repasoSolucion}>{i.solucion}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className={s.acciones}>
        <button type="button" className={s.secundario} onClick={otraVez}>
          <RotateCcw size={20} strokeWidth={2.8} aria-hidden="true" />
          Jugar otra vez
        </button>
        <Link href={volverHref} className={s.principal}>
          <ArrowLeft size={20} strokeWidth={2.8} aria-hidden="true" />
          Volver a {materia}
        </Link>
      </div>
    </div>
  );
}
