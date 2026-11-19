import { generador } from "../tipos/contrato";
import type { Pregunta } from "../tipos/preguntas";

/** Un generador para toda la partida: Fisher–Yates por pregunta. */
export function ordenesPreguntas(preguntas: Pregunta[], semilla: string, barajarOpciones = true): number[][] {
  const azar = generador(semilla);
  return preguntas.map((p) => {
    const orden = p.opciones.map((_, i) => i);
    if (!barajarOpciones) return orden;
    for (let i = orden.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [orden[i], orden[j]] = [orden[j], orden[i]];
    }
    return orden;
  });
}
