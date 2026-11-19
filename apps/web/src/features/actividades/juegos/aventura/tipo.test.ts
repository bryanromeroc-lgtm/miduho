import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { aventura, cargaRestante, type ContenidoAventura } from "./tipo";

const escena = (id: string, correcta: number, entrega: number) => ({
  id,
  lugar: "tienda" as const,
  narracion: "Armi llega a la tienda.",
  pregunta: "¿Cuántos huevos entrega?",
  opciones: ["8", "16", "24", "48"],
  correcta,
  pista: "Reparte el total entre las partes.",
  explicacion: "48 ÷ 6 = 8.",
  entrega,
});

const c: ContenidoAventura = {
  carga: { objeto: "huevos", inicio: 48 },
  inicio: "Armi debe entregar los huevos.",
  final: "Armi terminó la entrega.",
  escenas: [escena("a", 1, 16), escena("b", 2, 24), escena("c", 0, 8), escena("d", 3, 0)],
};

const archivo = { slug: "x-y", titulo: "Prueba", tipo: "aventura", grado: 5, instruccion: "Ayuda a Armi.", tema: "Fracciones" };

describe("aventura", () => {
  it("vale 1 por escena acertada a la primera", () => {
    const r = calificarIntento(aventura, c, { a: 1, b: 0, c: 0, d: 3 });
    expect(r.items.map((i) => i.puntaje)).toEqual([1, 0, 1, 1]);
    expect(r.puntajeMaximo).toBe(4);
  });

  it("una escena sin responder o con una respuesta inválida vale 0", () => {
    expect(calificarIntento(aventura, c, { a: "x", b: -1 }).puntaje).toBe(0);
  });

  it("el repaso dice la pregunta y la opción correcta", () => {
    expect(aventura.repaso(c, "b")).toEqual({ pregunta: "¿Cuántos huevos entrega?", solucion: "24" });
  });

  it("calcula la carga que queda a lo largo de la historia", () => {
    expect([0, 1, 2, 3, 4].map((n) => cargaRestante(c, n))).toEqual([48, 32, 8, 0, 0]);
  });

  it("valida el archivo y rechaza una correcta inexistente, opciones repetidas y entregas de más", () => {
    expect(leerActividad({ ...archivo, contenido: c }).ok).toBe(true);
    expect(leerActividad({ ...archivo, contenido: { ...c, escenas: [escena("a", 7, 0), ...c.escenas.slice(1)] } }).ok).toBe(false);
    expect(leerActividad({ ...archivo, contenido: { ...c, escenas: [{ ...escena("a", 0, 0), opciones: ["8", "8"] }, ...c.escenas.slice(1)] } }).ok).toBe(false);
    expect(leerActividad({ ...archivo, contenido: { ...c, carga: { objeto: "huevos", inicio: 10 } } }).ok).toBe(false);
  });

  it("rechaza un dibujo de apoyo que no se parte en partes iguales", () => {
    const visual = { objeto: "huevos" as const, total: 25, den: 4, usos: [{ num: 1, nombre: "Una" }] };
    expect(leerActividad({ ...archivo, contenido: { ...c, escenas: [{ ...escena("a", 0, 0), visual }, ...c.escenas.slice(1)] } }).ok).toBe(false);
  });
});
