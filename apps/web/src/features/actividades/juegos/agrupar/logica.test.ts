import { describe, expect, it } from "vitest";
import { aciertos, cabe, cupos, enGrupo, faltan, ordenRevelado, poner } from "./logica";

const grupos = [
  { id: "vivo", nombre: "Seres vivos" },
  { id: "inerte", nombre: "Seres inertes" },
];
const tarjetas = [
  { id: "tortuga", categoria: "vivo" },
  { id: "rosa", categoria: "vivo" },
  { id: "piedra", categoria: "inerte" },
];

describe("tablero agrupar", () => {
  it("da a cada grupo tantas casillas como tarjetas le tocan", () => {
    expect(cupos(grupos, tarjetas)).toEqual({ vivo: 2, inerte: 1 });
  });

  it("poner mueve la tarjeta al final del grupo y null la devuelve a la pila", () => {
    let l = poner({}, "piedra", "vivo");
    l = poner(l, "tortuga", "vivo");
    l = poner(l, "piedra", "vivo");
    expect(enGrupo(l, "vivo")).toEqual(["tortuga", "piedra"]);
    expect(poner(l, "piedra", null)).toEqual({ tortuga: "vivo" });
  });

  it("no deja pasar del cupo, salvo la tarjeta que ya está en ese grupo", () => {
    const l = { piedra: "inerte" };
    expect(cabe(l, "inerte", 1, "rosa")).toBe(false);
    expect(cabe(l, "inerte", 1, "piedra")).toBe(true);
    expect(cabe(l, "vivo", 2, "rosa")).toBe(true);
  });

  it("cuenta lo que falta, revela grupo por grupo y cuenta aciertos", () => {
    const l = { piedra: "vivo", tortuga: "vivo", rosa: "inerte" };
    expect(faltan({ piedra: "vivo" }, tarjetas)).toBe(2);
    expect(ordenRevelado(grupos, l)).toEqual([
      { id: "piedra", grupo: "vivo" },
      { id: "tortuga", grupo: "vivo" },
      { id: "rosa", grupo: "inerte" },
    ]);
    expect(aciertos(tarjetas, l)).toBe(1);
  });
});
