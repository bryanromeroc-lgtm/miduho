"use client";

import { useState } from "react";
import type { EstadoRonda, Pose } from "./piezas";
import { useSonido } from "./sonido";
import { useVoz } from "./voz";

/*
  Flujo común de los juegos por rondas, con «error que enseña»:
  - la PRIMERA respuesta de cada ronda es la que cuenta para la nota;
  - si falla, la ronda sigue abierta con una pista y se puede reintentar;
  - al segundo fallo se muestra la solución y se avanza.
  La guirnalda marca «bien» (primer intento) o «corregida».
*/
export function useRondas<R extends { id: string }, V extends string | number>({
  rondas,
  correcta,
  alTerminar,
  maxIntentos = 2,
}: {
  rondas: R[];
  correcta: (r: R) => V;
  alTerminar: (respuestas: Record<string, unknown>) => void;
  maxIntentos?: number;
}) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, V>>({});
  const [intentos, setIntentos] = useState<V[]>([]);
  const [estados, setEstados] = useState<EstadoRonda[]>(() => rondas.map(() => "pendiente"));
  const voz = useVoz();
  const sonido = useSonido();

  const ronda = rondas[indice];
  const solucion = correcta(ronda);
  const acerto = intentos.length > 0 && intentos[intentos.length - 1] === solucion;
  const cerrada = acerto || intentos.length >= maxIntentos;
  const conPista = intentos.length > 0 && !acerto;
  const ultima = indice === rondas.length - 1;
  const pose: Pose = intentos.length === 0 ? "senala" : acerto ? "celebra" : "piensa";

  function responder(valor: V) {
    if (cerrada || intentos.includes(valor)) return;
    voz.callar();
    const nuevos = [...intentos, valor];
    setIntentos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [ronda.id]: valor }));
    const bien = valor === solucion;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevos.length >= maxIntentos) {
      const estado: EstadoRonda = nuevos.length === 1 && bien ? "bien" : "corregida";
      setEstados((e) => e.map((v, i) => (i === indice ? estado : v)));
    }
  }

  function siguiente() {
    voz.callar();
    if (ultima) {
      sonido.tocar("fin");
      alTerminar(respuestas);
      return;
    }
    setIndice((i) => i + 1);
    setIntentos([]);
  }

  return { indice, ronda, solucion, intentos, estados, acerto, cerrada, conPista, ultima, pose, responder, siguiente, voz, sonido };
}
