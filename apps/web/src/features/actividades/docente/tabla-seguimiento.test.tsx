import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TablaSeguimiento } from "./tabla-seguimiento";

describe("tabla de seguimiento", () => {
  it("incluye encabezados, resumen y distingue sin entregar de nota cero", () => {
    const html = renderToStaticMarkup(<TablaSeguimiento grupo={{ asignacionId: "as", grupo: "5°-01",
      resumen: { respondieron: 0, total: 1, promedio: null },
      estudiantes: [{ estudianteId: "est", nombres: "", apellidos: "", estado: "SIN_ENTREGAR",
        intentosUsados: 0, nota: null, ultimoEnvio: null }] }} />);
    expect(html).toContain('<th scope="col"');
    expect(html).toContain('<th scope="row"');
    expect(html).toContain("0 de 1 respondieron");
    expect(html).toContain("Sin entregar");
    expect(html).toContain("sin notas");
    expect(html).not.toContain("0 %");
  });
});
