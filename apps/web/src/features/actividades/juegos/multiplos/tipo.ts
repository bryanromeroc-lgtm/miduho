/**
 * Tipo «multiplos» — juegos 10 y 11 de Matemáticas de 5.° (MCM y MCD). El
 * referente público de Mundo Primaria (mat-num-5-10 y 5-11) usa verdadero o
 * falso; en MIDUHO se manipula: dos filas de múltiplos (MCM) o de divisores
 * (MCD) y se toca el número que se repite, el menor o el mayor.
 * Escenas, situaciones y números propios de MIDUHO.
 */
import { z } from "zod";
import { definirTipo } from "../../tipos/contrato";
import { mcd, mcm } from "../bocadillo/tipo";

const id = z.string().regex(/^[a-z0-9-]+$/, "id en minúsculas, números y guiones");

export const ESCENAS_MULTIPLOS = ["terminal", "flores"] as const;

const ronda = z
  .object({
    id,
    a: z.number().int().min(2).max(60),
    b: z.number().int().min(2).max(60),
    /** Situación en una o dos frases. */
    contexto: z.string().trim().min(10).max(200),
  })
  .refine((r) => r.a !== r.b, { message: "los números deben ser distintos" });

const contenido = z
  .object({
    modo: z.enum(["mcm", "mcd"]),
    escena: z.enum(ESCENAS_MULTIPLOS),
    /** Nombres de las dos filas: «Chiva azul», «Rosas»… */
    filas: z.tuple([z.string().trim().min(2).max(24), z.string().trim().min(2).max(24)]),
    rondas: z.array(ronda).min(3).max(8),
  })
  .superRefine((c, ctx) => {
    c.rondas.forEach((r, i) => {
      if (c.modo === "mcm" && mcm(r.a, r.b) / Math.min(r.a, r.b) > 6) {
        ctx.addIssue({ code: "custom", path: ["rondas", i], message: "el MCM queda muy lejos: la fila sería demasiado larga" });
      }
      if (c.modo === "mcd" && mcd(r.a, r.b) === 1) {
        ctx.addIssue({ code: "custom", path: ["rondas", i], message: "el MCD es 1: elige números con divisores comunes" });
      }
    });
  });

export type ContenidoMultiplos = z.infer<typeof contenido>;
export type RondaMultiplos = ContenidoMultiplos["rondas"][number];

/** Fila de la ronda: múltiplos hasta el doble del MCM, o todos los divisores. */
export function fila(modo: "mcm" | "mcd", n: number, otro: number): number[] {
  if (modo === "mcd") return Array.from({ length: n }, (_, k) => k + 1).filter((d) => n % d === 0);
  const tope = 2 * mcm(n, otro);
  return Array.from({ length: Math.floor(tope / n) }, (_, k) => (k + 1) * n);
}

export function objetivo(modo: "mcm" | "mcd", r: RondaMultiplos): number {
  return modo === "mcm" ? mcm(r.a, r.b) : mcd(r.a, r.b);
}

function rondaDe(c: ContenidoMultiplos, itemId: string) {
  const r = c.rondas.find((x) => x.id === itemId);
  if (!r) throw new Error(`Ronda desconocida: ${itemId}`);
  return r;
}

export const multiplos = definirTipo({
  tipo: "multiplos",
  nombre: "Múltiplos y divisores",
  versionEsquema: 1,
  esquemaContenido: contenido,
  esquemaRespuesta: z.number().int().min(1),
  items: (c) => c.rondas.map((r) => ({ itemId: r.id, puntajeMaximo: 1 })),
  calificar(c, itemId, resp) {
    const correcta = objetivo(c.modo, rondaDe(c, itemId)) === resp;
    return { correcta, puntaje: correcta ? 1 : 0 };
  },
  repaso(c, itemId) {
    const r = rondaDe(c, itemId);
    const sigla = c.modo === "mcm" ? "m.c.m." : "m.c.d.";
    return { pregunta: `${sigla} de ${r.a} y ${r.b}`, solucion: `${objetivo(c.modo, r)}` };
  },
});
