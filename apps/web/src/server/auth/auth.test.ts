import { describe, expect, it } from "vitest";
import {
  generarTokenRestablecimiento,
  hashearContrasena,
  hashearToken,
  verificarContrasena,
} from "./contrasena";
import { esquemaLogin, esquemaRestablecer } from "./esquemas";
import { ControlIntentos } from "./intentos";

describe("contraseñas", () => {
  it("hashea con bcrypt y verifica", async () => {
    const hash = await hashearContrasena("clave-de-prueba-1", 4);
    expect(hash).not.toContain("clave-de-prueba-1");
    expect(hash.startsWith("$2")).toBe(true);
    expect(await verificarContrasena("clave-de-prueba-1", hash)).toBe(true);
    expect(await verificarContrasena("otra-clave-1", hash)).toBe(false);
  });
});

describe("token de recuperación", () => {
  it("es aleatorio y se guarda solo como SHA-256", () => {
    const a = generarTokenRestablecimiento();
    const b = generarTokenRestablecimiento();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(hashearToken(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashearToken(a)).toBe(hashearToken(a));
    expect(hashearToken(a)).not.toBe(a);
  });
});

describe("esquemas", () => {
  it("normaliza el correo del login", () => {
    const r = esquemaLogin.parse({ correo: "  Docente@Ejemplo.TEST ", contrasena: "x" });
    expect(r.correo).toBe("docente@ejemplo.test");
  });
  it("rechaza correo inválido y contraseña vacía", () => {
    expect(esquemaLogin.safeParse({ correo: "no-es-correo", contrasena: "" }).success).toBe(false);
  });
  it("exige política mínima y confirmación igual", () => {
    const token = "t".repeat(43);
    expect(esquemaRestablecer.safeParse({ token, contrasena: "corta1", confirmacion: "corta1" }).success).toBe(false);
    expect(esquemaRestablecer.safeParse({ token, contrasena: "sinnumeros", confirmacion: "sinnumeros" }).success).toBe(false);
    expect(esquemaRestablecer.safeParse({ token, contrasena: "valida12345", confirmacion: "distinta123" }).success).toBe(false);
    expect(esquemaRestablecer.safeParse({ token, contrasena: "valida12345", confirmacion: "valida12345" }).success).toBe(true);
  });
});

describe("bloqueo por intentos", () => {
  it("bloquea tras N fallos y libera al vencer el bloqueo", () => {
    let t = 0;
    const c = new ControlIntentos(() => t, 3, 60_000, 30_000);
    c.registrarFallo("A@x.test");
    c.registrarFallo("a@x.test");
    expect(c.estaBloqueado("a@x.test")).toBe(false);
    c.registrarFallo("a@x.test");
    expect(c.estaBloqueado("a@x.test")).toBe(true);
    t = 30_001;
    expect(c.estaBloqueado("a@x.test")).toBe(false);
  });
  it("reinicia el conteo fuera de la ventana y al limpiar", () => {
    let t = 0;
    const c = new ControlIntentos(() => t, 2, 1_000, 5_000);
    c.registrarFallo("b@x.test");
    t = 2_000;
    c.registrarFallo("b@x.test");
    expect(c.estaBloqueado("b@x.test")).toBe(false);
    c.limpiar("b@x.test");
    c.registrarFallo("b@x.test");
    expect(c.estaBloqueado("b@x.test")).toBe(false);
  });
});
