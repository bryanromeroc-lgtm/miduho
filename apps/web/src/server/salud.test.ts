import { describe, expect, it } from "vitest";
import { comprobarSalud } from "./salud";

describe("chequeo de salud", () => {
  it("responde 200 {estado: ok} cuando la base contesta", async () => {
    const r = await comprobarSalud(async () => [{ "?column?": 1 }]);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ estado: "ok" });
    expect(r.headers.get("cache-control")).toBe("no-store");
  });

  it("responde 503 sin detalles cuando la consulta falla", async () => {
    const r = await comprobarSalud(async () => {
      throw new Error("connect ECONNREFUSED 10.0.0.5:5432 password=secreto");
    });
    expect(r.status).toBe(503);
    expect(await r.text()).not.toMatch(/ECONNREFUSED|5432|secreto/);
  });

  it("responde 503 al vencer el tope aunque la base no conteste nunca", async () => {
    const inicio = Date.now();
    const r = await comprobarSalud(() => new Promise(() => {}), 50);
    expect(r.status).toBe(503);
    expect(Date.now() - inicio).toBeLessThan(1_000);
  });
});
