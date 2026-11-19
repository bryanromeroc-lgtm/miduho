/**
 * Tipo «sello» — verdadero o falso con sello. Juego 4 de Matemáticas de 5.°
 * (cuadrado y cubo de un número) y base de los demás temas que el referente
 * público de Mundo Primaria trabaja con afirmaciones V/F (mat-num-5-4 y
 * otros). Escena, redacción y afirmaciones propias de MIDUHO.
 *
 * Es una decisión binaria: cuenta la única respuesta y no hay reintento
 * (reintentar sería adivinar). Al responder se ve la explicación y, si la
 * afirmación trae figura, la figura para contar.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");
const texto = z.string().trim().min(1);

/** Figuras que se pueden dibujar junto a una afirmación. */
export const esquemaFigura = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("cuadrado"), lado: z.number().int().min(1).max(12) }),
  z.object({ tipo: z.literal("cubo"), lado: z.number().int().min(1).max(6) }),
  z
    .object({
      tipo: z.literal("fraccion"),
      numerador: z.number().int().min(0).max(36),
      denominador: z.number().int().min(1).max(12),
      /** Torta redonda o chocolatina en barra. */
      forma: z.enum(["circulo", "barra"]),
    })
    .refine((f) => f.numerador <= f.denominador * 3, { message: "a lo sumo tres unidades dibujadas" }),
]);
export type Figura = z.infer<typeof esquemaFigura>;

const afirmacion = z.object({
  id,
  texto: texto.max(160),
  verdadera: z.boolean(),
  /** Por qué es verdadera o falsa; si es falsa, cuál es la versión correcta. */
  explicacion: texto,
  figura: esquemaFigura.optional(),
});

export type Afirmacion = z.infer<typeof afirmacion>;

/** Escenarios disponibles (fondo + letrero). */
export const ESCENAS_SELLO = ["bodega", "panaderia"] as const;

const contenido = z
  .object({ escena: z.enum(ESCENAS_SELLO), afirmaciones: z.array(afirmacion).min(4).max(12) })
  .refine((c) => c.afirmaciones.some((a) => a.verdadera) && c.afirmaciones.some((a) => !a.verdadera), {
    message: "debe haber afirmaciones verdaderas y falsas",
  });

export type ContenidoSello = z.infer<typeof contenido>;

function afirmacionDe(c: ContenidoSello, itemId: string) {
  const a = c.afirmaciones.find((x) => x.id === itemId);
  if (!a) throw new Error(`Afirmación desconocida: ${itemId}`);
  return a;
}

export const sello = definirTipo({
  tipo: "sello",
  nombre: "Verdadero o falso",
  versionEsquema: 1,
  esquemaContenido: contenido,
  esquemaRespuesta: z.boolean(),
  items: (c) => c.afirmaciones.map((a) => ({ itemId: a.id, puntajeMaximo: 1 })),
  calificar(c, itemId, r) {
    const correcta = afirmacionDe(c, itemId).verdadera === r;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const a = afirmacionDe(c, itemId);
    return { pregunta: a.texto, solucion: `${a.verdadera ? "Verdadero" : "Falso"}. ${a.explicacion}` };
  },
});
