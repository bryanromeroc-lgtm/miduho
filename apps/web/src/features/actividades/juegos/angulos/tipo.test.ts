import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { angulos, candidatos } from "./tipo";

const c = {
  rondas: [
    { id: "a", modo: "medir" as const, angulo: 50, desde: "derecha" as const },
    { id: "b", modo: "medir" as const, angulo: 120, desde: "izquierda" as const },
    { id: "c", modo: "bisectriz" as const, angulo: 80 },
    { id: "d", modo: "bisectriz" as const, angulo: 140 },
  ],
};

describe("ángulos", () => {
  it("califica la medida y la bisectriz", () => {
    const r = calificarIntento(angulos, c, { a: 50, b: 60, c: 40, d: 105 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true, false]);
  });
  it("los candidatos a bisectriz son distintos y uno es la mitad", () => {
    for (const a of [40, 80, 120, 160]) {
      const k = candidatos(a);
      expect(new Set(k).size).toBe(3);
      expect(k).toContain(a / 2);
    }
  });
  it("rechaza ángulos que no se pueden leer en el transportador", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "angulos", grado: 5, instruccion: "Haz algo.", tema: "Ángulos" };
    expect(leerActividad({ ...base, contenido: { rondas: [...c.rondas, { id: "e", modo: "medir", angulo: 37, desde: "derecha" }] } }).ok).toBe(false);
  });
});
