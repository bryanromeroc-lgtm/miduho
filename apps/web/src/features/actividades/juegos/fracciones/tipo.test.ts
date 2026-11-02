import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { describirFigura, diagnosticar, enPalabras, tallerFracciones, unidadesDe, type ContenidoTaller, type RondaTaller } from "./tipo";

const c: ContenidoTaller = {
  rondas: [
    { id: "a", reto: "construir", forma: "circulo", fraccion: [3, 4] },
    { id: "b", reto: "leer", forma: "barra", fraccion: [2, 4] },
    { id: "c", reto: "leer", forma: "recta", fraccion: [5, 3] },
    {
      id: "d",
      reto: "comparar",
      fraccion: [2, 3],
      opciones: [
        { forma: "barra", fraccion: [2, 5] },
        { forma: "circulo", fraccion: [3, 2] },
        { forma: "recta", fraccion: [4, 6] },
      ],
    },
  ],
};

const base = { slug: "x-y", titulo: "Prueba", tipo: "taller-fracciones", grado: 5, instruccion: "Haz algo.", tema: "Fracciones" };

describe("taller-fracciones", () => {
  it("construir pide la fracción exacta; leer acepta una equivalente", () => {
    const r = calificarIntento(tallerFracciones, c, { a: { n: 6, d: 8 }, b: { n: 1, d: 2 }, c: { n: 5, d: 3 }, d: { opcion: 2 } });
    expect(r.items.map((i) => i.correcta)).toEqual([false, true, true, true]);
    expect(calificarIntento(tallerFracciones, c, { a: { n: 3, d: 4 } }).items[0].correcta).toBe(true);
  });

  it("una respuesta de otra forma vale 0", () => {
    const r = calificarIntento(tallerFracciones, c, { a: { opcion: 0 }, d: { n: 2, d: 3 } });
    expect(r.puntaje).toBe(0);
  });

  it("repaso dice qué se pedía y la solución", () => {
    expect(tallerFracciones.repaso(c, "a")).toEqual({ pregunta: "Arma 3/4 con círculos", solucion: "3/4" });
    expect(tallerFracciones.repaso(c, "d").solucion).toBe("la recta numérica con 4/6");
  });

  it("valida el archivo y rechaza comparar con dos opciones correctas", () => {
    expect(leerActividad({ ...base, contenido: c }).ok).toBe(true);
    const mal = structuredClone(c);
    const comp = mal.rondas[3] as Extract<RondaTaller, { reto: "comparar" }>;
    comp.opciones[0].fraccion = [2, 3];
    expect(leerActividad({ ...base, contenido: mal }).ok).toBe(false);
  });

  it("rechaza más de tres unidades o más de 8 partes", () => {
    const mal = structuredClone(c);
    mal.rondas[0].fraccion = [13, 4];
    expect(leerActividad({ ...base, contenido: mal }).ok).toBe(false);
    mal.rondas[0].fraccion = [3, 9];
    expect(leerActividad({ ...base, contenido: mal }).ok).toBe(false);
  });
});

describe("diagnóstico del error", () => {
  const construir = c.rondas[0];
  const recta: RondaTaller = { id: "r", reto: "construir", forma: "recta", fraccion: [3, 4] };

  it.each([
    [{ n: 3, d: 1 }, "sin-pintar"],
    [{ n: 4, d: 3 }, "invertida"],
    [{ n: 3, d: 6 }, "partes"],
    [{ n: 2, d: 4 }, "pintadas"],
    [{ n: 5, d: 7 }, "otra"],
  ] as const)("círculos: %o → %s", (resp, esperado) => {
    expect(diagnosticar(construir, resp)).toBe(esperado);
  });

  it("en la recta reconoce contar rayitas en vez de saltos", () => {
    expect(diagnosticar(recta, { n: 3, d: 5 })).toBe("marcas");
    expect(diagnosticar(construir, { n: 3, d: 5 })).toBe("partes");
  });

  it("en comparar reconoce el mismo numerador y la fracción invertida", () => {
    const comp = c.rondas[3];
    expect(diagnosticar(comp, { opcion: 0 })).toBe("mismo-numerador");
    expect(diagnosticar(comp, { opcion: 1 })).toBe("invertida");
  });
});

describe("lectura de fracciones", () => {
  it.each([
    [1, 2, "un medio"],
    [3, 4, "tres cuartos"],
    [5, 3, "cinco tercios"],
    [7, 8, "siete octavos"],
    [1, 1, "un entero"],
    [2, 1, "dos enteros"],
    [0, 6, "cero sextos"],
  ])("%i/%i se lee «%s»", (n, d, texto) => {
    expect(enPalabras(n, d)).toBe(texto);
  });

  it("unidades a dibujar y descripción para el lector", () => {
    expect([unidadesDe(0, 4), unidadesDe(4, 4), unidadesDe(5, 4), unidadesDe(12, 4)]).toEqual([1, 1, 2, 3]);
    expect(describirFigura("barra", 1, 3)).toBe("Barras partidas en 3 partes iguales, con 1 parte pintada");
  });
});
