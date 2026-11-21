import { describe, expect, it } from "vitest";
import { AVISO_VISTA_PREVIA, primeraRespuestaCuenta, textoReglas } from "./reglas";

describe("reglas visibles antes de jugar", () => {
  it("explica las pistas solo en tarjetas de sonido", () => {
    expect(textoReglas("clasificar", "practica", "tablero", "sonido")).toContain("abrir su pista sin perder puntos");
    expect(textoReglas("clasificar", "vista-previa", "tablero", "sonido")).toContain("escuchar cada tarjeta de nuevo");
    expect(textoReglas("clasificar", "practica", "tablero")).not.toContain("pista");
  });
  it("explica la primera ubicación solo en la presentación de parejas", () => {
    expect(primeraRespuestaCuenta("clasificar", "parejas")).toBe(true);
    expect(textoReglas("clasificar", "practica", "parejas")).toContain("la primera ubicación de cada objeto cuenta");
    expect(textoReglas("clasificar", "practica", "parejas")).toContain("Puedes corregir");
    expect(primeraRespuestaCuenta("clasificar")).toBe(false);
    expect(textoReglas("clasificar")).not.toContain("primera ubicación");
  });
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

describe("separar", () => {
  it("explica un intento y revelado", () => {
    expect(textoReglas("separar")).toContain("cada palabra tiene un intento");
    expect(textoReglas("separar")).toContain("separación correcta");
  });
});

describe("modo vista previa", () => {
  it("explica la primera ubicación de parejas sin indicar práctica libre", () => {
    expect(textoReglas("clasificar", "vista-previa", "parejas")).toBe(
      `${AVISO_VISTA_PREVIA} La primera ubicación de cada objeto cuenta para las estrellas.`,
    );
  });
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

describe("formar", () => {
  it("explica reintentos y punto del primer intento", () => {
    expect(primeraRespuestaCuenta("formar")).toBe(true);
    expect(textoReglas("formar")).toContain("primera respuesta");
    expect(textoReglas("formar")).toContain("puedes corregir");
  });
});

it("taller-comparar anuncia que cuenta la primera respuesta", () => {
  expect(primeraRespuestaCuenta("taller-comparar")).toBe(true);
  expect(textoReglas("taller-comparar")).toContain("primera respuesta");
});
