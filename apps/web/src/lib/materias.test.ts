import { describe, expect, it } from "vitest";
import { accionDe, fechaCorta, ordenarActividades, paginar, resumenTarjeta, textoCierre, type ActividadResumen } from "./materias";

const act = (titulo: string, estado: ActividadResumen["estado"], fechas: { abre?: string; cierra?: string } = {}) => ({
  titulo,
  estado,
  abre: fechas.abre ?? null,
  cierra: fechas.cierra ?? null,
});

describe("orden de actividades", () => {
  it("disponibles por cierre más próximo, luego en curso, por abrir, hechas y cerradas", () => {
    const r = ordenarActividades([
      act("Cerrada", "cerrada"),
      act("Hecha", "hecha"),
      act("Abre tarde", "porAbrir", { abre: "2026-11-20T12:00:00Z" }),
      act("Sin cierre", "disponible"),
      act("En curso", "enCurso"),
      act("Cierra pronto", "disponible", { cierra: "2026-11-03T12:00:00Z" }),
      act("Abre antes", "porAbrir", { abre: "2026-11-05T12:00:00Z" }),
      act("Cierra después", "disponible", { cierra: "2026-11-10T12:00:00Z" }),
    ]);
    expect(r.map((a) => a.titulo)).toEqual([
      "Cierra pronto",
      "Cierra después",
      "Sin cierre",
      "En curso",
      "Abre antes",
      "Abre tarde",
      "Hecha",
      "Cerrada",
    ]);
  });

  it("los empates se resuelven por título y no muta la lista", () => {
    const lista = [act("Zeta", "hecha"), act("Árbol", "hecha")];
    expect(ordenarActividades(lista).map((a) => a.titulo)).toEqual(["Árbol", "Zeta"]);
    expect(lista[0].titulo).toBe("Zeta");
  });
});

describe("paginar", () => {
  const ocho = Array.from({ length: 8 }, (_, i) => i);

  it("ocho actividades: 6 en la primera página y 2 en la segunda", () => {
    expect(paginar(ocho, 1)).toEqual({ elementos: [0, 1, 2, 3, 4, 5], pagina: 1, total: 2 });
    expect(paginar(ocho, 2)).toEqual({ elementos: [6, 7], pagina: 2, total: 2 });
  });

  it("ajusta números fuera de rango y la lista vacía tiene una página", () => {
    expect(paginar(ocho, 9).pagina).toBe(2);
    expect(paginar(ocho, -3).pagina).toBe(1);
    expect(paginar(ocho, Number.NaN).pagina).toBe(1);
    expect(paginar([], 1)).toEqual({ elementos: [], pagina: 1, total: 1 });
  });
});

describe("acción de la tarjeta", () => {
  const base = { intentosUsados: 0, intentosMax: 3, abre: null };

  it("cada estado tiene su acción", () => {
    expect(accionDe({ ...base, estado: "disponible" })).toEqual({ texto: "Jugar", habilitada: true, principal: true });
    expect(accionDe({ ...base, estado: "enCurso", intentosUsados: 1 })).toEqual({ texto: "Continuar", habilitada: true, principal: true });
    expect(accionDe({ ...base, estado: "hecha", intentosUsados: 1 })).toEqual({ texto: "Repetir para mejorar", habilitada: true, principal: false });
    expect(accionDe({ ...base, estado: "hecha", intentosUsados: 3 })).toEqual({ texto: "Ver resultado", habilitada: true, principal: false });
    expect(accionDe({ ...base, estado: "cerrada", intentosUsados: 2 })).toEqual({ texto: "Ver resultado", habilitada: true, principal: false });
    expect(accionDe({ ...base, estado: "cerrada" })).toEqual({ texto: "Cerrada", habilitada: false, principal: false });
  });

  it("por abrir: deshabilitada con la fecha en español de Colombia", () => {
    expect(accionDe({ ...base, estado: "porAbrir", abre: "2026-11-05T15:00:00Z" })).toEqual({ texto: "Abre el 5 de noviembre", habilitada: false, principal: false });
    expect(accionDe({ ...base, estado: "porAbrir" })).toEqual({ texto: "Abre pronto", habilitada: false, principal: false });
  });

  it("la fecha usa la hora de Colombia", () => {
    // 03:00 UTC del 1 de diciembre aún es 30 de noviembre en Bogotá (UTC−5).
    expect(fechaCorta("2026-12-01T03:00:00Z")).toBe("30 de noviembre");
  });
});

describe("texto de la tarjeta", () => {
  it("un intento en curso no se describe como «sin intentos»", () => {
    expect(resumenTarjeta({ estado: "enCurso", estrellas: null, intentosUsados: 1, intentosMax: 3 })).toBe(
      "Tienes un intento sin terminar · 2 intentos disponibles",
    );
    expect(resumenTarjeta({ estado: "disponible", estrellas: null, intentosUsados: 0, intentosMax: 3 })).toBe("Sin intentos todavía · 3 intentos disponibles");
    expect(resumenTarjeta({ estado: "hecha", estrellas: 2, intentosUsados: 3, intentosMax: 3 })).toBe("2 de 3 estrellas · Sin intentos disponibles");
  });

  it("el cierre solo se muestra mientras se puede jugar", () => {
    const cierra = "2026-11-06T22:00:00Z";
    expect(textoCierre({ estado: "disponible", cierra })).toBe("Hasta el 6 de nov.");
    expect(textoCierre({ estado: "enCurso", cierra })).toBe("Hasta el 6 de nov.");
    expect(textoCierre({ estado: "hecha", cierra })).toBeNull();
    expect(textoCierre({ estado: "disponible", cierra: null })).toBeNull();
  });
});
