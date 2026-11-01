/**
 * Contrato de un tipo de actividad (fundacion-actividades, D3), en su forma
 * de práctica: cada tipo valida su contenido y su respuesta con Zod y
 * califica cada ítem con una función pura. La misma calificación correrá en
 * el servidor cuando existan los intentos (5.2); hoy la usa el reproductor.
 */
import type { z } from "zod";

export type ItemActividad = { itemId: string; puntajeMaximo: number };

export type Calificacion = { correcta: boolean; puntaje: number };

/** Lo que el repaso del resultado muestra de un ítem: qué se pedía y cuál era la respuesta. */
export type Repaso = { pregunta: string; solucion: string };

export interface DefinicionTipoActividad<C = unknown, R = unknown> {
  tipo: string;
  versionEsquema: number;
  /** Nombre corto para la tarjeta y el reproductor: «Quiz», «Memoria»… */
  nombre: string;
  esquemaContenido: z.ZodType<C>;
  esquemaRespuesta: z.ZodType<R>;
  items(contenido: C): ItemActividad[];
  calificar(contenido: C, itemId: string, respuesta: R): Calificacion;
  repaso(contenido: C, itemId: string): Repaso;
}

/** Ayuda de tipado: conserva C y R al declarar un tipo. */
export function definirTipo<C, R>(definicion: DefinicionTipoActividad<C, R>): DefinicionTipoActividad<C, R> {
  return definicion;
}

export type ResultadoItem = Calificacion & Repaso & { itemId: string; puntajeMaximo: number };

export type ResultadoIntento = {
  puntaje: number;
  puntajeMaximo: number;
  /** 0–100 con dos decimales. */
  porcentaje: number;
  items: ResultadoItem[];
};

/**
 * Califica un intento completo. Un ítem sin respuesta o con una respuesta que
 * no cumple el esquema vale 0; el puntaje de un ítem nunca pasa de su máximo.
 */
export function calificarIntento<C, R>(
  definicion: DefinicionTipoActividad<C, R>,
  contenido: C,
  respuestas: Record<string, unknown>,
): ResultadoIntento {
  const items = definicion.items(contenido).map(({ itemId, puntajeMaximo }) => {
    const leida = definicion.esquemaRespuesta.safeParse(respuestas[itemId]);
    const nota = leida.success ? definicion.calificar(contenido, itemId, leida.data) : { correcta: false, puntaje: 0 };
    const puntaje = Math.min(puntajeMaximo, Math.max(0, nota.puntaje));
    return { itemId, puntajeMaximo, correcta: nota.correcta, puntaje, ...definicion.repaso(contenido, itemId) };
  });
  const puntaje = items.reduce((t, i) => t + i.puntaje, 0);
  const puntajeMaximo = items.reduce((t, i) => t + i.puntajeMaximo, 0);
  const porcentaje = puntajeMaximo === 0 ? 0 : Math.round((puntaje / puntajeMaximo) * 10000) / 100;
  return { puntaje, puntajeMaximo, porcentaje, items };
}

/** Barajado determinista (mulberry32 sobre un hash de la semilla): el mismo orden en servidor y cliente. */
export function barajar<T>(lista: readonly T[], semilla: string): T[] {
  const azar = generador(semilla);
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function generador(semilla: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
