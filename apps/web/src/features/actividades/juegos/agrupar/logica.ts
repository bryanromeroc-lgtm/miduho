/*
  Lógica pura del tablero «Agrupar» (clasificar con presentación `tablero`):
  cuántas casillas tiene cada grupo, qué falta para enviar y en qué orden se
  revela. Sin React, para probarla sola.
*/

export type Grupo = { id: string; nombre: string };
export type Tarjeta = { id: string; categoria: string };
/** Dónde está cada tarjeta: id del grupo, o ausente si sigue en la pila. Conserva el orden en que se pusieron. */
export type Lugares = Record<string, string>;

/** Casillas por grupo: tantas como tarjetas le corresponden (como en la referencia). */
export function cupos(grupos: Grupo[], tarjetas: Tarjeta[]): Record<string, number> {
  return Object.fromEntries(grupos.map((g) => [g.id, tarjetas.filter((t) => t.categoria === g.id).length]));
}

/** Tarjetas puestas en un grupo, en el orden en que llegaron. */
export function enGrupo(lugares: Lugares, grupo: string): string[] {
  return Object.keys(lugares).filter((id) => lugares[id] === grupo);
}

/** ¿Cabe una tarjeta más en el grupo? (Si la tarjeta ya está allí, no cuenta dos veces.) */
export function cabe(lugares: Lugares, grupo: string, cupo: number, tarjeta: string): boolean {
  if (lugares[tarjeta] === grupo) return true;
  return enGrupo(lugares, grupo).length < cupo;
}

/** Mueve la tarjeta al final del grupo (o a la pila con `null`) sin mutar. */
export function poner(lugares: Lugares, tarjeta: string, grupo: string | null): Lugares {
  const sin = Object.fromEntries(Object.entries(lugares).filter(([id]) => id !== tarjeta));
  return grupo === null ? sin : { ...sin, [tarjeta]: grupo };
}

export function faltan(lugares: Lugares, tarjetas: Tarjeta[]): number {
  return tarjetas.filter((t) => lugares[t.id] === undefined).length;
}

/** Orden del revelado: grupo por grupo, casilla por casilla, como se ve en pantalla. */
export function ordenRevelado(grupos: Grupo[], lugares: Lugares): { id: string; grupo: string }[] {
  return grupos.flatMap((g) => enGrupo(lugares, g.id).map((id) => ({ id, grupo: g.id })));
}

export function aciertos(tarjetas: Tarjeta[], lugares: Lugares): number {
  return tarjetas.filter((t) => lugares[t.id] === t.categoria).length;
}
