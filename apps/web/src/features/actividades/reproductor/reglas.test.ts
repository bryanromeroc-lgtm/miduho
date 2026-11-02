import { describe, expect, it } from "vitest";
import { primeraRespuestaCuenta, textoReglas } from "./reglas";

describe("reglas visibles antes de jugar", () => {
  it.each(["angulos", "rectas", "bocadillo", "sello", "operaciones"])("%s explica el primer intento", (tipo) => {
    expect(primeraRespuestaCuenta(tipo)).toBe(true);
    expect(textoReglas(tipo)).toContain("primera respuesta");
    expect(textoReglas(tipo)).toContain("no se guarda");
  });

  it.each(["memoria", "sopa-letras", "seleccion-multiple"])("%s no atribuye una regla ajena", (tipo) => {
    expect(primeraRespuestaCuenta(tipo)).toBe(false);
    expect(textoReglas(tipo)).not.toContain("primera respuesta");
    expect(textoReglas(tipo)).toContain("no se guarda");
  });
});
