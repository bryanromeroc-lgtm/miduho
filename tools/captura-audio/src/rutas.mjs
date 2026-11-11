import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Raíz del repositorio (tools/captura-audio/src → ../../..). */
export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const PUBLICO = join(RAIZ, "apps", "web", "public");

export function carpetaReferencia(slug) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`Slug inválido «${slug}»: usa <plataforma>-<juego> en minúsculas con guiones`);
  return join(RAIZ, "content", "referencias", slug);
}
