import { describe, expect, it } from "vitest";
import { calificarIntento } from "./contrato";
import { definicionDe, nombreTipo } from "./registro";
import { esquemaVideoPreguntas, videoPreguntas } from "./video";

const contenido = {
  video: { proveedor: "youtube" as const, id: "aBc123_-XyZ", tituloOriginal: "Video de prueba" },
  preguntas: Array.from({ length: 5 }, (_, i) => ({
    id: `p${i + 1}`,
    enunciado: `Pregunta ${i + 1}`,
    opciones: ["Sí", "No"],
    correcta: 0,
  })),
};

describe("video-preguntas", () => {
  it("acepta contenido válido y registra el nombre", () => {
    expect(esquemaVideoPreguntas.safeParse(contenido).success).toBe(true);
    expect(definicionDe("video-preguntas")).toBeDefined();
    expect(nombreTipo("video-preguntas")).toBe("Material audiovisual");
  });

  it("rechaza sin preguntas, rango de video inválido e id mal formado", () => {
    expect(esquemaVideoPreguntas.safeParse({ ...contenido, preguntas: [] }).success).toBe(false);
    expect(esquemaVideoPreguntas.safeParse({ ...contenido, video: { ...contenido.video, inicio: 90, fin: 90 } }).success).toBe(false);
    expect(esquemaVideoPreguntas.safeParse({ ...contenido, video: { ...contenido.video, id: "corto" } }).success).toBe(false);
    expect(esquemaVideoPreguntas.safeParse({ ...contenido, preguntas: [{ ...contenido.preguntas[0], audio: "/audio/prueba.mp3" }] }).success).toBe(false);
  });

  it("califica cuatro de cinco como 80 %", () => {
    const leido = esquemaVideoPreguntas.parse(contenido);
    expect(calificarIntento(videoPreguntas, leido, { p1: 0, p2: 0, p3: 0, p4: 0, p5: 1 }).porcentaje).toBe(80);
  });
});
