import { describe, expect, it } from "vitest";
import { intentosDisponibles, leerResultado, resumenActividad, textoDisponibles } from "./desempeno";

describe("intentos", () => {
  it("cuenta los disponibles sobre un máximo de 3", () => {
    expect([0, 1, 2, 3, 4].map((u) => intentosDisponibles(u))).toEqual([3, 2, 1, 0, 0]);
  });

  it("forma textual accesible de la tarjeta", () => {
    expect(resumenActividad(2, 2)).toBe("2 de 3 estrellas · 1 intento disponible");
    expect(resumenActividad(null, 0)).toBe("Sin intentos todavía · 3 intentos disponibles");
  });

  it("con los 3 intentos usados no quedan disponibles", () => {
    expect(textoDisponibles(3)).toBe("Sin intentos disponibles");
  });
});

describe("resultado", () => {
  it("un intento que mejora se celebra", () => {
    const r = leerResultado({ estrellas: 3, mejorAnterior: 2, usados: 2, materiaDominada: true });
    expect(r).toMatchObject({ mejora: true, titulo: "¡Superaste tu mejor resultado!", quedan: 1, puedeReintentar: true, cromoBrilla: true });
  });

  it("un intento que no mejora conserva el mejor, sin mensaje de fracaso", () => {
    const r = leerResultado({ estrellas: 1, mejorAnterior: 2, usados: 3 });
    expect(r.mejora).toBe(false);
    expect(r.detalle).toBe("Esta vez fue 1 estrella. Se conserva tu mejor resultado: 2 estrellas.");
    expect(r.puedeReintentar).toBe(false);
    expect(`${r.titulo} ${r.detalle}`).not.toMatch(/fall|perd|mal|error/i);
  });

  it("el primer intento siempre cuenta como mejora", () => {
    expect(leerResultado({ estrellas: 1, mejorAnterior: null, usados: 1 })).toMatchObject({ mejora: true, titulo: "¡Lo lograste!" });
  });

  it("el cromo solo brilla si la materia queda dominada con este intento", () => {
    expect(leerResultado({ estrellas: 3, mejorAnterior: 3, usados: 2, materiaDominada: true }).cromoBrilla).toBe(false);
  });
});
