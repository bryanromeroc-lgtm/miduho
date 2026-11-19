/**
 * `adaptar <slug> <id…> --destino <carpeta> [--nombre a.mp3,b.mp3] [--para "texto"]`
 *
 * Copia pistas del inventario a `apps/web/public/audio/...`: MP3 mono a
 * 44,1 kHz, sin silencio inicial, normalizado (−18 LUFS voz/efecto, −23 LUFS
 * música/ambiente). Escribe una fila por archivo en el `LICENCIAS.md` de la
 * carpeta de destino y anota la ruta pública en `uso` del inventario.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { filaLicencia, objetivoLufs } from "./puro.mjs";
import { carpetaReferencia, PUBLICO, RAIZ } from "./rutas.mjs";

const ENCABEZADO_TABLA = "| Archivo | Pista de origen | URL | Autoría | Licencia |\n|---|---|---|---|---|";

export function adaptar(slug, ids, { destino, nombre }) {
  if (!destino) throw new Error("Falta --destino (p. ej. apps/web/public/audio/consignas/vivo-o-no-vivo)");
  const dirDestino = isAbsolute(destino) ? destino : resolve(RAIZ, destino);
  if (!dirDestino.startsWith(join(PUBLICO, "audio"))) throw new Error("El destino debe estar dentro de apps/web/public/audio/");
  const dir = carpetaReferencia(slug);
  const rutaInv = join(dir, "inventario.json");
  const inv = JSON.parse(readFileSync(rutaInv, "utf8"));
  const nombres = nombre ? String(nombre).split(",") : [];
  mkdirSync(dirDestino, { recursive: true });
  const filas = [];

  ids.forEach((id, i) => {
    const p = inv.pistas.find((x) => x.id === id);
    if (!p) throw new Error(`No existe la pista ${id} en ${slug}`);
    const archivo = (nombres[i] ?? `${id}.mp3`).replace(/\.[^.]+$/, "") + ".mp3";
    const salida = join(dirDestino, archivo);
    const lufs = objetivoLufs(p.rol);
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", join(dir, p.archivo),
      "-af", `silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=${lufs}:TP=-2:LRA=11`,
      "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-q:a", "3", salida,
    ]);
    const publica = `/${relative(PUBLICO, salida).split("\\").join("/")}`;
    if (!p.uso.includes(publica)) p.uso.push(publica);
    filas.push(filaLicencia({ archivo, slug, id, url: p.urls[0], autor: p.autor_dominio, licencia: p.licencia }));
    console.log(`${p.id} → ${publica} (${lufs} LUFS)`);
  });

  writeFileSync(rutaInv, `${JSON.stringify(inv, null, 2)}\n`);
  escribirLicencias(join(dirDestino, "LICENCIAS.md"), filas);
}

function escribirLicencias(ruta, filas) {
  let texto = existsSync(ruta) ? readFileSync(ruta, "utf8") : "# Sonidos de esta carpeta\n";
  if (!texto.includes("## Audio de referencias")) {
    texto = `${texto.trimEnd()}\n\n## Audio de referencias\n\nAdaptado con \`tools/captura-audio adaptar\` (MP3 mono 44,1 kHz, normalizado). Cada fila remite a \`content/referencias/<slug>/inventario.json\` y a su \`LICENCIA.md\`.\n\n${ENCABEZADO_TABLA}\n`;
  }
  for (const f of filas) {
    const archivo = f.split("|")[1].trim();
    const lineas = texto.split("\n").filter((l) => !l.startsWith(`| ${archivo} |`));
    texto = lineas.join("\n");
    // Inserta al final de la tabla de referencias.
    const i = texto.indexOf(ENCABEZADO_TABLA) + ENCABEZADO_TABLA.length;
    let fin = texto.indexOf("\n\n", i);
    if (fin < 0) fin = texto.length;
    texto = `${texto.slice(0, fin).trimEnd()}\n${f}${texto.slice(fin)}`;
  }
  writeFileSync(ruta, texto.endsWith("\n") ? texto : `${texto}\n`);
}
