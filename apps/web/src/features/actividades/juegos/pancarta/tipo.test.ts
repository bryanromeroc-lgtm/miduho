import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { pancarta } from "./tipo";

const contenido = {
  rondas: [
    { id: "a", modo: "letras" as const, numero: 12405300, distractores: [1245300] },
    { id: "b", modo: "cifras" as const, numero: 36500412, distractores: [36050412] },
    { id: "c", modo: "posicion" as const, numero: 48273916, posicion: 5 },
    { id: "d", modo: "posicion" as const, numero: 603154287, posicion: 7 },
  ],
};

describe("pancarta", () => {
  it("califica el número elegido y la posición tocada", () => {
    const r = calificarIntento(pancarta, contenido, { a: 12405300, b: 36050412, c: 5, d: 2 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true, false]);
    expect(r.porcentaje).toBe(50);
  });

  it("el repaso dice la solución en cifras, en palabras o con su valor", () => {
    expect(pancarta.repaso(contenido, "a").solucion).toBe("12.405.300");
    expect(pancarta.repaso(contenido, "b").solucion).toBe("treinta y seis millones quinientos mil cuatrocientos doce");
    expect(pancarta.repaso(contenido, "d").solucion).toBe("El 0: no hay decenas de millón.");
  });

  it("rechaza una posición que el número no tiene y distractores iguales al número", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "pancarta", grado: 5, instruccion: "Haz algo.", tema: "Números" };
    const malo = leerActividad({
      ...base,
      contenido: {
        rondas: [
          ...contenido.rondas.slice(0, 3),
          { id: "e", modo: "posicion", numero: 1234, posicion: 6 },
          { id: "f", modo: "letras", numero: 5000, distractores: [5000] },
        ],
      },
    });
    expect(malo.ok).toBe(false);
    if (!malo.ok) expect(malo.errores.join(" ")).toMatch(/posición no existe[\s\S]*distractores repetidos/);
  });
});
