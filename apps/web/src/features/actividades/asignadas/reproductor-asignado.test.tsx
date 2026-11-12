import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReproductorAsignado } from "./reproductor-asignado";

const asignacion = {
  id: "as", titulo: "Material de prueba", instruccion: "Mira y responde.",
  contenido: { video: { id: "aBc123_-XyZ", tituloOriginal: "Video de prueba" },
    preguntas: [{ id: "p1", enunciado: "Pregunta de prueba", opciones: ["Sí", "No"], correcta: 0 }] },
  cierraEn: new Date("2099-01-01T00:00:00Z"), maxIntentos: 3, intentosUsados: 0,
  enCurso: null, ultimoResultado: null, ultimoEnviado: null, mejorPorcentaje: null,
};

describe("flujo audiovisual asignado", () => {
  it("mantiene ocultas las preguntas hasta «Ya lo vi»", () => {
    const html = renderToStaticMarkup(<ReproductorAsignado asignacion={asignacion} volverHref="/materias/asig" />);
    expect(html).toContain("Ya lo vi");
    expect(html).toContain("youtube-nocookie.com/embed/");
    expect(html).not.toContain("Pregunta de prueba");
  });

  it("en el último intento muestra el resultado sin ofrecer otro", () => {
    const html = renderToStaticMarkup(<ReproductorAsignado asignacion={{ ...asignacion,
      intentosUsados: 3, mejorPorcentaje: 100, ultimoEnviado: { id: "i3", numero: 3 },
      ultimoResultado: { puntaje: 1, puntajeMaximo: 1, porcentaje: 100,
        items: [{ itemId: "p1", puntajeMaximo: 1, correcta: true, puntaje: 1,
          pregunta: "Pregunta de prueba", solucion: "Sí" }] },
    }} volverHref="/materias/asig" />);
    expect(html).toContain("Intento 3 de 3");
    expect(html).toContain("Pregunta de prueba");
    expect(html).not.toContain("Intentar de nuevo");
  });
});
