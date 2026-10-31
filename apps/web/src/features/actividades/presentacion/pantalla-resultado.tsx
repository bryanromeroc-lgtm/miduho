import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { BotonSticker, Estrellas } from "@/components/sticker";
import { leerResultado, type Resultado } from "@/lib/desempeno";
import type { Avatar } from "@/lib/avatares";
import s from "./presentacion.module.css";

/*
  Pantalla de resultado de un intento. Si mejora, el avatar celebra; si la
  materia llega a 3 estrellas, se anuncia que su cromo ahora brilla. Si no
  mejora, se dice que se conserva el mejor, sin mensaje de fracaso. Requiere
  <SpriteEscenas /> en la página para dibujar el avatar.
*/
export function PantallaResultado({
  actividad,
  resultado,
  avatar,
  reintentarHref,
  volverHref = "/",
  etiqueta,
}: {
  actividad: string;
  resultado: Resultado;
  avatar: Avatar;
  reintentarHref: string;
  volverHref?: string;
  etiqueta?: string;
}) {
  const r = leerResultado(resultado);
  return (
    <section className={`sticker-panel sobre-papel ${s.resultado}`} aria-labelledby="resultado-titulo" data-mejora={r.mejora ? "" : undefined}>
      {etiqueta && <span className={`${s.ejemplo} ${s.ejemploEsquina}`}>{etiqueta}</span>}
      <div className={s.escenario} aria-hidden="true">
        {r.mejora && (
          <svg className={s.chispas} viewBox="0 0 200 120">
            <path d="M30 40 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 z" />
            <path d="M168 30 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1 z" />
            <path d="M150 92 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" />
            <circle cx="56" cy="96" r="5" />
            <circle cx="136" cy="16" r="4" />
          </svg>
        )}
        <svg className={s.avatar} data-celebra={r.mejora ? "" : undefined} viewBox="0 0 100 112">
          <use href={`#avatar-${avatar.toLowerCase()}`} />
        </svg>
      </div>
      <h2 id="resultado-titulo" className={`tipo-display ${s.resultadoTitulo}`}>
        {r.titulo}
      </h2>
      <p className={s.actividad}>{actividad}</p>
      <Estrellas cantidad={resultado.estrellas} tamano={44} className={s.resultadoEstrellas} />
      <p className={s.detalle}>{r.detalle}</p>
      {r.cromoBrilla && (
        <p className={s.brilla} role="status">
          <Sparkles size={20} strokeWidth={2.6} aria-hidden="true" />
          ¡Tu cromo ahora brilla!
        </p>
      )}
      <p className={s.quedan}>
        {r.quedan === 0 ? "Ya no quedan intentos en esta actividad." : `Te ${r.quedan === 1 ? "queda 1 intento" : `quedan ${r.quedan} intentos`}.`}
      </p>
      <div className={s.acciones}>
        {r.puedeReintentar && (
          <BotonSticker href={reintentarHref} tono="papel">
            <RotateCcw size={20} strokeWidth={2.8} aria-hidden="true" />
            Intentar de nuevo
          </BotonSticker>
        )}
        <BotonSticker href={volverHref} tono="sol">
          Volver a mis materias
          <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
        </BotonSticker>
      </div>
    </section>
  );
}
