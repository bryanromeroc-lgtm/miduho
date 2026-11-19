/**
 * Tipo «porcentaje» — juego 9 de Matemáticas de 5.° (aumentos porcentuales).
 * Idea del referente público de Mundo Primaria (mat-num-5-9: completar los
 * recuadros del cálculo del aumento); escena, productos y precios en pesos
 * propios de MIDUHO. 🔶 Precios ficticios, no son precios reales.
 *
 * Cada producto vale 2: el aumento y el precio nuevo, al primer intento.
 */
import { z } from "zod";
import { formatearNumero } from "@/lib/numeros";
import { definirTipo } from "../../tipos/contrato";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

const producto = z
  .object({
    id,
    nombre: z.string().trim().min(2).max(40),
    precio: z.number().int().min(100).max(999_900),
    porcentaje: z.number().int().min(1).max(100),
  })
  .refine((p) => (p.precio * p.porcentaje) % 100 === 0, { message: "el aumento debe dar pesos enteros" });

export type Producto = z.infer<typeof producto>;
export type ContenidoPorcentaje = { productos: Producto[] };

export const CAMPOS_PORCENTAJE = ["aumento", "nuevo"] as const;

export function resolverPorcentaje(p: Producto) {
  const aumento = (p.precio * p.porcentaje) / 100;
  return { aumento, nuevo: p.precio + aumento };
}

function productoDe(c: ContenidoPorcentaje, itemId: string) {
  const p = c.productos.find((x) => x.id === itemId);
  if (!p) throw new Error(`Producto desconocido: ${itemId}`);
  return p;
}

export const pesos = (n: number) => `$${formatearNumero(n)}`;

export const porcentajeTipo = definirTipo({
  tipo: "porcentaje",
  nombre: "Porcentajes",
  versionEsquema: 1,
  esquemaContenido: z.object({ productos: z.array(producto).min(3).max(10) }),
  esquemaRespuesta: z.object({ aumento: z.number().int().nullable(), nuevo: z.number().int().nullable() }),
  items: (c) => c.productos.map((p) => ({ itemId: p.id, puntajeMaximo: 2 })),
  calificar(c, itemId, r) {
    const s = resolverPorcentaje(productoDe(c, itemId));
    const puntos = Number(r.aumento === s.aumento) + Number(r.nuevo === s.nuevo);
    return { correcta: puntos === 2, puntaje: puntos };
  },
  repaso(c, itemId) {
    const p = productoDe(c, itemId);
    const s = resolverPorcentaje(p);
    return {
      pregunta: `${p.nombre}: ${pesos(p.precio)} sube el ${p.porcentaje} %`,
      solucion: `Aumento de ${pesos(s.aumento)}; precio nuevo ${pesos(s.nuevo)}.`,
    };
  },
});
