import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TITULOS } from "@/data/demo";
import { buscarLibro, paginasDe } from "@/features/biblioteca/libros";

const publico = fileURLToPath(new URL("../../../../public", import.meta.url));

describe("adaptación de Don Quijote para quinto grado", () => {
  const libro = buscarLibro("don-quijote-y-los-molinos")!;
  const paginas = paginasDe(libro);

  it("vincula una ficha 9–11 con el lector y acredita al autor original", () => {
    const ficha = TITULOS.find((titulo) => titulo.id === libro.tituloId);
    expect(ficha?.titulo).toBe(libro.titulo);
    expect(ficha?.edad).toBe("9-11");
    expect(ficha?.autor).toContain("Miguel de Cervantes");
    expect(libro.autor).toContain("adaptación MIDUHO");
  });

  it("publica apertura editorial y cinco escenas partidas en hojas consecutivas", () => {
    expect(paginas).toHaveLength(14);
    expect(paginas[0].compuesta?.disposicion).toBe("portada-editorial");
    expect(paginas[1].compuesta?.disposicion).toBe("creditos-editoriales");
    expect(paginas[2].compuesta?.disposicion).toBe("inicio-editorial");
    expect(paginas.at(-1)?.compuesta?.disposicion).toBe("cierre-editorial");
    expect(libro.pliegos).toHaveLength(5);
    for (const [izquierda, derecha] of libro.pliegos!) {
      expect(derecha).toBe(izquierda + 1);
      expect(paginas[izquierda - 1].compuesta?.mitad).toBe("izquierda");
      expect(paginas[derecha - 1].compuesta?.mitad).toBe("derecha");
    }
    for (const pagina of paginas) {
      if (pagina.compuesta?.ilustracion) {
        expect(existsSync(`${publico}${pagina.compuesta.ilustracion}`)).toBe(true);
      }
      expect(existsSync(`${publico}${pagina.miniatura}`)).toBe(true);
    }
    expect(existsSync(`${publico}/images/biblioteca/escudo-editorial.webp`)).toBe(true);
  });

  it("mantiene el relato y los créditos como texto accesible, con alt en cada ilustración", () => {
    for (const pagina of paginas) {
      expect(pagina.src).toBeUndefined();
      if (pagina.compuesta?.ilustracion) {
        expect(pagina.compuesta.alt?.trim()).toBeTruthy();
      }
      expect(
        pagina.compuesta?.titulo || pagina.compuesta?.parrafos?.join(" ").trim()
      ).toBeTruthy();
    }
    expect(paginas[1].compuesta?.secciones?.[0].parrafos.join(" ")).toContain("capítulo VIII");
    expect(paginas[1].compuesta?.secciones?.[2].enlaces?.length).toBe(2);
  });
});
