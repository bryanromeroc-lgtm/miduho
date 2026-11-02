/** Da una lectura textual de las marcas del transportador, sin decir la medida final. */
export function describirTransportador(angulo: number, desde: "derecha" | "izquierda"): string {
  const escala = desde === "derecha" ? "exterior" : "interior";
  const intervalos = Math.floor(angulo / 10);
  const intermedia = angulo % 10 === 5 ? " y la marca intermedia siguiente" : "";
  return `Transportador con dos escalas. El primer lado sale a la ${desde} y está sobre el cero de la escala ${escala}. El segundo lado se alinea con la marca que está a ${intervalos} intervalos de diez${intermedia} desde ese cero.`;
}

/** Ubicación de un candidato, medida desde el primer lado del ángulo. */
export function describirRayo(letra: string, grados: number): string {
  return `Rayo ${letra}: se separa ${grados} grados del primer lado.`;
}
