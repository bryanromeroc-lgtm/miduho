/**
 * Poblado de DEMO para presentación (no forma parte del seed versionado).
 * 3 cursos (1°01, 2°01, 3°01) · 3 docentes · 10 estudiantes por curso ·
 * 4 asignaturas con horario semanal. Todos los nombres son inventados.
 * Genera contraseñas aleatorias y las escribe en un CSV (ruta en argv[2]).
 * Idempotente: al volver a correrlo actualiza los datos y regenera las claves.
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { urlBaseDatos } from "../src/lib/entorno";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: urlBaseDatos() }),
});

const ANIO = 2026;
const fechaUtc = (s: string) => new Date(`${s}T00:00:00.000Z`);

const PERIODOS = [
  { orden: 1, nombre: "Primer período", fechaInicio: "2026-01-26", fechaFin: "2026-04-03" },
  { orden: 2, nombre: "Segundo período", fechaInicio: "2026-04-13", fechaFin: "2026-06-19" },
  { orden: 3, nombre: "Tercer período", fechaInicio: "2026-07-13", fechaFin: "2026-09-18" },
  { orden: 4, nombre: "Cuarto período", fechaInicio: "2026-09-28", fechaFin: "2026-11-27" },
];

/** Área → asignatura con intensidad semanal (horas) en 1°, 2° y 3°. */
const ASIGNATURAS = [
  { clave: "LEN", area: "Humanidades: Lengua Castellana", areaPrevia: "Humanidades: lengua castellana (demo)", nombre: "Lengua Castellana", nombrePrevio: "Comprensión Lectora", horas: 5, orden: 1 },
  { clave: "CIE", area: "Ciencias Naturales y Educación Ambiental", nombre: "Ciencias Naturales", horas: 4, orden: 2 },
  { clave: "ROB", area: "Tecnología e Informática", areaPrevia: "Tecnología e informática (demo)", nombre: "Robótica", horas: 2, orden: 3 },
  { clave: "EMP", area: "Emprendimiento", areaPrevia: "Emprendimiento (demo)", nombre: "Emprendimiento", horas: 2, orden: 4 },
] as const;

const DOCENTES = [
  { nombres: "Claudia Patricia", apellidos: "Rincón Vargas", correo: "claudia.rincon@miduho.test", asignaturas: ["LEN"], dirige: "1°" },
  { nombres: "Andrés Felipe", apellidos: "Moreno Castillo", correo: "andres.moreno@miduho.test", asignaturas: ["CIE"], dirige: "2°" },
  { nombres: "Luz Marina", apellidos: "Castañeda Ruiz", correo: "luz.castaneda@miduho.test", asignaturas: ["ROB", "EMP"], dirige: "3°" },
];

const ESTUDIANTES: Record<string, [string, string][]> = {
  "1°": [
    ["Santiago", "Gómez Pardo"], ["Valentina", "Rodríguez Peña"], ["Samuel", "Martínez Rojas"],
    ["Mariana", "López Cárdenas"], ["Matías", "Hernández Suárez"], ["Isabella", "García Muñoz"],
    ["Emiliano", "Torres Beltrán"], ["Sofía", "Ramírez Ortiz"], ["Tomás", "Díaz Quintero"],
    ["Antonella", "Sánchez Mora"],
  ],
  "2°": [
    ["Jerónimo", "Castro Vargas"], ["Salomé", "Pérez Londoño"], ["Martín", "Romero Acosta"],
    ["Gabriela", "Jiménez Salazar"], ["Nicolás", "Ruiz Herrera"], ["Luciana", "Álvarez Ríos"],
    ["Juan José", "Medina Cortés"], ["Sara", "Gutiérrez Molina"], ["Daniel", "Rojas Camacho"],
    ["Victoria", "Moreno Vega"],
  ],
  "3°": [
    ["Sebastián", "Navarro Pineda"], ["Camila", "Restrepo Gil"], ["Alejandro", "Ospina Duarte"],
    ["Valeria", "Cardona Mejía"], ["Miguel Ángel", "Vargas León"], ["Emilia", "Aguilar Franco"],
    ["David", "Rincón Parra"], ["María José", "Benítez Arias"], ["Felipe", "Guerrero Osorio"],
    ["Juliana", "Mendoza Rueda"],
  ],
};

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"] as const;
const FRANJAS = [
  ["07:00", "08:00"], ["08:00", "09:00"], ["09:00", "10:00"], ["10:30", "11:30"], ["11:30", "12:30"],
] as const;

