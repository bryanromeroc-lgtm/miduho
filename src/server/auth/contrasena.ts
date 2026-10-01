import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

/** Costo bcrypt (RNF-SEG-2). */
export const COSTO_BCRYPT = 12;

/** Vigencia del enlace de recuperación (HU-02): 24 horas. */
export const VIGENCIA_RESTABLECIMIENTO_MS = 24 * 60 * 60 * 1000;

export function hashearContrasena(plana: string, costo = COSTO_BCRYPT) {
  return bcrypt.hash(plana, costo);
}

export function verificarContrasena(plana: string, hash: string) {
  return bcrypt.compare(plana, hash);
}

/**
 * Hash válido de una contraseña que nadie conoce. Se compara contra él cuando
 * el correo no existe, para que el tiempo de respuesta no revele si la cuenta
 * existe (HU-01: error genérico).
 */
export const HASH_SENUELO = bcrypt.hashSync("senuelo-sin-cuenta", COSTO_BCRYPT);

/** Token de recuperación: 32 bytes aleatorios en base64url (solo viaja por correo). */
export function generarTokenRestablecimiento() {
  return randomBytes(32).toString("base64url");
}

/** Lo que se guarda en la base: SHA-256 del token, nunca el token plano. */
export function hashearToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
