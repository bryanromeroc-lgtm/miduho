import { describe, expect, it } from "vitest";
import {
  agrupar,
  diaDe,
  estadoDe,
  fechaConHora,
  marcasPorDia,
  moverMes,
  semanasDelMes,
  tituloDia,
  tituloMes,
  type ActividadAgenda,
} from "./agenda";

const act = (p: Partial<ActividadAgenda>): ActividadAgenda => ({
  id: p.titulo ?? "a",
  titulo: "Actividad",
  tipo: "Quiz",
  estado: "disponible",
  estrellas: null,
  intentosUsados: 0,
  intentosMax: null,
  abre: null,
  cierra: null,
  href: "/materias/m/actividades/a",
  materia: { id: "m", nombre: "Matemáticas", escena: "matematicas" },
  ...p,
});

describe("fechas en Bogotá", () => {
  it("el día sale en hora de Colombia, no en UTC", () => {
    // 2026-09-12 03:00 UTC = 11 de septiembre, 10 p. m. en Bogotá
    expect(diaDe("2026-09-12T03:00:00Z")).toBe("2026-09-11");
    expect(diaDe("2026-09-12T05:00:00Z")).toBe("2026-09-12");
  });

  it("títulos legibles en español", () => {
    expect(tituloDia("2026-09-11")).toBe("Viernes 11 de septiembre");
    expect(tituloMes(2026, 9)).toBe("Septiembre de 2026");
  });

  it("la hora solo aparece si no es medianoche", () => {
    expect(fechaConHora("2026-09-15T05:00:00Z")).toBe("15 de septiembre");
    expect(fechaConHora("2026-09-15T12:00:00Z")).toMatch(/^15 de septiembre · 7:00/);
  });
});

describe("calendario de lunes a domingo", () => {
  it("septiembre de 2026 empieza en martes y tiene 30 días", () => {
    const s = semanasDelMes(2026, 9);
    expect(s[0]).toEqual([null, "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06"]);
    expect(s.flat().filter(Boolean)).toHaveLength(30);
    expect(s.every((w) => w.length === 7)).toBe(true);
  });

  it("febrero bisiesto y mes que empieza en lunes", () => {
    expect(semanasDelMes(2028, 2).flat().filter(Boolean)).toHaveLength(29);
    expect(semanasDelMes(2026, 6)[0][0]).toBe("2026-06-01");
  });

  it("mover de mes cruza años", () => {
    expect(moverMes(2026, 12, 1)).toEqual({ anio: 2027, mes: 1 });
    expect(moverMes(2026, 1, -1)).toEqual({ anio: 2025, mes: 12 });
  });
});

describe("estados y grupos", () => {
  it("el estado sale de los datos; una cerrada no tiene acción", () => {
    expect(estadoDe({ estado: "disponible", cierra: "2026-09-11T05:00:00Z" }).texto).toBe("Por entregar");
    expect(estadoDe({ estado: "disponible", cierra: null }).texto).toBe("Disponible");
    expect(estadoDe({ estado: "hecha", cierra: null }).texto).toBe("Entregada");
    expect(estadoDe({ estado: "cerrada", cierra: "2026-09-01T05:00:00Z" }).accion).toBe(false);
  });

  it("agrupa por entrega, separa disponibles sin fecha y nunca muestra las por abrir", () => {
    const g = agrupar([
      act({ titulo: "B", cierra: "2026-09-19T05:00:00Z" }),
      act({ titulo: "A", cierra: "2026-09-11T05:00:00Z" }),
      act({ titulo: "C", cierra: "2026-09-11T20:00:00Z", estado: "enCurso" }),
      act({ titulo: "Libre" }),
      act({ titulo: "Futura", estado: "porAbrir", abre: "2026-09-15T12:00:00Z" }),
      act({ titulo: "Hecha", estado: "hecha" }),
    ]);
    expect(g.porEntregar.map((d) => d.dia)).toEqual(["2026-09-11", "2026-09-19"]);
    expect(g.porEntregar[0].actividades.map((a) => a.titulo)).toEqual(["A", "C"]);
    expect(g.disponibles.map((a) => a.titulo)).toEqual(["Libre"]);
    expect(g.terminadas.map((a) => a.titulo)).toEqual(["Hecha"]);
    expect(JSON.stringify(g)).not.toContain("Futura");
  });

  it("las marcas del calendario ignoran las por abrir", () => {
    const m = marcasPorDia([
      act({ cierra: "2026-09-11T05:00:00Z", abre: "2026-09-03T05:00:00Z" }),
      act({ estado: "porAbrir", abre: "2026-09-15T12:00:00Z" }),
    ]);
    expect(m.get("2026-09-11")).toEqual({ entregas: 1, aperturas: 0 });
    expect(m.get("2026-09-03")).toEqual({ entregas: 0, aperturas: 1 });
    expect(m.has("2026-09-15")).toBe(false);
  });
});
