import { describe, expect, it } from "vitest";
import { describirTarjeta } from "./acceso";

describe("descripción accesible de los planos", () => {
  it("explica las marcas de los tres tipos de línea sin depender del SVG", () => {
    expect(describirTarjeta({ figura: "linea", tipo: "recta", giro: 0 })).toContain("flechas en los dos extremos");
    expect(describirTarjeta({ figura: "linea", tipo: "semirrecta", giro: 0 })).toContain("un punto al inicio y una flecha");
    expect(describirTarjeta({ figura: "linea", tipo: "segmento", giro: 0 })).toContain("un punto en cada extremo");
  });

  it("permite comparar rectas que no se cruzan en la tarjeta", () => {
    const paralelas = describirTarjeta({ figura: "par", relacion: "paralelas", giro: 30, cruceVisible: true });
    const secantes = describirTarjeta({ figura: "par", relacion: "secantes", giro: 30, cruceVisible: false });
    expect(paralelas).toContain("azul va a 30 grados y el naranja a 30 grados");
    expect(secantes).toContain("azul va a 30 grados y el naranja a 18 grados");
    expect(secantes).toContain("No se cruzan dentro del dibujo");
    expect(paralelas).not.toContain("paralelas");
    expect(secantes).not.toContain("secantes");
  });

  it("da la diferencia de orientación de un cruce recto sin nombrar la respuesta", () => {
    const descripcion = describirTarjeta({ figura: "par", relacion: "perpendiculares", giro: 0, cruceVisible: true });
    expect(descripcion).toContain("azul va a 0 grados y el naranja a 90 grados");
    expect(descripcion).toContain("Se cruzan dentro del dibujo");
    expect(descripcion).not.toContain("perpendiculares");
  });
});
