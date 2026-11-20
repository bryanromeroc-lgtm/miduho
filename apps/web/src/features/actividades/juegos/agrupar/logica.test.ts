import { describe, expect, it } from "vitest";
import { aciertos, cabe, cupos, enGrupo, faltan, ordenRevelado, poner, poseGuia, sonidosAgrupar } from "./logica";

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

  it("elige la pose según reacción, momento y fase", () => {
    expect(poseGuia("acierto", "anticipacion", "revelando", "reposo")).toBe("reposo");
    expect(poseGuia("acierto", "accion", "revelando", "reposo")).toBe("senala");
    expect(poseGuia("fallo", "impacto", "revelando", "reposo")).toBe("duda");
    expect(poseGuia("fallo", "recuperacion", "revelando", "reposo")).toBe("reposo");
    expect(poseGuia(null, "reposo", "revelado", "senala")).toBe("senala");
    expect(poseGuia(null, "reposo", "jugando", "senala")).toBe("reposo");
  });

  it("el tema elige solo la carpeta de sonidos", () => {
    const girasol = sonidosAgrupar("girasol");
    const corcho = sonidosAgrupar("corcho");
    expect(Object.keys(corcho)).toEqual(Object.keys(girasol));
    expect(girasol.levantar).toEqual([1, 2, 3].map((n) => `/audio/juegos/agrupar/levantar-${n}.mp3`));
    expect(corcho.levantar).toEqual([1, 2, 3].map((n) => `/audio/juegos/agrupar-corcho/levantar-${n}.mp3`));
    expect(corcho.fin).toEqual(["/audio/juegos/agrupar-corcho/fin.mp3"]);
  });
  it("sobrescribe solo los eventos indicados y conserva los demás", () => {
    const base = sonidosAgrupar("girasol");
    expect(sonidosAgrupar("girasol", { fallo: "/audio/juegos/error.mp3", fin: ["/audio/juegos/exito.mp3"] })).toEqual({
      ...base, fallo: ["/audio/juegos/error.mp3"], fin: ["/audio/juegos/exito.mp3"],
    });
  });
});
