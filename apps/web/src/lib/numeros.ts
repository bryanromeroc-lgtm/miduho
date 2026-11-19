/**
 * Números en español de Colombia para los juegos de Matemáticas: escritura
 * en palabras, formato con separador de miles y nombre de cada posición.
 * Funciones puras: las usan el tipo (calificar, repaso) y el juego.
 */

const UNIDADES = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

/** El mayor número que saben escribir los juegos: 999 999 999 999. */
export const MAXIMO_EN_LETRAS = 999_999_999_999;

type Genero = { femenino?: boolean };

/**
 * 1–999. Con `apocope`, «uno» se vuelve «un» porque sigue «mil», «millones» o
 * un sustantivo masculino. En femenino: «una», «veintiuna», «doscientas».
 */
function hasta999(n: number, apocope: boolean, femenino = false): string {
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]);
  if (r) {
    if (r < 30) partes.push(UNIDADES[r]);
    else partes.push(DECENAS[Math.floor(r / 10)] + (r % 10 ? ` y ${UNIDADES[r % 10]}` : ""));
  }
  let texto = partes.join(" ");
  if (femenino) texto = texto.replace(/ientos\b/g, "ientas");
  if (apocope) return texto.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un");
  if (femenino) return texto.replace(/uno$/, "una");
  return texto;
}

/** 1–999 999. «mil», no «un mil». */
function hastaMillon(n: number, apocope: boolean, femenino = false): string {
  const m = Math.floor(n / 1000);
  const u = n % 1000;
  const partes: string[] = [];
  if (m) partes.push(m === 1 ? "mil" : `${hasta999(m, true, femenino)} mil`);
  if (u) partes.push(hasta999(u, apocope, femenino));
  return partes.join(" ");
}

/**
 * Escribe un entero de 0 a 999 999 999 999 en palabras: 21 000 000 → «veintiún millones».
 * `femenino` concuerda con un sustantivo femenino («veintiuna centésimas»);
 * `apocope` con uno masculino que sigue («veintiún enteros»).
 */
export function numeroEnLetras(n: number, { femenino = false, apocope = false }: Genero & { apocope?: boolean } = {}): string {
  if (!Number.isInteger(n) || n < 0 || n > MAXIMO_EN_LETRAS) throw new RangeError(`Fuera de rango: ${n}`);
  if (n === 0) return "cero";
  const millones = Math.floor(n / 1_000_000);
  const resto = n % 1_000_000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? "un millón" : `${hastaMillon(millones, true)} millones`);
  if (resto) partes.push(hastaMillon(resto, apocope, femenino));
  return partes.join(" ");
}

/**
 * Separador de miles. 🔶 En Colombia se ven el punto (54.189.833), el espacio
 * y el apóstrofo de millones (54'189.833); falta confirmar con la docente cuál
 * usa el colegio. Cambiarlo aquí lo cambia en todos los juegos.
 */
export const SEPARADOR_MILES = ".";

/** 54189833 → «54.189.833». */
export function formatearNumero(n: number): string {
  return Math.trunc(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, SEPARADOR_MILES);
}

/** Nombre de cada posición, desde la derecha (0 = unidades). */
export const POSICIONES = [
  "unidades",
  "decenas",
  "centenas",
  "unidades de mil",
  "decenas de mil",
  "centenas de mil",
  "unidades de millón",
  "decenas de millón",
  "centenas de millón",
] as const;

/** Abreviatura para el tablero de posiciones. 🔶 «UMi/DMi/CMi» para millones: confirmar la que usa el colegio. */
export const POSICIONES_CORTAS = ["U", "D", "C", "UM", "DM", "CM", "UMi", "DMi", "CMi"] as const;

/** Cifra que ocupa una posición (0 = unidades): cifraEn(54189833, 5) → 1. */
export function cifraEn(n: number, posicion: number): number {
  return Math.floor(n / 10 ** posicion) % 10;
}

/** Cuánto vale la cifra en esa posición: valorPosicional(54189833, 5) → 100000. */
export function valorPosicional(n: number, posicion: number): number {
  return cifraEn(n, posicion) * 10 ** posicion;
}

/** Cantidad de cifras de un entero positivo. */
export function cantidadCifras(n: number): number {
  return Math.trunc(Math.abs(n)).toString().length;
}

