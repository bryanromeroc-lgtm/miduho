import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/*
  Trazabilidad del audio desplegado (juegos-primero, captura-audio-referencia):
  todo archivo de public/audio/** debe estar nombrado en un LICENCIAS.md o
  LICENCIA.md de su carpeta o de una superior (basta el nombre del archivo o
  un patrón glob como `*.mp3`). La prueba no mira si el permiso está
  adjuntado: solo que cada archivo tenga su origen escrito.
*/
const RAIZ = join(process.cwd(), "public", "audio");
const EXTENSIONES = /\.(mp3|ogg|oga|wav|m4a|webm|aac|opus|flac)$/i;

function* archivos(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const r = join(dir, n);
    if (statSync(r).isDirectory()) yield* archivos(r);
    else if (EXTENSIONES.test(n)) yield r;
  }
}

function registros(dir: string): string[] {
  const textos: string[] = [];
  for (let d = dir; d.startsWith(RAIZ); d = dirname(d)) {
    for (const nombre of ["LICENCIAS.md", "LICENCIA.md"]) {
      const r = join(d, nombre);
      if (existsSync(r)) textos.push(readFileSync(r, "utf8"));
    }
    if (d === RAIZ) break;
  }
  return textos;
}

/** `*.mp3`, `musica-*.mp3`… dentro de comillas invertidas. */
function patrones(texto: string): RegExp[] {
  return [...texto.matchAll(/`([^`\s]*\*[^`\s]*)`/g)].map(
    (m) => new RegExp(`^${m[1].replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`, "i"),
  );
}

function sinRegistro(raiz = RAIZ): string[] {
  if (!existsSync(raiz)) return [];
  const faltan: string[] = [];
  for (const a of archivos(raiz)) {
    const nombre = a.split(sep).pop()!;
    const textos = registros(dirname(a));
    const citado = textos.some((t) => t.includes(nombre) || patrones(t).some((p) => p.test(nombre)));
    if (!citado) faltan.push(relative(raiz, a));
  }
  return faltan;
}

describe("audio desplegado", () => {
  it("cada archivo de public/audio está registrado en un LICENCIAS.md (origen: propio, Gemini, CC0 o una referencia)", () => {
    expect(sinRegistro()).toEqual([]);
  });

  it("los patrones glob cubren nombres", () => {
    const [p] = patrones("Las voces `*.mp3` vienen de…");
    expect(p.test("casa.mp3")).toBe(true);
    expect(p.test("casa.ogg")).toBe(false);
  });
});
