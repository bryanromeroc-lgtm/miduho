/**
 * Rondas de «Golpea el resultado» (sumas y restas). Mecánica estudiada en
 * docs/investigacion/referencia-golpea-el-resultado.md; implementación propia.
 *
 * Todo sale de la configuración de la actividad y su semilla: el cliente y el
 * servidor generan exactamente las mismas operaciones, opciones y huecos.
 */
import { generador } from "../../tipos/contrato";

export type Rango = 10 | 20 | 100;
export type Operacion = "suma" | "resta";

export type ConfigGolpea = {
  semilla: number;
  rondas: number;
  rango: Rango;
  operaciones: Operacion[];
  llevadas: boolean;
};

/** Una opción es un número en un cartel y el hueco (0–9) donde asoma su topo. */
export type OpcionGolpea = { valor: number; hueco: number };

export type RondaGolpea = {
  id: string;
  a: number;
  b: number;
  operacion: Operacion;
  resultado: number;
  /** Si la operación obliga a llevar (suma) o a desagrupar (resta). */
  conLlevada: boolean;
  /** Ordenadas por hueco; exactamente una vale `resultado`. */
  opciones: OpcionGolpea[];
};

export const HUECOS = 10;
/** Cuántos resultados recientes no se repiten. */
const MEMORIA = 6;

export function signo(operacion: Operacion) {
  return operacion === "suma" ? "+" : "−";
}

export function textoOperacion(r: Pick<RondaGolpea, "a" | "b" | "operacion">) {
  return `${r.a} ${signo(r.operacion)} ${r.b}`;
}

export function requiereLlevada(a: number, b: number, operacion: Operacion) {
  return operacion === "suma" ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10;
}

/** Errores típicos: contar de más o de menos, y olvidar o sobrar una decena. */
function desfases(rango: Rango) {
  return rango === 100 ? [1, -1, 2, -2, 10, -10, 20, -20] : [1, -1, 2, -2, 10, -10, 5, -5];
}

function minimoResultado(rango: Rango) {
  return rango === 100 ? 10 : 1;
}

export function rondasDe(config: ConfigGolpea): RondaGolpea[] {
  const azar = generador(`golpea:${config.semilla}:${config.rango}:${config.operaciones.join("+")}:${config.llevadas}`);
  const entre = (min: number, max: number) => min + Math.floor(azar() * (max - min + 1));
  const recientes: number[] = [];
  const rondas: RondaGolpea[] = [];

  for (let i = 0; i < config.rondas; i++) {
    const operacion: Operacion = config.operaciones.length > 1 ? (azar() < 0.5 ? "suma" : "resta") : config.operaciones[0];
    const cuentaLlevada = config.rango > 10;
    // Con llevadas, al menos la mitad de las rondas las exigen (las pares, y algunas más al azar).
    const forzar = cuentaLlevada && config.llevadas && (i % 2 === 0 || azar() < 0.2);
    const { rango } = config;
    let a = 0;
    let b = 0;
    let resultado = 0;
    for (let intento = 0; ; intento++) {
      if (operacion === "suma") {
        a = entre(1, rango - 1);
        b = entre(1, rango - a);
        resultado = a + b;
      } else {
        a = entre(2, rango);
        b = entre(1, a - 1);
        resultado = a - b;
      }
      const relajar = intento > 400;
      if (resultado < minimoResultado(rango)) continue;
      const lleva = requiereLlevada(a, b, operacion);
      if (cuentaLlevada && !config.llevadas && lleva) continue;
      if (forzar && !lleva && !relajar) continue;
      if (recientes.includes(resultado) && !relajar) continue;
      break;
    }
    recientes.push(resultado);
    if (recientes.length > MEMORIA) recientes.shift();

    const total = azar() < 0.5 ? 8 : 7;
    const valores = [resultado];
    const candidatos = mezclar(desfases(rango), azar).map((d) => resultado + d);
    candidatos.push(entre(1, rango), entre(1, rango));
    for (const c of candidatos) {
      if (valores.length >= total) break;
      if (c >= 1 && c <= rango && !valores.includes(c)) valores.push(c);
    }
    while (valores.length < total) {
      const c = entre(1, rango);
      if (!valores.includes(c)) valores.push(c);
    }

    const huecos = mezclar(Array.from({ length: HUECOS }, (_, h) => h), azar);
    const opciones = valores.map((valor, k) => ({ valor, hueco: huecos[k] })).sort((x, y) => x.hueco - y.hueco);
    rondas.push({ id: `r${i + 1}`, a, b, operacion, resultado, conLlevada: requiereLlevada(a, b, operacion), opciones });
  }
  return rondas;
}

function mezclar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
