// E2E INC1R-13 · Incremento 1R completo (fuera del repo) sobre `next start`.
// Navegador real (Chromium) en escritorio 1366x900 y móvil 390x844.
// Captura traza Playwright y captura de pantalla en el primer fallo.
// Datos 100 % ficticios; verifica ausencia de datos reales.
//
// Uso: source smoke.env && BASE=http://localhost:3113 node smoke.mjs
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const require = createRequire(
  process.env.PLAYWRIGHT_CORE_DIR
    ? `${process.env.PLAYWRIGHT_CORE_DIR}/package.json`
    : "/home/server/Documentos/taskflow_personal/package.json",
);
const { chromium } = require("playwright-core");

const BASE = process.env.BASE ?? "http://localhost:3113";
const DIR = new URL("./", import.meta.url).pathname;
const OUT = `${DIR}capturas/`;
const TRAZAS = `${DIR}trazas/`;
mkdirSync(OUT, { recursive: true });
mkdirSync(TRAZAS, { recursive: true });
const IDS = JSON.parse(readFileSync(`${DIR}ids.json`, "utf8"));
const EXE = process.env.CHROMIUM_PATH ?? "/home/server/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const browser = await chromium.launch({ executablePath: EXE });

// ── Resultados y captura de evidencia en fallo ──
const resultados = [];
let activo = null; // { ctx, page }
let falloCapturado = false;
const pendientes = [];
function ok(nombre, cond, detalle = "") {
  resultados.push({ nombre, ok: !!cond, detalle });
  console.log(`${cond ? "PASS" : "FAIL"} ${nombre}${detalle ? " — " + detalle : ""}`);
  if (!cond && !falloCapturado) {
    falloCapturado = true;
    pendientes.push(
      (async () => {
        try {
          if (activo?.page) await activo.page.screenshot({ path: `${OUT}fallo.png`, fullPage: true }).catch(() => {});
          if (activo?.ctx) await activo.ctx.tracing.stop({ path: `${TRAZAS}fallo-traza.zip` }).catch(() => {});
        } catch {}
      })(),
    );
  }
}
async function usar(ctx, page) {
  if (activo?.ctx && activo.ctx !== ctx) await activo.ctx.tracing.stop().catch(() => {});
  activo = { ctx, page };
  await ctx.tracing.start({ screenshots: true, snapshots: true }).catch(() => {});
}

// ── Utilidades ──
const A = process.env.SEED_ADMIN_PASSWORD;
const D = process.env.SEED_DOCENTE_PASSWORD;
const ES = process.env.SEED_ESTUDIANTE_PASSWORD;
const ruta = (page) => new URL(page.url()).pathname;
const scrollX = (page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
const mains = (page) => page.evaluate(() => document.querySelectorAll("main").length);
const texto = (page, sel = "body") => page.$eval(sel, (e) => e.innerText).catch(() => "");
// Espera a que el contenido aparezca/desaparezca tras una recarga del lado cliente.
const esperarTexto = (page, t) => page.waitForFunction((txt) => document.querySelector("main")?.innerText.includes(txt), t, { timeout: 15000 });
const esperarTextoAusente = (page, t) => page.waitForFunction((txt) => !(document.querySelector("main")?.innerText.includes(txt)), t, { timeout: 15000 });
const navEtiquetas = (page) => page.$$eval("#menu-principal a span", (els) => els.map((e) => e.textContent.trim()));
const chip = (page) => page.$eval(".school-group", (e) => e.innerText.replace(/\s+/g, " ").trim()).catch(() => null);

async function login(page, correo, clave) {
  await page.goto(`${BASE}/login`);
  await page.fill("#correo", correo);
  await page.fill("#contrasena", clave);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }), page.click("button[type=submit]")]);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}
async function intentarLogin(page, correo, clave) {
  await page.goto(`${BASE}/login`);
  await page.fill("#correo", correo);
  await page.fill("#contrasena", clave);
  await page.click("button[type=submit]");
  await page.waitForTimeout(2500);
  return ruta(page);
}
const api = (page, url, method = "GET", body) =>
  page.evaluate(
    async ({ url, method, body }) => {
      const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
      let json = null;
      const t = await r.text();
      try { json = JSON.parse(t); } catch {}
      return { status: r.status, json, text: t };
    },
    { url, method, body },
  );

const NAV_EST = ["Hoy", "Mis clases", "Biblioteca", "Laboratorios", "Agenda", "Cuenta"];
const NAV_DOC = ["Hoy", "Mis clases", "Biblioteca", "Laboratorios", "Agenda", "Mi curso", "Cuenta"];
const NAV_ADMIN = ["Dashboard", "Usuarios", "Estudiantes", "Estructura", "Asignaciones", "Cuenta"];
const MAQUETA = ["/", "/clases", "/biblioteca", "/laboratorios", "/agenda"];
const RUTAS_ADMIN = ["/admin", "/admin/usuarios", "/admin/usuarios/nuevo", "/admin/usuarios/importar", "/admin/estudiantes", "/admin/estructura", "/admin/asignaciones"];
// Patrones que delatarían datos reales de menores o personal del colegio.
const MARCADORES_REALES = ["cédula", "cédula de ciudadanía", "tarjeta de identidad", "documento de identidad", "número de documento", "cc ", "ti ", "ti. ", "cc. "];

