import { test } from "node:test";
import assert from "node:assert/strict";
import { aplicarRutas, cadena, esperaDe, frasesDeActividad, leerError, licencias, nombreArchivo, paraDecir } from "../lib.mjs";

test("paraDecir quita comillas angulares, pone mayúscula y punto", () => {
  assert.equal(paraDecir("toca «Enviar respuestas»"), "Toca Enviar respuestas.");
  assert.equal(paraDecir("tranquilo o tranquila"), "Tranquilo o tranquila.");
  assert.equal(paraDecir("¿Qué ves?"), "¿Qué ves?");
});

test("nombreArchivo quita tildes y símbolos", () => {
  assert.equal(nombreArchivo("Año Nuevo/1"), "ano-nuevo-1");
});

test("cadena: salta agotados y respaldo si se pide", () => {
  const ahora = 1000;
  assert.deepEqual(cadena({ ahora }).map((m) => m.id).slice(0, 2), ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"]);
  assert.equal(cadena({ ahora, agotados: { "gemini-3.8-flash-tts": 5000 } })[0].id, "gemini-3.8-flash-lite-tts");
  assert.equal(cadena({ ahora, agotados: { "gemini-3.8-flash-tts": 500 } })[0].id, "gemini-3.8-flash-tts", "la cuota ya se renovó");
  assert.ok(cadena({ ahora, sinRespaldo: true }).every((m) => !m.respaldo));
});

test("leerError distingue cuota diaria, por minuto y bloqueo", () => {
  const dia = leerError(429, "Rate limit exceeded (limit: 10 requests per day on Free Tier). Please retry in 2h55m26s", 0);
  assert.equal(dia.tipo, "dia");
  assert.equal(dia.hasta, (2 * 3600 + 55 * 60 + 26) * 1000);
  assert.deepEqual(leerError(429, 'quota per minute "retryDelay": "41s"', 0), { tipo: "minuto", esperaMs: 41000 });
  assert.equal(leerError(200, '{"promptFeedback":{"blockReason":"PROHIBITED_CONTENT"}}').tipo, "bloqueo");
  assert.equal(leerError(400, "Generated voice prompt was flagged by safety policies.").tipo, "bloqueo");
  assert.equal(leerError(400, "otra cosa").tipo, "otro");
});

test("esperaDe entiende segundos decimales", () => {
  assert.equal(esperaDe("Please retry in 41.5s."), 41500);
  assert.equal(esperaDe("sin dato"), 0);
});

const actividad = {
  slug: "x",
  titulo: "X",
  instruccion: "Toca «Enviar».",
  imagen: "/images/x.webp",
  contenido: {
    elementos: [
      { id: "feliz", texto: "Feliz" },
      { id: "seguro", texto: "Seguro/a", lectura: "seguro o segura" },
    ],
    preguntas: [{ id: "p1", enunciado: "¿Cuál?", opciones: ["sí", "no"] }],
    pares: [{ izquierda: "a", derecha: "b" }],
  },
};

test("frasesDeActividad: consigna, elementos (con lectura), preguntas y opciones; omite lo desconocido", () => {
  const { frases, omitidos } = frasesDeActividad(actividad);
  assert.deepEqual(frases.map((f) => [f.clave, f.texto]), [
    ["instruccion", "Toca Enviar."],
    ["feliz", "Feliz."],
    ["seguro", "Seguro o segura."],
    ["p1", "¿Cuál?"],
    ["p1-opcion-1", "Sí."],
    ["p1-opcion-2", "No."],
  ]);
  assert.deepEqual(omitidos, ["contenido.pares"]);
});

test("aplicarRutas pone audioInstruccion tras instruccion y rellena audioOpciones con null", () => {
  const { frases } = frasesDeActividad(actividad);
  const r = aplicarRutas(actividad, { instruccion: "/audio/i.mp3", seguro: "/audio/s.mp3", "p1-opcion-2": "/audio/no.mp3" }, frases);
  assert.deepEqual(Object.keys(r).slice(0, 4), ["slug", "titulo", "instruccion", "audioInstruccion"]);
  assert.equal(r.contenido.elementos[0].audio, undefined);
  assert.equal(r.contenido.elementos[1].audio, "/audio/s.mp3");
  assert.deepEqual(r.contenido.preguntas[0].audioOpciones, [null, "/audio/no.mp3"]);
  assert.equal(actividad.audioInstruccion, undefined, "no muta el original");
});

test("licencias marca las voces de respaldo", () => {
  const md = licencias("X", {
    a: { archivo: "a.mp3", modelo: "gemini-3.8-flash-tts", voz: "es-419-tutor-3", texto: "Hola." },
    b: { archivo: "b.mp3", modelo: "gemini-2.5-flash-preview-tts", voz: "Sulafat", texto: "Chao." },
  }, "2026-11-18");
  assert.match(md, /`a\.mp3`/);
  assert.match(md, /`Sulafat` 🔶/);
  assert.match(md, /--rehacer-respaldo/);
});
