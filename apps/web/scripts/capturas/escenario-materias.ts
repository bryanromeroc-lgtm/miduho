/**
 * Escenario de capturas para «Mis materias»: asigna al grupo del estudiante
 * demo las asignaturas de 1° (nombres curriculares, ningún dato personal),
 * todas dictadas por la docente ficticia del seed. Solo corre contra la base
 * desechable `miduho_capturas`.
 *
 * Uso: source scripts/capturas/capturas.env && npx tsx scripts/capturas/escenario-materias.ts [cantidad]
 * cantidad: 10 (por defecto) o más, para probar la paginación.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { urlBaseDatos } from "../../src/lib/entorno";

const url = urlBaseDatos();
if (!/\/miduho_capturas(\?|$)/.test(url)) {
  console.error(`ABORTO: este escenario solo corre contra miduho_capturas (${url.replace(/\/\/.*@/, "//…@")})`);
  process.exit(1);
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Área (con su orden) → asignaturas. Las tres primeras ya vienen del seed.
const PLAN: [string, number, string[]][] = [
  ["Humanidades: lengua castellana (demo)", 1, ["Comprensión Lectora"]],
  ["Matemáticas", 4, ["Matemáticas"]],
  ["Ciencias Naturales y Educación Ambiental", 5, ["Ciencias naturales"]],
  ["Humanidades: idioma extranjero", 6, ["Inglés"]],
  ["Tecnología e informática (demo)", 2, ["Robótica"]],
  ["Emprendimiento (demo)", 3, ["Emprendimiento"]],
  ["Educación Ética y en Valores Humanos", 7, ["Ética y valores"]],
  ["Educación Artística y Cultural", 8, ["Educación artística"]],
  ["Educación Física, Recreación y Deportes", 9, ["Educación física"]],
  ["Ciencias Sociales", 10, ["Ciencias sociales"]],
  ["Educación Religiosa", 11, ["Educación religiosa"]],
  ["Humanidades: lengua castellana (demo)", 1, ["Plan lector"]],
  ["Matemáticas", 4, ["Geometría"]],
  ["Ciencias Sociales", 10, ["Cátedra de la paz"]],
];

async function main() {
  const cantidad = Math.max(1, Number(process.argv[2] ?? 10));
  const est = await db.usuario.findUniqueOrThrow({ where: { correo: "estudiante@miduho.test" } });
  const docente = await db.usuario.findUniqueOrThrow({ where: { correo: "docente@miduho.test" } });
  const asoc = await db.asociacionEstudianteGrupo.findFirstOrThrow({
    where: { estudianteId: est.id, finEn: null },
    include: { grupo: true },
  });
  let n = 0;
  for (const [areaNombre, orden, asignaturas] of PLAN) {
    for (const nombre of asignaturas) {
      if (n >= cantidad) break;
      const area = await db.area.upsert({
        where: { nombre_idioma: { nombre: areaNombre, idioma: "es" } },
        update: { orden },
        create: { nombre: areaNombre, orden },
      });
      const asignatura = await db.asignatura.upsert({
        where: { areaId_nombre: { areaId: area.id, nombre } },
        update: {},
        create: { nombre, areaId: area.id },
      });
      await db.asignaturaGrado.upsert({
        where: { asignaturaId_gradoId: { asignaturaId: asignatura.id, gradoId: asoc.grupo.gradoId } },
        update: {},
        create: { asignaturaId: asignatura.id, gradoId: asoc.grupo.gradoId },
      });
      const existe = await db.asignacionDocente.findFirst({
        where: { asignaturaId: asignatura.id, grupoId: asoc.grupoId, anioLectivoId: asoc.anioLectivoId, estado: "ACTIVA" },
      });
      if (!existe) {
        await db.asignacionDocente.create({
          data: { docenteId: docente.id, asignaturaId: asignatura.id, grupoId: asoc.grupoId, anioLectivoId: asoc.anioLectivoId },
        });
      }
      n += 1;
    }
  }
  // Las que sobran de una corrida anterior con más materias se desactivan.
  const activas = await db.asignacionDocente.findMany({
    where: { grupoId: asoc.grupoId, anioLectivoId: asoc.anioLectivoId, estado: "ACTIVA" },
    include: { asignatura: true },
  });
  const deseadas = new Set(PLAN.flatMap(([, , a]) => a).slice(0, cantidad));
  for (const a of activas) {
    if (!deseadas.has(a.asignatura.nombre)) {
      await db.asignacionDocente.update({ where: { id: a.id }, data: { estado: "INACTIVA" } });
    }
  }
  console.log(`Grupo del estudiante demo con ${n} asignaturas activas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
