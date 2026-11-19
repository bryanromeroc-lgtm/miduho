import { describe, expect, it } from "vitest";
import { pasosEstructura, type Conteos } from "./pasos";

const completo: Conteos = {
  anios: 1, anioActivo: 2026, periodosActivo: 4, ponderacionActivo: 100, areas: 9, grados: 5,
  gruposActivo: 5, gruposSinDirector: 0, asignaturas: 14, asignaturasSinGrado: 0,
};
const estados = (c: Conteos) => Object.fromEntries(pasosEstructura(c).map((p) => [p.clave, p.estado]));

describe("pasosEstructura", () => {
  it("sigue el orden de configuración y marca todo listo cuando nada falta", () => {
    const pasos = pasosEstructura(completo);
    expect(pasos.map((p) => p.clave)).toEqual(["anios", "periodos", "areas", "grados", "grupos", "asignaturas"]);
    expect(pasos.every((p) => p.estado === "listo")).toBe(true);
    expect(pasos[1].detalle).toBe("Suman 100 % en 2026.");
  });

  it("sin año activo deja pendientes los pasos que dependen de él", () => {
    const e = estados({ ...completo, anios: 0, anioActivo: null, periodosActivo: 0, ponderacionActivo: 0, gruposActivo: 0 });
    expect(e).toMatchObject({ anios: "pendiente", periodos: "pendiente", grupos: "pendiente", areas: "listo" });
  });

  it("pide revisar ponderaciones incompletas, grupos sin director y asignaturas sin grado", () => {
    const pasos = pasosEstructura({ ...completo, ponderacionActivo: 75.5, gruposSinDirector: 1, asignaturasSinGrado: 2 });
    const [, periodos, , , grupos, asignaturas] = pasos;
    expect(periodos).toMatchObject({ estado: "atencion", detalle: "Suman 75,5 %; deben sumar 100 % para cerrar el año." });
    expect(grupos).toMatchObject({ estado: "atencion", detalle: "1 grupo sin director." });
    expect(asignaturas).toMatchObject({ estado: "atencion", detalle: "2 asignaturas sin grado habilitado." });
  });

  it("usa singular y plural en las cifras", () => {
    const pasos = pasosEstructura({ ...completo, areas: 1, grados: 0 });
    expect(pasos[2].cifra).toBe("1 área");
    expect(pasos[3]).toMatchObject({ cifra: "0 grados", estado: "pendiente" });
  });
});
