import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
  Guardia del estilo flat (D5): el CSS de la vista no puede ganar sombras,
  relieves ni contornos de tinta. `box-shadow: none` sí se permite (apaga la
  sombra heredada del menú de cuenta).
*/
const RUTA = join(__dirname, "vista.module.css");
const ARCHIVOS = [
  RUTA,
  join(__dirname, "../../../app/muestras/materia/muestra.module.css"),
  join(__dirname, "../../actividades/reproductor/reproductor.module.css"),
];

function declaraciones(css: string) {
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...sinComentarios.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)].map(([, prop, valor]) => ({ prop, valor: valor.trim() }));
}

describe.each(ARCHIVOS)("estilo flat: %s", (archivo) => {
  const decl = declaraciones(readFileSync(archivo, "utf8"));

  it("sin box-shadow ni text-shadow (salvo «none»)", () => {
    const malas = decl.filter((d) => /^(box|text)-shadow$/.test(d.prop) && d.valor !== "none");
    expect(malas).toEqual([]);
  });

  it("sin drop-shadow ni filtros de volumen", () => {
    expect(decl.filter((d) => /drop-shadow|blur\(/.test(d.valor) || d.prop === "filter")).toEqual([]);
  });

  it("sin degradados que simulen relieve", () => {
    expect(decl.filter((d) => /gradient\(/.test(d.valor))).toEqual([]);
  });

  it("los bordes nunca usan la tinta ni pasan de 2 px", () => {
    const bordes = decl.filter((d) => /^border(-(top|right|bottom|left))?$/.test(d.prop) && d.valor !== "0" && d.valor !== "none");
    for (const b of bordes) {
      expect(b.valor, `${b.prop}: ${b.valor}`).not.toMatch(/tinta|#000|black|#1b2440/);
      const ancho = Number(b.valor.match(/^(\d+(?:\.\d+)?)px/)?.[1] ?? 0);
      expect(ancho, `${b.prop}: ${b.valor}`).toBeLessThanOrEqual(2);
    }
  });

  it("sin text-stroke (contorno sticker)", () => {
    expect(decl.filter((d) => /text-stroke/.test(d.prop))).toEqual([]);
  });
});

describe("guardia sobre un CSS con efectos prohibidos", () => {
  it("detecta una sombra y un borde de tinta", () => {
    const d = declaraciones(".a{box-shadow:0 2px 4px red;border:3px solid var(--m-tinta);}");
    expect(d.filter((x) => x.prop === "box-shadow" && x.valor !== "none")).toHaveLength(1);
    expect(d.find((x) => x.prop === "border")?.valor).toMatch(/tinta/);
  });
});
