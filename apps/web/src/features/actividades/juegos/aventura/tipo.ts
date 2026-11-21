/**
 * Tipo «aventura» — una historia por escenas con preguntas de selección
 * múltiple. El personaje (Armi) tiene un encargo; cada escena es un lugar
 * distinto con su ilustración, un problema y una pregunta. Responder bien
 * hace avanzar el relato: la carga se entrega y el camino sigue.
 * Escenas, redacción y números propios de MIDUHO.
 *
 * Cada escena vale 1: acertar al primer intento. El error no frena la
 * historia: da una pista, permite un segundo intento y, si falla de nuevo,
 * muestra la respuesta con su explicación y la historia continúa.
 */
import { z } from "zod";
import { rutaAudio } from "../../tipos/audio";
import { esquemaEscenaJuego } from "../comun/escena";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = (max: number) => z.string().trim().min(3).max(max);

/** Lugares ilustrados que tiene el reproductor (un fondo por lugar). */
export const LUGARES = ["gallinero", "tienda", "puente", "panaderia", "mercado", "salon", "plaza"] as const;
export type Lugar = (typeof LUGARES)[number];

export const OBJETOS = {
  huevos: { singular: "huevo", plural: "huevos" },
  naranjas: { singular: "naranja", plural: "naranjas" },
  panes: { singular: "pan", plural: "panes" },
  galletas: { singular: "galleta", plural: "galletas" },
  plantas: { singular: "planta", plural: "plantas" },
  balones: { singular: "balón", plural: "balones" },
} as const;
export type Objeto = keyof typeof OBJETOS;
export const LLAVES_OBJETO = Object.keys(OBJETOS) as [Objeto, ...Objeto[]];

const uso = z.object({
  num: z.number().int().min(1).max(9),
  nombre: texto(30),
});

/** Dibujo de apoyo: el todo partido en `den` partes iguales con algunas resaltadas. Se muestra al corregir. */
const visual = z
  .object({
    objeto: z.enum(LLAVES_OBJETO),
    total: z.number().int().min(4).max(48),
    den: z.number().int().min(2).max(10),
    usos: z.array(uso).min(1).max(2),
  })
  .refine((v) => v.total % v.den === 0, { message: "el total debe partirse en partes iguales" })
  .refine((v) => v.usos.reduce((t, u) => t + u.num, 0) < v.den, { message: "las partes resaltadas deben ser menos que el denominador" });

export type Visual = z.infer<typeof visual>;

/** Una pila de objetos sin partir, para escenas que no reparten pero sí muestran algo (p. ej. «el último huevo»). */
const muestra = z.object({
  objeto: z.enum(LLAVES_OBJETO),
  cantidad: z.number().int().min(1).max(48),
  titulo: texto(60),
});

export type Muestra = z.infer<typeof muestra>;

const escena = z
  .object({
    id,
    lugar: z.enum(LUGARES).optional(),
    imagen: z.string().regex(/^\/images\/[\w\-/]+\.webp$/).optional(),
    alt: texto(180).optional(),
    /** Lo que pasa en la historia, dicho al estudiante. */
    narracion: texto(320),
    pregunta: texto(200),
    opciones: z.array(z.string().trim().min(1).max(60)).min(2).max(4),
    correcta: z.number().int().min(0),
    /** Se muestra después del primer error: orienta sin dar la respuesta. */
    pista: texto(260),
    /** Se muestra al cerrar la escena: por qué esa es la respuesta. */
    explicacion: texto(260),
    /** Cuánta carga se entrega al resolver esta escena. */
    entrega: z.number().int().min(0).max(99).optional(),
    visual: visual.optional(),
    muestra: muestra.optional(),
    /** Narración y pregunta grabadas (opcional). */
    audio: rutaAudio.optional(),
  })
  .refine((e) => Boolean(e.lugar || e.imagen), { message: "se necesita lugar o imagen" })
  .refine((e) => !e.imagen || Boolean(e.alt), { message: "la imagen necesita alt" })
  .refine((e) => e.correcta < e.opciones.length, { message: "«correcta» apunta a una opción que no existe" })
  .refine((e) => new Set(e.opciones).size === e.opciones.length, { message: "opciones repetidas" });

