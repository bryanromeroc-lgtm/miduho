/**
 * Tipo «rectas» — juego 13 de Matemáticas de 5.° (posiciones relativas de
 * rectas; recta, semirrecta y segmento). Idea del referente público de
 * Mundo Primaria (mat-geo-5-1: elegir qué rectas son paralelas); figuras,
 * escena y redacción propias de MIDUHO.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

export const RELACIONES = ["paralelas", "perpendiculares", "secantes"] as const;
export const LINEAS = ["recta", "semirrecta", "segmento"] as const;
export type Busca = (typeof RELACIONES)[number] | (typeof LINEAS)[number];

const tarjeta = z.discriminatedUnion("figura", [
  z.object({
    figura: z.literal("par"),
    relacion: z.enum(RELACIONES),
    /** Giro de la primera recta, en grados. */
    giro: z.number().int().min(0).max(179),
    /** Solo secantes: si el cruce se ve dentro de la tarjeta o hay que prolongar las rectas. */
    cruceVisible: z.boolean().default(true),
  }),
  z.object({ figura: z.literal("linea"), tipo: z.enum(LINEAS), giro: z.number().int().min(0).max(179) }),
]);

export type Tarjeta = z.infer<typeof tarjeta>;

const ronda = z
  .object({ id, busca: z.enum([...RELACIONES, ...LINEAS]), opciones: z.array(tarjeta).min(2).max(4) })
  .refine((r) => r.opciones.filter((t) => categoria(t) === r.busca).length === 1, { message: "exactamente una tarjeta debe ser la que se busca" })
  .refine((r) => r.busca !== "secantes" || !r.opciones.some((t) => t.figura === "par" && t.relacion === "perpendiculares"), {
    message: "si se buscan secantes no puede haber perpendiculares (también son secantes)",
  });

export type RondaRectas = z.infer<typeof ronda>;
export type ContenidoRectas = { rondas: RondaRectas[] };

export function categoria(t: Tarjeta): Busca {
  return t.figura === "par" ? t.relacion : t.tipo;
}

export const PREGUNTAS: Record<Busca, string> = {
  paralelas: "¿Cuáles rectas son paralelas?",
  perpendiculares: "¿Cuáles rectas son perpendiculares?",
  secantes: "¿Cuáles rectas son secantes, sin formar ángulos rectos?",
  recta: "¿Cuál es una recta?",
  semirrecta: "¿Cuál es una semirrecta?",
  segmento: "¿Cuál es un segmento?",
};

export const EXPLICACIONES: Record<Busca, string> = {
  paralelas: "Las paralelas nunca se cortan, aunque las prolongues: van siempre a la misma distancia, como dos calles vecinas.",
  perpendiculares: "Las perpendiculares se cortan formando cuatro ángulos rectos, como una calle y una carrera.",
  secantes: "Las secantes se cortan en un punto; si los ángulos no son rectos, no son perpendiculares.",
  recta: "La recta no tiene principio ni fin: sigue en los dos sentidos (las dos flechas).",
  semirrecta: "La semirrecta empieza en un punto y sigue sin fin hacia un solo lado (un punto y una flecha).",
  segmento: "El segmento empieza y termina: tiene dos extremos (dos puntos).",
};

function rondaDe(c: ContenidoRectas, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const rectas = definirTipo({
  tipo: "rectas",
  nombre: "Rectas",
  versionEsquema: 1,
  esquemaContenido: z.object({ rondas: z.array(ronda).min(4).max(10) }),
  esquemaRespuesta: z.number().int().min(0),
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, i) {
    const r = rondaDe(c, itemId);
    const correcta = r.opciones[i] !== undefined && categoria(r.opciones[i]) === r.busca;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    return { pregunta: PREGUNTAS[r.busca], solucion: EXPLICACIONES[r.busca] };
  },
});
