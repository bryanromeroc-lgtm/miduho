/**
 * Cuenta de DEMO de un estudiante de 5° con todo el currículo a la vista
 * (no forma parte del seed versionado). Requiere haber corrido poblar-demo.ts.
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

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlBaseDatos() }),
});

const ANIO = 2026;
const CORREO = "estudiante.quinto@miduho.test";

/** Asignatura (nombre = carpeta del currículo) → área y docente demo que la dicta. */
const ASIGNATURAS = [
  { nombre: "Comprensión Lectora", area: "Humanidades: Lengua Castellana", orden: 1, docente: "claudia.rincon@miduho.test" },
  { nombre: "Ciencias Naturales", area: "Ciencias Naturales y Educación Ambiental", orden: 2, docente: "andres.moreno@miduho.test" },
  { nombre: "Robótica", area: "Tecnología e Informática", orden: 3, docente: "luz.castaneda@miduho.test" },
  { nombre: "Emprendimiento", area: "Emprendimiento", orden: 4, docente: "luz.castaneda@miduho.test" },
  { nombre: "Matemáticas", area: "Matemáticas", orden: 5, docente: "andres.moreno@miduho.test" },
  { nombre: "Ciencias Sociales", area: "Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia", orden: 6, docente: "andres.moreno@miduho.test" },
  { nombre: "Inglés", area: "Humanidades: Idioma Extranjero (Inglés)", orden: 7, docente: "claudia.rincon@miduho.test" },
  { nombre: "Educación Artística", area: "Educación Artística y Cultural", orden: 8, docente: "luz.castaneda@miduho.test" },
  { nombre: "Educación Física", area: "Educación Física, Recreación y Deportes", orden: 9, docente: "andres.moreno@miduho.test" },
  { nombre: "Ética y Valores", area: "Educación Ética y en Valores Humanos", orden: 10, docente: "claudia.rincon@miduho.test" },
  { nombre: "Educación Religiosa", area: "Educación Religiosa", orden: 11, docente: "claudia.rincon@miduho.test" },
] as const;

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
    const docente = await db.usuario.findUniqueOrThrow({ where: { correo: a.docente } });
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
    nombres: "Estudiante",
    apellidos: "Demo Quinto",
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