const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
function generarClave() {
  // 8 letras + 4 dígitos, sin caracteres ambiguos (cumple la política ≥10, letra y número).
  let s = "";
  for (let i = 0; i < 8; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `${s}${randomInt(1000, 10000)}`;
}

type Fila = { rol: string; curso: string; nombres: string; apellidos: string; correo: string; contrasena: string };
const filas: Fila[] = [];

async function usuario(d: { nombres: string; apellidos: string; correo: string; rol: "DOCENTE" | "ESTUDIANTE"; curso: string }) {
  const clave = generarClave();
  const hashContrasena = await bcrypt.hash(clave, 10);
  const datos = { nombres: d.nombres, apellidos: d.apellidos, hashContrasena, estado: "ACTIVO" as const, debeCambiarContrasena: false };
  const u = await db.usuario.upsert({ where: { correo: d.correo }, update: datos, create: { ...datos, correo: d.correo } });
  const rol = await db.rol.findUniqueOrThrow({ where: { codigo: d.rol } });
  await db.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
    update: {},
    create: { usuarioId: u.id, rolId: rol.id },
  });
  filas.push({ rol: d.rol, curso: d.curso, nombres: d.nombres, apellidos: d.apellidos, correo: d.correo, contrasena: clave });
  return u;
}

async function main() {
  const csv = process.argv[2];
  if (!csv) throw new Error("Uso: tsx scripts/poblar-demo.ts <ruta.csv>");
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) {
    await db.rol.upsert({ where: { codigo }, update: {}, create: { codigo, nombre: codigo } });
  }

  // Año lectivo completo y sus 4 períodos (25 % cada uno).
  const anio = await db.anioLectivo.upsert({
    where: { anio: ANIO },
    update: { fechaInicio: fechaUtc("2026-01-19"), fechaFin: fechaUtc("2026-12-04"), estado: "ACTIVO" },
    create: { anio: ANIO, fechaInicio: fechaUtc("2026-01-19"), fechaFin: fechaUtc("2026-12-04") },
  });
  for (const p of PERIODOS) {
    const datos = { nombre: p.nombre, fechaInicio: fechaUtc(p.fechaInicio), fechaFin: fechaUtc(p.fechaFin), ponderacion: 25 };
    await db.periodo.upsert({
      where: { anioLectivoId_orden: { anioLectivoId: anio.id, orden: p.orden } },
      update: datos,
      create: { ...datos, anioLectivoId: anio.id, orden: p.orden },
    });
  }

  // Grados 1° a 3° y sus grupos 01.
  const grupos: Record<string, { id: string; gradoId: string }> = {};
  for (const [i, nombre] of ["1°", "2°", "3°"].entries()) {
    const grado = await db.grado.upsert({ where: { nombre }, update: {}, create: { nombre, nivel: "PRIMARIA", orden: i + 1 } });
    const g = await db.grupo.upsert({
      where: { gradoId_anioLectivoId_identificador: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } },
      update: {},
      create: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" },
    });
    grupos[nombre] = { id: g.id, gradoId: grado.id };
  }

  // Áreas y asignaturas: se renombran las demo previas para conservar sus ids.
  const asignaturas: Record<string, string> = {};
  for (const a of ASIGNATURAS) {
    const previa = "areaPrevia" in a ? await db.area.findUnique({ where: { nombre_idioma: { nombre: a.areaPrevia, idioma: "es" } } }) : null;
    const area = previa
      ? await db.area.update({ where: { id: previa.id }, data: { nombre: a.area, orden: a.orden } })
      : await db.area.upsert({
          where: { nombre_idioma: { nombre: a.area, idioma: "es" } },
          update: { orden: a.orden },
          create: { nombre: a.area, orden: a.orden },
        });
    const asigPrevia = "nombrePrevio" in a ? await db.asignatura.findUnique({ where: { areaId_nombre: { areaId: area.id, nombre: a.nombrePrevio } } }) : null;
    const asig = asigPrevia
      ? await db.asignatura.update({ where: { id: asigPrevia.id }, data: { nombre: a.nombre, intensidadHoraria: a.horas } })
      : await db.asignatura.upsert({
          where: { areaId_nombre: { areaId: area.id, nombre: a.nombre } },
          update: { intensidadHoraria: a.horas },
          create: { nombre: a.nombre, areaId: area.id, intensidadHoraria: a.horas },
        });
    asignaturas[a.clave] = asig.id;
    for (const g of Object.values(grupos)) {
      await db.asignaturaGrado.upsert({
        where: { asignaturaId_gradoId: { asignaturaId: asig.id, gradoId: g.gradoId } },
        update: { intensidad: a.horas },
        create: { asignaturaId: asig.id, gradoId: g.gradoId, intensidad: a.horas },
      });
    }
  }

  // Las cuentas genéricas previas quedan fuera de la demo (inactivas, sin grupo ni asignaciones).
  const genericas = await db.usuario.findMany({ where: { correo: { in: ["docente@miduho.test", "estudiante@miduho.test"] } } });
  for (const u of genericas) {
    await db.asignacionDocente.updateMany({ where: { docenteId: u.id, estado: "ACTIVA" }, data: { estado: "INACTIVA" } });
    await db.asociacionEstudianteGrupo.updateMany({ where: { estudianteId: u.id, finEn: null }, data: { finEn: new Date() } });
    await db.usuario.update({ where: { id: u.id }, data: { estado: "INACTIVO" } });
  }

  const admin = await db.usuario.findFirst({ where: { roles: { some: { rol: { codigo: "ADMIN" } } } } });

  // Docentes, dirección de grupo y asignaciones.
  const ocupadoDocente = new Set<string>();
  const ocupadoGrupo = new Set<string>();
  for (const d of DOCENTES) {
    const u = await usuario({ ...d, rol: "DOCENTE", curso: `Director(a) ${d.dirige}01` });
    await db.grupo.update({ where: { id: grupos[d.dirige].id }, data: { directorId: u.id } });
    for (const clave of d.asignaturas) {
      const horas = ASIGNATURAS.find((a) => a.clave === clave)!.horas;
      for (const [gi, g] of Object.values(grupos).entries()) {
        const asignacion = (await db.asignacionDocente.findFirst({
          where: { docenteId: u.id, asignaturaId: asignaturas[clave], grupoId: g.id, anioLectivoId: anio.id },
          orderBy: { creadoEn: "desc" },
        })) ?? (await db.asignacionDocente.create({
          data: { docenteId: u.id, asignaturaId: asignaturas[clave], grupoId: g.id, anioLectivoId: anio.id, creadoPorId: admin?.id },
        }));
        await db.asignacionDocente.update({ where: { id: asignacion.id }, data: { estado: "ACTIVA" } });
        await db.bloqueHorario.deleteMany({ where: { asignacionId: asignacion.id } });
        // Reparto greedy sin cruces: un bloque por día, rotando la franja según el grupo.
        let asignadas = 0;
        for (let vuelta = 0; vuelta < 2 && asignadas < horas; vuelta++) {
          for (let di = 0; di < DIAS.length && asignadas < horas; di++) {
            const dia = DIAS[(di * 2 + gi + vuelta) % DIAS.length];
            for (let f = 0; f < FRANJAS.length; f++) {
              const franja = (f + gi) % FRANJAS.length;
              const kd = `${u.id}|${dia}|${franja}`;
              const kg = `${g.id}|${dia}|${franja}`;
              if (ocupadoDocente.has(kd) || ocupadoGrupo.has(kg)) continue;
              ocupadoDocente.add(kd);
              ocupadoGrupo.add(kg);
              const [horaInicio, horaFin] = FRANJAS[franja];
              await db.bloqueHorario.create({ data: { asignacionId: asignacion.id, dia, horaInicio, horaFin } });
              asignadas++;
              break;
            }
          }
        }
        if (asignadas < horas) throw new Error(`Sin franjas para ${clave} en grupo ${gi + 1}`);
      }
    }
  }

  // Estudiantes y su asociación vigente al grupo.
  for (const [grado, lista] of Object.entries(ESTUDIANTES)) {
    for (const [nombres, apellidos] of lista) {
      const correo = `${sinTildes(nombres.split(" ")[0])}.${sinTildes(apellidos.split(" ")[0])}@miduho.test`.toLowerCase();
      const u = await usuario({ nombres, apellidos, correo, rol: "ESTUDIANTE", curso: `${grado}01` });
      const vigente = await db.asociacionEstudianteGrupo.findFirst({ where: { estudianteId: u.id, anioLectivoId: anio.id, finEn: null } });
      if (vigente && vigente.grupoId !== grupos[grado].id) {
        await db.asociacionEstudianteGrupo.update({ where: { id: vigente.id }, data: { finEn: new Date() } });
      }
      if (!vigente || vigente.grupoId !== grupos[grado].id) {
        await db.asociacionEstudianteGrupo.create({
          data: { estudianteId: u.id, grupoId: grupos[grado].id, anioLectivoId: anio.id, inicioEn: fechaUtc("2026-01-19") },
        });
      }
    }
  }

  const adminFila = admin && process.env.SEED_ADMIN_PASSWORD
    ? [{ rol: "ADMIN", curso: "", nombres: admin.nombres, apellidos: admin.apellidos, correo: admin.correo, contrasena: process.env.SEED_ADMIN_PASSWORD }]
    : [];
  const todas = [...adminFila, ...filas];
  const esc = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const contenido = ["rol,curso,nombres,apellidos,correo,contrasena", ...todas.map((f) => [f.rol, f.curso, f.nombres, f.apellidos, f.correo, f.contrasena].map(esc).join(","))].join("\n");
  writeFileSync(csv, "﻿" + contenido + "\n", { mode: 0o600 });
  console.info(`Demo poblada: ${DOCENTES.length} docentes, ${filas.length - DOCENTES.length} estudiantes. CSV: ${csv}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
