/** Demostración técnica ficticia: recibe una URL real, nunca la fija en el seed. */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlBaseDatos } from "../src/lib/entorno";
import { crearServicioActividades } from "../src/server/modules/actividades/servicio";

async function main() {
  const url = process.argv[2];
  if (!url) throw new Error("Uso: npx tsx scripts/demo-material.ts <url-de-youtube>");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: urlBaseDatos() }) });
  try {
    const docente = await db.usuario.findUnique({ where: { correo: "docente@miduho.test" } });
    if (!docente) throw new Error("Primero ejecuta el seed con las cuentas ficticias de demostración.");
    const servicio = crearServicioActividades(db);
    const opciones = await servicio.opcionesDeCreacion(docente.id);
    const opcion = opciones.opciones.find((o) => o.asignatura === "Comprensión Lectora" && o.grupos.length >= 2)
      ?? opciones.opciones[0];
    if (!opcion) throw new Error("La docente ficticia no tiene una asignación activa en el período vigente.");
    const creado = await servicio.crearMaterial(docente.id, {
      titulo: "Material audiovisual de demostración 🔶",
      instruccion: "Demostración técnica ficticia. Reemplaza la pregunta antes de usar este material en clase.",
      url, asignaturaId: opcion.asignaturaId, gradoId: opcion.gradoId,
      grupoIds: opcion.grupos.map((grupo) => grupo.grupoId),
      contenido: { preguntas: [{ id: "p1", enunciado: "¿Qué recurso viste en esta actividad?",
        opciones: ["Un video", "Un texto"], correcta: 0,
        explicacion: "Esta actividad presenta un video de YouTube." }] },
    });
    console.info(`Material demo ficticio creado: ${creado.actividad.id}; grupos: ${creado.asignaciones.length}.`);
  } finally { await db.$disconnect(); }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
