/**
 * Juegos de palabras: sopa de letras y palabra secreta. No están en el
 * catálogo D4: se añaden por la investigación de tipos (docs/actividades/tipos.md).
 */
import { z } from "zod";
import { definirTipo, generador } from "./contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

/** Letra base (sin tilde) en mayúscula; la Ñ se conserva. */
export function letraBase(letra: string): string {
  return letra.normalize("NFD").replace(/[̀-̂̄-ͯ]/g, "").normalize("NFC").toLocaleUpperCase("es");
}

/* ---------------------------------------------------------------- sopa */

export type Celda = [fila: number, columna: number];

// Hacia la derecha, hacia abajo y en diagonal hacia abajo: nunca al revés, para lectores de 10 años.
const DIRECCIONES: Celda[] = [
  [0, 1],
  [1, 0],
  [1, 1],
];
// Relleno con frecuencias parecidas al español para que la sopa no delate las palabras.
const RELLENO = "AAAAABCCDDEEEEEFGHIIIJLLMMNNOOOOPPRRRSSSTTTUUVYZ";

const palabraSopa = z.object({
  id,
  palabra: z.string().regex(/^[A-ZÑ]{3,12}$/, "en mayúsculas, sin tildes ni espacios, de 3 a 12 letras"),
  pista: texto.optional(),
});

const contenidoSopa = z
  .object({
    filas: z.number().int().min(6).max(12),
    columnas: z.number().int().min(6).max(12),
    palabras: z.array(palabraSopa).min(3).max(10),
  })
  .refine((c) => new Set(c.palabras.map((p) => p.palabra)).size === c.palabras.length, { message: "palabras repetidas" })
  .refine((c) => c.palabras.every((p) => p.palabra.length <= Math.max(c.filas, c.columnas)), {
    message: "una palabra no cabe en la cuadrícula",
  });

export type ContenidoSopa = z.infer<typeof contenidoSopa>;
export type Sopa = { letras: string[][]; lugares: Record<string, { desde: Celda; hasta: Celda }> };

const cache = new WeakMap<ContenidoSopa, Sopa>();

/**
 * Arma la cuadrícula de forma determinista: el mismo contenido da la misma
 * sopa en el servidor y en el navegador. Las palabras
 * largas se colocan primero; dos palabras pueden cruzarse en una letra igual.
 */
export function armarSopa(c: ContenidoSopa): Sopa {
  const guardada = cache.get(c);
  if (guardada) return guardada;
  const orden = [...c.palabras].sort((a, b) => b.palabra.length - a.palabra.length);
  for (let ronda = 0; ronda < 40; ronda++) {
    const azar = generador(`${c.palabras.map((p) => p.palabra).join("-")}:${ronda}`);
    const letras: string[][] = Array.from({ length: c.filas }, () => Array<string>(c.columnas).fill(""));
    const lugares: Sopa["lugares"] = {};
    const colocada = orden.every((p) => {
      for (let intento = 0; intento < 300; intento++) {
        const [df, dc] = DIRECCIONES[Math.floor(azar() * DIRECCIONES.length)];
        const largo = p.palabra.length;
        const maxF = c.filas - (df ? largo : 1);
        const maxC = c.columnas - (dc ? largo : 1);
        if (maxF < 0 || maxC < 0) continue;
        const f0 = Math.floor(azar() * (maxF + 1));
        const c0 = Math.floor(azar() * (maxC + 1));
        const cabe = [...p.palabra].every((l, i) => [l, ""].includes(letras[f0 + df * i][c0 + dc * i]));
        if (!cabe) continue;
        [...p.palabra].forEach((l, i) => (letras[f0 + df * i][c0 + dc * i] = l));
        lugares[p.id] = { desde: [f0, c0], hasta: [f0 + df * (largo - 1), c0 + dc * (largo - 1)] };
        return true;
      }
      return false;
    });
    if (!colocada) continue;
    for (const fila of letras) for (let k = 0; k < fila.length; k++) fila[k] ||= RELLENO[Math.floor(azar() * RELLENO.length)];
    const sopa = { letras, lugares };
    cache.set(c, sopa);
    return sopa;
  }
  throw new Error("No fue posible colocar todas las palabras en la sopa de letras.");
}

