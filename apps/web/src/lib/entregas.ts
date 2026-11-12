/** Reglas puras de entregas a coordinación. Fechas almacenadas en UTC, mostradas en Colombia. */
export const TAMANO_MAXIMO_ENTREGA = 20 * 1024 * 1024;
export const FORMATOS_ENTREGA = [".xlsx", ".xls", ".csv", ".pdf", ".docx"] as const;
export type FormatoEntrega = (typeof FORMATOS_ENTREGA)[number];
export type EstadoEntrega = "Pendiente" | "Sin entregar" | "Entregada" | "Tardía";

export const ETIQUETAS_TIPO_DOCUMENTO = {
  PLANILLA_NOTAS: "Planilla de notas",
  PLANEACION: "Planeación",
  OBSERVADOR: "Observador del estudiante",
  INFORME: "Informe",
  OTRO: "Otro",
} as const;

export function estadoEntrega({ cierraEn, ultimaSubida, ahora }: {
  cierraEn: Date;
  ultimaSubida?: Date | null;
  ahora: Date;
}): { estado: EstadoEntrega; retrasoMs: number } {
  if (ultimaSubida) {
    const retrasoMs = Math.max(0, ultimaSubida.getTime() - cierraEn.getTime());
    return { estado: retrasoMs > 0 ? "Tardía" : "Entregada", retrasoMs };
  }
  return { estado: ahora.getTime() > cierraEn.getTime() ? "Sin entregar" : "Pendiente", retrasoMs: 0 };
}

function fechaColombia(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function sanearNombre(valor: string): string {
  return valor.replace(/[\/\\:*?"<>|\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim();
}

export function nombreArchivoDrive(titulo: string, docente: string, fecha: Date, version: number, ext: string): string {
  if (!Number.isInteger(version) || version < 1) throw new Error("La versión debe ser positiva");
  const extension = ext.toLowerCase().replace(/^\./, "");
  if (!FORMATOS_ENTREGA.includes(`.${extension}` as FormatoEntrega)) throw new Error("Extensión no permitida");
  const sufijo = `${version > 1 ? ` _v${version}` : ""}.${extension}`;
  const fechaTexto = fechaColombia(fecha);
  const disponible = 200 - sufijo.length - fechaTexto.length - 6; // dos separadores « — »
  const tituloLimpio = sanearNombre(titulo);
  const docenteLimpio = sanearNombre(docente);
  const tituloFinal = tituloLimpio.slice(0, Math.min(120, Math.max(3, disponible - Math.min(docenteLimpio.length, 60)))).trim();
  const docenteFinal = docenteLimpio.slice(0, disponible - tituloFinal.length).trim();
  return `${tituloFinal} — ${docenteFinal} — ${fechaTexto}${sufijo}`;
}

export function formatoRetraso(retrasoMs: number): string {
  if (retrasoMs <= 0) return "Sin retraso";
  const minutos = Math.ceil(retrasoMs / 60_000);
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const resto = minutos % 60;
  const partes = [dias && `${dias} ${dias === 1 ? "día" : "días"}`, horas && `${horas} h`, resto && `${resto} min`].filter(Boolean);
  return `${partes.join(" ")} después del cierre`;
}

export function formatoCierre(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  }).format(fecha);
}

export function extensionArchivo(nombre: string): FormatoEntrega | null {
  const extension = nombre.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  return FORMATOS_ENTREGA.includes(extension as FormatoEntrega) ? extension as FormatoEntrega : null;
}

export function validarArchivoEntrega(bytes: Uint8Array, extension: FormatoEntrega): string | null {
  if (bytes.byteLength > TAMANO_MAXIMO_ENTREGA) return "El archivo supera 20 MB";
  const esZip = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06));
  const ole = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  const esOle = bytes.length >= ole.length && ole.every((valor, indice) => bytes[indice] === valor);
  const esPdf = bytes.length >= 4 && [0x25, 0x50, 0x44, 0x46].every((valor, indice) => bytes[indice] === valor);
  if (extension === ".xlsx" && !esZip) return "El archivo no parece un Excel válido";
  if (extension === ".xls" && !esOle) return "El archivo no parece un Excel válido";
  if (extension === ".docx" && !esZip) return "El archivo no parece un documento de Word válido";
  if (extension === ".pdf" && !esPdf) return "El archivo no parece un PDF válido";
  if (extension === ".csv") {
    if (bytes.includes(0)) return "El archivo no parece un CSV válido";
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { return "El archivo no parece un CSV válido"; }
  }
  return null;
}
