import "server-only";
import { createHash, randomBytes } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = ["https://www.googleapis.com/auth/drive.file", "openid", "email"] as const;

export class GoogleRevocadoError extends Error {
  constructor() { super("Conexión de Google revocada"); this.name = "GoogleRevocadoError"; }
}

function configuracion() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const origen = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!clientId || !clientSecret || !origen) throw new Error("Google Drive no está configurado");
  return { clientId, clientSecret, redirectUri: new URL("/api/integraciones/google/retorno", origen).toString() };
}

export function nuevoDesafio() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export function urlAutorizacion(state: string, challenge: string): string {
  const { clientId, redirectUri } = configuracion();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: "code",
    scope: SCOPES.join(" "), access_type: "offline", prompt: "consent",
    state, code_challenge: challenge, code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

type RespuestaToken = { access_token: string; expires_in: number; refresh_token?: string; scope?: string; token_type?: string };
async function pedirToken(parametros: URLSearchParams): Promise<RespuestaToken> {
  const respuesta = await fetch(TOKEN_URL, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: parametros, cache: "no-store",
  });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({})) as { error?: string };
    if (datos.error === "invalid_grant") throw new GoogleRevocadoError();
    throw new Error("No se pudo conectar con Google");
  }
  return respuesta.json() as Promise<RespuestaToken>;
}

export async function intercambiarCodigo(code: string, verifier: string) {
  const { clientId, clientSecret, redirectUri } = configuracion();
  return pedirToken(new URLSearchParams({
    code, code_verifier: verifier, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirectUri, grant_type: "authorization_code",
  }));
}

export async function refrescarToken(refreshToken: string) {
  const { clientId, clientSecret } = configuracion();
  return pedirToken(new URLSearchParams({
    refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret,
    grant_type: "refresh_token",
  }));
}

export async function revocarToken(token: string): Promise<void> {
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }), cache: "no-store",
  });
}

export async function correoGoogle(accessToken: string): Promise<string> {
  const respuesta = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store",
  });
  if (!respuesta.ok) throw new Error("No se pudo verificar la cuenta de Google");
  const datos = await respuesta.json() as { email?: string; email_verified?: boolean };
  if (!datos.email || datos.email_verified !== true) throw new Error("La cuenta de Google no tiene un correo verificado");
  return datos.email;
}

export function tienePermisoDrive(scopes: string): boolean {
  return scopes.split(/\s+/).includes(SCOPES[0]);
}
