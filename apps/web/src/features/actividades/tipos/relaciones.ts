/**
 * Tipos de relacionar (D4): emparejar, ordenar, clasificar y memoria.
 * Ninguno exige arrastrar: todo se resuelve tocando (WCAG 2.5.7).
 */
import { z } from "zod";
import { rutaAudio } from "./audio";
import { definirTipo } from "./contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

function unicos<T>(lista: T[], llave: (x: T) => string) {
  return new Set(lista.map(llave)).size === lista.length;
}

/** `audio`: la tarjeta de la izquierda dicha en voz alta; `audioDerecha`: la de la derecha. */
const par = z.object({
  id,
  izquierda: texto,
  derecha: texto,
  audio: rutaAudio.optional(),
  audioDerecha: rutaAudio.optional(),
  /** Presentación «cinta»: ilustración de la tarjeta (su `alt` es `izquierda`). */
  imagen: z.string().regex(/^\/images\/[\w\-/]+\.webp$/, "ruta /images/….webp").optional(),
  /** Presentación «cinta»: pista tras el primer fallo, sin decir la respuesta. */
  pista: texto.max(140).optional(),
});

/**
 * Emparejar: la respuesta de cada par es el id del par cuya derecha se eligió primero.
 * `presentacion: "cinta"` (mecánica de «Rutinas diarias», informe docs/investigacion/
 * referencia-cokitos-rutinas-diarias.md): una tarjeta con imagen cuelga de una cuerda y
 * se toca la ficha de texto que coincide; hasta 18 tarjetas.
 */
export const emparejar = definirTipo({
  tipo: "emparejar",
  nombre: "Emparejar",
  versionEsquema: 1,
  esquemaContenido: z
    .object({
      presentacion: z.enum(["columnas", "cinta"]).optional(),
      pares: z
        .array(par)
        .min(3)
        .max(18)
        .refine((p) => unicos(p, (x) => x.id) && unicos(p, (x) => x.derecha), { message: "ids o derechas repetidas" }),
    })
    .refine((c) => c.presentacion === "cinta" || c.pares.length <= 8, { message: "en columnas, hasta 8 parejas; la cinta admite hasta 18" })
    .refine((c) => c.presentacion !== "cinta" || c.pares.every((p) => p.imagen), { message: "cada tarjeta de la cinta lleva imagen" }),
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
const elementoOrden = z.object({ id, texto, audio: rutaAudio.optional() });
const elementosOrden = (maximo: number) => z.array(elementoOrden).min(3).max(maximo)
  .refine((e) => unicos(e, (x) => x.id), { message: "ids repetidos" });

/** La ausencia de `presentacion` mantiene el contrato anterior. */
const rutaImagen = z.string().regex(/^\/images\/[\w\-/]+\.webp$/, "ruta /images/….webp");
const escenaCasillas = z.object({
  fondo: rutaImagen.optional(),
  personaje: z.object({ nombre: texto, reposo: rutaImagen, senala: rutaImagen, duda: rutaImagen }).optional(),
}).optional();

const contenidoOrdenar = z.union([
  z.object({ presentacion: z.literal("casillas"), semilla: z.union([z.string(), z.number().int()]), escena: escenaCasillas, elementos: elementosOrden(12) }),
  z.object({ presentacion: z.never().optional(), elementos: elementosOrden(8) }),
]);

type ContenidoOrdenar = z.infer<typeof contenidoOrdenar>;
function validarRespuestaOrden(c: ContenidoOrdenar, r: (string | null)[]): boolean {
  if (c.presentacion === "casillas") {
    const ids = c.elementos.map((e) => e.id);
    const puestos = r.filter((x): x is string => x !== null);
    return r.length === ids.length && new Set(puestos).size === puestos.length && puestos.every((x) => ids.includes(x));
  }
  return r.every((x) => typeof x === "string");
}

export const ordenar = definirTipo({
  tipo: "ordenar",
  nombre: "Ordenar",
  versionEsquema: 1,
  esquemaContenido: contenidoOrdenar,
  esquemaRespuesta: z.array(z.string().nullable()),
  items: (c) => [{ itemId: "orden", puntajeMaximo: c.elementos.length }],
  validarRespuesta: validarRespuestaOrden,
  calificar(c, _itemId, r) {
    if (!validarRespuestaOrden(c, r)) return { correcta: false, puntaje: 0 };
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
      /**
       * `una-a-una` (por omisión): una tarjeta a la vez, con retroalimentación inmediata.
       * `tablero`: todas las tarjetas a la vista, columnas con casillas, «Enviar respuestas»
       * y revelado de cada una (mecánica de la plantilla «Agrupar» de la referencia).
       */
      presentacion: z.enum(["una-a-una", "tablero", "parejas"]).optional(),
      escena: escenaCasillas,
      /** Apariencia y efectos del tablero; la omisión conserva girasol. */
      tema: z.enum(["girasol", "corcho"]).optional(),
      categorias: z
        .array(z.object({ id, nombre: texto }))
        .min(2)
        .max(3),
      elementos: z
        .array(
          z.object({
            id,
            texto,
            categoria: id,
            pareja: id.optional(),
            /** Lectura oral alternativa a la palabra visible. */
            lectura: texto.max(100).optional(),
            audio: rutaAudio.optional(),
            /** Ilustración de la tarjeta (1.°: para quien aún no lee); su `alt` es el `texto`. */
            imagen: z.string().regex(/^\/images\/[\w\-/]+\.webp$/, "ruta /images/….webp").optional(),
            /** Por qué va en su cesta, en una frase («La gallina nace, crece y se alimenta»). */
            explicacion: texto.max(160).optional(),
          }),
        )
        .min(4)
        .max(16),
    })
    .refine((c) => c.presentacion === "tablero" || c.elementos.length <= 12, {
      message: "una a una admite hasta 12 elementos; el tablero, hasta 16",
    })
    .refine((c) => unicos(c.categorias, (x) => x.id) && unicos(c.elementos, (x) => x.id), { message: "ids repetidos" })
    .refine((c) => c.elementos.every((e) => c.categorias.some((k) => k.id === e.categoria)), {
      message: "un elemento apunta a una categoría que no existe",
    })
    .refine((c) => {
      if (c.presentacion !== "parejas") return true;
      if (c.categorias.length !== 2 || c.elementos.length % 2 !== 0 || c.elementos.length > 12) return false;
      if (c.elementos.some((e) => !e.imagen || !e.pareja)) return false;
      const grupos = new Map<string, string[]>();
      for (const e of c.elementos) grupos.set(e.pareja!, [...(grupos.get(e.pareja!) ?? []), e.categoria]);
      return [...grupos.values()].every((categorias) => categorias.length === 2 && c.categorias.every((k) => categorias.includes(k.id)));
    }, { message: "parejas requiere dos categorías y una imagen de cada categoría por ronda" }),
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
