/*
  Lógica pura de la cinta (emparejar, presentación «cinta»). Una tarjeta con
  imagen cuelga de la cuerda y se toca la ficha de texto que le corresponde.

  - Acierto: la ficha sale del tablero y pasa la tarjeta siguiente.
  - Primer fallo: se avisa con una pista y se puede intentar otra vez.
  - Segundo fallo: se muestra la ficha correcta, la tarjeta cuenta como
    fallada y pasa a la siguiente.

  La respuesta que se califica en el servidor es la **primera** ficha tocada
  en cada tarjeta (`primeros`), igual que en `emparejar` en columnas.
*/

export const INTENTOS_POR_TARJETA = 2;

export type EstadoCinta = {
  /** Posición de la tarjeta actual en el orden barajado. */
  indice: number;
  /** Fichas equivocadas en la tarjeta actual. */
  fallos: number;
  /** Primera ficha tocada en cada tarjeta (id del par → id de la ficha). */
  primeros: Record<string, string>;
  /** Fichas que ya salieron del tablero. */
  quitadas: string[];
  aciertos: number;
};

export type Resultado = "acierto" | "pista" | "revelar";

export const estadoInicial = (): EstadoCinta => ({ indice: 0, fallos: 0, primeros: {}, quitadas: [], aciertos: 0 });

/** Aplica el toque en una ficha. `tarjeta` es el id del par que cuelga de la cuerda; la ficha correcta tiene ese mismo id. */
export function responder(estado: EstadoCinta, tarjeta: string, ficha: string): { estado: EstadoCinta; resultado: Resultado } {
  if (estado.quitadas.includes(ficha)) return { estado, resultado: "pista" };
  const primeros = tarjeta in estado.primeros ? estado.primeros : { ...estado.primeros, [tarjeta]: ficha };
  if (ficha === tarjeta) {
    const acierto = estado.fallos === 0;
    return {
      resultado: "acierto",
      estado: { ...estado, primeros, quitadas: [...estado.quitadas, ficha], aciertos: estado.aciertos + (acierto ? 1 : 0) },
    };
  }
  const fallos = estado.fallos + 1;
  return { resultado: fallos >= INTENTOS_POR_TARJETA ? "revelar" : "pista", estado: { ...estado, primeros, fallos } };
}

/** Pasa a la tarjeta siguiente. Si era una ficha revelada, esa ficha también sale. */
export function avanzar(estado: EstadoCinta, tarjeta: string): EstadoCinta {
  const quitadas = estado.quitadas.includes(tarjeta) ? estado.quitadas : [...estado.quitadas, tarjeta];
  return { ...estado, indice: estado.indice + 1, fallos: 0, quitadas };
}

export const terminado = (estado: EstadoCinta, total: number) => estado.indice >= total;
