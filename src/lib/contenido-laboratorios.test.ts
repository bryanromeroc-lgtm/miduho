import { describe, expect, it } from "vitest";
import { PROGRAMAS, RUTAS } from "./datos";
import { MISIONES_EMPRENDIMIENTO, MISIONES_ROBOTICA } from "./laboratorios";

const camposDeRuta = [
  "objetivo",
  "evidencias",
  "profundizacion",
  "inicio",
  "desarrollo",
  "evaluacion",
  "queCalificar",
] as const;

describe("contenido curricular de Laboratorios", () => {
  it("publica exactamente cinco rutas de Robótica y cinco de Emprendimiento", () => {
    expect(MISIONES_ROBOTICA).toHaveLength(5);
    expect(MISIONES_EMPRENDIMIENTO).toHaveLength(5);
  });

  it("cada estación enlaza una ruta didáctica existente y única", () => {
    const estaciones = [...MISIONES_ROBOTICA, ...MISIONES_EMPRENDIMIENTO];
    const ids = estaciones.map((estacion) => estacion.unidadId);

    expect(new Set(ids).size).toBe(10);
    for (const estacion of estaciones) {
      expect(estacion.rutaHref).toBe(`/laboratorios/${estacion.unidadId}`);
      expect(RUTAS[estacion.unidadId]?.titulo).toBe(estacion.titulo);
    }
  });

  it("incluye las diez unidades en el programa con su área correcta", () => {
    const unidades = PROGRAMAS[0].bloques.flatMap((bloque) => bloque.unidades);

    expect(unidades).toHaveLength(10);
    expect(unidades.filter((unidad) => unidad.area === "robotica")).toHaveLength(5);
    expect(unidades.filter((unidad) => unidad.area === "emprendimiento")).toHaveLength(5);
    expect(unidades.every((unidad) => unidad.estado === "activa")).toBe(true);
  });

  it("cada ruta completa las siete secciones pedagógicas y marca la alineación pendiente", () => {
    expect(Object.keys(RUTAS)).toHaveLength(10);

    for (const ruta of Object.values(RUTAS)) {
      for (const campo of camposDeRuta) {
        const contenido = ruta[campo];
        expect(Array.isArray(contenido) ? contenido.length : contenido.trim().length).toBeGreaterThan(0);
      }
      expect(ruta.estandares.every((texto) => texto.startsWith("🔶"))).toBe(true);
      expect(ruta.dba.every((texto) => texto.startsWith("🔶"))).toBe(true);
    }
  });

  it("no expone terminología comercial de la plataforma observada", () => {
    const contenido = JSON.stringify({
      programa: PROGRAMAS[0],
      rutas: RUTAS,
      estaciones: [...MISIONES_ROBOTICA, ...MISIONES_EMPRENDIMIENTO],
    }).toLowerCase();

    expect(contenido).not.toMatch(/kids|curious|circuito de aprendizaje|trendi/);
  });
});
