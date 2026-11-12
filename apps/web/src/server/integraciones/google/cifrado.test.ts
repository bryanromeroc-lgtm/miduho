import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { cifrar, descifrar, integracionConfigurada } from "./cifrado";

const anterior = process.env.CLAVE_CIFRADO_INTEGRACIONES;
afterEach(() => { if (anterior === undefined) delete process.env.CLAVE_CIFRADO_INTEGRACIONES; else process.env.CLAVE_CIFRADO_INTEGRACIONES = anterior; });
describe("cifrado de integraciones", () => {
  it("cifra con IV aleatorio y verifica autenticidad", () => {
    process.env.CLAVE_CIFRADO_INTEGRACIONES = Buffer.alloc(32, 7).toString("base64");
    const a = cifrar("secreto de prueba");
    const b = cifrar("secreto de prueba");
    expect(a).toMatch(/^v1:/);
    expect(a).not.toBe(b);
    expect(descifrar(a)).toBe("secreto de prueba");
    expect(() => descifrar(a.replace(/.$/, "A"))).toThrow();
  });
  it("deshabilita la integración sin clave", () => {
    delete process.env.CLAVE_CIFRADO_INTEGRACIONES;
    expect(integracionConfigurada()).toBe(false);
    expect(() => cifrar("x")).toThrow();
  });
});
