import { describe, expect, it } from "vitest";
import actividad from "../../../../../curriculo/actividades/matematicas/1/comparar-numeros.json";
import { calificarIntento } from "../../tipos/contrato";
import { describirColeccion, esCorrecta, frase, relacionDe, esquemaContenidoComparar, tallerComparar } from "./tipo";

const contenido = esquemaContenidoComparar.parse(actividad.contenido);
describe("taller-comparar", () => {
  it("lee relaciones y marcos de diez", () => {
    expect([relacionDe(3, 5), relacionDe(8, 4), relacionDe(6, 6)]).toEqual(["menor", "mayor", "igual"]);
    expect(frase(6, 6)).toBe("6 es igual a 6");
    expect(describirColeccion(12, "rana", "ranas")).toBe("12 ranas: un marco lleno y 2 más");
    expect(describirColeccion(20, "rana", "ranas")).toBe("20 ranas: dos marcos llenos");
  });
  it("valida ids, objetos, rango y relaciones", () => {
    expect(contenido.rondas).toHaveLength(10);
    const malo = structuredClone(actividad.contenido);
    malo.rondas[0].correcta = "mayor";
    expect(esquemaContenidoComparar.safeParse(malo).success).toBe(false);
    malo.rondas[0].correcta = "menor";
    malo.rondas[0].izquierda.objeto = "no-existe";
    expect(esquemaContenidoComparar.safeParse(malo).success).toBe(false);
    malo.rondas[0].izquierda.objeto = "mango";
    malo.rondas[1].id = malo.rondas[0].id;
    expect(esquemaContenidoComparar.safeParse(malo).success).toBe(false);
    malo.rondas[1].id = "ocho-cuatro";
    malo.rondas[0].izquierda.cantidad = 21;
    expect(esquemaContenidoComparar.safeParse(malo).success).toBe(false);
    malo.rondas[0].izquierda.cantidad = 3;
    malo.rondas[6].izquierda.cantidad = 20;
    expect(esquemaContenidoComparar.safeParse(malo).success).toBe(false);
  });
  it("acepta todas las soluciones de construir y califica la primera respuesta", () => {
    const mayor = contenido.rondas[6];
    expect(esCorrecta(mayor, 12)).toBe(true);
    expect(esCorrecta(mayor, 20)).toBe(true);
    expect(esCorrecta(mayor, 11)).toBe(false);
    const menor = contenido.rondas[9];
    expect(esCorrecta(menor, 0)).toBe(true);
    expect(esCorrecta(menor, 15)).toBe(true);
    expect(esCorrecta(menor, 16)).toBe(false);
    const nota = calificarIntento(tallerComparar, contenido, { "tres-cinco": "menor", "mas-que-once": 11 });
    expect(nota.puntaje).toBe(1);
    expect(nota.puntajeMaximo).toBe(10);
    expect(nota.items[6].solucion).toContain("12 a 20");
  });
});
