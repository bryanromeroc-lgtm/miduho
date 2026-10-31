import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { etiquetaElegir, partesDelCromo, type ResumenMateria } from "@/lib/materias";
import { Cromo } from "./cromo";

const base: ResumenMateria = {
  id: "m1",
  nombre: "Comprensión lectora",
  area: { nombre: "Humanidades", orden: 1 },
  escena: "lectura",
  claseHref: "/biblioteca",
  estrellas: null,
  avance: null,
  sigue: null,
  nuevo: null,
  conMaterial: null,
};

const html = (m: Partial<ResumenMateria>, elegida = false) =>
  renderToStaticMarkup(<Cromo materia={{ ...base, ...m }} indice={0} elegida={elegida} onElegir={() => {}} />);

describe("partes del cromo según los datos", () => {
  const sigue = [null, "Caperucita Roja"] as const;
  const avance = [null, { hechas: 4, total: 6 }] as const;
  const estrellas = [null, 0, 2, 3] as const;
  const conMaterial = [null, true, false] as const;
  const nuevo = [null, false, true] as const;

  const casos = sigue.flatMap((s) =>
    avance.flatMap((a) => estrellas.flatMap((e) => conMaterial.flatMap((c) => nuevo.map((n) => ({ sigue: s, avance: a, estrellas: e, conMaterial: c, nuevo: n }))))),
  );

  it.each(casos)("sigue=$sigue avance=$avance estrellas=$estrellas conMaterial=$conMaterial nuevo=$nuevo", (m) => {
    const p = partesDelCromo(m);
    const prep = m.conMaterial === false;
    expect(p.preparacion).toBe(prep);
    expect(p.jugar).toBe(!prep);
    expect(p.sigue).toBe(!prep && m.sigue !== null);
    expect(p.avance).toBe(!prep && m.avance !== null);
    expect(p.estrellas).toBe(!prep && m.estrellas !== null);
    expect(p.invitacion).toBe(!prep && m.sigue === null && m.avance === null && m.estrellas === null);
    expect(p.nuevo).toBe(!prep && m.nuevo === true);
    expect(p.dominada).toBe(!prep && m.estrellas === 3);
  });

  it("un avance con total 0 no pinta barra", () => {
    expect(partesDelCromo({ ...base, avance: { hechas: 0, total: 0 } }).avance).toBe(false);
  });
});

describe("render del cromo", () => {
  it("sin datos de progreso invita a jugar y no muestra cifras", () => {
    const h = html({});
    expect(h).toContain("Toca jugar para entrar");
    expect(h).not.toContain("Sigue con");
    expect(h).not.toContain("estrellas");
    expect(h).not.toMatch(/\d+\/\d+/);
    expect(h).toContain('aria-label="Entrar a Comprensión lectora"');
  });

  it("con progreso muestra «Sigue con», la barra al 67 % con 4/6 y 2 de 3 estrellas", () => {
    const h = html({ avance: { hechas: 4, total: 6 }, estrellas: 2, sigue: "Caperucita Roja" });
    expect(h).toContain("Sigue con");
    expect(h).toContain("Caperucita Roja");
    expect(h).toContain("--avance:67%");
    expect(h).toContain(">4/6<");
    expect(h).toContain("4 de 6 actividades hechas");
    expect(h).toContain('aria-label="2 de 3 estrellas"');
    expect(h).not.toContain("Toca jugar para entrar");
  });

  it("en preparación: texto de la docente y sin botón de jugar", () => {
    const h = html({ conMaterial: false, estrellas: 3, nuevo: true });
    expect(h).toContain("Tu docente está preparando el material");
    expect(h).not.toContain("Entrar a");
    expect(h).not.toContain("¡Nuevo!");
    expect(h).toContain("data-preparacion");
  });

  it("con material nuevo lleva la etiqueta «¡Nuevo!»", () => {
    expect(html({ nuevo: true })).toContain("¡Nuevo!");
    expect(html({ nuevo: false })).not.toContain("¡Nuevo!");
  });

  it("el botón de elegir anuncia nombre, estrellas y lo siguiente, y refleja la elección", () => {
    expect(html({}, true)).toContain('aria-pressed="true"');
    expect(html({}, false)).toContain('aria-pressed="false"');
    expect(etiquetaElegir({ ...base, estrellas: 2, sigue: "Caperucita Roja" })).toBe(
      "Elegir Comprensión lectora, 2 de 3 estrellas, sigue con Caperucita Roja",
    );
    expect(etiquetaElegir({ ...base, conMaterial: false })).toBe("Elegir Comprensión lectora, sin material todavía");
  });

  it("la escena es decorativa y el nombre es un encabezado real", () => {
    const h = html({});
    expect(h).toContain('href="#escena-lectura"');
    expect(h).toMatch(/<h2[^>]*>.*Comprensión lectora.*<\/h2>/);
  });
});
