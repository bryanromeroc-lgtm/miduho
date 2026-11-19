import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { GoogleRevocadoError, nuevoDesafio, refrescarToken, tienePermisoDrive, urlAutorizacion } from "./oauth";

const previo = { ...process.env };
afterEach(() => { process.env = { ...previo }; vi.unstubAllGlobals(); });
describe("OAuth de Google", () => {
  it("pide solo los permisos definidos con PKCE S256", () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-prueba";
    process.env.GOOGLE_CLIENT_SECRET = "secreto-prueba";
    process.env.AUTH_URL = "https://miduho.test";
    const desafio = nuevoDesafio();
    const url = new URL(urlAutorizacion(desafio.state, desafio.challenge));
    expect(url.searchParams.get("scope")?.split(" ")).toEqual(["https://www.googleapis.com/auth/drive.file", "openid", "email"]);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBe(desafio.state);
    expect(url.searchParams.get("redirect_uri")).toBe("https://miduho.test/api/integraciones/google/retorno");
    expect(tienePermisoDrive("openid email")).toBe(false);
  });
  it("identifica invalid_grant al refrescar", async () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-prueba";
    process.env.GOOGLE_CLIENT_SECRET = "secreto-prueba";
    process.env.AUTH_URL = "https://miduho.test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "invalid_grant" }), { status: 400 })));
    await expect(refrescarToken("token-de-prueba")).rejects.toBeInstanceOf(GoogleRevocadoError);
  });
});
