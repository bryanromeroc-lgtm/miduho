import { describe, expect, it } from "vitest";
import { calificarIntento } from "../../tipos/contrato";
import { DEPARTAMENTOS, VIEWBOX } from "./colombia";
import { departamento, descripcion, disponibles, enumerar, pistaMapa, rondasDe, rumbo, vecinoEnDireccion, zona, type ConfigMapa } from "./generador";
import { mapa } from "./tipo";

const base: ConfigMapa = {
  mapa: "colombia-departamentos",
  semilla: 7,
  rondas: 10,
  regiones: ["caribe", "andina", "pacifica", "orinoquia", "amazonia", "insular"],
  fronteras: true,
};

describe("geometría de Colombia", () => {
  it("tiene las 33 unidades con nombre, región, trazado y centro dentro del mapa", () => {
    expect(DEPARTAMENTOS).toHaveLength(33);
    expect(new Set(DEPARTAMENTOS.map((d) => d.id)).size).toBe(33);
    for (const d of DEPARTAMENTOS) {
      expect(d.nombre.length).toBeGreaterThan(2);
      expect(d.d).toMatch(/^M[\d.]+ [\d.]+L/);
      expect(d.centro[0]).toBeGreaterThan(0);
      expect(d.centro[0]).toBeLessThan(VIEWBOX.ancho);
      expect(d.centro[1]).toBeGreaterThan(0);
      expect(d.centro[1]).toBeLessThan(VIEWBOX.alto);
    }
  });

  it("reparte las regiones naturales: 7 Caribe, 11 Andina, 4 Pacífica, 4 Orinoquía, 6 Amazonía, 1 Insular", () => {
    const cuenta = (r: Parameters<typeof disponibles>[0]) => disponibles(r).length;
    expect([cuenta(["caribe"]), cuenta(["andina"]), cuenta(["pacifica"]), cuenta(["orinoquia"]), cuenta(["amazonia"]), cuenta(["insular"])]).toEqual([7, 11, 4, 4, 6, 1]);
  });

  it("tiene vecindad simétrica y conocida", () => {
    for (const d of DEPARTAMENTOS) for (const v of d.vecinos) expect(departamento(v).vecinos).toContain(d.id);
    expect(departamento("CO-CAL").vecinos).toEqual(["CO-ANT", "CO-BOY", "CO-CUN", "CO-RIS", "CO-TOL"]);
    expect(departamento("CO-DC").vecinos).toContain("CO-CUN");
    expect(departamento("CO-SAP").vecinos).toEqual([]);
  });
});

describe("rondas de «Ubica en el mapa»", () => {
  it("genera lo mismo con la misma configuración y otra cosa con otra semilla", () => {
    expect(rondasDe(base)).toEqual(rondasDe(base));
    expect(rondasDe({ ...base, semilla: 8 })).not.toEqual(rondasDe(base));
  });

  it("no repite departamentos y respeta las regiones elegidas", () => {
    for (let semilla = 1; semilla <= 30; semilla++) {
      const rondas = rondasDe({ ...base, semilla, rondas: 11, regiones: ["andina"] });
      expect(rondas).toHaveLength(11);
      expect(new Set(rondas.map((r) => r.departamento)).size).toBe(11);
      expect(rondas.every((r) => departamento(r.departamento).region === "andina")).toBe(true);
    }
  });

  it("acepta un contenido válido y rechaza más rondas que departamentos", () => {
    expect(mapa.esquemaContenido.safeParse(base).success).toBe(true);
    expect(mapa.esquemaContenido.safeParse({ ...base, rondas: 33 }).success).toBe(true);
    expect(mapa.esquemaContenido.safeParse({ ...base, regiones: ["caribe"], rondas: 8 }).success).toBe(false);
    expect(mapa.esquemaContenido.safeParse({ ...base, regiones: [] }).success).toBe(false);
    expect(mapa.esquemaContenido.safeParse({ ...base, regiones: ["caribe", "caribe"] }).success).toBe(false);
    expect(mapa.esquemaContenido.safeParse({ ...base, mapa: "otro" }).success).toBe(false);
  });
});

