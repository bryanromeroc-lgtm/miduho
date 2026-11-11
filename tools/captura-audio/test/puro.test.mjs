import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agruparPorHuella,
  crearLimitador,
  detectarUrlsAudio,
  esAudio,
  filaLicencia,
  inferirRol,
  leerSonoridad,
  leerSprites,
  nombreDesdeUrl,
  objetivoLufs,
} from "../src/puro.mjs";

test("esAudio reconoce por MIME y por extensión", () => {
  assert.equal(esAudio("https://a.com/x.bin", "audio/mpeg"), true);
  assert.equal(esAudio("https://a.com/sonidos/bien.mp3?v=2"), true);
  assert.equal(esAudio("https://a.com/juego.js"), false);
  assert.equal(esAudio("https://a.com/intro.webm", "video/webm"), false);
});

test("detectarUrlsAudio encuentra rutas absolutas, relativas y escapadas, sin repetir", () => {
  const texto = `
    var s = new Howl({ src: ["sounds/correct.mp3", "sounds/correct.ogg"] });
    play('https://cdn.x.org/a/b/win.wav'); play("sounds/correct.mp3");
    {"musica":"audio\\/fondo.m4a?x=1"} url(/sfx/pop.ogg) ".mp3" 'nada.js'
  `;
  const { urls } = detectarUrlsAudio(texto, "https://juego.net/es/index.html");
  assert.deepEqual(urls, [
    "https://juego.net/es/sounds/correct.mp3",
    "https://juego.net/es/sounds/correct.ogg",
    "https://cdn.x.org/a/b/win.wav",
    "https://juego.net/es/audio/fondo.m4a?x=1",
    "https://juego.net/sfx/pop.ogg",
  ]);
});

test("detectarUrlsAudio resuelve rutas armadas con un prefijo declarado", () => {
  const texto = `<script>var sonidos="/juegos/9019/img/sounds/"</script> if(!sonidos){var sonidos="img/sounds/"} fb.ok=sonidos+'ok.mp3'; fb.fin=sonidos+'level_end.mp3';`;
  const { urls } = detectarUrlsAudio(texto, "https://www.ejemplo.com/juegos/ficha?x=1");
  assert.ok(urls.includes("https://www.ejemplo.com/juegos/9019/img/sounds/ok.mp3"));
  assert.ok(urls.includes("https://www.ejemplo.com/juegos/9019/img/sounds/level_end.mp3"));
  assert.ok(urls.includes("https://www.ejemplo.com/juegos/img/sounds/ok.mp3"));
});

test("detectarUrlsAudio separa los audios data: en base64", () => {
  const b64 = "A".repeat(240);
  const { urls, datos } = detectarUrlsAudio(`x="data:audio/mpeg;base64,${b64}"`, "https://a.com/");
  assert.equal(urls.length, 0);
  assert.deepEqual(datos, [{ mime: "audio/mpeg", base64: b64 }]);
});

test("leerSprites lee los cortes al estilo Howler", () => {
  const texto = `new Howl({src:['atlas.mp3'], sprite: { aparecer: [0, 450], "acierto": [500, 300], error:[900,250,false], fin: [1200, 2000, true] }})`;
  assert.deepEqual(leerSprites(texto), [
    { nombre: "aparecer", inicio_ms: 0, duracion_ms: 450, bucle: false },
    { nombre: "acierto", inicio_ms: 500, duracion_ms: 300, bucle: false },
    { nombre: "error", inicio_ms: 900, duracion_ms: 250, bucle: false },
    { nombre: "fin", inicio_ms: 1200, duracion_ms: 2000, bucle: true },
  ]);
  assert.deepEqual(leerSprites("sin sprites aquí"), []);
});

