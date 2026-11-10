import { describe, expect, it } from "vitest";
import { AVISO_VISTA_PREVIA, primeraRespuestaCuenta, textoReglas } from "./reglas";

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

describe("modo vista previa", () => {
  it.each(["angulos", "memoria"])("%s dice que el resultado de la vista previa no se guarda", (tipo) => {
    expect(textoReglas(tipo, "vista-previa")).toContain("Vista previa: este resultado no se guarda");
    expect(textoReglas(tipo, "vista-previa")).not.toContain("Práctica libre");
  });

  it("conserva la regla de la primera respuesta y no cambia el modo por defecto", () => {
    expect(textoReglas("angulos", "vista-previa")).toContain("primera respuesta");
    expect(textoReglas("memoria")).toContain("Práctica libre");
    expect(AVISO_VISTA_PREVIA).toBe("Vista previa: este resultado no se guarda.");
  });
});
