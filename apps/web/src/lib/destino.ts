/*
  Destino de retorno tras el login (`?desde=`), validado contra redirecciones
  abiertas. Lógica pura: la usa la server action de ingreso y la cubren pruebas.
*/

/** Origen ficticio solo para resolver la ruta; nunca sale del servidor. */
const ORIGEN = "http://miduho.invalid";

/**
 * Devuelve `path + query + hash` si `valor` es una ruta interna del mismo
 * origen; si no, `null`. Rechaza URL absolutas o con esquema, `//host`,
 * cualquier barra invertida (`/\host` lo normalizan los navegadores como host
 * externo) y caracteres de control (el parser de URL elimina tabuladores y
 * saltos de línea, con lo que `/\t/host` acabaría siendo `//host`).
 */
export function destinoInterno(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  if (!valor.startsWith("/") || valor.startsWith("//")) return null;
  if (valor.includes("\\")) return null;
  if (/[\u0000-\u001F\u007F]/.test(valor)) return null;

  let url: URL;
  try {
    url = new URL(valor, ORIGEN);
  } catch {
    return null;
  }
  if (url.origin !== ORIGEN) return null;

  const destino = `${url.pathname}${url.search}${url.hash}`;
  // `/.//host` o `/..//host` se normalizan a `//host`: protocolo-relativo, externo.
  if (destino.startsWith("//")) return null;
  return destino;
}
