import { describe, expect, it } from "vitest";
import { barajar, calificarIntento } from "./contrato";
import { armarSopa, jugarPalabra, leerLinea, palabraSecreta, sopaLetras } from "./palabras";
import { completar, seleccionMultiple } from "./preguntas";
import { leerActividad } from "./registro";
import { clasificar, emparejar, memoria, ordenar } from "./relaciones";

const preguntas = {
  preguntas: [
    { id: "a", enunciado: "¿1 + 1?", opciones: ["2", "3"], correcta: 0 },
    { id: "b", enunciado: "¿2 + 2?", opciones: ["3", "4"], correcta: 1 },
    { id: "c", enunciado: "¿3 + 3?", opciones: ["6", "9"], correcta: 0 },
  ],
};

describe("calificarIntento", () => {
  it("suma ítems, cuenta 0 a lo que falta o no cumple el esquema y redondea a dos decimales", () => {
    const r = calificarIntento(seleccionMultiple, preguntas, { a: 0, b: "cuatro" });
    expect(r).toMatchObject({ puntaje: 1, puntajeMaximo: 3, porcentaje: 33.33 });
    expect(r.items.map((i) => i.correcta)).toEqual([true, false, false]);
    expect(r.items[1]).toMatchObject({ pregunta: "¿2 + 2?", solucion: "4" });
  });
});

describe("completar", () => {
  const c = {
    frases: [1, 2, 3].map((n) => ({ id: `f${n}`, antes: "El", despues: "pasó.", opciones: ["camión", "camion"], correcta: "camión" })),
  };
  it("compara la opción exacta: la tilde cuenta", () => {
    expect(completar.calificar(c, "f1", "camión").correcta).toBe(true);
    expect(completar.calificar(c, "f1", "camion").correcta).toBe(false);
  });
});

describe("relaciones", () => {
  it("emparejar acierta cuando se elige el mismo par", () => {
    expect(emparejar.calificar({ pares: [] }, "par1", "par1").puntaje).toBe(1);
    expect(emparejar.calificar({ pares: [] }, "par1", "par2").puntaje).toBe(0);
  });
  it("ordenar da una parte por cada posición exacta", () => {
    const c = { elementos: ["x", "y", "z"].map((id) => ({ id, texto: id })) };
    expect(ordenar.calificar(c, "orden", ["x", "z", "y"])).toEqual({ correcta: false, puntaje: 1 });
    expect(ordenar.calificar(c, "orden", ["x", "y", "z"])).toEqual({ correcta: true, puntaje: 3 });
  });
  it("clasificar compara la categoría", () => {
    const c = { categorias: [{ id: "a", nombre: "A" }], elementos: [{ id: "e", texto: "E", categoria: "a" }] };
    expect(clasificar.calificar(c, "e", "a").correcta).toBe(true);
    expect(clasificar.calificar(c, "e", "b").correcta).toBe(false);
  });
  it("memoria vale el máximo al completar el tablero, sin importar los volteos", () => {
    const c = { parejas: [1, 2, 3].map((n) => ({ id: `m${n}`, a: `a${n}`, b: `b${n}` })) };
    expect(memoria.calificar(c, "tablero", { completo: true, volteos: 40 }).puntaje).toBe(3);
    expect(memoria.calificar(c, "tablero", { completo: false, volteos: 4 }).puntaje).toBe(0);
  });
});

describe("sopa de letras", () => {
  const c = {
    filas: 8,
    columnas: 8,
    palabras: ["SOL", "LUNA", "MARTE", "TIERRA"].map((palabra, i) => ({ id: `w${i}`, palabra })),
  };
  it("coloca todas las palabras siempre en el mismo lugar", () => {
    const sopa = armarSopa(c);
    expect(armarSopa({ ...c })).toEqual(sopa);
    for (const p of c.palabras) {
      const { desde, hasta } = sopa.lugares[p.id];
      expect(leerLinea(sopa.letras, desde, hasta)).toBe(p.palabra);
    }
  });
  it("acepta la palabra marcada en cualquier sentido y rechaza otra línea", () => {
    const { desde, hasta } = armarSopa(c).lugares.w1;
    expect(sopaLetras.calificar(c, "w1", { desde, hasta }).correcta).toBe(true);
    expect(sopaLetras.calificar(c, "w1", { desde: hasta, hasta: desde }).correcta).toBe(true);
    expect(sopaLetras.calificar(c, "w1", { desde: [0, 0], hasta: [0, 0] }).correcta).toBe(false);
  });
  it("leerLinea rechaza lo que no es recto", () => {
    expect(
      leerLinea(
        [
          ["A", "B"],
          ["C", "D"],
        ],
        [0, 0],
        [1, 0],
      ),
    ).toBe("AC");
    expect(
      leerLinea(
        [
          ["A", "B", "C"],
          ["D", "E", "F"],
        ],
        [0, 0],
        [1, 2],
      ),
    ).toBeNull();
  });
});

describe("palabra secreta", () => {
  it("ignora tildes, no cuenta letras repetidas y se detiene al agotar los fallos", () => {
    expect(jugarPalabra("PERDÓN", ["p", "e", "r", "d", "o", "n"], 3)).toEqual({ fallos: 0, adivinada: true, agotada: false });
    expect(jugarPalabra("PAZ", ["X", "X", "Y", "W", "P", "A", "Z"], 3)).toEqual({ fallos: 3, adivinada: false, agotada: true });
    const c = { fallos: 3, palabras: [{ id: "s1", palabra: "PAZ", pista: "Vivir sin violencia" }] };
    expect(palabraSecreta.calificar(c, "s1", ["Z", "A", "P"]).correcta).toBe(true);
  });
});

describe("leerActividad", () => {
  const base = { slug: "prueba", titulo: "Prueba", grado: 5, instruccion: "Responde cada pregunta.", tema: "Sumas" };
  it("valida el contenido con el esquema de su tipo", () => {
    expect(leerActividad({ ...base, tipo: "seleccion-multiple", contenido: preguntas }).ok).toBe(true);
    const mala = leerActividad({ ...base, tipo: "seleccion-multiple", contenido: { preguntas: preguntas.preguntas.slice(0, 2) } });
    expect(mala.ok).toBe(false);
  });
  it("rechaza tipos no registrados y respuestas correctas fuera de rango", () => {
    expect(leerActividad({ ...base, tipo: "crucigrama", contenido: {} })).toEqual({
      ok: false,
      errores: ["tipo: «crucigrama» no está registrado"],
    });
    const fuera = { preguntas: [...preguntas.preguntas.slice(0, 2), { id: "c", enunciado: "?", opciones: ["a", "b"], correcta: 2 }] };
    expect(leerActividad({ ...base, tipo: "seleccion-multiple", contenido: fuera }).ok).toBe(false);
  });
});

describe("barajar", () => {
  it("es determinista y conserva los elementos", () => {
    expect(barajar([1, 2, 3, 4, 5], "x")).toEqual(barajar([1, 2, 3, 4, 5], "x"));
    expect([...barajar([1, 2, 3, 4, 5], "x")].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