export type EscenaAventura = z.infer<typeof escena>;

const contenido = z
  .object({
    carga: z.object({ objeto: z.enum(LLAVES_OBJETO), inicio: z.number().int().min(1).max(99) }).optional(),
    escena: esquemaEscenaJuego.optional(),
    efectos: z.object({ acierto: rutaAudio.optional(), error: rutaAudio.optional(), avanzar: rutaAudio.optional(), secuencia: rutaAudio.optional(), fin: rutaAudio.optional() }).optional(),
    secuencia: z.object({
      consigna: texto(220),
      casillas: z.tuple([texto(60), texto(60), texto(60)]),
      items: z.array(z.object({ id, imagen: z.string().regex(/^\/images\/[\w\-/]+\.webp$/), alt: texto(180), posicion: z.number().int().min(0).max(2) })).length(3),
      pista: texto(260), explicacion: texto(260), audio: rutaAudio.optional(),
    }).refine((v) => new Set(v.items.map((i) => i.id)).size === 3 && new Set(v.items.map((i) => i.posicion)).size === 3, { message: "ids y posiciones de secuencia deben ser únicos" }).optional(),
    /** El encargo: lo que se lee antes de empezar. */
    inicio: texto(400),
    /** Lectura grabada del encargo, si existe. */
    audioInicio: rutaAudio.optional(),
    /** El cierre de la historia, sea cual sea el resultado. */
    final: texto(400),
    /** Lectura grabada del cierre, si existe. */
    audioFinal: rutaAudio.optional(),
    escenas: z.array(escena).min(4).max(10),
  })
  .refine((c) => !c.carga || c.escenas.reduce((t, e) => t + (e.entrega ?? 0), 0) <= c.carga.inicio, { message: "se entrega más carga de la que hay" });

export type ContenidoAventura = z.infer<typeof contenido>;

function escenaDe(c: ContenidoAventura, itemId: string) {
  const e = c.escenas.find((x) => x.id === itemId);
  if (!e) throw new Error(`Escena desconocida: ${itemId}`);
  return e;
}

/** Carga que queda después de resolver las primeras `hechas` escenas. */
export function cargaRestante(c: ContenidoAventura, hechas: number): number {
  return (c.carga?.inicio ?? 0) - c.escenas.slice(0, hechas).reduce((t, e) => t + (e.entrega ?? 0), 0);
}

export const aventura = definirTipo({
  tipo: "aventura",
  nombre: "Aventura",
  versionEsquema: 1,
  esquemaContenido: contenido,
  esquemaRespuesta: z.union([z.number().int().min(0), z.array(id).length(3)]),
  items: (c) => [...c.escenas.map((e) => ({ itemId: e.id, puntajeMaximo: 1 })), ...(c.secuencia ? [{ itemId: "secuencia", puntajeMaximo: 1 }] : [])],
  calificar(c, itemId, resp) {
    const correcta = itemId === "secuencia"
      ? Boolean(c.secuencia && Array.isArray(resp) && resp.every((id, i) => id === [...c.secuencia!.items].sort((a, b) => a.posicion - b.posicion)[i].id))
      : typeof resp === "number" && escenaDe(c, itemId).correcta === resp;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    if (itemId === "secuencia" && c.secuencia) return { pregunta: c.secuencia.consigna, solucion: [...c.secuencia.items].sort((a, b) => a.posicion - b.posicion).map((i, k) => `${c.secuencia!.casillas[k]}: ${i.alt}`).join(" · ") };
    const e = escenaDe(c, itemId);
    return { pregunta: e.pregunta, solucion: e.opciones[e.correcta] };
  },
});
