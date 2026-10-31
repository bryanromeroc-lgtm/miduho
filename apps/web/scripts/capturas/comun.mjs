// Utilidades compartidas por las capturas visuales (línea base y regresión de
// Laboratorios). Chrome headless vía playwright-core; datos 100 % ficticios.
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const APP = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const RAIZ = resolve(APP, "../..");
export const REVISION = resolve(RAIZ, ".impeccable/review");

const require = createRequire(resolve(APP, "package.json"));
const { chromium } = require("playwright-core");

export const BASE = process.env.BASE ?? "http://localhost:3114";
export const ANCHOS = [1440, 1024, 390];
const ALTO = { 1440: 900, 1024: 768, 390: 844 };

// Laboratorios no se toca (D7): estas rutas son la puerta de regresión.
export const RUTAS_LABS = [
  { nombre: "laboratorios", ruta: "/laboratorios" },
  { nombre: "laboratorios-emprendimiento", ruta: "/laboratorios?mundo=emprendimiento" },
  { nombre: "laboratorios-unidad", ruta: "/laboratorios/rob-energia-movimiento" },
];

export const CUENTAS = {
  estudiante: {
    correo: process.env.CAPTURA_ESTUDIANTE_CORREO ?? "estudiante@miduho.test",
    clave: process.env.CAPTURA_ESTUDIANTE_CLAVE ?? process.env.SEED_ESTUDIANTE_PASSWORD,
  },
  docente: {
    correo: process.env.CAPTURA_DOCENTE_CORREO ?? "docente@miduho.test",
    clave: process.env.CAPTURA_DOCENTE_CLAVE ?? process.env.SEED_DOCENTE_PASSWORD,
  },
};

// Chrome del sistema primero: el Chrome de Playwright MCP falla en esta máquina.
function ejecutable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (existsSync(p)) return p;
  }
  return undefined; // playwright-core resuelve su propio Chromium
}

export async function abrirNavegador() {
  return chromium.launch({ executablePath: ejecutable(), headless: true });
}

/** Contexto con movimiento reducido: las capturas deben ser deterministas. */
export async function nuevoContexto(navegador, ancho) {
  return navegador.newContext({
    viewport: { width: ancho, height: ALTO[ancho] ?? 900 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
    locale: "es-CO",
    timezoneId: "America/Bogota",
  });
}

export async function ingresar(pagina, cuenta) {
  if (!cuenta.clave) {
    throw new Error(`Falta la contraseña de ${cuenta.correo}: ejecuta scripts/capturas/preparar.sh y carga capturas.env.`);
  }
  await pagina.goto(`${BASE}/login`);
  await pagina.fill("#correo", cuenta.correo);
  await pagina.fill("#contrasena", cuenta.clave);
  await Promise.all([
    pagina.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }),
    pagina.click("button[type=submit]"),
  ]);
  if (new URL(pagina.url()).pathname.startsWith("/cuenta/contrasena")) {
    throw new Error(`${cuenta.correo} debe cambiar la contraseña; usa la base de scripts/capturas/preparar.sh.`);
  }
}

/** Navega, espera a que la red y las fuentes se asienten y captura la página completa. */
export async function capturar(pagina, ruta, archivo) {
  await pagina.goto(`${BASE}${ruta}`, { waitUntil: "networkidle", timeout: 60000 });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(600);
  // El foco automático (p. ej. tras el vuelo de cámara de Laboratorios) llega en
  // un momento variable; el anillo de foco se verifica en la auditoría, no aquí.
  await pagina.evaluate(() => (document.activeElement instanceof HTMLElement) && document.activeElement.blur());
  await pagina.screenshot({ path: archivo, fullPage: true, animations: "disabled", caret: "hide" });
}
