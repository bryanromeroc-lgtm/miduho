"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { estrellasDe } from "@/lib/estrellas";
import { calificarIntento, type ResultadoIntento } from "../tipos/contrato";
import { definicionDe, nombreTipo } from "../tipos/registro";
import type { PropsJuego } from "./comun";
import { PalabraSecreta, SopaLetras } from "./juegos-palabras";
import { Completar, Concurso, Quiz } from "./juegos-preguntas";
import { Clasificar, Emparejar, Memoria, Ordenar } from "./juegos-relaciones";
import s from "./reproductor.module.css";

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
      <header className={s.cabeza}>
        <span className={s.tipo}>{nombreTipo(actividad.tipo)}</span>
        <h1 className={s.titulo}>{actividad.titulo}</h1>
        {!resultado && <p className={s.instruccion}>{actividad.instruccion}</p>}
      </header>

      <section className={s.mesa} aria-label={resultado ? "Resultado" : "Juego"}>
        {resultado ? (
          <Resultado
            resultado={resultado}
            materia={materia}
            volverHref={volverHref}
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
            alTerminar={(respuestas) => setResultado(calificarIntento(definicion, actividad.contenido, respuestas))}
          />
        )}
      </section>

      <p className={s.practica}>Práctica libre: puedes jugar las veces que quieras. Tu resultado todavía no se guarda.</p>
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
}: {
  resultado: ResultadoIntento;
  materia: string;
  volverHref: string;
  otraVez: () => void;
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