describe("calificación 2/1/0", () => {
  const [r1] = rondasDe(base);
  const otro = DEPARTAMENTOS.find((d) => d.id !== r1.departamento)!.id;

  it("vale 2 al primer toque, 1 al segundo y 0 si no", () => {
    expect(mapa.calificar(base, r1.id, [r1.departamento])).toEqual({ correcta: true, puntaje: 2 });
    expect(mapa.calificar(base, r1.id, [otro, r1.departamento])).toEqual({ correcta: false, puntaje: 1 });
    expect(mapa.calificar(base, r1.id, [otro, otro])).toEqual({ correcta: false, puntaje: 0 });
    expect(mapa.calificar(base, r1.id, [])).toEqual({ correcta: false, puntaje: 0 });
  });

  it("califica el intento completo; una ronda sin responder vale 0", () => {
    const rondas = rondasDe(base);
    const respuestas = { [rondas[0].id]: [rondas[0].departamento], [rondas[1].id]: ["CO-XYZ", rondas[1].departamento] };
    const resultado = calificarIntento(mapa, base, respuestas);
    expect(resultado.puntajeMaximo).toBe(20);
    expect(resultado.puntaje).toBe(3);
    expect(mapa.esquemaRespuesta.safeParse(["CO-ANT", "CO-DC", "CO-CAL"]).success).toBe(false);
    expect(mapa.esquemaRespuesta.safeParse(["Antioquia"]).success).toBe(false);
  });

  it("el repaso nombra la región y los límites", () => {
    const rondas = rondasDe({ ...base, regiones: ["insular", "orinoquia"], rondas: 5 });
    for (const r of rondas) {
      const { pregunta, solucion } = mapa.repaso({ ...base, regiones: ["insular", "orinoquia"], rondas: 5 }, r.id);
      expect(pregunta).toBe(`¿Dónde está ${departamento(r.departamento).nombre}?`);
      expect(solucion).toBe(descripcion(r.departamento));
    }
    expect(descripcion("CO-ARA")).toBe("Arauca está en la región Orinoquía y limita con Boyacá, Casanare y Vichada.");
    expect(descripcion("CO-SAP")).toMatch(/insular/);
  });
});

describe("pistas según el error", () => {
  it("vecino: dice hacia dónde queda", () => {
    expect(pistaMapa("CO-CAL", "CO-ANT")).toBe("¡Estás cerca! Caldas limita con Antioquia: está al sur.");
  });

  it("misma región sin ser vecino: anima y orienta", () => {
    expect(pistaMapa("CO-LAG", "CO-COR")).toMatch(/^Vas bien: La Guajira también es de la región Caribe\. Búscalo más al (noreste|este)\.$/);
  });

  it("otra región: nombra la región del pedido", () => {
    expect(pistaMapa("CO-AMA", "CO-LAG")).toBe("La Guajira es de la región Caribe. Amazonas está en la región Amazonía, más al sur.");
  });

  it("islas: manda al recuadro o al continente", () => {
    expect(pistaMapa("CO-SAP", "CO-ATL")).toMatch(/recuadro/);
    expect(pistaMapa("CO-ATL", "CO-SAP")).toMatch(/continente, en la región Caribe/);
  });

  it("calcula los ocho rumbos con el eje y hacia abajo", () => {
    expect(rumbo([0, 0], [0, -10])).toBe("norte");
    expect(rumbo([0, 0], [10, 10])).toBe("sureste");
    expect(rumbo([0, 0], [-10, 0])).toBe("oeste");
    expect(rumbo([0, 0], [-10, -10])).toBe("noroeste");
  });

  it("enumera en español", () => {
    expect(enumerar(["A"])).toBe("A");
    expect(enumerar(["A", "B"])).toBe("A y B");
    expect(enumerar(["A", "B", "C"])).toBe("A, B y C");
  });
});

describe("teclado y nombres accesibles", () => {
  it("las flechas llevan al departamento cercano en esa dirección", () => {
    expect(vecinoEnDireccion("CO-AMA", "arriba")).not.toBeNull();
    expect(departamento(vecinoEnDireccion("CO-AMA", "arriba")!).centro[1]).toBeLessThan(departamento("CO-AMA").centro[1]);
    expect(vecinoEnDireccion("CO-NAR", "izquierda")).toBeNull();
    expect(vecinoEnDireccion("CO-ATL", "abajo")).toBe("CO-MAG");
    for (const d of DEPARTAMENTOS) {
      const algun = (["arriba", "abajo", "izquierda", "derecha"] as const).some((f) => vecinoEnDireccion(d.id, f) !== null);
      expect(algun).toBe(true);
    }
  });

  it("la zona describe la posición sin dar el nombre", () => {
    expect(zona("CO-LAG")).toBe("el norte");
    expect(zona("CO-CHO")).toBe("el oeste");
    expect(zona("CO-AMA")).toBe("el sur");
    expect(zona("CO-SAP")).toBe("las islas del recuadro");
    for (const d of DEPARTAMENTOS) expect(zona(d.id)).not.toContain(d.nombre);
  });
});
