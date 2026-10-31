import { describe, expect, it } from "vitest";
import { partirSilabas } from "./silabas";

describe("guiones blandos en nombres de asignatura", () => {
  it("parte por sílaba las palabras largas y conserva el texto visible", () => {
    expect(partirSilabas("Emprendimiento")).toBe("Empren­dimiento");
    expect(partirSilabas("Matemáticas")).toBe("Mate\u00admáticas");
    expect(partirSilabas("Educación artística")).toBe("Educación artística");
    expect(partirSilabas("Comprensión Lectora").replace(/­/g, "")).toBe("Comprensión Lectora");
  });

  it("deja igual lo que no conoce", () => {
    expect(partirSilabas("Inglés")).toBe("Inglés");
  });
});
