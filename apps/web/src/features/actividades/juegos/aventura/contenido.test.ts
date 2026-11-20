import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { leerActividad } from "../../tipos/registro";
import { calificarIntento } from "../../tipos/contrato";
import { aventura, cargaRestante, type ContenidoAventura } from "./tipo";

const RUTA = "curriculo/actividades/matematicas/5/la-entrega-de-armi.json";

/** Lo que la historia espera como respuesta de cada escena, calculado aparte del JSON. */
const ESPERADAS: Record<string, string> = {
  e1: String(48 / 6),
  e2: String((48 / 6) * 2),
  e3: "1/3",
  e4: String((48 / 6) * 3),
  e5: String(8 / 2),
  e6: String((4 / 4) * 3),
  e7: "1/48",
};

describe("la-entrega-de-armi.json", () => {
  const datos = JSON.parse(readFileSync(join(process.cwd(), RUTA), "utf8"));
  const lectura = leerActividad(datos);

  it("cumple el esquema del tipo aventura", () => {
    expect(lectura.ok ? [] : lectura.errores).toEqual([]);
  });

  it("la opción correcta de cada escena es la que dicen las cuentas", () => {
    const c = (lectura.ok ? lectura.actividad.contenido : null) as ContenidoAventura;
    for (const e of c.escenas) expect(e.opciones[e.correcta], e.id).toBe(ESPERADAS[e.id]);
  });

  it("la carga se entrega completa a lo largo de la historia", () => {
    const c = (lectura.ok ? lectura.actividad.contenido : null) as ContenidoAventura;
    expect(cargaRestante(c, c.escenas.length)).toBe(0);
  });

  it("conserva los siete puntos de la actividad existente", () => {
    const c = (lectura.ok ? lectura.actividad.contenido : null) as ContenidoAventura;
    const respuestas = Object.fromEntries(c.escenas.map((e) => [e.id, e.correcta]));
    expect(calificarIntento(aventura, c, respuestas).puntaje).toBe(7);
    expect(aventura.items(c)).toHaveLength(7);
  });
});

describe("cuento-de-la-quebrada.json", () => {
  const ruta = "curriculo/actividades/comprension-lectora/1/cuento-de-la-quebrada.json";
  const datos = JSON.parse(readFileSync(join(process.cwd(), ruta), "utf8"));

  it("registra seis escenas y la secuencia con contenido válido", () => {
    const lectura = leerActividad(datos);
    expect(lectura.ok ? [] : lectura.errores).toEqual([]);
    if (!lectura.ok) return;
    const c = lectura.actividad.contenido as ContenidoAventura;
    expect(c.carga).toBeUndefined();
    expect(aventura.items(c)).toHaveLength(7);
    expect(calificarIntento(aventura, c, { secuencia: ["llega-la-mirla", "piedra-grande", "canta-otra-vez"] }).puntaje).toBe(1);
  });
});
