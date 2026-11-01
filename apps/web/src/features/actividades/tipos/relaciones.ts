/**
 * Tipos de relacionar (D4): emparejar, ordenar, clasificar y memoria.
 * Ninguno exige arrastrar: todo se resuelve tocando (WCAG 2.5.7).
 */
import { z } from "zod";
import { definirTipo } from "./contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

function unicos<T>(lista: T[], llave: (x: T) => string) {
  return new Set(lista.map(llave)).size === lista.length;
}

const par = z.object({ id, izquierda: texto, derecha: texto });

/** Emparejar: la respuesta de cada par es el id del par cuya derecha se eligió primero. */
export const emparejar = definirTipo({
  tipo: "emparejar",
  nombre: "Emparejar",
  versionEsquema: 1,
  esquemaContenido: z.object({
    pares: z
      .array(par)
      .min(3)
      .max(8)
      .refine((p) => unicos(p, (x) => x.id) && unicos(p, (x) => x.derecha), { message: "ids o derechas repetidas" }),
  }),
  esquemaRespuesta: z.string(),
  items: (c) => c.pares.map((p) => ({ itemId: p.id, puntajeMaximo: 1 })),
  calificar: (_c, itemId, r) => ({ correcta: r === itemId, puntaje: r === itemId ? 1 : 0 }),
  repaso(c, itemId) {
    const p = c.pares.find((x) => x.id === itemId)!;
    return { pregunta: p.izquierda, solucion: p.derecha };
  },
});

/*
  Ordenar: un solo ítem; vale una parte por cada elemento en su posición
  exacta (🔶 regla de puntaje parcial abierta en D4: se eligió la posición
  exacta por ser la más fácil de explicar a un niño).
*/
export const ordenar = definirTipo({
  tipo: "ordenar",
  nombre: "Ordenar",
  versionEsquema: 1,
  esquemaContenido: z.object({
    /** En el orden correcto. */
    elementos: z
      .array(z.object({ id, texto }))
      .min(3)
      .max(8)
      .refine((e) => unicos(e, (x) => x.id), { message: "ids repetidos" }),
  }),
  esquemaRespuesta: z.array(z.string()),
  items: (c) => [{ itemId: "orden", puntajeMaximo: c.elementos.length }],
  calificar(c, _itemId, r) {
    const puntaje = c.elementos.filter((e, i) => r[i] === e.id).length;
    return { correcta: puntaje === c.elementos.length && r.length === c.elementos.length, puntaje };
  },
  repaso: (c) => ({ pregunta: "El orden correcto", solucion: c.elementos.map((e) => e.texto).join(" → ") }),
});

/** Clasificar: cada elemento vale 1 si su primera ubicación es su categoría. */
export const clasificar = definirTipo({
  tipo: "clasificar",
  nombre: "Clasificar",
  versionEsquema: 1,
  esquemaContenido: z
    .object({
      categorias: z
        .array(z.object({ id, nombre: texto }))
        .min(2)
        .max(3),
      elementos: z
        .array(z.object({ id, texto, categoria: id }))
        .min(4)
        .max(12),
    })
    .refine((c) => unicos(c.categorias, (x) => x.id) && unicos(c.elementos, (x) => x.id), { message: "ids repetidos" })
    .refine((c) => c.elementos.every((e) => c.categorias.some((k) => k.id === e.categoria)), {
      message: "un elemento apunta a una categoría que no existe",
    }),
  esquemaRespuesta: z.string(),
  items: (c) => c.elementos.map((e) => ({ itemId: e.id, puntajeMaximo: 1 })),
  calificar(c, itemId, r) {
    const correcta = c.elementos.find((e) => e.id === itemId)?.categoria === r;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const e = c.elementos.find((x) => x.id === itemId)!;
    return { pregunta: e.texto, solucion: c.categorias.find((k) => k.id === e.categoria)!.nombre };
  },
});

/*
  Memoria: parejas de cartas que se corresponden (palabra y significado,
  operación y resultado…). Completar el tablero vale el puntaje máximo; los
  errores no restan nota (D4).
*/
export const memoria = definirTipo({
  tipo: "memoria",
  nombre: "Memoria",
  versionEsquema: 1,
  esquemaContenido: z.object({
    parejas: z
      .array(z.object({ id, a: texto, b: texto }))
      .min(3)
      .max(8)
      .refine((p) => unicos(p, (x) => x.id) && unicos([...p.map((x) => x.a), ...p.map((x) => x.b)], (x) => x), {
        message: "ids o caras repetidas",
      }),
  }),
  esquemaRespuesta: z.object({ completo: z.boolean(), volteos: z.number().int().min(0) }),
  items: (c) => [{ itemId: "tablero", puntajeMaximo: c.parejas.length }],
  calificar: (c, _itemId, r) => ({ correcta: r.completo, puntaje: r.completo ? c.parejas.length : 0 }),
  repaso: (c) => ({ pregunta: "Las parejas", solucion: c.parejas.map((p) => `${p.a} = ${p.b}`).join(" · ") }),
});
