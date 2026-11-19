import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { leerActividad } from "../../tipos/registro";
import { cargaRestante, type ContenidoAventura } from "./tipo";

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
});
