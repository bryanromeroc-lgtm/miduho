import { describe, expect, it } from "vitest";
import { destinoInterno } from "./destino";

describe("destino tras login", () => {
  it("acepta una ruta interna y conserva path, query y hash", () => {
    expect(destinoInterno("/clases")).toBe("/clases");
    expect(destinoInterno("/admin/usuarios?pagina=2&orden=nombre#tabla")).toBe(
      "/admin/usuarios?pagina=2&orden=nombre#tabla",
    );
    expect(destinoInterno("/cuenta/contrasena")).toBe("/cuenta/contrasena");
    expect(destinoInterno("/")).toBe("/");
  });

  it("rechaza URL absolutas y con esquema", () => {
    expect(destinoInterno("https://evil.example/")).toBeNull();
    expect(destinoInterno("http://evil.example")).toBeNull();
    expect(destinoInterno("javascript:alert(1)")).toBeNull();
    expect(destinoInterno("data:text/html,x")).toBeNull();
    expect(destinoInterno("evil.example")).toBeNull();
  });

  it("rechaza //host (protocolo-relativo)", () => {
    expect(destinoInterno("//evil.example")).toBeNull();
    expect(destinoInterno("//evil.example/clases")).toBeNull();
    expect(destinoInterno("/.//evil.example")).toBeNull();
    expect(destinoInterno("/..//evil.example")).toBeNull();
  });

  it("rechaza /\\host y cualquier barra invertida", () => {
    // El parser WHATWG trata `\` como `/`: `/\evil.example` sale del origen.
    expect(new URL("/\\evil.example", "https://miduho.test").host).toBe("evil.example");
    expect(destinoInterno("/\\evil.example")).toBeNull();
    expect(destinoInterno("\\\\evil.example")).toBeNull();
    expect(destinoInterno("/\\/evil.example")).toBeNull();
    expect(destinoInterno("/clases\\otra")).toBeNull();
  });

  it("rechaza caracteres de control que el parser elimina", () => {
    expect(destinoInterno("/\t/evil.example")).toBeNull();
    expect(destinoInterno("/\n/evil.example")).toBeNull();
    expect(destinoInterno("/\r\\evil.example")).toBeNull();
  });

  it("sin destino utilizable devuelve null (se usa el inicio del contexto)", () => {
    expect(destinoInterno(null)).toBeNull();
    expect(destinoInterno(undefined)).toBeNull();
    expect(destinoInterno("")).toBeNull();
  });
});