/**
 * Parte la escritura en palabras por periodos, de mayor a menor, para la
 * pista del juego: 54189833 → millones «cincuenta y cuatro millones»,
 * miles «ciento ochenta y nueve mil», unidades «ochocientos treinta y tres».
 */
export function periodosEnLetras(n: number): { periodo: "millones" | "miles" | "unidades"; cifras: number; texto: string }[] {
  const millones = Math.floor(n / 1_000_000) % 1000;
  const miles = Math.floor(n / 1000) % 1000;
  const unidades = n % 1000;
  const lista: { periodo: "millones" | "miles" | "unidades"; cifras: number; texto: string }[] = [];
  if (millones) lista.push({ periodo: "millones", cifras: millones, texto: millones === 1 ? "un millón" : `${hasta999(millones, true)} millones` });
  if (miles) lista.push({ periodo: "miles", cifras: miles, texto: miles === 1 ? "mil" : `${hasta999(miles, true)} mil` });
  if (unidades) lista.push({ periodo: "unidades", cifras: unidades, texto: hasta999(unidades, false) });
  return lista;
}

/* ---------- Decimales ---------- */

/**
 * Un decimal se guarda como texto con coma y sin separador de miles
 * («6817,534»): así no hay errores de coma flotante al comparar ni al leer.
 * Hasta tres cifras decimales (milésimas), como en 5.°.
 */
export const PATRON_DECIMAL = /^(0|[1-9]\d{0,8}),(\d{1,3})$/;

const PARTES_DECIMALES = ["décima", "centésima", "milésima"] as const;

export function partesDecimal(texto: string): { entero: number; decimales: string } {
  const m = PATRON_DECIMAL.exec(texto);
  if (!m) throw new RangeError(`Decimal mal escrito: ${texto}`);
  return { entero: Number(m[1]), decimales: m[2] };
}

/** «6817,534» → «6.817,534». */
export function formatearDecimal(texto: string): string {
  const { entero, decimales } = partesDecimal(texto);
  return `${formatearNumero(entero)},${decimales}`;
}

/**
 * «6817,534» → «seis mil ochocientos diecisiete enteros con quinientas treinta
 * y cuatro milésimas». «0,7» → «siete décimas». 🔶 Se usa «enteros con…», la
 * forma más común en Colombia; confirmar con la docente si prefieren
 * «unidades con…» o «enteros, …».
 */
export function decimalEnLetras(texto: string): string {
  const { entero, decimales } = partesDecimal(texto);
  const n = Number(decimales);
  const unidad = PARTES_DECIMALES[decimales.length - 1] + (n === 1 ? "" : "s");
  const parteDecimal = n === 0 ? `cero ${unidad}` : `${numeroEnLetras(n, { femenino: true })} ${unidad}`;
  if (entero === 0) return parteDecimal;
  const parteEntera = entero === 1 ? "un entero" : `${numeroEnLetras(entero, { apocope: true })} enteros`;
  return `${parteEntera} con ${parteDecimal}`;
}

/** Posiciones con decimales: 2 = centenas … 0 = unidades, -1 = décimas, -2 = centésimas, -3 = milésimas. */
export function nombrePosicion(p: number): string {
  if (p >= 0) return POSICIONES[p];
  return ["décimas", "centésimas", "milésimas"][-p - 1];
}

/** Abreviatura: C, D, U, d, c, m. */
export function nombrePosicionCorto(p: number): string {
  if (p >= 0) return POSICIONES_CORTAS[p];
  return ["d", "c", "m"][-p - 1];
}

/** Cifras de un decimal con su posición, de izquierda a derecha. */
export function cifrasDecimal(texto: string): { cifra: string; posicion: number }[] {
  const { entero, decimales } = partesDecimal(texto);
  const ent = String(entero).split("");
  return [
    ...ent.map((c, i) => ({ cifra: c, posicion: ent.length - 1 - i })),
    ...decimales.split("").map((c, i) => ({ cifra: c, posicion: -(i + 1) })),
  ];
}

/** Valor de la cifra en esa posición, escrito: («6817,534», -2) → «0,03». */
export function valorPosicionalDecimal(texto: string, p: number): string {
  const cifra = cifrasDecimal(texto).find((c) => c.posicion === p)?.cifra ?? "0";
  if (p >= 0) return formatearNumero(Number(cifra) * 10 ** p);
  return `0,${"0".repeat(-p - 1)}${cifra}`;
}
