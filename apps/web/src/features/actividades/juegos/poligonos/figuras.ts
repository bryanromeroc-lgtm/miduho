/**
 * Figuras de los vitrales: triángulos y cuadriláteros con coordenadas fijas
 * (viewBox 200 × 160) y las marcas que se deducen de ellas: lados iguales,
 * ángulos rectos y lados paralelos. Funciones puras y probadas.
 */

export type Punto = [number, number];

export const TRIANGULOS = {
  "equilatero-acutangulo": [[100, 12], [180, 150], [20, 150]],
  "isosceles-acutangulo": [[100, 10], [155, 150], [45, 150]],
  "isosceles-rectangulo": [[30, 150], [170, 150], [30, 10]],
  "isosceles-obtusangulo": [[100, 95], [185, 150], [15, 150]],
  "escaleno-acutangulo": [[70, 15], [180, 150], [25, 150]],
  "escaleno-rectangulo": [[30, 150], [180, 150], [30, 40]],
  "escaleno-obtusangulo": [[60, 100], [190, 150], [15, 150]],
} satisfies Record<string, Punto[]>;

export const CUADRILATEROS = {
  cuadrado: [[45, 20], [155, 20], [155, 130], [45, 130]],
  rectangulo: [[20, 35], [180, 35], [180, 125], [20, 125]],
  rombo: [[100, 15], [160, 80], [100, 145], [40, 80]],
  romboide: [[55, 30], [185, 30], [145, 130], [15, 130]],
  trapecio: [[60, 30], [140, 30], [185, 130], [15, 130]],
  trapezoide: [[40, 40], [150, 20], [185, 140], [25, 120]],
} satisfies Record<string, Punto[]>;

export type ClaveTriangulo = keyof typeof TRIANGULOS;
export type NombreCuadrilatero = keyof typeof CUADRILATEROS;

const largo = (a: Punto, b: Punto) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const dir = (a: Punto, b: Punto): Punto => {
  const l = largo(a, b);
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};

/** Marcas de lados iguales: cuántas rayitas lleva cada lado (0 si no se repite su medida). */
export function rayitas(p: Punto[]): number[] {
  const lados = p.map((a, i) => largo(a, p[(i + 1) % p.length]));
  const grupos: number[] = [];
  return lados.map((l) => {
    const iguales = lados.filter((x) => Math.abs(x - l) < 1.5).length;
    if (iguales < 2) return 0;
    let g = grupos.findIndex((x) => Math.abs(x - l) < 1.5);
    if (g < 0) g = grupos.push(l) - 1;
    return g + 1;
  });
}

/** Vértices con ángulo recto. */
export function rectos(p: Punto[]): number[] {
  return p
    .map((v, i) => {
      const a = dir(v, p[(i + p.length - 1) % p.length]);
      const b = dir(v, p[(i + 1) % p.length]);
      return Math.abs(a[0] * b[0] + a[1] * b[1]) < 0.02 ? i : -1;
    })
    .filter((i) => i >= 0);
}

/** Pares de lados opuestos paralelos de un cuadrilátero: [lado0∥lado2, lado1∥lado3]. */
export function paralelos(p: Punto[]): [boolean, boolean] {
  if (p.length !== 4) return [false, false];
  const d = p.map((a, i) => dir(a, p[(i + 1) % 4]));
  const par = (i: number, j: number) => Math.abs(d[i][0] * d[j][1] - d[i][1] * d[j][0]) < 0.02;
  return [par(0, 2), par(1, 3)];
}

/** Ángulo (grados) en cada vértice. */
export function angulosDe(p: Punto[]): number[] {
  return p.map((v, i) => {
    const a = dir(v, p[(i + p.length - 1) % p.length]);
    const b = dir(v, p[(i + 1) % p.length]);
    return (Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) * 180) / Math.PI;
  });
}
