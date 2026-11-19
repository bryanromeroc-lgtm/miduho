import { describe, expect, it } from "vitest";
import { TITULOS } from "@/data/demo";
import { contextoVisible } from "@/lib/navegacion";
import { titulosVisibles } from "./visibles";

describe("títulos visibles en la Biblioteca", () => {
  const guias = TITULOS.filter((t) => t.soloDocente);

  it("hay títulos solo para docentes en el catálogo", () => {
    expect(guias.length).toBeGreaterThan(0);
  });

  it("el contexto ADMIN (la coordinadora) ve las guías, como la docente", () => {
    const admin = titulosVisibles(TITULOS, contextoVisible("ADMIN", ["ADMIN"], "/biblioteca"));
    for (const g of guias) expect(admin).toContain(g);
    expect(titulosVisibles(TITULOS, "DOCENTE")).toEqual(TITULOS);
    // Una cuenta mixta en contexto ADMIN también.
    expect(titulosVisibles(TITULOS, contextoVisible("ADMIN", ["ADMIN", "DOCENTE"], "/biblioteca"))).toEqual(TITULOS);
  });

  it("el estudiante nunca ve los títulos solo para docentes", () => {
    expect(titulosVisibles(TITULOS, "ESTUDIANTE").some((t) => t.soloDocente)).toBe(false);
  });
});