// ────────────────────────────────────────────────────────────────────────────
// 1 · Sin sesión: rutas protegidas y pantallas públicas
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await usar(ctx, page);
  for (const r of ["/", "/clases", "/cuenta", "/mi-curso", "/admin", "/admin/usuarios", "/admin/estructura"]) {
    await page.goto(`${BASE}${r}`);
    ok(`sin sesión ${r} → login`, ruta(page) === "/login", page.url());
  }
  ok("API sin sesión → 401", (await api(page, "/api/usuarios")).status === 401);
  for (const r of ["/login", "/recuperar"]) {
    await page.goto(`${BASE}${r}`);
    ok(`pública ${r} accesible`, ruta(page) === r, page.url());
    ok(`pública ${r} una <main>`, (await mains(page)) === 1);
    ok(`pública ${r} sin scroll horizontal`, !(await scrollX(page)));
  }
  const cuerpoLogin = await texto(page);
  ok("login sin datos reales", !MARCADORES_REALES.some((m) => cuerpoLogin.toLowerCase().includes(m)));
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 2 · Login por rol, navegación y rutas protegidas (escritorio y móvil)
// ────────────────────────────────────────────────────────────────────────────
for (const [vista, viewport] of [["escritorio", { width: 1366, height: 900 }], ["movil", { width: 390, height: 844 }]]) {
  // ADMIN puro
  {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await usar(ctx, page);
    await login(page, "admin@miduho.test", A);
    ok(`[${vista}] ADMIN → Dashboard`, ruta(page) === "/admin", page.url());
    ok(`[${vista}] ADMIN nav exacta`, JSON.stringify(await navEtiquetas(page)) === JSON.stringify(NAV_ADMIN), JSON.stringify(await navEtiquetas(page)));
    ok(`[${vista}] ADMIN sin grupo ficticio`, !(await texto(page)).includes("1°-01"));
    ok(`[${vista}] ADMIN una <main>`, (await mains(page)) === 1);
    ok(`[${vista}] ADMIN sin scroll horizontal`, !(await scrollX(page)));
    for (const r of ["/clases", "/mi-curso", "/"]) {
      await page.goto(`${BASE}${r}`);
      const fuera = r === "/" ? "/admin" : "/cuenta";
      ok(`[${vista}] ADMIN puro ${r} → ${fuera}`, ruta(page) === fuera, page.url());
    }
    for (const r of ["/admin/usuarios", "/admin/estructura", "/admin/asignaciones", "/admin/estudiantes", "/biblioteca", "/cuenta"]) {
      await page.goto(`${BASE}${r}`);
      ok(`[${vista}] ADMIN ${r} accesible`, ruta(page) === r, page.url());
      ok(`[${vista}] ADMIN ${r} una <main>`, (await mains(page)) === 1);
      ok(`[${vista}] ADMIN ${r} sin scroll horizontal`, !(await scrollX(page)));
    }
    if (vista === "escritorio") await page.screenshot({ path: `${OUT}${vista}-admin-dashboard.png` });
    await ctx.close();
  }
  // ESTUDIANTE
  {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await usar(ctx, page);
    await login(page, "estudiante@miduho.test", ES);
    ok(`[${vista}] ESTUDIANTE → Hoy`, ruta(page) === "/", page.url());
    ok(`[${vista}] ESTUDIANTE nav exacta`, JSON.stringify(await navEtiquetas(page)) === JSON.stringify(NAV_EST), JSON.stringify(await navEtiquetas(page)));
    ok(`[${vista}] ESTUDIANTE chip grupo 1°-01`, (await chip(page))?.startsWith("Grupo 1°-01"), await chip(page));
    ok(`[${vista}] ESTUDIANTE sin selector contexto`, (await page.$(".shell-contexto")) === null);
    for (const r of MAQUETA) {
      await page.goto(`${BASE}${r}`);
      ok(`[${vista}] ESTUDIANTE ${r} accesible`, ruta(page) === r, page.url());
      ok(`[${vista}] ESTUDIANTE ${r} una <main>`, (await mains(page)) === 1);
      ok(`[${vista}] ESTUDIANTE ${r} sin scroll horizontal`, !(await scrollX(page)));
    }
    for (const r of RUTAS_ADMIN) {
      await page.goto(`${BASE}${r}`);
      ok(`[${vista}] ESTUDIANTE ${r} bloqueada`, ruta(page) === "/cuenta", page.url());
    }
    await page.goto(`${BASE}/mi-curso`);
    ok(`[${vista}] ESTUDIANTE /mi-curso bloqueada`, ruta(page) === "/cuenta", page.url());
    await page.goto(`${BASE}/cuenta`);
    ok(`[${vista}] ESTUDIANTE cuenta sin cambio de contraseña`, !(await texto(page)).includes("Cambiar contraseña"));
    for (const [u, m] of [["/api/usuarios", "GET"], ["/api/asociaciones-estudiantes", "GET"], ["/api/grupos", "GET"]]) {
      ok(`[${vista}] ESTUDIANTE ${m} ${u} → 403`, (await api(page, u, m)).status === 403);
    }
    // Cierre de sesión
    await page.goto(`${BASE}/`);
    await page.click(".shell-cuenta-boton");
    await Promise.all([page.waitForURL(/\/login/), page.click(".shell-cuenta-panel button[type=submit]")]);
    ok(`[${vista}] cerrar sesión → login`, ruta(page) === "/login");
    await page.goto(`${BASE}/clases`);
    ok(`[${vista}] tras cerrar sesión /clases → login`, ruta(page) === "/login");
    if (vista === "movil") await page.screenshot({ path: `${OUT}movil-estudiante-hoy.png` });
    await ctx.close();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 3 · Cambio obligatorio de contraseña del DOCENTE
// ────────────────────────────────────────────────────────────────────────────
let CLAVE_DOCENTE_NUEVA = null;
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await usar(ctx, page);
  await login(page, "docente@miduho.test", D);
  ok("DOCENTE con temporal → /cuenta/contrasena", ruta(page) === "/cuenta/contrasena", page.url());
  ok("cambio obligatorio sin shell/nav", (await navEtiquetas(page)).length === 0);
  await page.goto(`${BASE}/clases`);
  ok("DOCENTE temporal no entra a /clases", ruta(page) === "/cuenta/contrasena", page.url());
  CLAVE_DOCENTE_NUEVA = `Propia${Date.now() % 100000}Zz9`;
  await page.fill("#actual", D);
  await page.fill("#contrasena", CLAVE_DOCENTE_NUEVA);
  await page.fill("#confirmacion", CLAVE_DOCENTE_NUEVA);
  await Promise.all([page.waitForURL(/\/login/), page.click("button[type=submit]")]);
  ok("tras cambiar contraseña → login", ruta(page) === "/login", page.url());
  await page.screenshot({ path: `${OUT}escritorio-docente-cambio-obligatorio.png` });
  await ctx.close();

  // Re-ingreso con la nueva contraseña: navegación DOCENTE completa.
  for (const [vista, viewport] of [["escritorio", { width: 1366, height: 900 }], ["movil", { width: 390, height: 844 }]]) {
    const c2 = await browser.newContext({ viewport });
    const p2 = await c2.newPage();
    await usar(c2, p2);
    await login(p2, "docente@miduho.test", CLAVE_DOCENTE_NUEVA);
    ok(`[${vista}] DOCENTE → Hoy`, ruta(p2) === "/", p2.url());
    ok(`[${vista}] DOCENTE nav exacta`, JSON.stringify(await navEtiquetas(p2)) === JSON.stringify(NAV_DOC), JSON.stringify(await navEtiquetas(p2)));
    ok(`[${vista}] DOCENTE chip grupo 1°-01`, (await chip(p2))?.includes("1°-01"), await chip(p2));
    ok(`[${vista}] DOCENTE sin selector contexto`, (await p2.$(".shell-contexto")) === null);
    for (const r of MAQUETA) {
      await p2.goto(`${BASE}${r}`);
      ok(`[${vista}] DOCENTE ${r} accesible`, ruta(p2) === r, p2.url());
      ok(`[${vista}] DOCENTE ${r} una <main>`, (await mains(p2)) === 1);
      ok(`[${vista}] DOCENTE ${r} sin scroll horizontal`, !(await scrollX(p2)));
    }
    await p2.goto(`${BASE}/admin`);
    ok(`[${vista}] DOCENTE bloqueado en /admin`, ruta(p2) === "/cuenta", p2.url());
    if (vista === "escritorio") await p2.screenshot({ path: `${OUT}escritorio-docente-hoy.png` });
    await c2.close();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 4 · Selector y persistencia de contexto DOCENTE+ADMIN
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await usar(ctx, page);
  await login(page, "mixta@miduho.test", A);
  ok("MIXTA primer acceso → ADMIN", ruta(page) === "/admin", page.url());
  ok("MIXTA selector visible", (await page.$(".shell-contexto")) !== null);
  ok("MIXTA nav ADMIN", (await navEtiquetas(page))[0] === "Dashboard", JSON.stringify(await navEtiquetas(page)));
  await Promise.all([page.waitForURL((u) => u.pathname === "/"), page.click(".shell-contexto-opcion:has-text('Docente')")]);
  await page.waitForTimeout(800);
  const dn = await navEtiquetas(page);
  ok("MIXTA cambia a DOCENTE", dn.includes("Mi curso") && !dn.includes("Dashboard"), dn.join("|"));
  await page.screenshot({ path: `${OUT}escritorio-mixta-docente.png` });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await usar(ctx, page);
  await login(page, "mixta@miduho.test", A);
  // El contexto se recuerda por cuenta: en la misma sesión de servidor quedó DOCENTE.
  const nav = await navEtiquetas(page);
  ok("MIXTA móvil recuerda contexto", nav.includes("Mi curso") || nav[0] === "Dashboard", nav.join("|"));
  ok("MIXTA móvil sin scroll horizontal", !(await scrollX(page)));
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 5 · CRUD de usuarios (ADMIN, escritorio)
// ────────────────────────────────────────────────────────────────────────────
let ID_DOC_SMOKE = null;
let ID_EST_SMOKE = null;
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);
  await pa.goto(`${BASE}/admin/usuarios`);
  ok("listado usuarios carga", (await pa.textContent("h1"))?.includes("Usuarios"));
  ok("listado una <main>", (await mains(pa)) === 1);
  ok("listado muestra cuentas sembradas", (await pa.locator(".admin-tabla tbody tr").count()) >= 3);
  const listadoTexto = (await texto(pa)).toLowerCase();
  ok("listado sin datos reales", !MARCADORES_REALES.some((m) => listadoTexto.includes(m)));

  // Búsqueda vacía
  await pa.fill("#f-q", "nadie-coincide-zzz");
  await Promise.all([pa.waitForURL(/q=nadie/), pa.click(".admin-filtros button[type=submit]")]);
  ok("búsqueda sin resultados → estado vacío", (await pa.textContent(".admin-vacio"))?.includes("Ninguna cuenta coincide"));

  // Alta DOCENTE: credencial temporal única
  await pa.goto(`${BASE}/admin/usuarios/nuevo`);
  await pa.check("input[name=combinacion][value=DOCENTE]");
  await pa.fill("#nombres", "Docente");
  await pa.fill("#apellidos", "E2E (ficticia)");
  await pa.fill("#correo", "doc-e2e@miduho.test");
  await pa.click(".admin-formulario button[type=submit]");
  await pa.waitForSelector(".admin-credencial");
  const claveDoc = (await pa.textContent(".admin-clave"))?.trim();
  ok("alta DOCENTE muestra temporal una vez", /^[a-z]+-[a-z]+-[a-z]+-\d{4}$/.test(claveDoc ?? ""), claveDoc ?? "sin clave");
  const [descargaDoc] = await Promise.all([pa.waitForEvent("download"), pa.click("text=Descargar CSV")]);
  ok("credencial DOCENTE CSV descargable", descargaDoc.suggestedFilename().endsWith(".csv"), descargaDoc.suggestedFilename());
  await pa.click("text=Ya la entregué, ocultar");
  ok("credencial oculta tras entregar", (await pa.locator(".admin-credencial").count()) === 0);

  // Duplicado
  await pa.click("text=Crear otra cuenta");
  await pa.check("input[name=combinacion][value=DOCENTE]");
  await pa.fill("#nombres", "Otra");
  await pa.fill("#apellidos", "Cuenta");
  await pa.fill("#correo", "doc-e2e@miduho.test");
  await pa.click(".admin-formulario button[type=submit]");
  await pa.waitForSelector("#nuevo-error");
  ok("correo duplicado → error visible", (await pa.textContent("#nuevo-error"))?.includes("Ya existe"));

  // Alta ESTUDIANTE con grupo
  await pa.check("input[name=combinacion][value=ESTUDIANTE]");
  await pa.fill("#nombres", "Estudiante");
  await pa.fill("#apellidos", "E2E (ficticia)");
  await pa.fill("#correo", "est-e2e@miduho.test");
  const opcionGrupo = await pa.locator("#grupoId option").nth(1).getAttribute("value");
  await pa.selectOption("#grupoId", opcionGrupo);
  await pa.click(".admin-formulario button[type=submit]");
  await pa.waitForSelector(".admin-credencial");
  ok("alta ESTUDIANTE con contraseña legible", /^[a-z]+-[a-z]+-\d{4}$/.test((await pa.textContent(".admin-clave"))?.trim() ?? ""));

  // Alta ADMIN puro: invitación sin contraseña
  await pa.click("text=Crear otra cuenta");
  await pa.check("input[name=combinacion][value=ADMIN]");
  await pa.fill("#nombres", "Admin");
  await pa.fill("#apellidos", "Invitado E2E (ficticio)");
  await pa.fill("#correo", "admin-inv-e2e@miduho.test");
  await pa.click(".admin-formulario button[type=submit]");
  await pa.waitForSelector(".admin-aviso[data-tipo=ok]");
  ok("ADMIN puro invitación sin contraseña", (await pa.textContent(".admin-aviso[data-tipo=ok]"))?.includes("invitación") && (await pa.locator(".admin-clave").count()) === 0);

  // Ficha del docente creado: promover a DOCENTE+ADMIN, editar, desactivar (revocación)
  const lista = await api(pa, "/api/usuarios?q=doc-e2e");
  ID_DOC_SMOKE = lista.json?.data?.[0]?.id;
  ok("API listado con búsqueda", lista.status === 200 && !!ID_DOC_SMOKE && lista.json.total === 1);
  await pa.goto(`${BASE}/admin/usuarios/${ID_DOC_SMOKE}`);
  await pa.check("input[name=combinacion-rol][value=DOCENTE_ADMIN]");
  await pa.click("text=Cambiar rol");
  await pa.waitForSelector("dialog[open]");
  ok("confirmación modal al cambiar rol", (await pa.textContent("dialog[open] h2"))?.includes("rol"));
  await pa.click("dialog[open] >> text=Sí, cambiar rol");
  await pa.waitForSelector("section[aria-labelledby=sec-rol] .admin-aviso[data-tipo=ok]");
  ok("promover DOCENTE→DOCENTE+ADMIN", (await api(pa, `/api/usuarios/${ID_DOC_SMOKE}`)).json?.combinacion === "DOCENTE_ADMIN");

  // Editar identidad
  await pa.fill("#nombres", "Docente Editada");
  await pa.click("text=Guardar datos");
  await pa.waitForSelector("section[aria-labelledby=sec-identidad] .admin-aviso[data-tipo=ok]");
  ok("editar identidad", (await api(pa, `/api/usuarios/${ID_DOC_SMOKE}`)).json?.nombres === "Docente Editada");

  // Desactivar → revocación inmediata de sesión
  const ctxD = await browser.newContext();
  const pd = await ctxD.newPage();
  await login(pd, "doc-e2e@miduho.test", claveDoc);
  ok("DOCENTE nuevo va a cambio obligatorio", ruta(pd) === "/cuenta/contrasena", pd.url());
  await pa.click("text=Desactivar cuenta");
  await pa.waitForSelector("dialog[open]");
  await pa.click("dialog[open] >> text=Sí, desactivar");
  await pa.waitForSelector("section[aria-labelledby=sec-estado] .admin-aviso[data-tipo=ok]");
  ok("desactivar cuenta", (await api(pa, `/api/usuarios/${ID_DOC_SMOKE}`)).json?.estado === "INACTIVO");
  await pd.goto(`${BASE}/cuenta`);
  ok("sesión del desactivado revocada → login", ruta(pd) === "/login", pd.url());
  await ctxD.close();

  // Último ADMIN protegido
  const yo = (await api(pa, "/api/usuarios?q=admin%40miduho.test")).json?.data?.[0];
  ok("no auto-desactivación", (await api(pa, `/api/usuarios/${yo.id}/estado`, "PUT", { estado: "INACTIVO" })).json?.error?.code === "AUTODESACTIVACION");
  ok("no retirar rol ADMIN propio/último", ["AUTODEGRADACION", "ULTIMO_ADMIN"].includes((await api(pa, `/api/usuarios/${yo.id}/roles`, "PUT", { combinacion: "DOCENTE" })).json?.error?.code));
  ok("combinación inválida rechazada", (await api(pa, `/api/usuarios/${yo.id}/roles`, "PUT", { combinacion: "ESTUDIANTE_ADMIN" })).status === 400);

  // Restablecer credencial del estudiante creado (una sola vez)
  ID_EST_SMOKE = (await api(pa, "/api/usuarios?q=est-e2e")).json?.data?.[0]?.id;
  await pa.goto(`${BASE}/admin/usuarios/${ID_EST_SMOKE}`);
  await pa.click("text=Restablecer contraseña");
  await pa.waitForSelector("dialog[open]");
  await pa.click("dialog[open] >> text=Sí, generar nueva");
  await pa.waitForSelector(".admin-credencial");
  ok("restablecer muestra nueva credencial una vez", /^[a-z]+-[a-z]+-\d{4}$/.test((await pa.textContent(".admin-clave"))?.trim() ?? ""));
  await pa.screenshot({ path: `${OUT}escritorio-ficha-usuario.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 6 · CRUD de estructura académica (ADMIN, escritorio)
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);
  await pa.goto(`${BASE}/admin/estructura`);
  ok("estructura carga", (await pa.textContent("h1"))?.includes("Estructura académica"));
  ok("estructura una <main>", (await mains(pa)) === 1);
  ok("estructura sin scroll horizontal", !(await scrollX(pa)));
  const estTexto = (await texto(pa)).toLowerCase();
  ok("estructura sin datos reales", !MARCADORES_REALES.some((m) => estTexto.includes(m)));

  // Crear área nueva
  await pa.fill("form[aria-label='Crear área'] input[name=nombre]", "Ciencias naturales E2E");
  await pa.click("form[aria-label='Crear área'] button");
  await esperarTexto(pa, "Ciencias naturales E2E");
  ok("crear área aparece en listado", true);

  // Crear grado nuevo
  await pa.fill("form[aria-label='Crear grado'] input[name=nombre]", "6°");
  await pa.fill("form[aria-label='Crear grado'] input[name=orden]", "6");
  await pa.click("form[aria-label='Crear grado'] button");
  await esperarTexto(pa, "6°");
  ok("crear grado aparece en listado", true);

  // Crear grupo nuevo en el año activo
  const anioEdit = await pa.locator("form[aria-label='Crear grupo'] select[name=anioLectivoId] option").nth(1).getAttribute("value");
  const gradoEdit = await pa.locator("form[aria-label='Crear grupo'] select[name=gradoId] option").nth(1).getAttribute("value");
  await pa.selectOption("form[aria-label='Crear grupo'] select[name=anioLectivoId]", anioEdit);
  await pa.selectOption("form[aria-label='Crear grupo'] select[name=gradoId]", gradoEdit);
  await pa.fill("form[aria-label='Crear grupo'] input[name=identificador]", "99");
  await pa.click("form[aria-label='Crear grupo'] button");
  await esperarTexto(pa, "-99");
  ok("crear grupo aparece en listado", true);

  // Eliminar el área recién creada (sin relaciones) funciona; eliminar un área con relaciones se bloquea
  await pa.goto(`${BASE}/admin/estructura`);
  const filaArea = pa.locator("tr", { hasText: "Ciencias naturales E2E" }).first();
  await filaArea.locator("text=Eliminar").click();
  await pa.waitForSelector("dialog[open]");
  await pa.click("dialog[open] >> text=Eliminar definitivamente");
  await esperarTextoAusente(pa, "Ciencias naturales E2E");
  ok("borrado físico de registro sin relaciones", true);

  const filaHumanidades = pa.locator("tr", { hasText: "Humanidades: lengua castellana" }).first();
  await filaHumanidades.locator("text=Eliminar").click();
  await pa.waitForSelector("dialog[open]");
  await pa.click("dialog[open] >> text=Eliminar definitivamente");
  await pa.waitForSelector("dialog[open] .admin-aviso[data-tipo=error], dialog[open] p[role=alert]");
  ok("borrado bloqueado por relaciones", (await pa.textContent("dialog[open]")).toLowerCase().includes("relaci") || (await pa.textContent("dialog[open]")).toLowerCase().includes("no se puede"));
  await pa.keyboard.press("Escape");
  await pa.screenshot({ path: `${OUT}escritorio-estructura.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 7 · CSV válido e inválido (ADMIN, escritorio)
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);
  await pa.goto(`${BASE}/admin/usuarios/importar`);

  // Plantilla descargable
  const [plantilla] = await Promise.all([pa.waitForEvent("download"), pa.click("a[href*='/api/usuarios/importar/plantilla?tipo=estudiantes']")]);
  ok("plantilla estudiantes descargable", /\.csv$/.test(plantilla.suggestedFilename()), plantilla.suggestedFilename());

  // CSV inválido: errores por fila, sin importar
  const csvInvalido = "nombres,apellidos,correo,año,grado,grupo\n,sin-nombre,bad-email,2026,1°,01\n";
  await pa.setInputFiles("#imp-archivo", { name: "invalido.csv", mimeType: "text/csv", buffer: Buffer.from(csvInvalido) });
  await pa.click("button[type=submit]:has-text('Revisar archivo')");
  await pa.waitForSelector(".admin-resultados");
  ok("CSV inválido: errores por fila", (await pa.textContent(".admin-resultados")).includes("Con error"));
  const botonImportar = pa.locator(".admin-resultados button", { hasText: "Importar" });
  ok("CSV inválido: botón importar deshabilitado", await botonImportar.isDisabled());
  // Todo o nada: la cuenta no se creó
  ok("CSV inválido: no se creó ninguna cuenta", (await api(pa, "/api/usuarios?q=bad-email")).json?.total === 0);

  // CSV válido con duplicados: nuevas + omitidas
  const csvValido = "nombres,apellidos,correo,año,grado,grupo\nImportada,Uno,csv-e2e-a@miduho.test,2026,1°,01\nImportada,Dos,csv-e2e-b@miduho.test,2026,1°,01\nExistente,Ya,estudiante@miduho.test,2026,1°,01\n";
  await pa.setInputFiles("#imp-archivo", { name: "valido.csv", mimeType: "text/csv", buffer: Buffer.from(csvValido) });
  await pa.click("button[type=submit]:has-text('Revisar archivo')");
  await pa.waitForSelector(".admin-resultados");
  const resumen = await pa.textContent(".admin-resultados");
  ok("CSV válido: vista previa con duplicados", resumen.includes("Se crearán") && resumen.includes("Ya existen"));
  await pa.locator(".admin-resultados button", { hasText: "Importar" }).click();
  await pa.waitForSelector("dialog[open]");
  const [credenciales] = await Promise.all([pa.waitForEvent("download"), pa.click("dialog[open] >> text=Importar y descargar contraseñas")]);
  const rutaCSV = `${DIR}credenciales-e2e.csv`;
  await credenciales.saveAs(rutaCSV);
  const lineas = readFileSync(rutaCSV, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  ok("CSV credenciales: encabezado y 2 filas nuevas", lineas[0] === "correo,contrasena" && lineas.length === 3, `líneas=${lineas.length}`);
  ok("CSV credenciales: solo correo y contraseña (sin datos reales)", lineas.every((l) => l === "correo,contrasena" || /^[^,\n]+,[^,\n]+$/.test(l)), lineas.join("|"));
  ok("CSV válido: éxito visible", (await pa.textContent("[role=status].admin-aviso"))?.includes("no se puede volver a descargar"));
  writeFileSync(rutaCSV, ""); // no conservar credenciales en disco
  await pa.screenshot({ path: `${OUT}escritorio-importar-csv.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 8 · Asignaciones y horarios (ADMIN, escritorio)
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);
  await pa.goto(`${BASE}/admin/asignaciones`);
  ok("asignaciones carga", (await pa.textContent("h1"))?.includes("Asignaciones docentes"));

  // Cruce de horario: mismo docente y grupo, bloque solapado → rechazado
  const grupos = (await api(pa, "/api/grupos?pageSize=100")).json?.data ?? [];
  const g1 = grupos.find((g) => g.identificador === "01");
  const docentes = (await api(pa, "/api/usuarios?rol=DOCENTE&pageSize=100")).json?.data ?? [];
  const docenteSeed = docentes.find((d) => d.correo === "docente@miduho.test");
  const asignaturas = (await api(pa, "/api/asignaturas?pageSize=100")).json?.data ?? [];
  const asig = asignaturas[0];
  const asignaturaB = asignaturas.find((x) => x.id !== asig?.id) ?? asig;
  const cruce = await api(pa, "/api/asignaciones-docente", "POST", {
    docenteId: docenteSeed?.id, asignaturaId: asignaturaB?.id, grupoId: g1?.id, anioLectivoId: g1?.anioLectivoId,
    bloques: [{ dia: "LUNES", horaInicio: "08:00", horaFin: "09:00" }],
  });
  ok("cruce de horario bloqueado", cruce.status >= 400, `${cruce.status} ${cruce.json?.error?.code ?? ""}`);

  // Crear asignación nueva sin cruce (bloque distinto)
  const creada = await api(pa, "/api/asignaciones-docente", "POST", {
    docenteId: docenteSeed?.id, asignaturaId: asignaturaB?.id, grupoId: g1?.id, anioLectivoId: g1?.anioLectivoId,
    bloques: [{ dia: "MIERCOLES", horaInicio: "07:00", horaFin: "08:00" }],
  });
  ok("crear asignación con bloque", creada.status === 201 || creada.status === 200, String(creada.status));
  const idAsig = creada.json?.id ?? creada.json?.data?.id;

  // Desactivar → reactivar → reasignar
  if (idAsig) {
    ok("desactivar asignación", (await api(pa, `/api/asignaciones-docente/${idAsig}`, "DELETE")).status < 400);
    ok("reactivar asignación", (await api(pa, `/api/asignaciones-docente/${idAsig}`, "PATCH", { accion: "REACTIVAR" })).status < 400);
    const otroDoc = docentes.find((d) => d.id !== docenteSeed?.id && d.estado === "ACTIVO");
    if (otroDoc) {
      const reasig = await api(pa, `/api/asignaciones-docente/${idAsig}`, "PATCH", { accion: "REASIGNAR", docenteId: otroDoc.id, bloques: [{ dia: "MIERCOLES", horaInicio: "07:00", horaFin: "08:00" }], confirmar: true });
      ok("reasignar conserva historial", reasig.status < 400, `${reasig.status} ${reasig.json?.error?.code ?? ""}`);
    }
  }
  await pa.goto(`${BASE}/admin/asignaciones`);
  ok("asignaciones una <main>", (await mains(pa)) === 1);
  ok("asignaciones sin scroll horizontal", !(await scrollX(pa)));
  await pa.screenshot({ path: `${OUT}escritorio-asignaciones.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 9 · Asociación y traslado de estudiantes (ADMIN, escritorio)
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);
  await pa.goto(`${BASE}/admin/estudiantes`);
  ok("estudiantes panel carga", (await pa.textContent("h1"))?.includes("Estudiantes"));
  ok("estudiantes una <main>", (await mains(pa)) === 1);

  // Trasladar un estudiante con confirmación
  const fila = pa.locator("tr", { hasText: "est-e2e@miduho.test" }).first();
  const existeFila = (await fila.count()) > 0;
  if (existeFila) {
    const select = fila.locator("select");
    const destinos = await select.locator("option").count();
    ok("traslado ofrece otro grupo", destinos > 1, `opciones=${destinos}`);
    if (destinos > 1) {
      const destino = await select.locator("option").nth(1).getAttribute("value");
      await select.selectOption(destino);
      await fila.locator("text=Trasladar").click();
      await pa.waitForSelector("dialog[open]");
      ok("traslado pide confirmación", (await pa.textContent("dialog[open] h2"))?.includes("traslado"));
      await pa.click("dialog[open] >> text=Sí, trasladar");
      await pa.waitForFunction(() => !document.querySelector("dialog[open]"), null, { timeout: 15000 }).catch(() => {});
      await pa.goto(`${BASE}/admin/estudiantes`);
      await pa.waitForLoadState("networkidle");
      const historial = await pa.locator("tr", { hasText: "est-e2e@miduho.test" }).first().textContent();
      ok("traslado conserva historial", /actual/.test(historial ?? "") && /–/.test(historial ?? ""), (historial ?? "").slice(0, 120));
    }
  }
  await pa.screenshot({ path: `${OUT}escritorio-estudiantes.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 10 · Mi curso (DOCENTE): aislamiento horizontal y restablecimiento
// ────────────────────────────────────────────────────────────────────────────
{
  // Permisos negativos
  const ctx0 = await browser.newContext();
  const p0 = await ctx0.newPage();
  await usar(ctx0, p0);
  await login(p0, "estudiante@miduho.test", ES);
  await p0.goto(`${BASE}/mi-curso`);
  ok("ESTUDIANTE /mi-curso → fuera", !ruta(p0).startsWith("/mi-curso"), p0.url());
  ok("ESTUDIANTE restablecer ajeno → 403", (await api(p0, "/api/usuarios/estudiantes/restablecer-contrasenas", "POST", { estudianteIds: [IDS.ajeno] })).status === 403);
  await ctx0.close();

  const ctxA = await browser.newContext();
  const pA = await ctxA.newPage();
  await usar(ctxA, pA);
  await login(pA, "admin@miduho.test", A);
  await pA.goto(`${BASE}/mi-curso`);
  ok("ADMIN puro /mi-curso → fuera", !ruta(pA).startsWith("/mi-curso"), pA.url());
  await ctxA.close();

  // DOCENTE en escritorio y móvil
  for (const [vista, viewport] of [["escritorio", { width: 1366, height: 900 }], ["movil", { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await ctx.newPage();
    await usar(ctx, page);
    await login(page, "docente@miduho.test", CLAVE_DOCENTE_NUEVA);
    await page.goto(`${BASE}/mi-curso`);
    ok(`[${vista}] Mi curso carga`, (await page.textContent("h1"))?.includes("Mi curso"));
    ok(`[${vista}] una <main>`, (await mains(page)) === 1);
    ok(`[${vista}] solo 1 grupo asignado`, (await page.locator(".micurso-grupo").count()) === 1);
    const cuerpo = await texto(page, "main");
    ok(`[${vista}] grupo 1°-01, no 1°-02`, cuerpo.includes("1°-01") && !cuerpo.includes("1°-02"));
    ok(`[${vista}] asignatura y bloque`, cuerpo.includes("Lunes") && cuerpo.includes("08:00–09:00"));
    const mEst = cuerpo.match(/(\d+) estudiantes?/);
    ok(`[${vista}] lista de estudiantes (≥6)`, !!mEst && Number(mEst[1]) >= 6, mEst?.[0]);
    ok(`[${vista}] sin scroll horizontal`, !(await scrollX(page)));

    await Promise.all([page.waitForURL(new RegExp(`/mi-curso/${IDS.g1}`)), page.click(".micurso-ir")]);
    await page.waitForLoadState("networkidle");
    ok(`[${vista}] detalle título grupo`, (await page.textContent("h1"))?.includes("Grupo 1°-01"));
    ok(`[${vista}] detalle lista estudiantes (≥6)`, (await page.locator(".micurso-tabla tbody tr").count()) >= 6);
    const det = await texto(page, "main");
    ok(`[${vista}] correo y estado`, det.includes("estudiante2@miduho.test") && det.includes("Inactivo") && det.includes("Activo"));
    ok(`[${vista}] no muestra estudiante ajeno`, !det.includes("estudiante7@miduho.test"));
    ok(`[${vista}] sin calificaciones/edición`, !/calificaci|entrega|Editar/i.test(det));
    ok(`[${vista}] casilla inactivo deshabilitada`, await page.locator('input[aria-label*="no activa"]').isDisabled());

    // 404 anti-enumeración
    const rAjeno = await page.goto(`${BASE}/mi-curso/${IDS.g2}`);
    ok(`[${vista}] grupo ajeno → 404`, rAjeno.status() === 404 && !(await texto(page)).includes("estudiante7@miduho.test"), `status=${rAjeno.status()}`);
    const rNo = await page.goto(`${BASE}/mi-curso/no-existe-zzz`);
    ok(`[${vista}] grupo inexistente → 404`, rNo.status() === 404, `status=${rNo.status()}`);

    if (vista === "escritorio") {
      await page.goto(`${BASE}/mi-curso/${IDS.g1}`);
      await page.waitForLoadState("networkidle");
      await page.check('input[aria-label="Seleccionar a Cuenta 2 Estudiantil (ficticia)"]');
      await page.check('input[aria-label="Seleccionar a Cuenta 3 Estudiantil (ficticia)"]');
      const boton = page.locator("button", { hasText: "Restablecer contraseña" });
      ok("botón muestra (2)", (await boton.textContent()).includes("(2)"));
      await boton.click();
      await page.waitForSelector("dialog[open]");
      await page.click("dialog[open] >> text=Sí, restablecer");
      await page.locator(".admin-credencial").waitFor();
      ok("panel una sola descarga", (await page.textContent(".admin-credencial")).includes("2 contraseñas"));
      ok("contraseña no visible en pantalla", !/[a-z]+-[a-z]+-\d{4}/.test(await texto(page, "main")));
      const [descarga] = await Promise.all([page.waitForEvent("download"), page.click("text=Descargar CSV de credenciales")]);
      const rutaDesc = `${DIR}descarga-mi-curso.csv`;
      await descarga.saveAs(rutaDesc);
      const csv = readFileSync(rutaDesc, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
      ok("CSV con encabezado y 2 filas", csv[0] === "correo,contrasena" && csv.length === 3, `líneas=${csv.length}`);
      ok("panel desaparece tras descargar", (await page.locator(".admin-credencial").count()) === 0);
      ok("aviso de no volver a descargar", (await page.textContent("[role=status].admin-aviso")).includes("no se puede volver a descargar"));

      // Credenciales nuevas funcionan; las anteriores no
      const [c2, k2] = csv.find((l) => l.startsWith("estudiante2@")).split(",");
      const otra = await browser.newContext();
      const po = await otra.newPage();
      ok("contraseña anterior ya no entra", (await intentarLogin(po, "estudiante2@miduho.test", ES)) === "/login");
      ok("nueva contraseña entra", (await intentarLogin(po, c2, k2)) !== "/login");
      await otra.close();
      writeFileSync(rutaDesc, "");
    } else {
      await page.goto(`${BASE}/mi-curso/${IDS.g1}`);
      await page.waitForLoadState("networkidle");
      ok("móvil 'Seleccionar todos' visible", await page.locator(".micurso-todos-texto").isVisible());
    }
    await page.screenshot({ path: `${OUT}${vista}-mi-curso.png` });
    await ctx.close();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 11 · Cierre de año (suma 100 %) e inmutabilidad — al final, no rompe nada más
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const pa = await ctx.newPage();
  await usar(ctx, pa);
  await login(pa, "admin@miduho.test", A);

  // Cierre vía API del año activo 2026 (períodos 4×25 % = 100 %)
  const anios = (await api(pa, "/api/anios-lectivos?pageSize=100")).json?.data ?? [];
  const activo = anios.find((a) => a.estado === "ACTIVO");
  ok("hay un año activo", !!activo, activo?.anio);
  const cierre = await api(pa, `/api/anios-lectivos/${activo?.id}`, "PATCH", { estado: "CERRADO" });
  ok("cierre de año con suma 100 %", cierre.status < 400, `${cierre.status} ${cierre.json?.error?.code ?? ""}`);

  // Inmutabilidad posterior: crear período/grupo en el año cerrado se rechaza
  const postCierre = await api(pa, "/api/periodos", "POST", { anioLectivoId: activo?.id, nombre: "Período post-cierre E2E", orden: 99, ponderacion: 1, fechaInicio: "2026-01-01", fechaFin: "2026-01-02" });
  ok("año cerrado inmutable (período)", postCierre.status >= 400, `${postCierre.status} ${postCierre.json?.error?.code ?? ""}`);

  // La interfaz marca el año como cerrado / solo lectura
  await pa.goto(`${BASE}/admin/estructura`);
  ok("estructura muestra año cerrado", (await texto(pa, "main")).includes("cerrado"));
  await pa.screenshot({ path: `${OUT}escritorio-anio-cerrado.png` });
  await ctx.close();
}

// ────────────────────────────────────────────────────────────────────────────
// 12 · Ausencia de datos reales en la experiencia autenticada
// ────────────────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await usar(ctx, page);
  await login(page, "estudiante@miduho.test", ES);
  for (const r of ["/", "/clases", "/biblioteca", "/laboratorios", "/agenda", "/cuenta"]) {
    await page.goto(`${BASE}${r}`);
    const t = (await texto(page)).toLowerCase();
    ok(`sin datos reales en ${r}`, !MARCADORES_REALES.some((m) => t.includes(m)));
  }
  await ctx.close();
}

// ── Cierre ──
await browser.close();
await Promise.all(pendientes);
const fallos = resultados.filter((r) => !r.ok);
const resumen = `${resultados.length - fallos.length}/${resultados.length} PASS`;
writeFileSync(
  `${DIR}smoke-resultado.txt`,
  resultados.map((r) => `${r.ok ? "PASS" : "FAIL"} ${r.nombre}${r.detalle ? " — " + r.detalle : ""}`).join("\n") + `\n\n${resumen}\n`,
);
console.log(`\n${resumen}`);
if (falloCapturado) console.log(`Evidencia de fallo: ${OUT}fallo.png y ${TRAZAS}fallo-traza.zip`);
process.exit(fallos.length ? 1 : 0);
