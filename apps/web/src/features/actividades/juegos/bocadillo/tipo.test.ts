import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { bocadillo, mcm, solucion } from "./tipo";

const r = (id: string) => ({ id, a: [2, 3] as [number, number], b: [3, 4] as [number, number], cortes: [7, 12, 10] });

describe("bocadillo", () => {
  it("encuentra el corte común y los numeradores equivalentes", () => {
    expect(solucion(r("a"))).toEqual({ corte: 12, a: 8, b: 9 });
    expect(mcm(4, 6)).toBe(12);
  });

  it("da un punto por el corte y uno por cada numerador", () => {
    const c = { rondas: [r("a"), r("b"), r("c")] };
    const res = calificarIntento(bocadillo, c, { a: { corte: 12, a: 8, b: 9 }, b: { corte: 7, a: 8, b: 9 }, c: { corte: 12, a: 6, b: null } });
    expect(res.items.map((i) => i.puntaje)).toEqual([3, 2, 1]);
    expect(bocadillo.repaso(c, "a").solucion).toBe("2/3 = 8/12 y 3/4 = 9/12");
  });

  it("exige un solo corte común entre las opciones", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "bocadillo", grado: 5, instruccion: "Haz algo.", tema: "Fracciones" };
    expect(leerActividad({ ...base, contenido: { rondas: [r("a"), r("b"), { ...r("c"), cortes: [12, 24] }] } }).ok).toBe(false);
  });
});
