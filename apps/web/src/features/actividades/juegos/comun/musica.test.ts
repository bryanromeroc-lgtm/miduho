import { describe, expect, it } from "vitest";
import { musicaDebeSonar } from "./musica";

describe("musicaDebeSonar", () => {
  it("solo reproduce una pista declarada durante una partida visible y activa", () => {
    const ruta = "/audio/juegos/actividad/musica.mp3";
    expect(musicaDebeSonar(ruta, true, true, true)).toBe(true);
    expect(musicaDebeSonar(undefined, true, true, true)).toBe(false);
    expect(musicaDebeSonar(ruta, false, true, true)).toBe(false);
    expect(musicaDebeSonar(ruta, true, false, true)).toBe(false);
    expect(musicaDebeSonar(ruta, true, true, false)).toBe(false);
  });
});
