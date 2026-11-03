import { describe, expect, it } from "vitest";
import { retosDe, robotsDivisiones } from "./tipo";
import { calificarIntento } from "../../tipos/contrato";

describe("robots divisiones", () => {
  const contenido = { semilla: 731, rondas: 100 };

  it("genera cien retos exactos con cuatro opciones únicas", () => {
    const retos = retosDe(contenido);
    expect(retos).toHaveLength(100);
    expect(retosDe(contenido)).toEqual(retos);
    for (const reto of retos) {
      expect(reto.dividendo / reto.divisor).toBe(reto.cociente);
      expect(reto.opciones).toHaveLength(4);
      expect(new Set(reto.opciones).size).toBe(4);
      expect(reto.opciones).toContain(reto.divisor);
    }
  });

  it("califica el divisor y explica la comprobación", () => {
    const reto = retosDe(contenido)[0];
    expect(robotsDivisiones.calificar(contenido, reto.id, reto.divisor).correcta).toBe(true);
    expect(robotsDivisiones.calificar(contenido, reto.id, null).puntaje).toBe(0);
    expect(robotsDivisiones.repaso(contenido, reto.id).solucion).toContain(`${reto.divisor} × ${reto.cociente}`);
  });

  it("al agotar las oportunidades repasa solo las rondas jugadas, incluido el tiempo agotado", () => {
    const retos = retosDe(contenido);
    const respuestas = { [retos[0].id]: null, [retos[1].id]: retos[1].divisor + 1, [retos[2].id]: null };
    const resultado = calificarIntento(robotsDivisiones, contenido, respuestas, { soloRespondidos: true });
    expect(resultado.items.map((item) => item.itemId)).toEqual(retos.slice(0, 3).map((reto) => reto.id));
    expect(resultado.puntajeMaximo).toBe(3);
    expect(resultado.items).toHaveLength(3);
  });
});
