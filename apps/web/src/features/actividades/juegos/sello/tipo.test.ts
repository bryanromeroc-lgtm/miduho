import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { sello } from "./tipo";

const af = (id: string, verdadera: boolean) => ({ id, texto: `Afirmación ${id}`, verdadera, explicacion: "Porque sí." });
const contenido = { escena: "bodega" as const, afirmaciones: [af("a", true), af("b", false), af("c", true), af("d", false)] };

describe("sello", () => {
  it("compara verdadero o falso", () => {
    const r = calificarIntento(sello, contenido, { a: true, b: true, c: true, d: false });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true, true]);
    expect(sello.repaso(contenido, "b").solucion).toBe("Falso. Porque sí.");
  });

  it("exige verdaderas y falsas, y figuras dibujables", () => {
    const base = { slug: "x-y", titulo: "Prueba", tipo: "sello", grado: 5, instruccion: "Haz algo.", tema: "Potencias" };
    expect(leerActividad({ ...base, contenido: { ...contenido, afirmaciones: contenido.afirmaciones.map((a) => ({ ...a, verdadera: true })) } }).ok).toBe(false);
    expect(leerActividad({ ...base, contenido: { ...contenido, afirmaciones: [...contenido.afirmaciones, { ...af("e", true), figura: { tipo: "cubo", lado: 9 } }] } }).ok).toBe(false);
    expect(leerActividad({ ...base, contenido: { ...contenido, afirmaciones: [...contenido.afirmaciones, { ...af("e", true), figura: { tipo: "cubo", lado: 3 } }] } }).ok).toBe(true);
  });
});