test("inferirRol: efecto corto de acierto, música en bucle, voz por nombre; siempre inferido", () => {
  assert.deepEqual(inferirRol({ nombre: "correct.mp3", duracion_s: 0.4 }), { rol: "efecto", evento: "acierto", certeza: "inferido" });
  assert.deepEqual(inferirRol({ nombre: "track1.mp3", duracion_s: 95, bucle: true }), { rol: "musica", evento: "fondo", certeza: "inferido" });
  assert.equal(inferirRol({ nombre: "instruccion_1.mp3", duracion_s: 3.2 }).rol, "voz");
  assert.equal(inferirRol({ nombre: "instruccion_1.mp3", duracion_s: 3.2 }).evento, "instruccion");
  assert.equal(inferirRol({ nombre: "a7f3.mp3", duracion_s: 0.3 }).rol, "efecto");
  assert.equal(inferirRol({ nombre: "a7f3.mp3", duracion_s: 4 }).rol, "desconocido");
  assert.equal(inferirRol({ nombre: "a7f3.mp3", duracion_s: 4, contexto: "onWin(){ play(x) }" }).evento, "fin");
  assert.equal(inferirRol({ nombre: "/content-sounds/tts/es-es-abrilneural/39be_64.mp3", duracion_s: 1.7 }).rol, "voz");
  assert.deepEqual(inferirRol({ nombre: "primarytilepickup1.ogg", duracion_s: 0.4 }), { rol: "efecto", evento: "toque", certeza: "inferido" });
  assert.equal(inferirRol({ nombre: "primarygamesuccessful.ogg", duracion_s: 4 }).evento, "fin");
  // El código cercano menciona «ok» pero el nombre dice «error»: gana el nombre.
  assert.equal(inferirRol({ nombre: "img/sounds/error.mp3", duracion_s: 0.2, contexto: "fb.ok=s+'ok.mp3';fb.error=s+'error.mp3'" }).evento, "error");
});

test("agruparPorHuella deja una copia por sha256 con todas las URL", () => {
  const g = agruparPorHuella([
    { sha256: "aa", url: "https://a.com/1.mp3", origen_deteccion: "red" },
    { sha256: "bb", url: "https://a.com/2.mp3", origen_deteccion: "red" },
    { sha256: "aa", url: "https://b.com/copia.mp3", origen_deteccion: "script" },
  ]);
  assert.equal(g.length, 2);
  assert.deepEqual(g[0].urls, ["https://a.com/1.mp3", "https://b.com/copia.mp3"]);
  assert.deepEqual(g[0].origen_deteccion, ["red", "script"]);
});

test("crearLimitador espacia las peticiones al mismo dominio", async () => {
  let t = 0;
  const esperas = [];
  const esperar = crearLimitador({ intervaloMs: 1000, ahora: () => t, dormir: async (ms) => { esperas.push(ms); t += ms; } });
  await esperar("https://a.com/1");
  await esperar("https://a.com/2");
  await esperar("https://b.com/1");
  await esperar("https://a.com/3");
  assert.deepEqual(esperas, [1000, 1000]);
});

test("leerSonoridad lee el I del resumen de ebur128", () => {
  const salida = "[Parsed_ebur128_0] t: 1 M: -20 S: -21 I: -30.0 LUFS\n  Summary:\n\n  Integrated loudness:\n    I:         -19.4 LUFS\n";
  assert.equal(leerSonoridad(salida), -19.4);
  assert.equal(leerSonoridad("Summary:\n I: -inf LUFS"), null);
  assert.equal(leerSonoridad(salida, 0.2), null);
});

test("nombreDesdeUrl, objetivoLufs y filaLicencia", () => {
  assert.equal(nombreDesdeUrl("https://a.com/s/Canción%20ñu.mp3?x"), "Cancion-nu.mp3");
  assert.equal(objetivoLufs("musica"), -23);
  assert.equal(objetivoLufs("voz"), -18);
  assert.equal(
    filaLicencia({ archivo: "bien.mp3", slug: "cokitos-x", id: "p3", url: "https://a.com/b.mp3", autor: "digipuzzle.net", licencia: "permiso declarado 🔶" }),
    "| `bien.mp3` | `cokitos-x#p3` | https://a.com/b.mp3 | digipuzzle.net | permiso declarado 🔶 |",
  );
});
