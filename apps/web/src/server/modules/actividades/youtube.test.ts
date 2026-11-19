import { describe, expect, it, vi } from "vitest";
import { ErrorDominio } from "@/server/errores";
import { comprobarVideo, extraerVideo, type ClienteHttpVideo } from "./youtube";

const id = "aBc123_-XyZ";

describe("enlaces de YouTube", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${id}`, undefined],
    [`https://m.youtube.com/watch?v=${id}&start=90`, 90],
    [`https://youtu.be/${id}?t=1m30s`, 90],
    [`https://youtube.com/shorts/${id}`, undefined],
    [`https://youtube.com/embed/${id}`, undefined],
    [`https://youtube.com/live/${id}`, undefined],
    [`https://youtube-nocookie.com/embed/${id}?start=30`, 30],
  ])("extrae %s", (url, inicio) => {
    expect(extraerVideo(url)).toEqual(inicio === undefined ? { id } : { id, inicio });
  });

  it.each([
    `https://youtube.com.ejemplo.test/watch?v=${id}`,
    `https://www.youtube.com/watch?v=corto`,
    `https://youtube-nocookie.com/watch?v=${id}`,
    `javascript:alert(1)`,
  ])("rechaza %s", (url) => {
    expect(() => extraerVideo(url)).toThrow(ErrorDominio);
  });
});

describe("comprobación oEmbed", () => {
  it("consulta solo la URL del video y devuelve su título", async () => {
    const http = vi.fn<ClienteHttpVideo>().mockResolvedValue({ status: 200, json: async () => ({ title: "  Video apto  " }) });
    await expect(comprobarVideo(id, http)).resolves.toEqual({ id, tituloOriginal: "Video apto" });
    const url = new URL(http.mock.calls[0][0]);
    expect(url.origin).toBe("https://www.youtube.com");
    expect(url.searchParams.get("url")).toBe(`https://www.youtube.com/watch?v=${id}`);
    expect(http.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    [401, "VIDEO_NO_INCRUSTABLE"],
    [403, "VIDEO_NO_INCRUSTABLE"],
    [404, "VIDEO_NO_ENCONTRADO"],
    [500, "VIDEO_NO_COMPROBADO"],
  ])("mapea HTTP %i a %s", async (status, code) => {
    const http: ClienteHttpVideo = async () => ({ status, json: async () => ({}) });
    await expect(comprobarVideo(id, http)).rejects.toMatchObject({ code });
  });

  it("mapea un fallo de red o tiempo de espera", async () => {
    const http: ClienteHttpVideo = async () => { throw new Error("sin red"); };
    await expect(comprobarVideo(id, http)).rejects.toMatchObject({ code: "VIDEO_NO_COMPROBADO" });
  });
});
