import { describe, expect, it } from "vitest";
import { posicionAvatar, totalPaginas } from "./posicion-avatar";

describe("posición del avatar", () => {
  it("en la cuadrícula de 5×2 recorre columnas y luego filas", () => {
    expect(posicionAvatar(0)).toEqual({ pagina: 0, columna: 0, fila: 0 });
    expect(posicionAvatar(4)).toEqual({ pagina: 0, columna: 4, fila: 0 });
    expect(posicionAvatar(5)).toEqual({ pagina: 0, columna: 0, fila: 1 });
    expect(posicionAvatar(9)).toEqual({ pagina: 0, columna: 4, fila: 1 });
  });

  it("acompaña al cromo a la página siguiente cuando hay más de 10", () => {
    expect(posicionAvatar(10)).toEqual({ pagina: 1, columna: 0, fila: 0 });
    expect(posicionAvatar(13)).toEqual({ pagina: 1, columna: 3, fila: 0 });
  });

  it("se adapta a menos columnas", () => {
    expect(posicionAvatar(3, 2)).toEqual({ pagina: 0, columna: 1, fila: 1 });
    expect(posicionAvatar(2, 1)).toEqual({ pagina: 0, columna: 0, fila: 2 });
  });

  it("tolera índices negativos o fraccionarios", () => {
    expect(posicionAvatar(-3)).toEqual({ pagina: 0, columna: 0, fila: 0 });
    expect(posicionAvatar(6.7)).toEqual({ pagina: 0, columna: 1, fila: 1 });
  });

  it("cuenta las páginas: 14 asignaturas son 2, ninguna es 1", () => {
    expect(totalPaginas(14)).toBe(2);
    expect(totalPaginas(10)).toBe(1);
    expect(totalPaginas(0)).toBe(1);
  });
});
