import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { rondasDe, requiereLlevada, type ConfigGolpea } from "./generador";
import { golpea } from "./tipo";

const base: ConfigGolpea = { semilla: 41, rondas: 30, rango: 100, operaciones: ["suma", "resta"], llevadas: true };

describe("generador de «Golpea el resultado»", () => {
  it("genera lo mismo con la misma configuración", () => {
    expect(rondasDe(base)).toEqual(rondasDe(base));
    expect(rondasDe({ ...base, semilla: 42 })).not.toEqual(rondasDe(base));
  });

  it.each([10, 20, 100] as const)("en rango %i mantiene resultados y opciones dentro del rango", (rango) => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      for (const r of rondasDe({ ...base, semilla, rango })) {
        expect(r.a).toBeGreaterThan(0);
        expect(r.b).toBeGreaterThan(0);
        expect(r.operacion === "suma" ? r.a + r.b : r.a - r.b).toBe(r.resultado);
        expect(r.resultado).toBeGreaterThanOrEqual(1);
        expect(r.resultado).toBeLessThanOrEqual(rango);
        for (const o of r.opciones) {
          expect(o.valor).toBeGreaterThanOrEqual(1);
          expect(o.valor).toBeLessThanOrEqual(rango);
        }
      }
    }
  });

  it("da 7 u 8 opciones distintas, una sola correcta, en huecos distintos", () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      for (const r of rondasDe({ ...base, semilla })) {
        const valores = r.opciones.map((o) => o.valor);
        const huecos = r.opciones.map((o) => o.hueco);
        expect([7, 8]).toContain(valores.length);
        expect(new Set(valores).size).toBe(valores.length);
        expect(valores.filter((v) => v === r.resultado)).toHaveLength(1);
        expect(new Set(huecos).size).toBe(huecos.length);
        expect(huecos.every((h) => h >= 0 && h <= 9)).toBe(true);
      }
    }
  });

  it("usa distractores de error típico cuando caben en el rango", () => {
    const r = rondasDe(base).find((x) => x.resultado > 30 && x.resultado < 70)!;
    const tipicos = r.opciones.filter((o) => [1, 2, 10, 20].includes(Math.abs(o.valor - r.resultado)));
    expect(tipicos.length).toBeGreaterThanOrEqual(5);
  });

  it("sin llevadas no exige llevar ni desagrupar", () => {
    for (let semilla = 1; semilla <= 30; semilla++) {
      for (const r of rondasDe({ ...base, semilla, llevadas: false })) {
        expect(requiereLlevada(r.a, r.b, r.operacion)).toBe(false);
      }
    }
  });

  it("con llevadas al menos la mitad de las rondas las exige", () => {
    for (const rango of [20, 100] as const) {
      const rondas = rondasDe({ ...base, rango });
      expect(rondas.filter((r) => r.conLlevada).length).toBeGreaterThanOrEqual(rondas.length / 2);
    }
  });

  it("no repite un resultado dentro de 6 rondas seguidas", () => {
    const rondas = rondasDe(base);
    rondas.forEach((r, i) => {
      const anteriores = rondas.slice(Math.max(0, i - 6), i).map((x) => x.resultado);
      expect(anteriores).not.toContain(r.resultado);
    });
  });

  it("respeta la operación elegida", () => {
    expect(rondasDe({ ...base, operaciones: ["resta"] }).every((r) => r.operacion === "resta")).toBe(true);
    expect(rondasDe({ ...base, operaciones: ["suma"] }).every((r) => r.operacion === "suma")).toBe(true);
  });
});

describe("tipo «golpea»", () => {
  const contenido = { ...base, rondas: 10 };
  const [r1] = rondasDe(contenido);
  const malo = r1.opciones.find((o) => o.valor !== r1.resultado)!.valor;

  it("valida el contenido", () => {
    expect(golpea.esquemaContenido.safeParse(contenido).success).toBe(true);
    expect(golpea.esquemaContenido.safeParse({ ...contenido, rango: 50 }).success).toBe(false);
    expect(golpea.esquemaContenido.safeParse({ ...contenido, operaciones: [] }).success).toBe(false);
    expect(golpea.esquemaContenido.safeParse({ ...contenido, operaciones: ["suma", "suma"] }).success).toBe(false);
  });

  it("califica 2 al primer golpe, 1 al segundo y 0 después", () => {
    expect(golpea.calificar(contenido, r1.id, [r1.resultado])).toEqual({ correcta: true, puntaje: 2 });
    expect(golpea.calificar(contenido, r1.id, [malo, r1.resultado])).toEqual({ correcta: false, puntaje: 1 });
    expect(golpea.calificar(contenido, r1.id, [malo])).toEqual({ correcta: false, puntaje: 0 });
  });

  it("una ronda sin responder vale 0 y el máximo es 2 por ronda", () => {
    const intento = calificarIntento(golpea, contenido, { [r1.id]: [r1.resultado] });
    expect(intento.puntajeMaximo).toBe(20);
    expect(intento.puntaje).toBe(2);
    expect(golpea.esquemaRespuesta.safeParse([1, 2, 3]).success).toBe(false);
  });

  it("el repaso muestra la operación y su resultado", () => {
    const repaso = golpea.repaso(contenido, r1.id);
    expect(repaso.pregunta).toContain(String(r1.a));
    expect(repaso.solucion).toContain(`= ${r1.resultado}.`);
  });
});
