import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { razonContraste } from "@/lib/contraste";

/*
  Los colores de acierto y error son los únicos que el reproductor añade a
  los tokens de la materia (que ya prueba tokens.test.ts): sus pares de
  texto deben cumplir 4.5:1.
*/
const css = readFileSync(join(__dirname, "reproductor.module.css"), "utf8");
const color = (nombre: string) => css.match(new RegExp(`--${nombre}:\\s*(#[0-9a-f]{6})`))?.[1] ?? "";

describe("colores de retroalimentación", () => {
  it.each(["ok", "no"])("%s: la tinta sobre su fondo cumple 4.5:1", (tono) => {
    expect(razonContraste(color(`${tono}-tinta`), color(`${tono}-fondo`))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["ok", "no"])("%s: la tinta sobre el blanco de la mesa cumple 4.5:1", (tono) => {
    expect(razonContraste(color(`${tono}-tinta`), "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("respuestas del quiz", () => {
  it("mantiene contraste AA en los cuatro pares de color de opción", () => {
    const pares = [...css.matchAll(/--quiz-color:\s*(#[0-9a-f]{6});\s*--quiz-tinta:\s*(#[0-9a-f]{6})/g)];
    expect(pares).toHaveLength(4);
    for (const [, fondo, tinta] of pares) expect(razonContraste(tinta, fondo)).toBeGreaterThanOrEqual(4.5);
  });
});
