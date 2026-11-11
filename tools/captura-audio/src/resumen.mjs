/** `resumen <slug>`: `RESUMEN.md` para el informe de referencia (sección «Inventario sonoro»). */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carpetaReferencia } from "./rutas.mjs";

const ROLES = ["voz", "efecto", "musica", "ambiente", "desconocido"];

export function textoResumen(inv) {
  const cuenta = Object.fromEntries(ROLES.map((r) => [r, inv.pistas.filter((p) => p.rol === r).length]));
  const total = inv.pistas.filter((p) => !p.sprite).reduce((t, p) => t + (p.duracion_s ?? 0), 0);
  // Nadie ha oído una voz hasta que una persona la marque «confirmado».
  const porEscuchar = inv.pistas.filter((p) => (p.rol === "voz" || p.rol === "desconocido") && p.certeza !== "confirmado");
  const usadas = inv.pistas.filter((p) => p.uso?.length);
  const s = (x) => (x == null ? "—" : String(x));
  const lineas = [
    `# Resumen sonoro — ${inv.slug}`,
    "",
    `- **Página:** ${inv.pagina}`,
    `- **Autoría real (dominio del juego):** ${inv.autor_dominio ?? "🔶"}`,
    `- **Captura:** ${inv.fecha_captura} con \`${inv.herramienta}\``,
    `- **Licencia:** ${inv.licencia}`,
    `- **Transcripción automática:** ${inv.transcripcion_automatica}`,
    "",
    "## Conteo",
    "",
    `${inv.pistas.length} pistas (${inv.pistas.filter((p) => p.sprite).length} son cortes de sprite) · duración total ${total.toFixed(1)} s.`,
    "",
    "| Rol | Pistas |",
    "|---|---|",
    ...ROLES.map((r) => `| ${r} | ${cuenta[r]} |`),
    "",
  ];
  if (inv.nota) lineas.push(`> ${inv.nota}.`, "");
  if (inv.pistas.length) {
    lineas.push(
      "## Pistas",
      "",
      "Rol y evento **inferidos** (nombre, duración, bucle y código cercano) salvo que diga otra cosa: Claude no oye 🔶.",
      "",
      "| id | archivo | s | LUFS | rol | evento | certeza | transcripción | uso |",
      "|---|---|---|---|---|---|---|---|---|",
      ...inv.pistas.map((p) => `| \`${p.id}\` | ${p.archivo.split("/").pop()} | ${s(p.duracion_s)} | ${s(p.sonoridad_lufs)} | ${p.rol} | ${s(p.evento)} | ${p.certeza} | ${p.transcripcion ?? "🔶"} | ${p.uso?.join(", ") || "—"} |`),
      "",
    );
  }
  lineas.push("## Por escuchar 🔶", "");
  lineas.push(porEscuchar.length ? porEscuchar.map((p) => `- [ ] \`${p.id}\` (${p.rol}, ${s(p.duracion_s)} s): ${p.transcripcion ? `confirmar que dice «${p.transcripcion}» y si el acento sirve` : "confirmar qué dice o qué es"}`).join("\n") : "- Nada pendiente.");
  lineas.push("", "## Usadas en MIDUHO", "", usadas.length ? usadas.map((p) => `- \`${p.id}\` → ${p.uso.join(", ")}`).join("\n") : "- Ninguna todavía.");
  if (inv.notas_captura?.length) {
    const ruido = /^(no descargado|omitido|descartado)/;
    const fallidas = inv.notas_captura.filter((n) => ruido.test(n)).length;
    lineas.push("", "## Notas de la captura", "", ...inv.notas_captura.filter((n) => !ruido.test(n)).map((n) => `- ${n}`));
    if (fallidas) lineas.push(`- ${fallidas} URL declaradas no se descargaron (404, rutas mal resueltas o no audio): ver \`notas_captura\` en \`inventario.json\`.`);
  }
  return `${lineas.join("\n")}\n`;
}

export function resumen(slug) {
  const dir = carpetaReferencia(slug);
  const inv = JSON.parse(readFileSync(join(dir, "inventario.json"), "utf8"));
  writeFileSync(join(dir, "RESUMEN.md"), textoResumen(inv));
  console.log(`RESUMEN.md de ${slug} escrito`);
}
