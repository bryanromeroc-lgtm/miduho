/**
 * Guiones blandos (U+00AD) en las palabras largas de los nombres de
 * asignatura (11 letras o más): solo se ven si la palabra no cabe y parte.
 * El punto de corte sigue la sílaba en español.
 */
const CORTES: Record<string, string> = {
  comprension: "Compren­sión",
  emprendimiento: "Empren­dimiento",
  matematicas: "Mate­máticas",
};

const sinTildes = (p: string) => p.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function partirSilabas(nombre: string): string {
  return nombre
    .split(" ")
    .map((palabra) => {
      const corte = CORTES[sinTildes(palabra)];
      if (!corte) return palabra;
      // Respeta la mayúscula inicial del original.
      const primera = palabra[0] === palabra[0].toUpperCase();
      return (primera ? corte[0].toUpperCase() : corte[0].toLowerCase()) + corte.slice(1);
    })
    .join(" ");
}
