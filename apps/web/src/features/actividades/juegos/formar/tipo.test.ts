import { describe, expect, it } from "vitest";
import actividad from "../../../../../curriculo/actividades/comprension-lectora/1/zoo-de-silabas.json";
import { leerActividad } from "../../tipos/registro";
import { calificarIntento } from "../../tipos/contrato";
import { fichasBarajadas, formar } from "./tipo";

const base = { id: "papa", texto: "papá", silabas: ["pa", "pá"], imagen: "/images/juegos/prueba.webp", alt: "Imagen de prueba" };
describe("formar", () => {
  it("valida el contenido curricular y su orden", () => {
    expect(leerActividad(actividad).ok).toBe(true);
    expect(actividad.contenido.elementos.map((e) => e.id)).toEqual(["gato", "vaca", "pato", "perro", "oso", "conejo", "jirafa", "tortuga", "caballo", "oveja"]);
    expect(formar.esquemaContenido.safeParse({ elementos: [{ ...base, silabas: ["pa"] }] }).success).toBe(false);
    expect(formar.esquemaContenido.safeParse({ elementos: [{ ...base, silabas: ["pa", "pa"] }] }).success).toBe(false);
  });
  it("recalcula el primer intento y distingue sílabas repetidas", () => {
    const c = { elementos: [base, { ...base, id: "coco", texto: "coco", silabas: ["co", "co"] }] };
    expect(calificarIntento(formar, c, { papa: ["pa", "pá"], coco: ["co", "co"] }).puntaje).toBe(2);
    expect(calificarIntento(formar, c, { papa: ["pá", "pa"], coco: ["co", "co"] }).puntaje).toBe(1);
    expect(calificarIntento(formar, c, { papa: ["pa", "pa"], coco: ["co"] }).puntaje).toBe(0);
  });
  it("baraja con un solo flujo y nunca deja las fichas en orden", () => {
    const elementos = [{ silabas: ["ga", "to"] }, { silabas: ["co", "ne", "jo"] }, { silabas: ["co", "co"] }];
    for (let i = 0; i < 100; i++) {
      const ordenes = fichasBarajadas(elementos, String(i));
      expect(ordenes.every((o) => o.some((n, j) => n !== j))).toBe(true);
      expect(ordenes.map((o) => o.slice().sort())).toEqual([[0, 1], [0, 1, 2], [0, 1]]);
      expect(fichasBarajadas(elementos, String(i))).toEqual(ordenes);
    }
  });
});
