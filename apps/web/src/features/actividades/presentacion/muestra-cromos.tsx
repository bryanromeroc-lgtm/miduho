"use client";

import { useState } from "react";
import { Cromo } from "@/features/materias/cromo";
import type { ResumenMateria } from "@/lib/materias";
import s from "./muestra.module.css";

/** Estados del cromo con datos ficticios, para revisión. Cada uno rotulado «Ejemplo». */
export function MuestraCromos({ materias }: { materias: (ResumenMateria & { estado: string })[] }) {
  const [elegida, setElegida] = useState(0);
  return (
    <div className={s.cromos}>
      {materias.map((m, i) => (
        <figure key={m.id} className={s.cromoMuestra}>
          <Cromo materia={m} indice={i} elegida={i === elegida} onElegir={() => setElegida(i)} />
          <figcaption>
            <span className={s.etiqueta}>Ejemplo</span> {m.estado}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
