import { describe, expect, it } from "vitest";
import { estadoEntrega, formatoCierre, formatoRetraso, nombreArchivoDrive, validarArchivoEntrega, TAMANO_MAXIMO_ENTREGA } from "./entregas";

const cierre = new Date("2026-11-12T20:00:00Z");
describe("estadoEntrega", () => {
  it("trata el cierre exacto como pendiente o entregada", () => {
    expect(estadoEntrega({ cierraEn: cierre, ahora: cierre }).estado).toBe("Pendiente");
    expect(estadoEntrega({ cierraEn: cierre, ultimaSubida: cierre, ahora: cierre }).estado).toBe("Entregada");
  });
  it("deriva tardía y recalcula al ampliar el plazo", () => {
    const subida = new Date("2026-11-12T21:00:00Z");
    expect(estadoEntrega({ cierraEn: cierre, ultimaSubida: subida, ahora: subida })).toEqual({ estado: "Tardía", retrasoMs: 3600000 });
    expect(estadoEntrega({ cierraEn: new Date("2026-11-13T20:00:00Z"), ultimaSubida: subida, ahora: subida }).estado).toBe("Entregada");
    expect(estadoEntrega({ cierraEn: cierre, ahora: subida }).estado).toBe("Sin entregar");
  });
});

describe("nombres y fechas", () => {
  it("usa la fecha de Colombia, sanea y versiona", () => {
    expect(nombreArchivoDrive("Notas/1", "Docente: ficticia", new Date("2026-11-13T02:00:00Z"), 2, ".xlsx"))
      .toBe("Notas 1 — Docente ficticia — 2026-11-12 _v2.xlsx");
    const largo = nombreArchivoDrive("x".repeat(250), "Cuenta", cierre, 1, "pdf");
    expect(largo.length).toBeLessThanOrEqual(200);
    expect(largo).toContain("2026-11-12.pdf");
    expect(formatoCierre(cierre)).toMatch(/12 de nov/);
    expect(formatoRetraso(130 * 60_000)).toBe("2 h 10 min después del cierre");
  });
});

describe("validarArchivoEntrega", () => {
  it("comprueba firmas y tamaño", () => {
    expect(validarArchivoEntrega(new Uint8Array([0x50, 0x4b, 3, 4]), ".xlsx")).toBeNull();
    expect(validarArchivoEntrega(new Uint8Array([1, 2, 3]), ".xlsx")).toContain("Excel");
    expect(validarArchivoEntrega(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), ".xls")).toBeNull();
    expect(validarArchivoEntrega(new TextEncoder().encode("%PDF-1.7"), ".pdf")).toBeNull();
    expect(validarArchivoEntrega(new Uint8Array([0xff, 0xfe]), ".csv")).toContain("CSV");
    expect(validarArchivoEntrega(new Uint8Array(TAMANO_MAXIMO_ENTREGA + 1), ".csv")).toContain("20 MB");
  });
});
