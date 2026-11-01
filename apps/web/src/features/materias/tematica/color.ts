/** Conversión sRGB → OKLCH para verificar los fondos pastel (croma ≤ 0.03). Pura. */

function lineal(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export type Oklch = { l: number; c: number; h: number };

export function hexAOklch(hex: string): Oklch {
  const h = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Color no válido: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => lineal(parseInt(h.slice(i, i + 2), 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    l: L,
    c: Math.hypot(A, B),
    h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  };
}
