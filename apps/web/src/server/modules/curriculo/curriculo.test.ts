import { describe, expect, it } from "vitest";
import { definicionDe } from "@/features/actividades/tipos/registro";
import { carpetaAsignatura, crearCatalogo, RAIZ_CURRICULO } from "./catalogo";

/*
  Guardia del currículo en git: todo archivo de curriculo/actividades debe
  pasar la validación general y la de su tipo, y cada asignatura de 5.° tiene
  sus cinco actividades.
*/
const catalogo = crearCatalogo(RAIZ_CURRICULO);

const ASIGNATURAS_QUINTO = [
  "Comprensión Lectora",
  "Robótica",
  "Emprendimiento",
  "Matemáticas",
  "Ciencias naturales",
  "Inglés",
  "Ética y valores",
  "Educación artística",
  "Educación física",
  "Ciencias sociales",
  "Educación religiosa",
];

describe("currículo", () => {
  it("todos los archivos son válidos", () => {
    expect(catalogo.errores()).toEqual([]);
  });

  it.each(ASIGNATURAS_QUINTO)("%s tiene al menos cinco actividades de 5.° con al menos tres tipos distintos", (nombre) => {
    const lista = catalogo.de(nombre, 5);
    expect(lista.length).toBeGreaterThanOrEqual(5);
    expect(new Set(lista.map((a) => a.tipo)).size).toBeGreaterThanOrEqual(3);
  });

  it("cada ítem de cada actividad se puede calificar y repasar", () => {
    for (const a of catalogo.todas()) {
      const definicion = definicionDe(a.tipo)!;
      for (const { itemId } of definicion.items(a.contenido)) {
        expect(definicion.repaso(a.contenido, itemId).solucion, `${a.slug}/${itemId}`).toBeTruthy();
      }
    }
  });

  it("la carpeta de una asignatura es su nombre normalizado", () => {
    expect(carpetaAsignatura("Ética y valores")).toBe("etica-y-valores");
    expect(carpetaAsignatura("Comprensión Lectora")).toBe("comprension-lectora");
  });

  it("un grado sin carpeta no tiene actividades", () => {
    expect(catalogo.de("Matemáticas", 1)).toEqual([]);
  });
});
