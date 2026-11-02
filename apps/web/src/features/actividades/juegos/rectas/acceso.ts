import type { Tarjeta } from "./tipo";

/** Describe las marcas geométricas visibles sin nombrar la categoría buscada. */
export function describirTarjeta(t: Tarjeta): string {
  if (t.figura === "linea") {
    if (t.tipo === "recta") return "Un trazo con flechas en los dos extremos: continúa hacia ambos lados.";
    if (t.tipo === "semirrecta") return "Un trazo con un punto al inicio y una flecha al final: continúa hacia un lado.";
    return "Un trazo con un punto en cada extremo: termina en ambos lados.";
  }

  // Una recta tiene la misma inclinación si se gira 180°. La descripción
  // permite comparar direcciones aun cuando el cruce quede fuera del dibujo.
  const azul = t.giro;
  const diferencia = t.relacion === "paralelas" ? 0 : t.relacion === "perpendiculares" ? 90 : t.cruceVisible ? 38 : 12;
  const naranja = (azul - diferencia + 180) % 180;
  const cruce = t.relacion === "perpendiculares" || (t.relacion === "secantes" && t.cruceVisible);
  return `Dos trazos con flechas. Desde la horizontal, el azul va a ${azul} grados y el naranja a ${naranja} grados. ${cruce ? "Se cruzan dentro del dibujo." : "No se cruzan dentro del dibujo; las flechas indican que continúan."}`;
}
