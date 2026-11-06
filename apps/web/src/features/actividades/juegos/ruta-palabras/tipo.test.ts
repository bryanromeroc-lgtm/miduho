import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { parecido, pistaDe, rondasDe, silabasDeRonda, type ConfigRuta } from "./generador";
import { PALABRAS, palabraDe } from "./palabras";
import { puntajeRonda, rutaPalabras } from "./tipo";

const base: ConfigRuta = { semilla: 7, rondas: 12, silabas: "mixtas", ritmo: "tranquilo" };

describe("banco de palabras", () => {
  it("no repite claves y las sílabas son 2, 3 o 4", () => {
    const claves = PALABRAS.map((p) => p.clave);
    expect(new Set(claves).size).toBe(claves.length);
    for (const p of PALABRAS) expect([2, 3, 4]).toContain(p.silabas);
    expect(palabraDe("arana")?.texto).toBe("araña");
  });
});

describe("generador de «La ruta de las palabras»", () => {
  it("genera lo mismo con la misma configuración", () => {
    expect(rondasDe(base)).toEqual(rondasDe(base));
    expect(rondasDe({ ...base, semilla: 8 })).not.toEqual(rondasDe(base));
  });

  it("da tres palabras distintas por ronda y una sola correcta en su carril", () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      for (const r of rondasDe({ ...base, semilla })) {
        const claves = r.carteles.map((c) => c.clave);
        expect(new Set(claves).size).toBe(3);
        expect(r.carteles[r.carril].clave).toBe(r.palabra.clave);
        expect(claves.filter((c) => c === r.palabra.clave)).toHaveLength(1);
      }
    }
  });

  it.each([2, 3, 4] as const)("con %i sílabas, todas las palabras tienen esas sílabas", (silabas) => {
    for (const r of rondasDe({ ...base, silabas, semilla: 3 })) {
      for (const c of r.carteles) expect(c.silabas).toBe(silabas);
    }
  });

  it("en modo mixtas va de 2 a 4 sílabas", () => {
    expect(silabasDeRonda("mixtas", 0, 10)).toBe(2);
    expect(silabasDeRonda("mixtas", 5, 10)).toBe(3);
    expect(silabasDeRonda("mixtas", 9, 10)).toBe(4);
  });

  it("no repite la palabra correcta en 6 rondas ni el carril correcto seguido", () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const rondas = rondasDe({ ...base, semilla, silabas: 2, rondas: 20 });
      rondas.forEach((r, i) => {
        for (let k = 1; k <= 6 && i - k >= 0; k++) expect(rondas[i - k].palabra.clave).not.toBe(r.palabra.clave);
        if (i > 0) expect(rondas[i - 1].carril).not.toBe(r.carril);
      });
    }
  });

  it("incluye el distractor más parecido que ofrece el banco", () => {
    for (const r of rondasDe({ ...base, semilla: 11, silabas: 2, rondas: 20 })) {
      const mejorPosible = Math.max(...PALABRAS.filter((p) => p.silabas === 2 && p.clave !== r.palabra.clave).map((p) => parecido(r.palabra, p)));
      const mejorElegido = Math.max(...r.carteles.filter((c) => c.clave !== r.palabra.clave).map((c) => parecido(r.palabra, c)));
      expect(mejorElegido).toBe(mejorPosible);
    }
  });

  it("la pista depende del error", () => {
    const casa = palabraDe("casa")!;
    expect(pistaDe(casa, palabraDe("cama")!)).toMatch(/letra que cambia/);
    expect(pistaDe(casa, palabraDe("capa")!)).toMatch(/letra que cambia/);
    expect(pistaDe(palabraDe("luna")!, palabraDe("lupa")!)).toMatch(/letra que cambia/);
    expect(pistaDe(casa, palabraDe("cine")!)).toMatch(/Empiezan igual|sílaba por sílaba/);
  });
});

describe("tipo ruta-palabras", () => {
  const rondas = rondasDe(base);
  const r1 = rondas[0];
  const otra = r1.carteles.find((c) => c.clave !== r1.palabra.clave)!.clave;

  it("califica 2, 1 y 0", () => {
    expect(puntajeRonda(r1.palabra.clave, [r1.palabra.clave])).toBe(2);
    expect(puntajeRonda(r1.palabra.clave, [otra, r1.palabra.clave])).toBe(1);
    expect(puntajeRonda(r1.palabra.clave, [otra, otra])).toBe(0);
    expect(puntajeRonda(r1.palabra.clave, [])).toBe(0);
  });

  it("califica un intento completo con respuestas válidas y sin responder", () => {
    const respuestas: Record<string, unknown> = { r1: [r1.palabra.clave], r2: [otra, rondas[1].palabra.clave] };
    const res = calificarIntento(rutaPalabras, base, respuestas);
    expect(res.puntajeMaximo).toBe(base.rondas * 2);
    expect(res.puntaje).toBe(2 + 1);
    expect(res.items[0].solucion).toContain(r1.palabra.texto);
  });

  it("rechaza respuestas de más de 2 elecciones", () => {
    const res = calificarIntento(rutaPalabras, base, { r1: [otra, otra, r1.palabra.clave] });
    expect(res.items[0].puntaje).toBe(0);
  });
});
