import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { corrector, oracion } from "./tipo";

const nota = (id: string) => ({
  id,
  partes: ["Un número es divisible entre 2", "si termina en", "cifra impar"],
  cierre: ".",
  error: 2,
  opciones: ["cifra par", "cinco"],
  correcta: 0,
  pista: "Piensa en 10, 12 y 14.",
  explicacion: "Los múltiplos de 2 terminan en 0, 2, 4, 6 u 8.",
});
const contenido = { notas: ["a", "b", "c", "d"].map(nota) };

describe("corrector", () => {
  it("da un punto por encontrar el error y otro por el reemplazo", () => {
    const r = calificarIntento(corrector, contenido, {
      a: { error: 2, cambio: 0 },
      b: { error: 2, cambio: 1 },
      c: { error: 0, cambio: 0 },
      d: { error: 1, cambio: null },
    });
    expect(r.items.map((i) => i.puntaje)).toEqual([2, 1, 1, 0]);
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, false, false]);
  });

  it("arma la oración corregida para el repaso", () => {
    expect(oracion(contenido.notas[0], "cifra par")).toBe("Un número es divisible entre 2 si termina en cifra par.");
    expect(corrector.repaso(contenido, "a").solucion).toBe("Un número es divisible entre 2 si termina en cifra par.");
  });

  it("rechaza opciones que repiten la parte equivocada", () => {
    const malo = leerActividad({
      slug: "x-y",
      titulo: "Prueba",
      tipo: "corrector",
      grado: 5,
      instruccion: "Haz algo.",
      tema: "Divisibilidad",
      contenido: { notas: [...contenido.notas.slice(1), { ...nota("e"), opciones: ["cifra impar", "cifra par"] }] },
    });
    expect(malo.ok).toBe(false);
  });
});
