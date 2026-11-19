/** Juegos que permiten corregir, pero calculan las estrellas con la primera respuesta. */
const PRIMERA_RESPUESTA = new Set([
  "pancarta", "pizarra-decimales", "corrector", "sello", "division", "bocadillo",
  "jarras", "porcentaje", "multiplos", "operaciones", "rectas", "angulos", "aventura", "taller-fracciones", "golpea", "ruta-palabras", "mapa",
]);

export function primeraRespuestaCuenta(tipo: string, presentacion?: string): boolean {
  return PRIMERA_RESPUESTA.has(tipo) || (tipo === "clasificar" && presentacion === "parejas");
}

/**
 * Modo del reproductor: `practica` (el estudiante, práctica libre) o
 * `vista-previa` (la coordinadora o la docente revisan la actividad; nombre
 * alineado con `actividades-en-clase`, D4). En ninguno se guarda nada.
 */
export type ModoReproductor = "practica" | "vista-previa";

export const AVISO_VISTA_PREVIA = "Vista previa: este resultado no se guarda.";

export function textoReglas(tipo: string, modo: ModoReproductor = "practica", presentacion?: string): string {
  const parejas = tipo === "clasificar" && presentacion === "parejas";
  if (modo === "vista-previa") {
    return primeraRespuestaCuenta(tipo, presentacion)
      ? `${AVISO_VISTA_PREVIA} ${parejas ? "La primera ubicación de cada objeto" : "La primera respuesta de cada reto"} cuenta para las estrellas.`
      : AVISO_VISTA_PREVIA;
  }
  if (parejas)
    return "Práctica libre: la primera ubicación de cada objeto cuenta para las estrellas. Puedes corregir para aprender. El resultado no se guarda.";
  if (primeraRespuestaCuenta(tipo, presentacion))
    return "Práctica libre: tu primera respuesta en cada reto cuenta para las estrellas. Si fallas, puedes corregir para aprender. El resultado no se guarda.";
  return "Práctica libre: puedes jugar las veces que quieras. El resultado no se guarda.";
}
