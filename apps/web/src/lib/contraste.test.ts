import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MATERIAS_CON_FAMILIA,
  PARES_DECLARADOS,
  UMBRAL_AA,
  cumpleAA,
  luminancia,
  razonContraste,
  tokensDeHoja,
} from "./contraste";

const css = readFileSync(fileURLToPath(new URL("../styles/globals.css", import.meta.url)), "utf8");
const tokens = tokensDeHoja(css);
const color = (nombre: string) => {
  const v = tokens.get(nombre);
  if (!v) throw new Error(`Token sin valor en globals.css: ${nombre}`);
  return v;
};

describe("contraste WCAG", () => {
  it("calcula la razón de referencia", () => {
    expect(razonContraste("#000", "#fff")).toBeCloseTo(21, 5);
    expect(razonContraste("#fff", "#fff")).toBe(1);
    expect(luminancia("#ffffff")).toBe(1);
  });

  it("rechaza colores que no son hexadecimales", () => {
    expect(() => luminancia("rojo")).toThrow();
  });

  it("texto blanco sobre el cielo y el pino del escudo no alcanza AA", () => {
    expect(cumpleAA("#ffffff", "#00adef")).toBe(false);
    expect(cumpleAA("#ffffff", "#01a451")).toBe(false);
  });
});

describe("tokens de globals.css", () => {
  it("la tinta de contorno es #1b2440", () => {
    expect(color("--tinta")).toBe("#1b2440");
  });

  it("cada materia tiene su familia completa", () => {
    for (const m of MATERIAS_CON_FAMILIA) {
      for (const parte of ["marco", "cinta", "cielo", "rayo", "suelo"]) {
        expect(color(`--${m}-${parte}`), `--${m}-${parte}`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it.each(PARES_DECLARADOS)("$texto sobre $fondo ($uso)", ({ texto, fondo, tipo }) => {
    const razon = razonContraste(color(texto), color(fondo));
    expect(razon, `${color(texto)} / ${color(fondo)} = ${razon.toFixed(2)}`).toBeGreaterThanOrEqual(UMBRAL_AA[tipo]);
  });
});
