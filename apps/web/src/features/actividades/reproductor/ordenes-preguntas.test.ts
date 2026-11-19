import { describe, expect, it } from "vitest";
import type { Pregunta } from "../tipos/preguntas";
import { ordenesPreguntas } from "./ordenes-preguntas";

const preguntas: Pregunta[] = Array.from({ length: 6 }, (_, i) => ({
  id: `p${i}`, enunciado: "¿Cuál?", opciones: ["a", "b", "c"], correcta: 0,
}));

describe("ordenesPreguntas", () => {
  it("produce órdenes reproducibles, completos y distintos entre partidas", () => {
    const a = ordenesPreguntas(preguntas, "partida-1");
    expect(a).toEqual(ordenesPreguntas(preguntas, "partida-1"));
    expect(a).not.toEqual(ordenesPreguntas(preguntas, "partida-2"));
    expect(a.every((orden) => [...orden].sort().join() === "0,1,2")).toBe(true);
  });
  it("conserva el orden explícito sin alterar el barajado predeterminado", () => {
    expect(ordenesPreguntas(preguntas, "partida-1", false)).toEqual(preguntas.map(() => [0, 1, 2]));
    expect(ordenesPreguntas(preguntas, "partida-1", true)).toEqual(ordenesPreguntas(preguntas, "partida-1"));
  });
});
