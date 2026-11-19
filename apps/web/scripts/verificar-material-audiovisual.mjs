// Recorrido E2E y auditoría local sobre la base desechable de capturas.
// Uso: source scripts/capturas/capturas.env && node scripts/verificar-material-audiovisual.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { abrirNavegador, nuevoContexto, ingresar, CUENTAS, BASE } from "./capturas/comun.mjs";

const require = createRequire(resolve("package.json"));
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const hallazgos = [];

async function revisar(pagina, nombre) {
  await pagina.addScriptTag({ content: axe });
  const resultado = await pagina.evaluate(async () => window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
  }));
  const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const violaciones = resultado.violations.map((v) => ({ id: v.id, impacto: v.impact, nodos: v.nodes.length }));
  hallazgos.push({ pantalla: nombre, ancho: pagina.viewportSize().width, violaciones, desborde });
  console.log(`A11Y ${nombre} ${pagina.viewportSize().width}px: ${violaciones.length} reglas, desborde=${desborde}`);
}

async function comprobarFocoTeclado(pagina, etiqueta) {
  await pagina.evaluate(() => document.activeElement?.blur());
  for (let i = 0; i < 100; i += 1) {
    await pagina.keyboard.press("Tab");
    const foco = await pagina.evaluate(() => {
      const elemento = document.activeElement;
      if (!(elemento instanceof HTMLElement)) return null;
      const estilo = getComputedStyle(elemento);
      return { etiqueta: elemento.getAttribute("aria-label"), contorno: estilo.outlineStyle,
        ancho: Number.parseFloat(estilo.outlineWidth) };
    });
    if (foco?.etiqueta === etiqueta) {
      if (foco.contorno === "none" || foco.ancho < 2) throw new Error(`Foco no visible: ${etiqueta}`);
      console.log(`TECLADO ${etiqueta}: alcanzable y con foco visible`);
      return;
    }
  }
  throw new Error(`No se alcanzó con Tab: ${etiqueta}`);
}

const navegador = await abrirNavegador();
try {
  const contextoDocente = await nuevoContexto(navegador, 360);
  const docente = await contextoDocente.newPage();
  await ingresar(docente, CUENTAS.docente);
  await docente.goto(`${BASE}/clases`);
  await docente.getByRole("heading", { name: "Mis clases" }).waitFor();
  await revisar(docente, "Mis clases");
  const clase = docente.getByRole("link", { name: "Abrir clase" }).first();
  await clase.click();
  await docente.getByRole("link", { name: "Nuevo material audiovisual" }).waitFor();
  const claseUrl = docente.url();
  await revisar(docente, "Actividades de la clase");
  await docente.getByRole("link", { name: "Nuevo material audiovisual" }).click();
  await docente.getByRole("heading", { name: "Video e indicaciones" }).waitFor();
  await revisar(docente, "Formulario docente");
  const titulo = `Lectura audiovisual ficticia ${Date.now()}`;
  await docente.getByLabel("Enlace de YouTube").fill("https://www.youtube.com/watch?v=jNQXAC9IVRw");
  await docente.getByRole("button", { name: "Comprobar video" }).click();
  await docente.getByText("Video encontrado:").waitFor();
  await docente.getByLabel("Título de la actividad").fill(titulo);
  await docente.getByLabel("Indicaciones para estudiantes").fill("Observa el video y responde la pregunta.");
  await docente.getByLabel("Enunciado").fill("¿Qué tipo de material acabas de ver?");
  await docente.getByLabel("Opción 1").fill("Un video");
  await docente.getByLabel("Opción 2").fill("Un texto impreso");
  const grupos = docente.locator('input[type="checkbox"]:checked');
  if (await grupos.count() !== 2) throw new Error("La docente no tiene dos grupos marcados.");
  await docente.getByRole("button", { name: "Publicar material audiovisual" }).click();
  await docente.getByRole("heading", { name: titulo }).waitFor({ timeout: 20000 });
  const seguimientoUrl = docente.url();
  await revisar(docente, "Seguimiento antes de responder");
  const etiquetaTabla = await docente.locator('[role="region"][aria-label^="Tabla de seguimiento"]').first().getAttribute("aria-label");
  if (!etiquetaTabla) throw new Error("Falta la etiqueta de la tabla de seguimiento.");
  await comprobarFocoTeclado(docente, etiquetaTabla);
  console.log("E2E docente: material publicado en dos grupos");

  const contextoEstudiante = await nuevoContexto(navegador, 360);
  const estudiante = await contextoEstudiante.newPage();
  await ingresar(estudiante, CUENTAS.estudiante);
  await estudiante.goto(`${BASE}/`);
  const materia = estudiante.locator('a[href^="/materias/"]').filter({ hasText: "Comprensión Lectora" }).first();
  await materia.click();
  const asignada = estudiante.locator('a[href*="/asignadas/"]').filter({ hasText: titulo }).first();
  await asignada.waitFor();
  await asignada.click();
  await estudiante.getByRole("heading", { name: titulo }).waitFor();
  await revisar(estudiante, "Actividad asignada antes de responder");
  if (await estudiante.getByRole("heading", { name: "¿Qué tipo de material acabas de ver?" }).count()) {
    throw new Error("Las preguntas aparecieron antes de «Ya lo vi».");
  }
  await estudiante.getByRole("button", { name: "Ya lo vi" }).click();
  await estudiante.getByRole("heading", { name: "¿Qué tipo de material acabas de ver?" }).waitFor();
  await revisar(estudiante, "Preguntas del estudiante");
  await estudiante.getByRole("button", { name: "Un video" }).click();
  await estudiante.getByRole("button", { name: "Ver resultado" }).click();
  await estudiante.getByRole("heading", { name: "Resultado: 100 %" }).waitFor();
  await revisar(estudiante, "Resultado del estudiante");
  console.log("E2E estudiante: video marcado, respuesta enviada, 100 % recibido");

  await docente.goto(seguimientoUrl);
  await docente.getByRole("heading", { name: "Seguimiento" }).waitFor();
  await docente.getByRole("cell", { name: "100 %" }).waitFor();
  await revisar(docente, "Seguimiento con nota");
  console.log("E2E docente: nota visible en seguimiento");
  if (hallazgos.some((h) => h.violaciones.length || h.desborde)) {
    console.error(JSON.stringify(hallazgos, null, 2));
    process.exitCode = 1;
  }
  await contextoEstudiante.close();
  await contextoDocente.close();
} finally {
  await navegador.close();
}
