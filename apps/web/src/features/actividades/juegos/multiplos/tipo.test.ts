import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { fila, multiplos, objetivo } from "./tipo";

const rondas = [
  { id: "a", a: 4, b: 6, contexto: "Dos chivas salen juntas." },
  { id: "b", a: 9, b: 12, contexto: "Dos chivas salen juntas." },
  { id: "c", a: 10, b: 15, contexto: "Dos chivas salen juntas." },
];

describe("múltiplos y divisores", () => {
  it("arma filas de múltiplos hasta el doble del MCM y de divisores", () => {
    expect(fila("mcm", 4, 6)).toEqual([4, 8, 12, 16, 20, 24]);
    expect(fila("mcd", 12, 18)).toEqual([1, 2, 3, 4, 6, 12]);
  });

  it("califica el MCM o el MCD tocado", () => {
    const c = { modo: "mcm" as const, escena: "terminal" as const, filas: ["Azul", "Verde"] as [string, string], rondas };
    expect(objetivo("mcm", rondas[1])).toBe(36);
    const r = calificarIntento(multiplos, c, { a: 12, b: 72, c: 30 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true]);
  });

  it("rechaza un MCD igual a 1", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "multiplos", grado: 5, instruccion: "Haz algo.", tema: "MCD" };
    const c = { modo: "mcd", escena: "flores", filas: ["Rosas", "Claveles"], rondas: [...rondas.slice(1), { id: "d", a: 8, b: 9, contexto: "Ramos de flores iguales." }] };
    expect(leerActividad({ ...base, contenido: c }).ok).toBe(false);
  });
});
