/* Ayudas de dibujo compartidas por los kits: solo geometría, ningún motivo. */

export const LETRA = { fontFamily: "var(--font-baloo), system-ui, sans-serif", fontWeight: 800 } as const;

/** Símbolo de marca de agua en el lienzo de 40×40 (el color lo pone el patrón). */
export function marcaTexto(texto: string, tamano = 30) {
  return (
    <text x="20" y="30" textAnchor="middle" fontSize={tamano} {...LETRA}>
      {texto}
    </text>
  );
}

/** Puntos de una estrella de cinco picos. */
export function puntosEstrella(cx: number, cy: number, r: number, interior = 0.45) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radio = i % 2 === 0 ? r : r * interior;
    return `${(cx + Math.cos(a) * radio).toFixed(1)},${(cy + Math.sin(a) * radio).toFixed(1)}`;
  }).join(" ");
}

/** Corazón centrado en (cx, cy) de ancho ~2r. */
export function corazon(cx: number, cy: number, r: number) {
  return `M${cx} ${cy + r * 0.9} C${cx - r * 1.4} ${cy - r * 0.1} ${cx - r * 0.7} ${cy - r * 1.1} ${cx} ${cy - r * 0.45} C${cx + r * 0.7} ${cy - r * 1.1} ${cx + r * 1.4} ${cy - r * 0.1} ${cx} ${cy + r * 0.9} Z`;
}

/** Engranaje de `dientes` dientes, como contorno relleno (con agujero si `hueco` > 0). */
export function engranaje(cx: number, cy: number, r: number, dientes: number, hueco = 0) {
  const pasos = dientes * 4;
  const puntos = Array.from({ length: pasos }, (_, i) => {
    const a = (i * 2 * Math.PI) / pasos;
    const radio = i % 4 < 2 ? r : r * 0.8;
    return `${(cx + Math.cos(a) * radio).toFixed(1)} ${(cy + Math.sin(a) * radio).toFixed(1)}`;
  });
  const cuerpo = `M${puntos.join(" L")} Z`;
  if (!hueco) return cuerpo;
  return `${cuerpo} M${cx + hueco} ${cy} A${hueco} ${hueco} 0 1 0 ${cx - hueco} ${cy} A${hueco} ${hueco} 0 1 0 ${cx + hueco} ${cy} Z`;
}

/** Gota con la punta arriba. */
export function gota(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r * 1.6} C${cx + r * 0.4} ${cy - r * 0.9} ${cx + r} ${cy - r * 0.4} ${cx + r} ${cy + r * 0.2} A${r} ${r} 0 0 1 ${cx - r} ${cy + r * 0.2} C${cx - r} ${cy - r * 0.4} ${cx - r * 0.4} ${cy - r * 0.9} ${cx} ${cy - r * 1.6} Z`;
}
