"use client";

import { useCallback, useState } from "react";
import { piezasDe, type Reaccion, type TipoReaccion } from "./confeti";
import s from "./efectos.module.css";

/*
  Celebración de una ronda: un halo suave y un puñado de confeti que sube y
  se desvanece. Va dentro de la escena (.escena es su contenedor) y es solo
  decoración: lo que pasó siempre está escrito en el aviso. Todo es CSS de
  una sola vez (transform y opacity); con «reducir movimiento» no se ve.
*/

export function useReaccion() {
  const [reaccion, setReaccion] = useState<Reaccion | null>(null);
  const disparar = useCallback((tipo: TipoReaccion) => setReaccion((r) => ({ tipo, n: (r?.n ?? 0) + 1 })), []);
  return { reaccion, disparar };
}

export function Chispas({ reaccion }: { reaccion: Reaccion | null }) {
  if (!reaccion) return null;
  // key = n: cada disparo monta piezas nuevas y reinicia la animación.
  return (
    <div key={reaccion.n} className={s.chispas} data-tipo={reaccion.tipo} aria-hidden="true">
      <span className={s.halo} />
      {piezasDe(reaccion.tipo).map((p, i) => (
        <span
          key={i}
          className={s.pieza}
          style={{ "--dx": `${p.dx}cqi`, "--dy": `${p.dy}cqb`, "--giro": `${p.giro}deg`, "--retardo": `${p.retardo}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
