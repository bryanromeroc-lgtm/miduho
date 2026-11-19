import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { pizarraDecimales } from "./tipo";

const contenido = {
  rondas: [
    { id: "a", modo: "letras" as const, numero: "3,25", distractores: ["3,025", "32,5"] },
    { id: "b", modo: "cifras" as const, numero: "12,07", distractores: ["12,7"] },
    { id: "c", modo: "posicion" as const, numero: "45,362", posicion: -2 },
    { id: "d", modo: "posicion" as const, numero: "906,05", posicion: -1 },
  ],
};

describe("pizarra de decimales", () => {
  it("califica el decimal elegido y la posición tocada", () => {
    const r = calificarIntento(pizarraDecimales, contenido, { a: "3,25", b: "12,7", c: -2, d: -2 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true, false]);
  });

  it("el repaso da la lectura y el valor de la cifra", () => {
    expect(pizarraDecimales.repaso(contenido, "b").solucion).toBe("doce enteros con siete centésimas");
    expect(pizarraDecimales.repaso(contenido, "c").solucion).toBe("El 6, que vale 0,06.");
  });

  it("rechaza decimales con punto y opciones que se leen igual", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "pizarra-decimales", grado: 5, instruccion: "Haz algo.", tema: "Decimales" };
    const malo = leerActividad({
      ...base,
      contenido: { rondas: [...contenido.rondas.slice(0, 3), { id: "e", modo: "letras", numero: "3.5", distractores: ["3,05"] }] },
    });
    expect(malo.ok).toBe(false);
    const repetido = leerActividad({
      ...base,
      contenido: { rondas: [...contenido.rondas.slice(0, 3), { id: "e", modo: "letras", numero: "3,5", distractores: ["3,5"] }] },
    });
    expect(repetido.ok).toBe(false);
  });
});
