/*
  Script de observación: se inyecta ANTES de que cargue la página (y en cada
  iframe). Registra lo que la página intenta reproducir y los sprites que
  declara, y lo entrega a la herramienta por `window.__capturaAudio`
  (expuesto con exposeBinding). No cambia el comportamiento del juego.
*/
(() => {
  if (window.__observadorAudio) return;
  window.__observadorAudio = true;
  const enviar = (tipo, datos) => {
    try {
      const pila = (new Error().stack || "").split("\n").slice(2, 6).join(" | ");
      window.__capturaAudio?.({ tipo, t: Date.now(), ...datos, pila });
    } catch {
      /* la herramienta no está escuchando */
    }
  };

  const reproducir = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    if (this instanceof HTMLAudioElement || !(this instanceof HTMLVideoElement)) {
      enviar("play", { src: this.currentSrc || this.src, bucle: this.loop });
    }
    return reproducir.apply(this, args);
  };

  const AudioOriginal = window.Audio;
  if (AudioOriginal) {
    window.Audio = function (src) {
      const a = new AudioOriginal(src);
      if (src) enviar("audio", { src: new URL(src, location.href).href });
      return a;
    };
    window.Audio.prototype = AudioOriginal.prototype;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (Ctx?.prototype?.decodeAudioData) {
    const decodificar = Ctx.prototype.decodeAudioData;
    Ctx.prototype.decodeAudioData = function (buffer, ...resto) {
      enviar("decode", { bytes: buffer?.byteLength ?? null });
      return decodificar.call(this, buffer, ...resto);
    };
  }

  // Howler.js: envolvemos el constructor cuando la librería lo defina.
  let howl;
  try {
    Object.defineProperty(window, "Howl", {
      configurable: true,
      get: () => howl,
      set: (H) => {
        if (typeof H !== "function") {
          howl = H;
          return;
        }
        const Envuelto = function (opciones = {}) {
          const src = [opciones.src].flat().filter(Boolean).map((s) => {
            try {
              return new URL(s, location.href).href;
            } catch {
              return s;
            }
          });
          enviar("howl", { src, sprite: opciones.sprite ?? null, bucle: Boolean(opciones.loop) });
          return new H(opciones);
        };
        Envuelto.prototype = H.prototype;
        Object.assign(Envuelto, H);
        howl = Envuelto;
      },
    });
  } catch {
    /* propiedad no configurable */
  }
})();
