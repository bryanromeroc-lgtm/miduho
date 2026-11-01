import { describe, expect, it } from "vitest";
import { ESCENAS } from "@/lib/escenas";
import { kitDe } from ".";
import { DECLARACIONES, PROHIBIDOS, idsDe } from "./kits";

const declaradas = Object.values(DECLARACIONES);

describe("catálogo de kits temáticos (D4)", () => {
  it.each(declaradas.map((k) => [k.escena, k] as const))("%s: mínimos del kit", (_, k) => {
    expect(k.sueltos.length).toBeGreaterThanOrEqual(3);
    expect(k.marcas.length).toBeGreaterThanOrEqual(3);
    expect(k.cabecera.length).toBeGreaterThanOrEqual(2);
    expect(k.utileria.clip && k.utileria.cinta && k.utileria.chinche).toBeTruthy();
    expect(k.marco).toBeTruthy();
  });

  it.each(declaradas.map((k) => [k.escena, k] as const))("%s: cada elemento declarado tiene su arte", (escena, k) => {
    const { arte } = kitDe(escena);
    for (const id of [...k.cabecera, ...k.sueltos, k.utileria.clip, k.utileria.chinche])
      expect(arte.piezas[id], `${escena}/${id}`).toBeDefined();
    for (const id of k.marcas) expect(arte.marcas[id], `${escena}/${id}`).toBeDefined();
  });

  it("temática estricta: ningún id se repite entre kits (salvo el genérico)", () => {
    const vistos = new Map<string, string>();
    for (const k of declaradas.filter((k) => k.escena !== "generica")) {
      for (const id of new Set(idsDe(k))) {
        expect(vistos.get(id), `«${id}» está en ${vistos.get(id)} y en ${k.escena}`).toBeUndefined();
        vistos.set(id, k.escena);
      }
    }
  });

  it("ningún kit usa bosque, madera ni paisajes", () => {
    for (const k of declaradas)
      for (const id of idsDe(k))
        expect(
          PROHIBIDOS.some((p) => id.includes(p)),
          `${k.escena}/${id}`,
        ).toBe(false);
  });

  it("las 11 escenas tienen kit propio con su arte", () => {
    for (const e of ESCENAS) expect(kitDe(e).escena).toBe(e);
  });

  it("cada cinta y cada marco tienen color", () => {
    for (const e of ESCENAS) {
      const { arte } = kitDe(e);
      expect(arte.cinta.color, e).toMatch(/^#[0-9a-f]{6}$/i);
      expect(arte.marco.ancho, e).toBeGreaterThan(0);
    }
  });
});
