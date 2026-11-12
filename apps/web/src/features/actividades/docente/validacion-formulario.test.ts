import { describe, expect, it, vi } from "vitest";
import { enfocarError, primerErrorMaterial } from "./validacion-formulario";

const datos = { url: "https://youtu.be/aBc123_-XyZ", titulo: "Material de prueba", grupos: ["g1"],
  preguntas: [{ enunciado: "Pregunta", opciones: ["Sí", "No"] }] };

describe("errores asociados del formulario", () => {
  it("asocia el enlace vacío a su campo y mueve allí el foco", () => {
    const error = primerErrorMaterial({ ...datos, url: "" });
    expect(error).toEqual({ campo: "material-url", mensaje: "Pega el enlace del video de YouTube." });
    const foco = vi.fn();
    enfocarError(error!.campo, (id) => id === "material-url" ? { focus: foco } : null);
    expect(foco).toHaveBeenCalledOnce();
  });

  it("asocia título, grupos y opciones a sus campos", () => {
    expect(primerErrorMaterial({ ...datos, titulo: "" })?.campo).toBe("material-titulo");
    expect(primerErrorMaterial({ ...datos, grupos: [] })?.campo).toBe("material-combinacion");
    expect(primerErrorMaterial({ ...datos, preguntas: [{ enunciado: "Pregunta", opciones: ["", "No"] }] })?.campo).toBe("pregunta-0-opcion-0");
    expect(primerErrorMaterial(datos)).toBeNull();
  });
});
