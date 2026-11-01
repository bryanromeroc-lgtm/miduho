import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { porcentajeTipo, resolverPorcentaje } from "./tipo";

const c = {
  productos: [
    { id: "a", nombre: "Pan", precio: 2000, porcentaje: 10 },
    { id: "b", nombre: "Leche", precio: 4500, porcentaje: 20 },
    { id: "c", nombre: "Huevos", precio: 15000, porcentaje: 5 },
  ],
};

describe("porcentaje", () => {
  it("calcula el aumento y el precio nuevo", () => {
    expect(resolverPorcentaje(c.productos[1])).toEqual({ aumento: 900, nuevo: 5400 });
  });
  it("da un punto por cada casilla", () => {
    const r = calificarIntento(porcentajeTipo, c, { a: { aumento: 200, nuevo: 2200 }, b: { aumento: 900, nuevo: 4600 }, c: { aumento: null, nuevo: null } });
    expect(r.items.map((i) => i.puntaje)).toEqual([2, 1, 0]);
    expect(porcentajeTipo.repaso(c, "c").solucion).toBe("Aumento de $750; precio nuevo $15.750.");
  });
  it("rechaza aumentos con centavos", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "porcentaje", grado: 5, instruccion: "Haz algo.", tema: "Porcentajes" };
    expect(leerActividad({ ...base, contenido: { productos: [...c.productos, { id: "d", nombre: "Dulce", precio: 150, porcentaje: 7 }] } }).ok).toBe(false);
  });
});
