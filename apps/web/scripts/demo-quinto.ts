/**
 * Cuenta de DEMO de un estudiante de 5° con todo el currículo a la vista
 * (no forma parte del seed versionado). Usa docentes de poblar-demo.ts si
 * existen; en la base desechable de capturas usa la cuenta docente del seed.
 *
 * Crea el grupo 5°01 y las asignaturas cuyos nombres coinciden con las
 * carpetas de `curriculo/actividades/` (el catálogo busca por nombre
 * normalizado), cada una con asignación ACTIVA de una docente demo: así
 * aparecen todas en «Mis materias» con sus actividades «para jugar».
 * Idempotente: al volver a correrlo regenera la contraseña y la imprime.
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlBaseDatos } from "../src/lib/entorno";
import { ASIGNATURAS_CURRICULO } from "../prisma/asignaturas-curriculo";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlBaseDatos() }),
});

const ANIO = 2026;
const CORREO = "estudiante.quinto@miduho.test";

const ASIGNATURAS = ASIGNATURAS_CURRICULO;

const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
function generarClave() {
  // 8 letras + 4 dígitos, sin caracteres ambiguos (cumple la política ≥10, letra y número).
  let s = "";
  for (let i = 0; i < 8; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `${s}${randomInt(1000, 10000)}`;
}

async function main() {
  const anio = await db.anioLectivo.findUniqueOrThrow({ where: { anio: ANIO } });
  const grado = await db.grado.upsert({ where: { nombre: "5°" }, update: {}, create: { nombre: "5°", nivel: "PRIMARIA", orden: 5 } });
  const grupo = await db.grupo.upsert({
    where: { gradoId_anioLectivoId_identificador: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } },
    update: {},
    create: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" },
  });
  const admin = await db.usuario.findFirst({ where: { roles: { some: { rol: { codigo: "ADMIN" } } } } });

  for (const a of ASIGNATURAS) {
    const area = await db.area.upsert({
      where: { nombre_idioma: { nombre: a.area, idioma: "es" } },
      update: {},
      create: { nombre: a.area, orden: a.orden },
    });
    const asig = await db.asignatura.upsert({
      where: { areaId_nombre: { areaId: area.id, nombre: a.nombre } },
      update: {},
      create: { nombre: a.nombre, areaId: area.id },
    });
    await db.asignaturaGrado.upsert({
      where: { asignaturaId_gradoId: { asignaturaId: asig.id, gradoId: grado.id } },
      update: {},
      create: { asignaturaId: asig.id, gradoId: grado.id },
    });
    const docente = await db.usuario.findUnique({ where: { correo: a.docente } })
      ?? await db.usuario.findUniqueOrThrow({ where: { correo: "docente@miduho.test" } });
    const asignacion = await db.asignacionDocente.findFirst({
      where: { docenteId: docente.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id },
    });
    if (asignacion) await db.asignacionDocente.update({ where: { id: asignacion.id }, data: { estado: "ACTIVA" } });
    else
      await db.asignacionDocente.create({
        data: { docenteId: docente.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id, creadoPorId: admin?.id },
      });
  }

  const clave = generarClave();
  const datos = {
    nombres: "Cuenta",
    apellidos: "Demostración",
    hashContrasena: await bcrypt.hash(clave, 10),
    estado: "ACTIVO" as const,
    debeCambiarContrasena: false,
  };
  const u = await db.usuario.upsert({ where: { correo: CORREO }, update: datos, create: { ...datos, correo: CORREO } });
  const rol = await db.rol.findUniqueOrThrow({ where: { codigo: "ESTUDIANTE" } });
  await db.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
    update: {},
    create: { usuarioId: u.id, rolId: rol.id },
  });
  const vigente = await db.asociacionEstudianteGrupo.findFirst({ where: { estudianteId: u.id, finEn: null } });
  if (vigente?.grupoId !== grupo.id) {
    if (vigente) await db.asociacionEstudianteGrupo.update({ where: { id: vigente.id }, data: { finEn: new Date() } });
    await db.asociacionEstudianteGrupo.create({ data: { estudianteId: u.id, grupoId: grupo.id, anioLectivoId: anio.id } });
  }

  console.log(`Grupo 5°01 con ${ASIGNATURAS.length} asignaturas.\nCuenta: ${CORREO}\nContraseña: ${clave}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
