import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { leerActividad } from "../../tipos/registro";
import { rectas } from "./tipo";

const par = (relacion: string, giro = 0) => ({ figura: "par", relacion, giro });
const ronda = (id: string) => ({ id, busca: "paralelas", opciones: [par("secantes"), par("paralelas"), par("perpendiculares")] });
const base = { slug: "x-y", titulo: "Prueba", tipo: "rectas", grado: 5, instruccion: "Haz algo.", tema: "Rectas" };

describe("rectas", () => {
  it("califica la tarjeta elegida", () => {
    const leida = leerActividad({ ...base, contenido: { rondas: ["a", "b", "c", "d"].map(ronda) } });
    expect(leida.ok).toBe(true);
    if (!leida.ok) return;
    const r = calificarIntento(rectas, leida.actividad.contenido as never, { a: 1, b: 0, c: 1, d: 9 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, true, false]);
  });

  it("no acepta perpendiculares cuando se buscan secantes", () => {
    const mala = { id: "e", busca: "secantes", opciones: [par("secantes"), par("perpendiculares")] };
    expect(leerActividad({ ...base, contenido: { rondas: [...["a", "b", "c"].map(ronda), mala] } }).ok).toBe(false);
  });
});
