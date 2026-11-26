import { describe, expect, it } from "vitest";
import { rutasDeAudio } from "./audio";
import { barajar, calificarIntento } from "./contrato";
import { armarSopa, jugarPalabra, leerLinea, palabraSecreta, sopaLetras } from "./palabras";
import { completar, concurso, seleccionMultiple } from "./preguntas";
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
  it("emparejar en cinta admite hasta 18 tarjetas, todas con imagen; en columnas, hasta 8", () => {
    const par = (i: number, imagen?: string) => ({ id: `p${i}`, izquierda: `Imagen ${i}`, derecha: `Ficha ${i}`, ...(imagen ? { imagen } : {}) });
    const ok = (n: number, imagen?: string) => Array.from({ length: n }, (_, i) => par(i, imagen));
    const esquema = emparejar.esquemaContenido;
    expect(esquema.safeParse({ presentacion: "cinta", pares: ok(18, "/images/juegos/x/a.webp") }).success).toBe(true);
    expect(esquema.safeParse({ presentacion: "cinta", pares: ok(4) }).success).toBe(false);
    expect(esquema.safeParse({ pares: ok(9) }).success).toBe(false);
    expect(esquema.safeParse({ pares: ok(8) }).success).toBe(true);
  });

  it("emparejar acierta cuando se elige el mismo par", () => {
    expect(emparejar.calificar({ pares: [] }, "par1", "par1").puntaje).toBe(1);
    expect(emparejar.calificar({ pares: [] }, "par1", "par2").puntaje).toBe(0);
  });
  it("ordenar da una parte por cada posición exacta", () => {
    const c = { elementos: ["x", "y", "z"].map((id) => ({ id, texto: id })) };
    expect(ordenar.calificar(c, "orden", ["x", "z", "y"])).toEqual({ correcta: false, puntaje: 1 });
    expect(ordenar.calificar(c, "orden", ["x", "y", "z"])).toEqual({ correcta: true, puntaje: 3 });
  });
  it("casillas acepta doce elementos y recalifica vacías, pero rechaza ids ajenos o repetidos", () => {
    const elementos = Array.from({ length: 12 }, (_, i) => ({ id: `m${i}`, texto: `Mes ${i + 1}` }));
    const escena = { fondo: "/images/juegos/tema/pizarra.webp", personaje: { nombre: "Guía", reposo: "/images/juegos/tema/reposo.webp", senala: "/images/juegos/tema/senala.webp", duda: "/images/juegos/tema/duda.webp" } };
    const c = ordenar.esquemaContenido.parse({ presentacion: "casillas", semilla: 42, escena, elementos });
    expect(c).toMatchObject({ escena });
    expect(ordenar.esquemaContenido.safeParse({ presentacion: "casillas", semilla: 42, escena: { fondo: "https://otro/sitio.webp" }, elementos }).success).toBe(false);
    expect(ordenar.esquemaContenido.safeParse({ presentacion: "casillas", semilla: 42, elementos }).success).toBe(true);
    expect(ordenar.items(c)).toEqual([{ itemId: "orden", puntajeMaximo: 12 }]);
    const respuesta = elementos.map((e, i) => i % 2 ? null : e.id);
    expect(calificarIntento(ordenar, c, { orden: respuesta })).toMatchObject({ puntaje: 6, puntajeMaximo: 12 });
    expect(ordenar.calificar(c, "orden", [...respuesta.slice(0, 11), "ajeno"]).puntaje).toBe(0);
    expect(ordenar.calificar(c, "orden", [...respuesta.slice(0, 11), "m0"]).puntaje).toBe(0);
    expect(ordenar.calificar(c, "orden", respuesta.slice(0, 11)).puntaje).toBe(0);
    expect(calificarIntento(ordenar, c, { orden: [...respuesta.slice(0, 11), "m0"] }).puntaje).toBe(0);
    expect(ordenar.esquemaContenido.safeParse({ elementos }).success).toBe(false);
    expect(ordenar.esquemaContenido.safeParse({ elementos: elementos.slice(0, 8) }).success).toBe(true);
    expect(ordenar.esquemaContenido.safeParse({ presentacion: "casillas", semilla: 1, elementos: [...elementos.slice(0, 11), elementos[0]] }).success).toBe(false);
  });
  it("clasificar compara la categoría", () => {
    const c = { categorias: [{ id: "a", nombre: "A" }], elementos: [{ id: "e", texto: "E", categoria: "a" }] };
    expect(clasificar.calificar(c, "e", "a").correcta).toBe(true);
    expect(clasificar.calificar(c, "e", "b").correcta).toBe(false);
  });
  it("clasificar admite tema, escena y lectura sin cambiar girasol por omisión", () => {
    const categorias = [{ id: "a", nombre: "A" }, { id: "b", nombre: "B" }];
    const elementos = [0, 1, 2, 3].map((n) => ({ id: `e${n}`, texto: "Tranquilo/a", categoria: n % 2 ? "a" : "b" }));
    const base = { presentacion: "tablero" as const, categorias, elementos };
    expect(clasificar.esquemaContenido.safeParse(base).success).toBe(true);
    const nuevo = { ...base, tema: "corcho" as const, escena: { personaje: { nombre: "Guía", reposo: "/images/juegos/x/r.webp", senala: "/images/juegos/x/s.webp", duda: "/images/juegos/x/d.webp" } }, elementos: elementos.map((e) => ({ ...e, lectura: "tranquilo o tranquila" })) };
    expect(clasificar.esquemaContenido.safeParse(nuevo).success).toBe(true);
    expect(clasificar.esquemaContenido.safeParse({ ...nuevo, tema: "desconocido" }).success).toBe(false);
    expect(clasificar.calificar(base, "e0", "b").correcta).toBe(true);
    expect(clasificar.calificar(nuevo, "e0", "b").correcta).toBe(true);
  });
  it("parejas exige dos categorías y una imagen de cada categoría por pareja", () => {
    const categorias = [{ id: "a", nombre: "A" }, { id: "b", nombre: "B" }];
    const elementos = ["uno", "dos"].flatMap((pareja) => categorias.map((c) => ({ id: `${pareja}-${c.id}`, texto: c.nombre, categoria: c.id, pareja, imagen: "/images/juegos/x/ficha.webp" })));
    const esquema = clasificar.esquemaContenido;
    expect(esquema.safeParse({ presentacion: "parejas", categorias, elementos }).success).toBe(true);
    expect(esquema.safeParse({ presentacion: "parejas", categorias: [...categorias, { id: "c", nombre: "C" }], elementos }).success).toBe(false);
    expect(esquema.safeParse({ presentacion: "parejas", categorias, elementos: elementos.slice(0, 3) }).success).toBe(false);
    expect(esquema.safeParse({ presentacion: "parejas", categorias, elementos: elementos.map((e, i) => i ? e : { ...e, categoria: "b" }) }).success).toBe(false);
    expect(esquema.safeParse({ presentacion: "parejas", categorias, elementos: elementos.map((e, i) => i ? e : { ...e, imagen: undefined }) }).success).toBe(false);
    expect(esquema.safeParse({ categorias, elementos: elementos.map((e) => ({ id: e.id, texto: e.texto, categoria: e.categoria, imagen: e.imagen })) }).success).toBe(true);
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

describe("audio en el contenido (juegos-primero)", () => {
  const archivo = (extra: object, contenido: object) => ({
    slug: "prueba-audio",
    titulo: "Prueba de audio",
    tipo: "clasificar",
    grado: 1,
    instruccion: "Ubica cada tarjeta en su grupo.",
    tema: "Prueba",
    contenido,
    ...extra,
  });
  const clasif = (audio?: string) => ({
    categorias: [
      { id: "a", nombre: "A" },
      { id: "b", nombre: "B" },
    ],
    elementos: ["e1", "e2", "e3", "e4"].map((id, i) => ({ id, texto: id, categoria: i % 2 ? "b" : "a", ...(audio ? { audio } : {}) })),
  });
  it("exige audio en todas las tarjetas de sonido y valida símbolo y efectos", () => {
    const base = { ...clasif("/audio/juegos/x.mp3"), presentacion: "tablero", tarjetas: "sonido", efectos: { fallo: "/audio/juegos/error.mp3", fin: ["/audio/juegos/fin.mp3"] } };
    expect(clasificar.esquemaContenido.safeParse(base).success).toBe(true);
    expect(clasificar.esquemaContenido.safeParse({ ...base, elementos: [{ ...base.elementos[0], simbolo: "A a" }, ...base.elementos.slice(1)] }).success).toBe(true);
    expect(clasificar.esquemaContenido.safeParse({ ...base, elementos: [{ ...base.elementos[0], audio: undefined }, ...base.elementos.slice(1)] }).success).toBe(false);
    expect(clasificar.esquemaContenido.safeParse({ ...base, elementos: [{ ...base.elementos[0], simbolo: "ABCD" }, ...base.elementos.slice(1)] }).success).toBe(false);
    expect(clasificar.esquemaContenido.safeParse({ ...base, efectos: { fin: "/images/fin.mp3" } }).success).toBe(false);
    expect(clasificar.esquemaContenido.safeParse(clasif()).success).toBe(true);
  });

  it("acepta audio en la instrucción y en cada elemento", () => {
    expect(leerActividad(archivo({ audioInstruccion: "/audio/consignas/x.mp3" }, clasif("/audio/x/e.mp3"))).ok).toBe(true);
  });
  it("el contenido sin audio sigue siendo válido", () => {
    expect(leerActividad(archivo({}, clasif())).ok).toBe(true);
  });
  it("rechaza rutas fuera de /audio/", () => {
    expect(leerActividad(archivo({ audioInstruccion: "https://x.com/a.mp3" }, clasif())).ok).toBe(false);
    expect(leerActividad(archivo({}, clasif("/images/a.mp3"))).ok).toBe(false);
  });
  it("audioOpciones debe tener una entrada por opción", () => {
    const p = (audioOpciones: (string | null)[]) => ({
      preguntas: ["a", "b", "c"].map((id) => ({ id, enunciado: "¿?", opciones: ["sí", "no"], correcta: 0, audioOpciones })),
    });
    expect(seleccionMultiple.esquemaContenido.safeParse(p(["/audio/a.mp3", null])).success).toBe(true);
    expect(seleccionMultiple.esquemaContenido.safeParse(p(["/audio/a.mp3"])).success).toBe(false);
  });
  it("acepta el quiz ilustrado y conserva válidos los quizzes anteriores", () => {
    const esquema = seleccionMultiple.esquemaContenido;
    expect(esquema.safeParse(preguntas).success).toBe(true);
    const p = { ...preguntas.preguntas[0], imagen: "/images/juegos/x/escena.webp", alt: "Una escena en el patio.", imagenesOpciones: ["/images/juegos/x/a.webp", null] };
    const nuevo = { preguntas: [p, ...preguntas.preguntas.slice(1)], escena: { personaje: { nombre: "Guía", reposo: "/images/juegos/x/r.webp", senala: "/images/juegos/x/s.webp", duda: "/images/juegos/x/d.webp" } }, efectos: { acierto: "/audio/juegos/a.mp3" } };
    expect(esquema.safeParse(nuevo).success).toBe(true);
    expect(concurso.esquemaContenido.safeParse({ ...nuevo, segundos: 20 }).success).toBe(true);
    expect(esquema.safeParse({ ...nuevo, preguntas: [{ ...p, alt: undefined }, ...preguntas.preguntas.slice(1)] }).success).toBe(false);
    expect(esquema.safeParse({ ...nuevo, preguntas: [{ ...p, imagenesOpciones: [null] }, ...preguntas.preguntas.slice(1)] }).success).toBe(false);
  });
  it("acepta orden fijo opcional en quiz y concurso, y rechaza valores no booleanos", () => {
    expect(seleccionMultiple.esquemaContenido.safeParse(preguntas).success).toBe(true);
    expect(seleccionMultiple.esquemaContenido.safeParse({ ...preguntas, barajarOpciones: false }).success).toBe(true);
    expect(concurso.esquemaContenido.safeParse({ ...preguntas, segundos: 20, barajarOpciones: false }).success).toBe(true);
    expect(seleccionMultiple.esquemaContenido.safeParse({ ...preguntas, barajarOpciones: "false" }).success).toBe(false);
  });
  it("rutasDeAudio junta todas las rutas citadas", () => {
    expect(rutasDeAudio({ audioInstruccion: "/audio/i.mp3", contenido: { preguntas: [{ audio: "/audio/p.mp3", audioOpciones: ["/audio/o.mp3", null] }] } })).toEqual([
      "/audio/i.mp3",
      "/audio/p.mp3",
      "/audio/o.mp3",
    ]);
  });
});


describe("seleccion-multiple con presentación diálogo", () => {
  const hablantes = [
    { id: "a", nombre: "A", imagen: "/images/juegos/x/a.webp", alt: "Personaje A", lado: "izquierda" },
    { id: "b", nombre: "B", imagen: "/images/juegos/x/b.webp", alt: "Personaje B", lado: "derecha" },
  ];
  const preguntasDialogo = [1, 2, 3].map((n) => ({ id: `d${n}`, hablante: "a", enunciado: "Hola", opciones: ["Sí", "No"], correcta: 0, audio: "/audio/a.mp3", audioOpciones: ["/audio/b.mp3", "/audio/c.mp3"] }));
  const base = { presentacion: "dialogo", dialogo: { hablantes }, preguntas: preguntasDialogo };
  it("admite diálogo completo y conserva la calificación del quiz", () => {
    expect(seleccionMultiple.esquemaContenido.safeParse(base).success).toBe(true);
    expect(seleccionMultiple.calificar(base, "d1", 0).puntaje).toBe(1);
    expect(seleccionMultiple.calificar(base, "d1", 1).puntaje).toBe(0);
  });
  it("rechaza hablante ajeno, falta de audio y bloque incompleto", () => {
    expect(seleccionMultiple.esquemaContenido.safeParse({ ...base, preguntas: [{ ...preguntasDialogo[0], hablante: "otro" }, ...preguntasDialogo.slice(1)] }).success).toBe(false);
    expect(seleccionMultiple.esquemaContenido.safeParse({ ...base, preguntas: [{ ...preguntasDialogo[0], audioOpciones: undefined }, ...preguntasDialogo.slice(1)] }).success).toBe(false);
    expect(seleccionMultiple.esquemaContenido.safeParse({ ...base, dialogo: undefined }).success).toBe(false);
  });
  it("admite los quizzes anteriores sin diálogo", () => {
    expect(seleccionMultiple.esquemaContenido.safeParse(preguntas).success).toBe(true);
  });
});
