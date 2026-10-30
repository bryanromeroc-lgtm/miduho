import { describe, expect, it } from "vitest";
import { origenCoincideConHost } from "./http-acceso";

describe("protección CSRF", () => {
  it("acepta el origen del Host solicitado aunque el servidor esté ligado a 0.0.0.0", () => {
    expect(origenCoincideConHost("http://localhost:3113", "http:", "localhost:3113", "http://0.0.0.0:3113")).toBe(true);
    expect(origenCoincideConHost("http://192.168.1.20:3113", "http:", "192.168.1.20:3113", "http://0.0.0.0:3113")).toBe(true);
  });

  it("rechaza un origen ajeno y conserva la compatibilidad sin cabecera Origin", () => {
    expect(origenCoincideConHost("http://origen-ajeno.test", "http:", "192.168.1.20:3113", "http://0.0.0.0:3113")).toBe(false);
    expect(origenCoincideConHost(null, "http:", "192.168.1.20:3113", "http://0.0.0.0:3113")).toBe(true);
  });
});
