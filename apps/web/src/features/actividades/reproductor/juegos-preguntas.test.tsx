import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContextoActividad } from "../juegos/comun/escuchar";
import { Quiz } from "./juegos-preguntas";

describe("inicio del quiz con música", () => {
  it("presenta la portada y la consigna de la actividad", () => {
    const html = renderToStaticMarkup(
      <ContextoActividad.Provider value={{ grado: 1, titulo: "Actividad de prueba", imagen: "/images/juegos/prueba/portada.webp", instruccion: "Escucha la consigna de prueba." }}>
        <Quiz contenido={{ preguntas: [], musica: "/audio/prueba.mp3" }} semilla="prueba" alTerminar={() => {}} />
      </ContextoActividad.Provider>,
    );

    expect(html).toContain('src="/images/juegos/prueba/portada.webp"');
    expect(html).toContain('alt=""');
    expect(html).toContain("Actividad de prueba");
    expect(html).toContain("Escucha la consigna de prueba.");
    expect(html).toContain(">Jugar</button>");
    expect(html).not.toContain("Escucha y elige la imagen");
  });
});
