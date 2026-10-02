import { randomInt } from "node:crypto";

/**
 * Generación de contraseñas iniciales (INC1R-03, requerimiento §4.2–4.3).
 * Se usan `crypto.randomInt` (CSPRNG) y palabras cortas propias, sin tildes ni
 * letras ambiguas, para que un estudiante de primaria pueda escribirlas.
 * El texto plano solo existe en memoria y se entrega una vez; se guarda el hash.
 */
export const PALABRAS = [
  "sol", "luna", "mar", "rio", "nube", "flor", "arbol", "hoja", "pino", "roca",
  "lago", "isla", "cielo", "monte", "nido", "pato", "gato", "perro", "oso", "mono",
  "loro", "rana", "pez", "ballena", "tigre", "zorro", "puma", "cebra", "jirafa", "koala",
  "mango", "pera", "uva", "kiwi", "coco", "limon", "fresa", "mora", "papaya", "maiz",
  "pan", "queso", "miel", "sopa", "arroz", "tren", "barco", "avion", "bici", "cohete",
  "lapiz", "libro", "mapa", "reloj", "globo", "cometa", "tambor", "piano", "flauta", "verde",
  "azul", "rojo", "dorado", "plata", "faro", "puente", "torre", "casa", "jardin", "selva",
] as const;

function elegir<T>(lista: readonly T[]) {
  return lista[randomInt(lista.length)];
}

function digitos(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += String(randomInt(10));
  return s;
}

/** ESTUDIANTE: dos palabras y cuatro números, p. ej. «nube-koala-4821». */
export function generarContrasenaEstudiante() {
  return `${elegir(PALABRAS)}-${elegir(PALABRAS)}-${digitos(4)}`;
}

/** DOCENTE (temporal, cambio obligatorio): tres palabras y cuatro números. */
export function generarContrasenaTemporal() {
  return `${elegir(PALABRAS)}-${elegir(PALABRAS)}-${elegir(PALABRAS)}-${digitos(4)}`;
}

/** Escapa un valor CSV (RFC 4180) y neutraliza fórmulas de hoja de cálculo. */
export function celdaCsv(valor: string) {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return /[",\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

/** CSV de credenciales nuevas: solo correo y contraseña, con BOM para Excel. */
export function csvCredenciales(filas: { correo: string; contrasena: string }[]) {
  const lineas = ["correo,contrasena", ...filas.map((f) => `${celdaCsv(f.correo)},${celdaCsv(f.contrasena)}`)];
  return `\uFEFF${lineas.join("\r\n")}\r\n`;
}