/** Letras de la línea recta (horizontal, vertical o diagonal) entre dos celdas; null si no es recta. */
export function leerLinea(letras: string[][], desde: Celda, hasta: Celda): string | null {
  const df = Math.sign(hasta[0] - desde[0]);
  const dc = Math.sign(hasta[1] - desde[1]);
  const pasosF = Math.abs(hasta[0] - desde[0]);
  const pasosC = Math.abs(hasta[1] - desde[1]);
  if (pasosF && pasosC && pasosF !== pasosC) return null;
  const pasos = Math.max(pasosF, pasosC);
  let salida = "";
  for (let i = 0; i <= pasos; i++) {
    const letra = letras[desde[0] + df * i]?.[desde[1] + dc * i];
    if (letra === undefined) return null;
    salida += letra;
  }
  return salida;
}

/** Celdas de la línea entre dos celdas (para pintar lo seleccionado). */
export function celdasDeLinea(desde: Celda, hasta: Celda): Celda[] {
  const df = Math.sign(hasta[0] - desde[0]);
  const dc = Math.sign(hasta[1] - desde[1]);
  const pasos = Math.max(Math.abs(hasta[0] - desde[0]), Math.abs(hasta[1] - desde[1]));
  return Array.from({ length: pasos + 1 }, (_, i) => [desde[0] + df * i, desde[1] + dc * i] as Celda);
}

const celda = z.tuple([z.number().int().min(0), z.number().int().min(0)]);

/** Sopa de letras: cada palabra vale 1 si se marcó su línea, leída en cualquier sentido. */
export const sopaLetras = definirTipo({
  tipo: "sopa-letras",
  nombre: "Sopa de letras",
  versionEsquema: 1,
  esquemaContenido: contenidoSopa.refine(
    (c) => {
      try {
        return !!armarSopa(c);
      } catch {
        return false;
      }
    },
    { message: "las palabras no caben juntas en la cuadrícula" },
  ),
  esquemaRespuesta: z.object({ desde: celda, hasta: celda }),
  items: (c) => c.palabras.map((p) => ({ itemId: p.id, puntajeMaximo: 1 })),
  calificar(c, itemId, r) {
    const palabra = c.palabras.find((p) => p.id === itemId)!.palabra;
    const linea = leerLinea(armarSopa(c).letras, r.desde, r.hasta);
    const correcta = linea === palabra || linea === [...palabra].reverse().join("");
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const p = c.palabras.find((x) => x.id === itemId)!;
    return { pregunta: p.pista ?? "Palabra escondida", solucion: p.palabra };
  },
});

/* ------------------------------------------------------ palabra secreta */

const palabraSecretaItem = z.object({
  id,
  palabra: z.string().regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,14}$/, "una sola palabra de 3 a 14 letras"),
  pista: texto,
});

export type PalabraSecreta = z.infer<typeof palabraSecretaItem>;

export type EstadoPalabra = { fallos: number; adivinada: boolean; agotada: boolean };

/** Recorre las letras propuestas: cuenta fallos únicos y dice si la palabra se completó antes de agotarlos. */
export function jugarPalabra(palabra: string, letras: string[], fallosPermitidos: number): EstadoPalabra {
  const objetivo = new Set([...palabra].map(letraBase));
  const acertadas = new Set<string>();
  const falladas = new Set<string>();
  for (const l of letras.map(letraBase)) {
    if (falladas.size >= fallosPermitidos || acertadas.size === objetivo.size) break;
    (objetivo.has(l) ? acertadas : falladas).add(l);
  }
  return {
    fallos: falladas.size,
    adivinada: acertadas.size === objetivo.size,
    agotada: falladas.size >= fallosPermitidos && acertadas.size < objetivo.size,
  };
}

/** Palabra secreta: adivinar letra a letra con una pista y un número de fallos permitidos. */
export const palabraSecreta = definirTipo({
  tipo: "palabra-secreta",
  nombre: "Palabra secreta",
  versionEsquema: 1,
  esquemaContenido: z.object({
    fallos: z.number().int().min(3).max(8),
    palabras: z
      .array(palabraSecretaItem)
      .min(3)
      .max(8)
      .refine((p) => new Set(p.map((x) => x.id)).size === p.length, { message: "ids repetidos" }),
  }),
  esquemaRespuesta: z.array(z.string().length(1)),
  items: (c) => c.palabras.map((p) => ({ itemId: p.id, puntajeMaximo: 1 })),
  calificar(c, itemId, r) {
    const correcta = jugarPalabra(c.palabras.find((p) => p.id === itemId)!.palabra, r, c.fallos).adivinada;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const p = c.palabras.find((x) => x.id === itemId)!;
    return { pregunta: p.pista, solucion: p.palabra.toLocaleUpperCase("es") };
  },
});
