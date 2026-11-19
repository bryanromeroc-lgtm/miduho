import { generador } from "../../tipos/contrato";

export type ElementoPareja = { id: string; categoria: string; pareja?: string };
export type Ronda = { id: string; piezas: string[] };
export type EstadoParejas = {
  ronda: number;
  colocadas: string[];
  primeras: Record<string, string>;
  fallos: Record<string, number>;
};

export function armarRondas(elementos: readonly ElementoPareja[], semilla: string): Ronda[] {
  const grupos = new Map<string, string[]>();
  for (const e of elementos) grupos.set(e.pareja!, [...(grupos.get(e.pareja!) ?? []), e.id]);
  const azar = generador(semilla);
  const rondas = [...grupos].map(([id, piezas]) => ({ id, piezas }));
  function mezclar<T>(lista: T[]): void {
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
  }
  mezclar(rondas);
  // Reparte las dos orientaciones en cada partida para evitar pistas por posición.
  const invertir = rondas.map((_, i) => i % 2 === 0);
  mezclar(invertir);
  for (const [i, ronda] of rondas.entries()) {
    if (invertir[i]) ronda.piezas.reverse();
  }
  return rondas;
}

export function iniciarParejas(): EstadoParejas {
  return { ronda: 0, colocadas: [], primeras: {}, fallos: {} };
}

export function ubicar(
  estado: EstadoParejas, rondas: readonly Ronda[], elementos: readonly ElementoPareja[], id: string, categoria: string,
): { estado: EstadoParejas; evento: "acierto" | "fallo" | "fin-ronda" | "fin" | "ignorado"; autocolocada: boolean } {
  const ronda = rondas[estado.ronda];
  const pieza = elementos.find((e) => e.id === id);
  if (!ronda?.piezas.includes(id) || !pieza || estado.colocadas.includes(id)) return { estado, evento: "ignorado", autocolocada: false };
  const primeras = id in estado.primeras ? estado.primeras : { ...estado.primeras, [id]: categoria };
  const fallo = pieza.categoria !== categoria;
  const n = fallo ? (estado.fallos[id] ?? 0) + 1 : 0;
  const autocolocada = fallo && n >= 2;
  const colocadas = !fallo || autocolocada ? [...estado.colocadas, id] : estado.colocadas;
  const completo = colocadas.length === ronda.piezas.length;
  const siguiente = {
    ronda: estado.ronda + (completo ? 1 : 0),
    colocadas: completo ? [] : colocadas,
    primeras,
    fallos: { ...estado.fallos, [id]: n },
  };
  return { estado: siguiente, evento: completo ? siguiente.ronda === rondas.length ? "fin" : "fin-ronda" : fallo ? "fallo" : "acierto", autocolocada };
}
