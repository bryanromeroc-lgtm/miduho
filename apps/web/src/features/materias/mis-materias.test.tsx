import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ESCENAS } from "@/lib/escenas";
import { GUIAS, guiaDe } from "@/lib/guias";
import type { ResumenMateria } from "@/lib/materias";
import { MisMaterias, Tarjeta } from "./mis-materias";

const base: ResumenMateria = {
  id: "m1",
  nombre: "Comprensión Lectora",
  area: { nombre: "Humanidades", orden: 1 },
  escena: "lectura",
  claseHref: "/materias/m1",
  estrellas: null,
  avance: null,
  sigue: null,
  nuevo: null,
  conMaterial: null,
};

const tarjeta = (m: Partial<ResumenMateria>) => renderToStaticMarkup(<Tarjeta materia={{ ...base, ...m }} />);

describe("guías de las materias", () => {
  it("toda escena salvo la genérica tiene guía con ilustración publicada", () => {
    for (const e of ESCENAS) {
      if (e === "generica") {
        expect(guiaDe(e)).toBeNull();
        continue;
      }
      const g = GUIAS[e];
      expect(g.nombre && g.especie && g.accion).toBeTruthy();
      expect(existsSync(resolve(__dirname, "../../../public", `.${g.imagen}`))).toBe(true);
    }
  });
});

describe("tarjeta de materia", () => {
  it("sin datos: nombre, guía y un solo enlace a la materia", () => {
    const h = tarjeta({});
    expect(h).toContain("Comprensión Lectora");
    expect(h).toContain("Bruno · Oso de anteojos");
    expect(h.match(/<a /g)).toHaveLength(1);
    expect(h).toContain('href="/materias/m1"');
    expect(h).toContain("Ver actividades");
    expect(h).not.toContain("hechas");
    expect(h).not.toContain("¡Nuevo!");
  });

  it("en preparación: sin enlace y lo dice", () => {
    const h = tarjeta({ conMaterial: false, nuevo: true, estrellas: 2 });
    expect(h).not.toContain("<a ");
    expect(h).toContain("Tu docente está preparando el material");
    expect(h).not.toContain("¡Nuevo!");
    expect(h).not.toContain("estrellas");
  });

  it("con desempeño real muestra estrellas y avance", () => {
    const h = tarjeta({ estrellas: 2, avance: { hechas: 4, total: 6 }, nuevo: true });
    expect(h).toContain("2 de 3 estrellas");
    expect(h).toContain("4/6 hechas");
    expect(h).toContain("¡Nuevo!");
  });

  it("la escena genérica no inventa guía", () => {
    const h = tarjeta({ escena: "generica", nombre: "Educación Religiosa" });
    expect(h).toContain("#escena-generica");
    expect(h).not.toContain(" · ");
  });
});

describe("Mis materias", () => {
  const datos = (materias: Partial<ResumenMateria>[]) => ({
    grupo: { id: "g", etiqueta: "1°-01" },
    materias: materias.map((m, i) => ({ ...base, id: `m${i}`, ...m })),
  });

  it("la siguiente actividad solo aparece cuando hay dato", () => {
    expect(renderToStaticMarkup(<MisMaterias datos={datos([{}])} />)).not.toContain("Tu siguiente actividad");
    const h = renderToStaticMarkup(<MisMaterias datos={datos([{}, { nombre: "Matemáticas", escena: "matematicas", sigue: "Sumas hasta 20" }])} />);
    expect(h).toContain("Tu siguiente actividad");
    expect(h).toContain("Sumas hasta 20");
  });

  it("pagina de 10 en 10 y abre en la página de la materia que vuelve", () => {
    const doce = datos(Array.from({ length: 12 }, () => ({})));
    expect(renderToStaticMarkup(<MisMaterias datos={doce} />)).toContain("Página 1 de 2");
    expect(renderToStaticMarkup(<MisMaterias datos={doce} materiaInicial="m11" />)).toContain("Página 2 de 2");
  });

  it("sin grupo lo explica", () => {
    expect(renderToStaticMarkup(<MisMaterias datos={{ grupo: null, materias: [] }} />)).toContain("Aún no tienes un grupo asignado");
  });
});
