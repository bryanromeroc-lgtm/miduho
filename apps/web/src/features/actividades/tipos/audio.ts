/**
 * Audio en el contenido (juegos-primero, audio-en-actividades): ruta de un
 * audio grabado bajo `public/audio/`. Siempre opcional: sin audio, el
 * reproductor usa la voz del navegador en 1.° y 2.°, y el texto sigue escrito.
 */
import { z } from "zod";

export const rutaAudio = z
  .string()
  .regex(/^\/audio\/[\w\-/]+\.(mp3|ogg|m4a|wav)$/, "ruta /audio/….mp3 (o .ogg, .m4a, .wav)");

/** Junta todas las rutas de audio citadas en un objeto de contenido (para validar que existan). */
export function rutasDeAudio(valor: unknown, rutas: string[] = []): string[] {
  if (Array.isArray(valor)) valor.forEach((v) => rutasDeAudio(v, rutas));
  else if (valor && typeof valor === "object") {
    for (const [llave, v] of Object.entries(valor)) {
      if (/^audio/i.test(llave) && typeof v === "string") rutas.push(v);
      else if (/^audio/i.test(llave) && Array.isArray(v)) v.forEach((x) => typeof x === "string" && rutas.push(x));
      else rutasDeAudio(v, rutas);
    }
  }
  return rutas;
}
