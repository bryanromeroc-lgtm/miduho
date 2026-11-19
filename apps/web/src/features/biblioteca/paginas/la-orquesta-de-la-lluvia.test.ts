import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TITULOS } from "@/data/demo";
import { buscarLibro, paginasDe } from "@/features/biblioteca/libros";

const PUBLICO = fileURLToPath(new URL("../../../../public", import.meta.url));
const libro = buscarLibro("la-orquesta-de-la-lluvia")!;
const paginas = paginasDe(libro);

describe("La orquesta de la lluvia", () => {
  it("está en el catálogo con portada, cinco pliegos y cierre", () => {
    expect(TITULOS.find((titulo) => titulo.id === libro.tituloId)?.titulo).toBe(libro.titulo);
    expect(paginas).toHaveLength(12);
    expect(libro.pliegos).toEqual([[2, 3], [4, 5], [6, 7], [8, 9], [10, 11]]);
  });

  it("publica todas las mitades y miniaturas en el orden del lector", () => {
    for (const pagina of paginas) {
      expect(pagina.compuesta?.ilustracion).toBeTruthy();
      expect(existsSync(`${PUBLICO}${pagina.compuesta!.ilustracion}`)).toBe(true);
      expect(existsSync(`${PUBLICO}${pagina.miniatura}`)).toBe(true);
    }
    for (const [izquierda, derecha] of libro.pliegos!) {
      expect(derecha).toBe(izquierda + 1);
      expect(paginas[izquierda - 1].compuesta?.mitad).toBe("izquierda");
      expect(paginas[derecha - 1].compuesta?.mitad).toBe("derecha");
    }
  });

  it("ofrece narración HTML y descripción alternativa en cada hoja", () => {
    for (const pagina of paginas) {
      expect(pagina.src).toBeUndefined();
      const texto = [pagina.compuesta?.titulo ?? "", ...(pagina.compuesta?.parrafos ?? [])].join(" ");
      expect(texto.trim()).not.toBe("");
      expect(pagina.compuesta?.alt?.trim()).not.toBe("");
    }
  });

  it("conserva la ruta de miniaturas de los libros anteriores", () => {
    const anterior = buscarLibro("tula-y-el-mural-del-bosque")!;
    expect(paginasDe(anterior)[0].miniatura).toBe("/libros/tula-y-el-mural-del-bosque/t01.webp");
  });
});
