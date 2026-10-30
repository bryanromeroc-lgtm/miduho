// Escenario ficticio adicional para el E2E INC1R-13 (fuera del repo). Datos 100 % ficticios.
// - Una cuenta mixta DOCENTE+ADMIN para el selector de contexto.
// - Cinco estudiantes ficticios más en 1°-01 (uno INACTIVO) para «Mi curso».
// - Un segundo docente con 1°-02 y un estudiante: el docente sembrado NO debe verlos.
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaLibSql({ url: process.env.DATABASE_URL! }) });

async function main() {
  const docente = await db.usuario.findUniqueOrThrow({ where: { correo: "docente@miduho.test" } });
  const est = await db.usuario.findUniqueOrThrow({ where: { correo: "estudiante@miduho.test" } });
  const anio = await db.anioLectivo.findFirstOrThrow({ where: { estado: "ACTIVO" } });
  const g1 = await db.grupo.findFirstOrThrow({ where: { anioLectivoId: anio.id, identificador: "01" }, include: { grado: true } });
  const rolEst = await db.rol.findUniqueOrThrow({ where: { codigo: "ESTUDIANTE" } });
  const rolDoc = await db.rol.findUniqueOrThrow({ where: { codigo: "DOCENTE" } });
  const rolAdmin = await db.rol.findUniqueOrThrow({ where: { codigo: "ADMIN" } });

  // Cuenta mixta DOCENTE+ADMIN (sin cambio obligatorio) para el selector de contexto.
  const admin = await db.usuario.findUniqueOrThrow({ where: { correo: "admin@miduho.test" } });
  await db.usuario.create({
    data: {
      nombres: "Cuenta",
      apellidos: "Mixta (ficticia)",
      correo: "mixta@miduho.test",
      hashContrasena: admin.hashContrasena,
      estado: "ACTIVO",
      roles: { create: [{ rolId: rolAdmin.id }, { rolId: rolDoc.id }] },
    },
  });

  const crear = async (n: number, grupoId: string, estado: "ACTIVO" | "INACTIVO" = "ACTIVO") => {
    const u = await db.usuario.create({
      data: {
        nombres: `Cuenta ${n}`,
        apellidos: "Estudiantil (ficticia)",
        correo: `estudiante${n}@miduho.test`,
        hashContrasena: est.hashContrasena,
        estado,
        roles: { create: { rolId: rolEst.id } },
      },
    });
    await db.asociacionEstudianteGrupo.create({ data: { estudianteId: u.id, grupoId, anioLectivoId: anio.id } });
    return u;
  };
  for (let n = 2; n <= 5; n++) await crear(n, g1.id);
  await crear(6, g1.id, "INACTIVO");

  const docB = await db.usuario.create({
    data: {
      nombres: "Cuenta",
      apellidos: "Docente B (ficticia)",
      correo: "docente-b@miduho.test",
      hashContrasena: docente.hashContrasena,
      estado: "ACTIVO",
      roles: { create: { rolId: rolDoc.id } },
    },
  });
  const g2 = await db.grupo.create({ data: { gradoId: g1.gradoId, anioLectivoId: anio.id, identificador: "02" } });
  const asig = await db.asignaturaGrado.findFirstOrThrow({ where: { gradoId: g1.gradoId } });
  await db.asignacionDocente.create({
    data: {
      docenteId: docB.id,
      asignaturaId: asig.asignaturaId,
      grupoId: g2.id,
      anioLectivoId: anio.id,
      bloques: { create: [{ dia: "MARTES", horaInicio: "10:00", horaFin: "11:00" }] },
    },
  });
  const ajeno = await crear(7, g2.id);
  console.log(JSON.stringify({ g1: g1.id, g2: g2.id, ajeno: ajeno.id }));
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
