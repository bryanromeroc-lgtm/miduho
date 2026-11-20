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

describe("aventura narrada", () => {
  const sinCarga = {
    inicio: "Escucha el cuento completo.",
    final: "El cuento ha terminado.",
    escenas: ["a", "b", "c", "d"].map((id) => ({
      id, imagen: "/images/juegos/cuento/escena.webp", alt: "Paisaje junto al agua.",
      narracion: "La mirla llegó al agua.", pregunta: "¿Qué ocurrió aquí?",
      opciones: ["Llegó la mirla", "Salió el sol", "Cayó una hoja"], correcta: 0,
      pista: "Recuerda quién llegó.", explicacion: "La mirla llegó al agua.",
    })),
    secuencia: {
      consigna: "Ordena los tres momentos.", casillas: ["Inicio", "Nudo", "Desenlace"],
      items: [
        { id: "i", imagen: "/images/a.webp", alt: "Llegada al agua.", posicion: 0 },
        { id: "n", imagen: "/images/b.webp", alt: "Piedra sobre el agua.", posicion: 1 },
        { id: "f", imagen: "/images/c.webp", alt: "Agua que fluye.", posicion: 2 },
      ], pista: "Piensa qué pasó primero.", explicacion: "Primero llegaron, luego encontraron y al final resolvieron.",
    },
  };
  it("acepta cuento sin carga y exige alt cuando hay imagen", () => {
    expect(leerActividad({ ...archivo, contenido: sinCarga }).ok).toBe(true);
    const sinAlt = { ...sinCarga, escenas: [{ ...sinCarga.escenas[0], alt: undefined }, ...sinCarga.escenas.slice(1)] };
    expect(leerActividad({ ...archivo, contenido: sinAlt }).ok).toBe(false);
  });
  it("califica tres escenas y la secuencia como ítem adicional", () => {
    const contenido = aventura.esquemaContenido.parse(sinCarga);
    expect(aventura.items(contenido).map((i) => i.itemId)).toEqual(["a", "b", "c", "d", "secuencia"]);
    expect(calificarIntento(aventura, contenido, { a: 0, b: 1, c: 0, d: 0, secuencia: ["i", "n", "f"] }).puntaje).toBe(4);
    expect(calificarIntento(aventura, contenido, { secuencia: ["n", "i", "f"] }).puntaje).toBe(0);
  });
});
