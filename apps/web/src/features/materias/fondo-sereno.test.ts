import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MATERIAS_CON_FAMILIA, tokensDeHoja } from "@/lib/contraste";
import { COLORES_FONDO } from "./fondo-sereno";

/** Saturación HSV (0–1): cuánto color tiene, sin importar lo claro. */
function saturacion(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

describe("fondo sereno", () => {
  it("tiene menos saturación media que cualquier marco de cromo", () => {
    const css = readFileSync(fileURLToPath(new URL("../../styles/globals.css", import.meta.url)), "utf8");
    const tokens = tokensDeHoja(css);
    const fondo = Object.values(COLORES_FONDO);
    const media = fondo.reduce((t, c) => t + saturacion(c), 0) / fondo.length;
    for (const m of MATERIAS_CON_FAMILIA) {
      const marco = tokens.get(`--${m}-marco`)!;
      expect(saturacion(marco), `${m}: ${marco}`).toBeGreaterThan(media);
    }
  });
});
