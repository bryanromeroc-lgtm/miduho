import { describe, expect, it } from "vitest";
import actividad from "../../../../../curriculo/actividades/comprension-lectora/1/separa-las-silabas.json";
import { leerActividad } from "../../tipos/registro";
import { calificarIntento } from "../../tipos/contrato";
import { cortesCorrectos, evaluarCortes, huecosPermitidos, separar } from "./tipo";

const base = { id: "gallina", texto: "gallina", silabas: ["ga", "lli", "na"], imagen: "/images/juegos/separa-las-silabas/gallina.webp", alt: "Dibujo de una gallina." };
const contenido = { elementos: [base] };
describe("separar", () => {
  it("valida la actividad curricular y conserva el orden aprobado", () => {
    expect(leerActividad(actividad).ok).toBe(true);
    expect(actividad.contenido.elementos.map((e) => e.id)).toEqual(["gato", "vaca", "mesa", "mano", "gallina", "jirafa", "naranja", "elefante", "cocodrilo", "camiseta"]);
  });
  it("califica solo el conjunto exacto de cortes", () => {
    expect(cortesCorrectos(base.silabas)).toEqual([2, 5]);
    expect(evaluarCortes(base.silabas, [5, 2])).toBe(true);
    expect(calificarIntento(separar, contenido, { gallina: [2, 5] }).puntaje).toBe(1);
    expect(calificarIntento(separar, contenido, { gallina: [2, 5, 6] }).puntaje).toBe(0);
    expect(calificarIntento(separar, contenido, { gallina: [2] }).puntaje).toBe(0);
    expect(evaluarCortes(base.silabas, [2, 2])).toBe(false);
  });
  it("no ofrece huecos dentro de ch, ll ni rr", () => {
    expect(huecosPermitidos("challar")).toEqual([2, 3, 5, 6]);
    expect(huecosPermitidos("perro")).toEqual([1, 2, 4]);
    expect(separar.esquemaContenido.safeParse({ elementos: [{ ...base, silabas: ["gal", "lina"] }] }).success).toBe(false);
  });
  it("acepta una palabra de una sílaba sin cortes", () => {
    const sol = { ...base, id: "sol", texto: "sol", silabas: ["sol"] };
    expect(separar.esquemaContenido.safeParse({ elementos: [sol] }).success).toBe(true);
    expect(calificarIntento(separar, { elementos: [sol] }, { sol: [] }).puntaje).toBe(1);
  });
  it("rechaza sílabas que no forman la palabra y más de seis", () => {
    expect(separar.esquemaContenido.safeParse({ elementos: [{ ...base, silabas: ["ga", "li", "na"] }] }).success).toBe(false);
    expect(separar.esquemaContenido.safeParse({ elementos: [{ ...base, silabas: Array(7).fill("a") }] }).success).toBe(false);
  });
});
