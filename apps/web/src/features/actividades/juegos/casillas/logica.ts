import { barajar } from "../../tipos/contrato";

export type Casillas = (string | null)[];

export function vacias(cantidad: number): Casillas { return Array.from({ length: cantidad }, () => null); }

/** Mover una ficha a una casilla. La ocupante vuelve a la pila. */
export function colocar(casillas: Casillas, id: string, destino: number): Casillas {
  if (destino < 0 || destino >= casillas.length || !Number.isInteger(destino)) return casillas;
  const nuevas = casillas.map((actual) => actual === id ? null : actual);
  nuevas[destino] = id;
  return nuevas;
}

export function devolver(casillas: Casillas, id: string): Casillas {
  return casillas.map((actual) => actual === id ? null : actual);
}

export function pila<T extends { id: string }>(elementos: readonly T[], semilla: string): T[] {
  const ids = elementos.map((e) => e.id);
  for (let intento = 0; intento < 5; intento++) {
    const mezcla = barajar(elementos, `${semilla}:${intento}`);
    if (mezcla.some((e, i) => e.id !== ids[i])) return mezcla;
  }
  return [...elementos].reverse();
}

export function ordenRevelado(cantidad: number): number[] {
  return Array.from({ length: cantidad }, (_, i) => i);
}

export function aciertos(elementos: readonly { id: string }[], casillas: Casillas): number {
  return elementos.filter((e, i) => casillas[i] === e.id).length;
}
