import { describe, expect, it } from "vitest";
import { buscar, indexar, normalizar, sugerir } from "./buscar";
import { TITULOS } from "@/data/demo";

/* El catálogo real: los casos de abajo son títulos que existen en datos.ts,
   no ejemplos inventados. Si un título cambia de nombre, el test lo dice. */
const indice = (t: (typeof TITULOS)[number]) => indexar(t.titulo, t.autor);
const titulos = (consulta: string) =>
  buscar(consulta, TITULOS, indice).map((r) => r.ficha.titulo);

describe("normalizar", () => {
  it("quita tildes y deja la letra", () => {
    expect(normalizar("Préstame")).toBe("prestame");
    expect(normalizar("Ibargüen")).toBe("ibarguen");
    expect(normalizar("corazón")).toBe("corazon");
  });

  it("quita signos de apertura, comillas y puntuación", () => {
    expect(normalizar("¡Préstame tus ojos!")).toBe("prestame tus ojos");
    expect(normalizar("«Fábulas»")).toBe("fabulas");
    expect(normalizar("Cuento 11: Derecho a la educación")).toBe(
      "cuento 11 derecho a la educacion",
    );
  });

  it("colapsa los espacios de más", () => {
    expect(normalizar("  la   liebre  ")).toBe("la liebre");
  });

  it("conserva la ñ como letra propia, no como n con tilde", () => {
    expect(normalizar("La muñeca negra")).toBe("la muñeca negra");
    expect(normalizar("Pijaraña")).toBe("pijaraña");
    /* la tilde de la á sí se va, la virgulilla de la ñ no */
    expect(normalizar("Un papá gritón")).toBe("un papa griton");
  });
});

describe("buscar sin tildes ni signos", () => {
  it("encuentra un título acentuado escrito sin tildes", () => {
    expect(titulos("prestame tus ojos")[0]).toBe("¡Préstame tus ojos!");
    expect(titulos("palabra ultima")[0]).toBe("Palabra última");
    expect(titulos("al ritmo del corazon")[0]).toBe("Al ritmo del corazón");
  });

  it("encuentra la ñ escrita como n", () => {
    expect(titulos("muneca negra")[0]).toBe("La muñeca negra");
    expect(titulos("un papa griton")[0]).toBe("Un papá gritón");
  });

  it("no exige los signos de apertura", () => {
    expect(titulos("prestame")[0]).toBe("¡Préstame tus ojos!");
  });

  it("ignora mayúsculas", () => {
    expect(titulos("LA LIEBRE Y LA TORTUGA")[0]).toBe("La liebre y la tortuga");
  });
});

describe("buscar por palabras sueltas", () => {
  it("encuentra con las palabras en cualquier orden", () => {
    expect(titulos("tortuga liebre")[0]).toBe("La liebre y la tortuga");
  });

  it("encuentra con una palabra del medio del título", () => {
    expect(titulos("mural")[0]).toBe("Tula y el mural del bosque");
  });

  it("acepta un prefijo: escribir a medias ya encuentra", () => {
    expect(titulos("lieb")[0]).toBe("La liebre y la tortuga");
  });

  it("también busca por autor", () => {
    /* «Bryan Romero» es el autor de Tula; el título no lo nombra */
    const porAutor = titulos("romero");
    expect(porAutor.length).toBeGreaterThan(0);
    expect(porAutor.some((t) => t === "Tula y el mural del bosque")).toBe(true);
  });

  it("busca por autor sin tildes", () => {
    /* «Nicolás Buenaventura» escrito «nicolas» */
    expect(titulos("nicolas buenaventura")[0]).toBe("Palabra última");
  });
});

describe("tolerar un error de dedo", () => {
  it("encuentra pese a una letra cambiada", () => {
    expect(titulos("mariposda").length).toBeGreaterThan(0);
  });

  it("encuentra pese a una letra de menos", () => {
    expect(titulos("tortuga")[0]).toBe("La liebre y la tortuga");
    expect(titulos("tortug").length).toBeGreaterThan(0);
  });

  it("marca como aproximado solo lo que entró por error de dedo", () => {
    const exacta = buscar("tortuga", TITULOS, indice);
    expect(exacta[0].aproximado).toBe(false);

    const torcida = buscar("mariposda", TITULOS, indice);
    expect(torcida[0].aproximado).toBe(true);
  });

  it("prefiere la coincidencia exacta antes que adivinar", () => {
    /* «liebre» existe tal cual: no debe colarse ningún aproximado */
    const r = buscar("liebre", TITULOS, indice);
    expect(r.every((x) => x.aproximado === false)).toBe(true);
  });

  it("no perdona errores en palabras cortas", () => {
    /* con margen, «sol» traería «son», «col», «sal»… que son otras palabras */
    expect(titulos("xyz")).toEqual([]);
  });
});

describe("orden por relevancia", () => {
  it("el título exacto va primero", () => {
    expect(titulos("fabulas")[0]).toBe("Fábulas");
  });

  it("un acierto en el título pesa más que uno en el autor", () => {
    const r = titulos("tula");
    expect(r[0]).toBe("Tula y el mural del bosque");
  });
});

describe("consulta vacía", () => {
  it("devuelve el catálogo entero sin filtrar", () => {
    expect(buscar("", TITULOS, indice)).toHaveLength(TITULOS.length);
    expect(buscar("   ", TITULOS, indice)).toHaveLength(TITULOS.length);
  });

  it("una consulta de puros signos no filtra nada", () => {
    expect(buscar("¿«»!", TITULOS, indice)).toHaveLength(TITULOS.length);
  });
});

describe("sugerencias", () => {
  it("sugiere títulos que existen, no consultas inventadas", () => {
    const s = sugerir("mune", TITULOS, indice);
    expect(s.length).toBeGreaterThan(0);
    expect(TITULOS).toContain(s[0]);
    expect(s[0].titulo).toBe("La muñeca negra");
  });

  it("no sugiere nada con la caja vacía", () => {
    expect(sugerir("", TITULOS, indice)).toEqual([]);
  });

  it("corta en el número pedido", () => {
    expect(sugerir("a", TITULOS, indice, 3).length).toBeLessThanOrEqual(3);
  });
});
