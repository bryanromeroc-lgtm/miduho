/**
 * Lectura de CSV para la importación de usuarios (INC1R-06, requerimiento §9).
 * RFC 4180 con comillas; acepta BOM, separador «,» o «;» (Excel en es-CO
 * exporta con «;») y finales de línea CRLF/LF. Sin dependencias externas.
 */

export const TIPOS_IMPORTACION = ["estudiantes", "docentes"] as const;
export type TipoImportacion = (typeof TIPOS_IMPORTACION)[number];

/** Encabezados exactos de cada plantilla (§9.1 y §9.2). */
export const ENCABEZADOS: Record<TipoImportacion, readonly string[]> = {
  estudiantes: ["nombres", "apellidos", "correo", "año", "grado", "grupo"],
  docentes: ["nombres", "apellidos", "correo"],
};

export const MAX_FILAS_IMPORTACION = 500;
/** Holgura generosa para 500 filas; evita leer archivos desproporcionados. */
export const MAX_BYTES_IMPORTACION = 512 * 1024;

/** Plantillas descargables: solo encabezados, con BOM para que Excel respete la «ñ». */
export function plantillaCsv(tipo: TipoImportacion) {
  return `\uFEFF${ENCABEZADOS[tipo].join(",")}\r\n`;
}

export class ErrorCsv extends Error {}

function detectarSeparador(primeraLinea: string) {
  const comas = primeraLinea.split(",").length;
  const puntoycoma = primeraLinea.split(";").length;
  return puntoycoma > comas ? ";" : ",";
}

/** Devuelve las filas como arreglos de celdas, sin la marca BOM. */
export function leerCsv(texto: string): string[][] {
  const t = texto.replace(/^\uFEFF/, "");
  const sep = detectarSeparador(t.split(/\r?\n/, 1)[0] ?? "");
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let comillas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celda += '"';
          i++;
        } else comillas = false;
      } else celda += c;
      continue;
    }
    if (c === '"' && celda === "") comillas = true;
    else if (c === sep) {
      fila.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += c;
  }
  if (comillas) throw new ErrorCsv("El archivo tiene comillas sin cerrar.");
  if (celda !== "" || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }
  // Las líneas totalmente vacías (incluida la final) no cuentan como filas.
  return filas.filter((f) => f.some((v) => v.trim() !== ""));
}

/** Compara encabezados sin distinguir mayúsculas ni espacios alrededor. */
export function normalizarEncabezado(v: string) {
  return v.trim().toLowerCase();
}
