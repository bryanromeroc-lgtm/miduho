import { describe, expect, it } from "vitest";
import greetings from "../../../../curriculo/actividades/ingles/1/greetings.json";
import { leerActividad } from "../tipos/registro";
import { calificarIntento } from "../tipos/contrato";
import { seleccionMultiple } from "../tipos/preguntas";

const preguntas = greetings.contenido.preguntas;

describe("Hello and goodbye", () => {
  it("valida las diez voces y escenas de saludo y despedida", () => {
    expect(leerActividad(greetings).ok).toBe(true);
    expect(preguntas).toHaveLength(10);
    expect(new Set(preguntas.map((p) => p.id)).size).toBe(10);
    expect(greetings.contenido.barajarPreguntas).toBe(true);
    expect(greetings.contenido.barajarOpciones).toBe(true);
    for (const p of preguntas) {
      expect(p.opciones).toEqual(["Llega", "Se va"]);
      expect(p.imagenesOpciones).toEqual(["/images/juegos/greetings/llega.webp", "/images/juegos/greetings/se-va.webp"]);
      expect(p.audio).toBe(`/audio/actividades/greetings/${p.id}.mp3`);
      expect(p.alt).toMatch(/^Un(a)? /);
      expect(p.correcta).toBe(p.id.startsWith("hello-") ? 0 : 1);
    }
  });

  it("otorga un punto solo a la respuesta correcta registrada", () => {
    const bien = Object.fromEntries(preguntas.map((p) => [p.id, p.correcta]));
    const mal = { ...bien, [preguntas[0].id]: 1 - preguntas[0].correcta };
    expect(calificarIntento(seleccionMultiple, greetings.contenido, bien).puntaje).toBe(10);
    expect(calificarIntento(seleccionMultiple, greetings.contenido, mal).puntaje).toBe(9);
  });
});
