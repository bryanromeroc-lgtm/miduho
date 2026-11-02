import { describe, expect, it } from "vitest";
import { describirRayo, describirTransportador } from "./acceso";

describe("lectura no visual de ángulos", () => {
  it("identifica el cero de la escala correcta y permite contar sus marcas", () => {
    expect(describirTransportador(55, "derecha")).toContain("escala exterior");
    expect(describirTransportador(55, "derecha")).toContain("5 intervalos de diez y la marca intermedia siguiente");
    expect(describirTransportador(130, "izquierda")).toContain("escala interior");
    expect(describirTransportador(130, "izquierda")).toContain("13 intervalos de diez desde ese cero");
  });

  it("permite comparar rayos candidatos con la mitad del ángulo", () => {
    expect(describirRayo("B", 40)).toBe("Rayo B: se separa 40 grados del primer lado.");
  });
});
