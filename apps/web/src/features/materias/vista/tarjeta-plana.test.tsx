import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ActividadResumen } from "@/lib/materias";
import { kitDe } from "../tematica";
import { TarjetaPlana } from "./tarjeta-plana";

const base: ActividadResumen = {
  id: "a1",
  titulo: "Retos de sumas hasta 20",
  tipo: "seleccion-multiple",
  estado: "disponible",
  estrellas: null,
  intentosUsados: 0,
  intentosMax: 3,
  abre: null,
  cierra: null,
  href: "/materias/m1/actividades/a1",
};

const html = (a: Partial<ActividadResumen>) =>
  renderToStaticMarkup(<TarjetaPlana actividad={{ ...base, ...a }} kit={kitDe("matematicas")} indice={0} />);

describe("tarjeta de actividad plana", () => {
  it("disponible: un solo enlace al reproductor, «Jugar» como acción principal y «3 intentos disponibles»", () => {
    const h = html({});
    expect(h.match(/<a /g)).toHaveLength(1);
    expect(h).toContain('href="/materias/m1/actividades/a1"');
    expect(h).toContain('data-tipo="principal"');
    expect(h).toContain("Sin intentos todavía · 3 intentos disponibles");
    expect(h).toContain("Quedan 3");
    expect(h.match(/data-queda/g)).toHaveLength(3);
    expect(h).not.toContain("aria-disabled");
  });

  it("práctica libre: sin fichas, dice qué juego es y que no hay límite de intentos", () => {
    const h = html({ intentosMax: null, tipo: "memoria" });
    expect(h).toContain("Memoria · Práctica libre");
    expect(h).toContain("Práctica libre · Sin límite de intentos");
    expect(h).not.toContain("data-queda");
    expect(h).toContain('data-tipo="principal"');
  });

  it("muestra el cierre mientras se puede jugar", () => {
    const h = html({ cierra: "2026-11-06T22:00:00Z" });
    expect(h).toContain("Hasta el 6 de nov.");
    expect(h).toContain("Para jugar. Hasta el 6 de nov. Sin intentos");
  });

  it("en curso no dice «sin intentos todavía»", () => {
    const h = html({ estado: "enCurso", intentosUsados: 1 });
    expect(h).toContain("Tienes un intento sin terminar · 2 intentos disponibles");
    expect(h).not.toContain("Sin intentos todavía");
  });

  it("el nombre accesible lleva el título completo, el estado, el desempeño y la acción", () => {
    const largo = "Una actividad con un título larguísimo que no cabe en dos líneas de la tarjeta y se recorta";
    expect(html({ titulo: largo })).toContain(`aria-label="${largo}. Quiz. Para jugar. Sin intentos todavía · 3 intentos disponibles. Jugar."`);
  });

  it("por abrir: enlace deshabilitado, sin destino y con la fecha de apertura", () => {
    const h = html({ estado: "porAbrir", abre: "2026-11-12T13:00:00Z" });
    expect(h).toContain('aria-disabled="true"');
    expect(h).not.toContain("href=");
    expect(h).toContain('data-tipo="bloqueada"');
    expect(h).toContain("Abre el 12 de noviembre");
  });

  it("intentos agotados: «Ver resultado» y «Sin intentos disponibles»", () => {
    const h = html({ estado: "hecha", estrellas: 3, intentosUsados: 3 });
    expect(h).toContain("Ver resultado");
    expect(h).toContain('data-tipo="secundaria"');
    expect(h).toContain("Sin intentos disponibles");
    expect(h).not.toContain("data-queda");
    expect(h).toContain("No quedan");
    expect(h.match(/data-llena/g)).toHaveLength(3);
  });

  it("sin intentos no pinta estrellas llenas", () => {
    expect(html({})).not.toContain("data-llena");
  });

  it("cerrada sin intento: deshabilitada y «Cerrada»; con intento: «Ver resultado»", () => {
    const sin = html({ estado: "cerrada" });
    expect(sin).toContain('aria-disabled="true"');
    expect(sin).toContain(">Cerrada<");
    const con = html({ estado: "cerrada", intentosUsados: 1, estrellas: 1 });
    expect(con).toContain("Ver resultado");
    expect(con).not.toContain("aria-disabled");
  });

  it("el estado se dice con texto, no solo con color", () => {
    for (const [estado, chip] of [
      ["disponible", "Para jugar"],
      ["enCurso", "En curso"],
      ["porAbrir", "Por abrir"],
      ["hecha", "Hecha"],
      ["cerrada", "Cerrada"],
    ] as const) {
      expect(html({ estado })).toContain(`>${chip}</span>`);
    }
  });

  it("toda la decoración es aria-hidden", () => {
    const h = html({});
    // Las piezas del kit van anidadas dentro del svg decorativo de la banda.
    const raiz = h.replace(/<svg x=[^>]*>[\s\S]*?<\/svg>/g, "");
    const svgs = raiz.match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThan(0);
    for (const s of svgs) expect(s).toContain('aria-hidden="true"');
  });

  it("la banda dibuja el tipo con piezas del kit de la materia, no pictogramas genéricos", () => {
    const { arte } = kitDe("matematicas");
    const h = html({ tipo: "ordenar" });
    // ordenar = tres piezas anidadas del kit, de menor a mayor
    expect(h.match(/<svg x=/g)).toHaveLength(3);
    expect(Object.keys(arte.piezas).length).toBeGreaterThan(3);
  });
});

describe("aviso de primera visita", () => {
  it("la huella de la cuenta es estable, distinta por cuenta y no contiene el correo", async () => {
    const { huellaCuenta } = await import("./bienvenida");
    expect(huellaCuenta("estudiante@miduho.test")).toBe(huellaCuenta("estudiante@miduho.test"));
    expect(huellaCuenta("a@miduho.test")).not.toBe(huellaCuenta("b@miduho.test"));
    expect(huellaCuenta("estudiante@miduho.test")).not.toMatch(/estudiante|@/);
  });
});
