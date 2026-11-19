import { ErrorDominio } from "@/server/errores";

const ID_VIDEO = /^[A-Za-z0-9_-]{11}$/;
const SOLO_YOUTUBE = "Por ahora solo se aceptan videos de YouTube";

function segundos(valor: string | null): number | undefined {
  if (!valor) return undefined;
  if (/^\d+$/.test(valor)) return Number(valor);
  const partes = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(valor);
  if (!partes || partes.slice(1).every((parte) => parte === undefined)) return undefined;
  return Number(partes[1] ?? 0) * 3600 + Number(partes[2] ?? 0) * 60 + Number(partes[3] ?? 0);
}

/** Acepta únicamente las variantes conocidas de URL de un video de YouTube. */
export function extraerVideo(enlace: string): { id: string; inicio?: number } {
  let url: URL;
  try {
    url = new URL(enlace);
  } catch {
    throw new ErrorDominio("VIDEO_URL_INVALIDA", SOLO_YOUTUBE);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ErrorDominio("VIDEO_URL_INVALIDA", SOLO_YOUTUBE);
  }
  const host = url.hostname.toLowerCase();
  const segmentos = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (host === "youtu.be" && segmentos.length === 1) id = segmentos[0];
  else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (segmentos.length === 2 && ["shorts", "embed", "live"].includes(segmentos[0])) id = segmentos[1];
  } else if (["youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    if (segmentos.length === 2 && segmentos[0] === "embed") id = segmentos[1];
  }
  if (!id || !ID_VIDEO.test(id)) throw new ErrorDominio("VIDEO_URL_INVALIDA", SOLO_YOUTUBE);
  const inicio = segundos(url.searchParams.get("t") ?? url.searchParams.get("start"));
  return inicio === undefined ? { id } : { id, inicio };
}

export type ClienteHttpVideo = (input: string, init: { signal: AbortSignal }) => Promise<Pick<Response, "status" | "json">>;

/** oEmbed recibe solo la URL pública del video; nunca datos de estudiantes. */
export async function comprobarVideo(id: string, http: ClienteHttpVideo = fetch): Promise<{ id: string; tituloOriginal: string }> {
  if (!ID_VIDEO.test(id)) throw new ErrorDominio("VIDEO_ID_INVALIDO", SOLO_YOUTUBE);
  const url = new URL("https://www.youtube.com/oembed");
  url.searchParams.set("url", `https://www.youtube.com/watch?v=${id}`);
  url.searchParams.set("format", "json");
  try {
    const respuesta = await http(url.toString(), { signal: AbortSignal.timeout(5_000) });
    if (respuesta.status === 401 || respuesta.status === 403) {
      throw new ErrorDominio("VIDEO_NO_INCRUSTABLE", "Este video no permite verse fuera de YouTube");
    }
    if (respuesta.status === 404) {
      throw new ErrorDominio("VIDEO_NO_ENCONTRADO", "No encontramos ese video; revisa el enlace");
    }
    if (respuesta.status !== 200) throw new Error("Respuesta de oEmbed no disponible");
    const datos: unknown = await respuesta.json();
    if (!datos || typeof datos !== "object" || !("title" in datos) || typeof datos.title !== "string" || !datos.title.trim()) {
      throw new Error("Respuesta de oEmbed inválida");
    }
    return { id, tituloOriginal: datos.title.trim() };
  } catch (error) {
    if (error instanceof ErrorDominio) throw error;
    throw new ErrorDominio("VIDEO_NO_COMPROBADO", "No pudimos comprobar el video; intenta de nuevo");
  }
}
