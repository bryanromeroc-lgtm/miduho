/**
 * Expresiones de operaciones combinadas: lectura, paso siguiente según la
 * jerarquía (paréntesis; luego × y ÷ de izquierda a derecha; luego + y −)
 * y aplicación de un paso. Funciones puras: las usan el tipo y el juego.
 */

export type Operador = "+" | "−" | "×" | "÷";
export type Token = { t: "n"; v: number } | { t: "op"; v: Operador } | { t: "(" } | { t: ")" };

const OPS: Record<string, Operador> = { "+": "+", "-": "−", "−": "−", "*": "×", "×": "×", "x": "×", "/": "÷", "÷": "÷", ":": "÷" };

/** «7 + 3 × (10 − 4) ÷ 2» → tokens. Lanza si hay un símbolo desconocido. */
export function leerExpresion(texto: string): Token[] {
  const tokens: Token[] = [];
  const re = /\s*(\d+|[()+\-−*×x/÷:])/gy;
  let m: RegExpExecArray | null;
  let fin = 0;
  while ((m = re.exec(texto))) {
    const s = m[1];
    fin = re.lastIndex;
    if (/^\d+$/.test(s)) tokens.push({ t: "n", v: Number(s) });
    else if (s === "(" || s === ")") tokens.push({ t: s });
    else tokens.push({ t: "op", v: OPS[s] });
  }
  if (texto.slice(fin).trim()) throw new SyntaxError(`Símbolo desconocido en «${texto}»`);
  return tokens;
}

export function escribirExpresion(tokens: Token[]): string {
  return tokens
    .map((k) => (k.t === "n" ? String(k.v) : k.t === "op" ? ` ${k.v} ` : k.t))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function operar(a: number, op: Operador, b: number): number {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  return a / b;
}

/** Índice (en tokens) del operador que va primero y el valor de esa operación. */
export function siguientePaso(tokens: Token[]): { k: number; a: number; op: Operador; b: number; valor: number } | null {
  let desde = 0;
  let hasta = tokens.length;
  // Paréntesis más interno: el último «(» antes del primer «)».
  const cierra = tokens.findIndex((k) => k.t === ")");
  if (cierra >= 0) {
    for (let i = cierra; i >= 0; i--) {
      if (tokens[i].t === "(") {
        desde = i + 1;
        hasta = cierra;
        break;
      }
    }
  }
  const tramo = tokens.slice(desde, hasta).map((k, i) => ({ k, i: i + desde }));
  const elegido =
    tramo.find(({ k }) => k.t === "op" && (k.v === "×" || k.v === "÷")) ?? tramo.find(({ k }) => k.t === "op" && (k.v === "+" || k.v === "−"));
  if (!elegido) return null;
  const k = elegido.i;
  const [ta, tb] = [tokens[k - 1], tokens[k + 1]];
  if (ta?.t !== "n" || tb?.t !== "n" || tokens[k].t !== "op") throw new SyntaxError("Expresión mal formada");
  const op = (tokens[k] as { v: Operador }).v;
  return { k, a: ta.v, op, b: tb.v, valor: operar(ta.v, op, tb.v) };
}

/** Reemplaza «a op b» (en k) por su valor y quita los paréntesis que quedan con un solo número. */
export function aplicarPaso(tokens: Token[], k: number, valor: number): Token[] {
  let r: Token[] = [...tokens.slice(0, k - 1), { t: "n", v: valor }, ...tokens.slice(k + 2)];
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (let i = 0; i + 2 < r.length; i++) {
      if (r[i].t === "(" && r[i + 1].t === "n" && r[i + 2].t === ")") {
        r = [...r.slice(0, i), r[i + 1], ...r.slice(i + 3)];
        cambio = true;
        break;
      }
    }
  }
  return r;
}

/** Todos los pasos de una expresión, en orden. */
export function pasos(texto: string) {
  let tokens = leerExpresion(texto);
  const lista: { tokens: Token[]; k: number; a: number; op: Operador; b: number; valor: number }[] = [];
  for (let p = siguientePaso(tokens); p; p = siguientePaso(tokens)) {
    lista.push({ tokens, ...p });
    tokens = aplicarPaso(tokens, p.k, p.valor);
  }
  return { pasos: lista, final: tokens.length === 1 && tokens[0].t === "n" ? tokens[0].v : NaN };
}
