import { afterEach, describe, expect, it, vi } from "vitest";
import { conSsl, urlBaseDatos } from "./entorno";

const URL = "postgresql://u:p@db.example:5432/miduho";

afterEach(() => vi.unstubAllEnvs());

describe("conSsl", () => {
  it("no toca la URL sin DATABASE_SSL", () => {
    vi.stubEnv("DATABASE_SSL", "");
    expect(conSsl(URL)).toBe(URL);
  });

  it("añade sslmode=no-verify para pg y require para la CLI de Prisma", () => {
    vi.stubEnv("DATABASE_SSL", "no-verify");
    expect(conSsl(URL)).toBe(`${URL}?sslmode=no-verify`);
    expect(conSsl(URL, "require")).toBe(`${URL}?sslmode=require`);
    expect(conSsl(`${URL}?connect_timeout=5`)).toBe(`${URL}?connect_timeout=5&sslmode=no-verify`);
  });

  it("respeta un sslmode que ya trae la URL", () => {
    vi.stubEnv("DATABASE_SSL", "no-verify");
    expect(conSsl(`${URL}?sslmode=disable`)).toBe(`${URL}?sslmode=disable`);
  });
});

describe("urlBaseDatos", () => {
  it("falla nombrando la variable si falta DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => urlBaseDatos()).toThrow(/DATABASE_URL/);
  });

  it("aplica DATABASE_SSL", () => {
    vi.stubEnv("DATABASE_URL", URL);
    vi.stubEnv("DATABASE_SSL", "no-verify");
    expect(urlBaseDatos()).toBe(`${URL}?sslmode=no-verify`);
  });
});
