import { describe, expect, it } from "vitest";
import {
  cifraEn,
  cifrasDecimal,
  decimalEnLetras,
  formatearDecimal,
  formatearNumero,
  numeroEnLetras,
  periodosEnLetras,
  valorPosicional,
  valorPosicionalDecimal,
} from "./numeros";

describe("numeroEnLetras", () => {
  it.each([
    [0, "cero"],
    [16, "dieciséis"],
    [21, "veintiuno"],
    [22, "veintidós"],
    [31, "treinta y uno"],
    [100, "cien"],
    [101, "ciento uno"],
    [500, "quinientos"],
    [1000, "mil"],
    [1001, "mil uno"],
    [21_000, "veintiún mil"],
    [31_000, "treinta y un mil"],
    [101_000, "ciento un mil"],
    [100_000, "cien mil"],
    [1_000_000, "un millón"],
    [1_000_001, "un millón uno"],
    [2_000_000, "dos millones"],
    [21_000_000, "veintiún millones"],
    [54_189_833, "cincuenta y cuatro millones ciento ochenta y nueve mil ochocientos treinta y tres"],
    [700_050_006, "setecientos millones cincuenta mil seis"],
    [1_000_000_000, "mil millones"],
    [3_201_000_000, "tres mil doscientos un millones"],
  ])("%i → %s", (n, texto) => {
    expect(numeroEnLetras(n)).toBe(texto);
  });

  it("rechaza lo que no es un entero en rango", () => {
    expect(() => numeroEnLetras(-1)).toThrow(RangeError);
    expect(() => numeroEnLetras(1.5)).toThrow(RangeError);
  });
});

describe("posiciones y formato", () => {
  it("separa los miles", () => {
    expect(formatearNumero(54189833)).toBe("54.189.833");
    expect(formatearNumero(999)).toBe("999");
  });
  it("lee la cifra y su valor en cada posición", () => {
    expect(cifraEn(54189833, 5)).toBe(1);
    expect(valorPosicional(54189833, 7)).toBe(50_000_000);
  });
  it("parte por periodos, omitiendo los vacíos", () => {
    expect(periodosEnLetras(7_000_250).map((p) => p.texto)).toEqual(["siete millones", "doscientos cincuenta"]);
  });
});

describe("género", () => {
  it("concuerda en femenino y apocopa ante masculino", () => {
    expect(numeroEnLetras(21, { femenino: true })).toBe("veintiuna");
    expect(numeroEnLetras(534, { femenino: true })).toBe("quinientas treinta y cuatro");
    expect(numeroEnLetras(201, { femenino: true })).toBe("doscientas una");
    expect(numeroEnLetras(21, { apocope: true })).toBe("veintiún");
  });
});

describe("decimales", () => {
  it.each([
    ["6817,534", "seis mil ochocientos diecisiete enteros con quinientas treinta y cuatro milésimas"],
    ["0,7", "siete décimas"],
    ["1,01", "un entero con una centésima"],
    ["21,25", "veintiún enteros con veinticinco centésimas"],
    ["3,201", "tres enteros con doscientas una milésimas"],
    ["2,50", "dos enteros con cincuenta centésimas"],
  ])("%s → %s", (n, texto) => {
    expect(decimalEnLetras(n)).toBe(texto);
  });

  it("formatea, parte en cifras y da el valor de cada posición", () => {
    expect(formatearDecimal("6817,534")).toBe("6.817,534");
    expect(cifrasDecimal("12,05").map((c) => c.posicion)).toEqual([1, 0, -1, -2]);
    expect(valorPosicionalDecimal("6817,534", -2)).toBe("0,03");
    expect(valorPosicionalDecimal("6817,534", 3)).toBe("6.000");
  });

  it("rechaza decimales mal escritos", () => {
    expect(() => decimalEnLetras("3.25")).toThrow(RangeError);
    expect(() => decimalEnLetras("03,2")).toThrow(RangeError);
    expect(() => decimalEnLetras("3,2541")).toThrow(RangeError);
  });
});
