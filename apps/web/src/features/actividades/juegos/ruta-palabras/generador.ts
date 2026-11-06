/**
 * Rondas de «La ruta de las palabras». Mecánica estudiada en
 * docs/investigacion/referencia-rodeo-de-palabras.md; implementación propia.
 * Todo sale de la configuración y su semilla: cliente y servidor generan
 * las mismas palabras, distractores y carriles.
 */
import { generador } from "../../tipos/contrato";
import { PALABRAS, type Palabra } from "./palabras";

export type Silabas = 2 | 3 | 4 | "mixtas";
export type Ritmo = "tranquilo" | "carrera";

export type ConfigRuta = {
  semilla: number;
  rondas: number;
  silabas: Silabas;
  ritmo: Ritmo;
};

export type RondaRuta = {
  id: string;
  /** La palabra que dice la voz. */
  palabra: Palabra;
  /** Los tres carteles, de izquierda a derecha (carril 0, 1, 2). */
  carteles: [Palabra, Palabra, Palabra];
  /** Carril del cartel correcto. */
  carril: number;
};

export const CARRILES = 3;
/** Cuántas rondas seguidas no se repite la palabra correcta. */
const MEMORIA = 6;

/** Sílabas de cada ronda: fijas, o 2 → 3 → 4 a lo largo de la partida. */
export function silabasDeRonda(silabas: Silabas, i: number, total: number): 2 | 3 | 4 {
  if (silabas !== "mixtas") return silabas;
  const avance = i / total;
  return avance < 0.4 ? 2 : avance < 0.75 ? 3 : 4;
}

/** Cuántas letras distintas hay entre dos palabras de la misma longitud (−1 si difieren de largo). */
export function letrasDistintas(a: string, b: string): number {
  if (a.length !== b.length) return -1;
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/** Error de lectura que un distractor atrapa: se parece al inicio, o solo cambia una letra. */
export function parecido(correcta: Palabra, otra: Palabra): 0 | 1 | 2 {
  if (letrasDistintas(correcta.clave, otra.clave) === 1) return 2;
  if (correcta.clave.length === otra.clave.length && correcta.clave.slice(0, 2) === otra.clave.slice(0, 2)) return 2;
  if (correcta.clave[0] === otra.clave[0] || correcta.clave.length === otra.clave.length) return 1;
  return 0;
}

/** Pista según qué cartel eligió el estudiante (en palabras propias). */
export function pistaDe(correcta: Palabra, elegida: Palabra): string {
  if (letrasDistintas(correcta.clave, elegida.clave) === 1) return "Se parecen mucho: mira bien la letra que cambia.";
  if (correcta.clave.slice(0, 2) === elegida.clave.slice(0, 2)) return "Empiezan igual: lee hasta el final de la palabra.";
  if (correcta.clave.length === elegida.clave.length) return "Tienen casi el mismo largo: léelas sílaba por sílaba.";
  return "Escucha otra vez y lee cada cartel sílaba por sílaba.";
}

export function rondasDe(config: ConfigRuta): RondaRuta[] {
  const azar = generador(`ruta-palabras:${config.semilla}:${config.silabas}:${config.ritmo}`);
  const recientes: string[] = [];
  const rondas: RondaRuta[] = [];
  let carrilAnterior = -1;

  for (let i = 0; i < config.rondas; i++) {
    const n = silabasDeRonda(config.silabas, i, config.rondas);
    const banco = mezclar(PALABRAS.filter((p) => p.silabas === n), azar);
    const correcta = banco.find((p) => !recientes.includes(p.clave)) ?? banco[0];
    recientes.push(correcta.clave);
    if (recientes.length > MEMORIA) recientes.shift();

    // Primero lo más parecido (error de lectura típico); después, lo que quede.
    const resto = banco.filter((p) => p.clave !== correcta.clave);
    const ordenados = [...resto].sort((a, b) => parecido(correcta, b) - parecido(correcta, a));
    const distractores = [ordenados[0], ...mezclar(ordenados.slice(1, 6), azar).slice(0, 1)];

    let carril = Math.floor(azar() * CARRILES);
    if (carril === carrilAnterior) carril = (carril + 1 + Math.floor(azar() * (CARRILES - 1))) % CARRILES;
    carrilAnterior = carril;

    const carteles: Palabra[] = [];
    let d = 0;
    for (let c = 0; c < CARRILES; c++) carteles.push(c === carril ? correcta : distractores[d++]);
    rondas.push({ id: `r${i + 1}`, palabra: correcta, carteles: carteles as RondaRuta["carteles"], carril });
  }
  return rondas;
}

function mezclar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
