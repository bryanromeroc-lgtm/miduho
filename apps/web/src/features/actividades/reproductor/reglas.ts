/** Juegos que permiten corregir, pero calculan las estrellas con la primera respuesta. */
const PRIMERA_RESPUESTA = new Set([
  "pancarta", "pizarra-decimales", "corrector", "sello", "division", "bocadillo",
  "jarras", "porcentaje", "multiplos", "operaciones", "rectas", "angulos", "aventura", "taller-fracciones",
]);

export function primeraRespuestaCuenta(tipo: string): boolean {
  return PRIMERA_RESPUESTA.has(tipo);
}

export function textoReglas(tipo: string): string {
  if (primeraRespuestaCuenta(tipo))
    return "Práctica libre: tu primera respuesta en cada reto cuenta para las estrellas. Si fallas, puedes corregir para aprender. El resultado no se guarda.";
  return "Práctica libre: puedes jugar las veces que quieras. El resultado no se guarda.";
}
