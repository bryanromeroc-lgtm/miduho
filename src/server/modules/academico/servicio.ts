/**
 * Capa de datos del módulo académico: AnioLectivo, Periodo, Grado, Grupo y
 * Asignatura (+ AsignaturaGrado). Aplica las reglas que SQL no expresa
 * (RN-01, RN-02, RN-03, RN-06, RN-07, RN-09, RN-52).
 *
 * Recibe el cliente Prisma por parámetro para poder probarla contra una base
 * temporal; las rutas usan `servicioAcademico` (singleton de src/server/db).
 * La autorización (ADMIN/COORDINACION) se verifica antes, en el handler.
 */
import type { z } from "zod";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import type * as E from "./esquemas";
import { dentroDe, ponderacionExcede, rangoValido, seSolapan, sumaPonderaciones, ponderacionCompleta } from "./reglas";

type Entrada<T extends z.ZodType> = z.output<T>;
type Pagina = { page: number; pageSize: number };
type Tx = Prisma.TransactionClient;

const saltar = ({ page, pageSize }: Pagina) => ({ skip: (page - 1) * pageSize, take: pageSize });

function exigirRango(r: { fechaInicio: Date; fechaFin: Date }) {
  if (!rangoValido(r)) throw new ErrorDominio("RANGO_INVALIDO", "La fecha de fin debe ser posterior a la de inicio.");
}

function periodoDto<T extends { ponderacion: Prisma.Decimal }>(p: T) {
  return { ...p, ponderacion: p.ponderacion.toNumber() };
}

export function crearServicioAcademico(db: PrismaClient) {
  async function anioEditable(tx: Tx, anioLectivoId: string) {
    const anio = await tx.anioLectivo.findUnique({ where: { id: anioLectivoId } });
    if (!anio) throw noEncontrado("El año lectivo");
    if (anio.estado === "CERRADO") {
      throw conflicto("ANIO_CERRADO", "El año lectivo está cerrado y es de solo lectura.");
    }
    return anio;
  }

  // ---------------- AnioLectivo ----------------
  const aniosLectivos = {
    async listar(p: Pagina) {
      const [data, total] = await Promise.all([
        db.anioLectivo.findMany({ orderBy: { anio: "desc" }, ...saltar(p) }),
        db.anioLectivo.count(),
      ]);
      return { data, total };
    },

    async obtener(id: string) {
      const anio = await db.anioLectivo.findUnique({
        where: { id },
        include: { periodos: { orderBy: { orden: "asc" } } },
      });
      if (!anio) throw noEncontrado("El año lectivo");
      const ponderaciones = anio.periodos.map((p) => p.ponderacion.toNumber());
      return {
        ...anio,
        periodos: anio.periodos.map(periodoDto),
        sumaPonderaciones: sumaPonderaciones(ponderaciones),
        ponderacionCompleta: ponderacionCompleta(ponderaciones),
      };
    },

    async crear(d: Entrada<typeof E.crearAnioLectivo>) {
      exigirRango(d);
      return db.$transaction(async (tx) => {
        if (await tx.anioLectivo.findUnique({ where: { anio: d.anio } })) {
          throw conflicto("ANIO_DUPLICADO", `Ya existe el año lectivo ${d.anio}.`);
        }
        if (d.estado === "ACTIVO" && (await tx.anioLectivo.count({ where: { estado: "ACTIVO" } })) > 0) {
          throw conflicto("ANIO_ACTIVO_EXISTE", "Ya hay un año lectivo activo; ciérralo antes de activar otro.");
        }
        return tx.anioLectivo.create({ data: d });
      });
    },

    async actualizar(id: string, d: Entrada<typeof E.actualizarAnioLectivo>) {
      return db.$transaction(async (tx) => {
        const actual = await tx.anioLectivo.findUnique({ where: { id }, include: { periodos: true } });
        if (!actual) throw noEncontrado("El año lectivo");
        // RN-52: cerrado = solo lectura. No se reabre en el MVP (🔶 confirmar con el colegio).
        if (actual.estado === "CERRADO") {
          throw conflicto("ANIO_CERRADO", "El año lectivo está cerrado y es de solo lectura.");
        }
        const rango = { fechaInicio: d.fechaInicio ?? actual.fechaInicio, fechaFin: d.fechaFin ?? actual.fechaFin };
        exigirRango(rango);
        if (actual.periodos.some((p) => !dentroDe(p, rango))) {
          throw conflicto("PERIODO_FUERA_DE_ANIO", "Hay períodos que quedarían fuera de las nuevas fechas del año.");
        }
        return tx.anioLectivo.update({ where: { id }, data: { ...rango, estado: d.estado } });
      });
    },
  };

  // ---------------- Periodo ----------------
  async function validarPeriodo(
    tx: Tx,
    anioLectivoId: string,
    candidato: { id?: string; orden: number; fechaInicio: Date; fechaFin: Date; ponderacion: number },
  ) {
    const anio = await anioEditable(tx, anioLectivoId);
    exigirRango(candidato);
    // RN-03: el período pertenece a su año y cae dentro de él.
    if (!dentroDe(candidato, anio)) {
      throw new ErrorDominio("PERIODO_FUERA_DE_ANIO", "Las fechas del período deben estar dentro del año lectivo.");
    }
    const hermanos = (await tx.periodo.findMany({ where: { anioLectivoId } })).filter((p) => p.id !== candidato.id);
    if (hermanos.some((p) => p.orden === candidato.orden)) {
      throw conflicto("PERIODO_ORDEN_DUPLICADO", `Ya existe un período con orden ${candidato.orden} en este año.`);
    }
    // RN-02
    if (hermanos.some((p) => seSolapan(p, candidato))) {
      throw conflicto("PERIODO_SOLAPADO", "Las fechas se cruzan con otro período del mismo año.");
    }
    // RN-06 (suma parcial permitida mientras se configura, nunca > 100 %)
    if (ponderacionExcede([...hermanos.map((p) => p.ponderacion.toNumber()), candidato.ponderacion])) {
      throw conflicto("PONDERACION_EXCEDIDA", "La suma de ponderaciones del año superaría el 100 %.");
    }
  }

  const periodos = {
    async listar(f: Entrada<typeof E.filtroPeriodos>) {
      const where = f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {};
      const [data, total] = await Promise.all([
        db.periodo.findMany({ where, orderBy: [{ anioLectivoId: "asc" }, { orden: "asc" }], ...saltar(f) }),
        db.periodo.count({ where }),
      ]);
      return { data: data.map(periodoDto), total };
    },

    async obtener(id: string) {
      const p = await db.periodo.findUnique({ where: { id } });
      if (!p) throw noEncontrado("El período");
      return periodoDto(p);
    },

    async crear(d: Entrada<typeof E.crearPeriodo>) {
      return db.$transaction(async (tx) => {
        await validarPeriodo(tx, d.anioLectivoId, d);
        return periodoDto(await tx.periodo.create({ data: d }));
      });
    },

    async actualizar(id: string, d: Entrada<typeof E.actualizarPeriodo>) {
      return db.$transaction(async (tx) => {
        const actual = await tx.periodo.findUnique({ where: { id } });
        if (!actual) throw noEncontrado("El período");
        const nuevo = {
          id,
          orden: d.orden ?? actual.orden,
          fechaInicio: d.fechaInicio ?? actual.fechaInicio,
          fechaFin: d.fechaFin ?? actual.fechaFin,
          ponderacion: d.ponderacion ?? actual.ponderacion.toNumber(),
        };
        await validarPeriodo(tx, actual.anioLectivoId, nuevo);
        const { id: _omitido, ...cambios } = nuevo;
        void _omitido;
        return periodoDto(await tx.periodo.update({ where: { id }, data: { ...cambios, nombre: d.nombre } }));
      });
    },
  };

  // ---------------- Grado ----------------
  const grados = {
    async listar(p: Pagina) {
      const [data, total] = await Promise.all([
        db.grado.findMany({ orderBy: { orden: "asc" }, ...saltar(p) }),
        db.grado.count(),
      ]);
      return { data, total };
    },
    async obtener(id: string) {
      const g = await db.grado.findUnique({ where: { id } });
      if (!g) throw noEncontrado("El grado");
      return g;
    },
    crear: (d: Entrada<typeof E.crearGrado>) => db.grado.create({ data: d }),
    async actualizar(id: string, d: Entrada<typeof E.actualizarGrado>) {
      await grados.obtener(id);
      return db.grado.update({ where: { id }, data: d });
    },
  };

  // ---------------- Grupo ----------------
  async function validarDirector(tx: Tx, directorId: string | null | undefined) {
    if (!directorId) return;
    const u = await tx.usuario.findUnique({ where: { id: directorId }, include: { roles: { include: { rol: true } } } });
    if (!u || u.estado !== "ACTIVO" || !u.roles.some((r) => r.rol.codigo === "DOCENTE")) {
      throw new ErrorDominio("DIRECTOR_INVALIDO", "El director de grupo debe ser un usuario activo con rol docente.");
    }
  }

  const incluirGrupo = {
    grado: true,
    anioLectivo: { select: { id: true, anio: true, estado: true } },
    director: { select: { id: true, nombres: true, apellidos: true } },
  } as const;

  const grupos = {
    async listar(f: Entrada<typeof E.filtroGrupos>) {
      const where = {
        ...(f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {}),
        ...(f.gradoId ? { gradoId: f.gradoId } : {}),
      };
      const [data, total] = await Promise.all([
        db.grupo.findMany({
          where,
          include: incluirGrupo,
          orderBy: [{ grado: { orden: "asc" } }, { identificador: "asc" }],
          ...saltar(f),
        }),
        db.grupo.count({ where }),
      ]);
      return { data, total };
    },
    async obtener(id: string) {
      const g = await db.grupo.findUnique({ where: { id }, include: incluirGrupo });
      if (!g) throw noEncontrado("El grupo");
      return g;
    },
    async crear(d: Entrada<typeof E.crearGrupo>) {
      return db.$transaction(async (tx) => {
        await anioEditable(tx, d.anioLectivoId);
        if (!(await tx.grado.findUnique({ where: { id: d.gradoId } }))) throw noEncontrado("El grado");
        await validarDirector(tx, d.directorId);
        return tx.grupo.create({ data: { ...d, directorId: d.directorId ?? null }, include: incluirGrupo });
      });
    },
    async actualizar(id: string, d: Entrada<typeof E.actualizarGrupo>) {
      return db.$transaction(async (tx) => {
        const actual = await tx.grupo.findUnique({ where: { id } });
        if (!actual) throw noEncontrado("El grupo");
        await anioEditable(tx, actual.anioLectivoId);
        await validarDirector(tx, d.directorId);
        return tx.grupo.update({ where: { id }, data: d, include: incluirGrupo });
      });
    },
  };

  // ---------------- Asignatura ----------------
  const incluirAsignatura = {
    area: { select: { id: true, nombre: true, tipo: true } },
    grados: { include: { grado: { select: { id: true, nombre: true, orden: true } } } },
  } as const;

  async function validarReferencias(tx: Tx, areaId?: string, gradoIds: string[] = []) {
    if (areaId && !(await tx.area.findUnique({ where: { id: areaId } }))) throw noEncontrado("El área");
    if (gradoIds.length && (await tx.grado.count({ where: { id: { in: gradoIds } } })) !== gradoIds.length) {
      throw noEncontrado("Alguno de los grados");
    }
  }

  const asignaturas = {
    async listar(f: Entrada<typeof E.filtroAsignaturas>) {
      const where = {
        ...(f.areaId ? { areaId: f.areaId } : {}),
        ...(f.gradoId ? { grados: { some: { gradoId: f.gradoId } } } : {}),
      };
      const [data, total] = await Promise.all([
        db.asignatura.findMany({ where, include: incluirAsignatura, orderBy: { nombre: "asc" }, ...saltar(f) }),
        db.asignatura.count({ where }),
      ]);
      return { data, total };
    },
    async obtener(id: string) {
      const a = await db.asignatura.findUnique({ where: { id }, include: incluirAsignatura });
      if (!a) throw noEncontrado("La asignatura");
      return a;
    },
    async crear(d: Entrada<typeof E.crearAsignatura>) {
      return db.$transaction(async (tx) => {
        await validarReferencias(tx, d.areaId, d.grados.map((g) => g.gradoId));
        return tx.asignatura.create({
          data: {
            nombre: d.nombre,
            areaId: d.areaId,
            intensidadHoraria: d.intensidadHoraria ?? null,
            grados: { create: d.grados.map((g) => ({ gradoId: g.gradoId, intensidad: g.intensidad ?? null })) },
          },
          include: incluirAsignatura,
        });
      });
    },
    async actualizar(id: string, d: Entrada<typeof E.actualizarAsignatura>) {
      return db.$transaction(async (tx) => {
        if (!(await tx.asignatura.findUnique({ where: { id } }))) throw noEncontrado("La asignatura");
        await validarReferencias(tx, d.areaId, d.grados?.map((g) => g.gradoId));
        return tx.asignatura.update({
          where: { id },
          data: {
            nombre: d.nombre,
            areaId: d.areaId,
            intensidadHoraria: d.intensidadHoraria,
            // Si llegan grados, reemplazan el conjunto completo (RN-09).
            ...(d.grados && {
              grados: {
                deleteMany: {},
                create: d.grados.map((g) => ({ gradoId: g.gradoId, intensidad: g.intensidad ?? null })),
              },
            }),
          },
          include: incluirAsignatura,
        });
      });
    },
  };

  const asignacionesDocente = {
    async listar(f: Entrada<typeof E.filtroAsignacionesDocente>) {
      const where = { ...(f.docenteId ? { docenteId: f.docenteId } : {}), ...(f.grupoId ? { grupoId: f.grupoId } : {}), ...(f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {}) };
      const [data, total] = await Promise.all([
        db.asignacionDocente.findMany({ where, include: { docente: { select: { id: true, nombres: true, apellidos: true } }, asignatura: true, grupo: { include: { grado: true } }, anioLectivo: true }, orderBy: { creadoEn: "desc" }, ...saltar(f) }),
        db.asignacionDocente.count({ where }),
      ]);
      return { data, total };
    },
    async crear(d: Entrada<typeof E.crearAsignacionDocente>, creadoPorId?: string) {
      return db.$transaction(async (tx) => {
        const docente = await tx.usuario.findUnique({ where: { id: d.docenteId }, include: { roles: { include: { rol: true } } } });
        if (!docente || docente.estado !== "ACTIVO" || !docente.roles.some((r) => r.rol.codigo === "DOCENTE")) throw new ErrorDominio("DOCENTE_INVALIDO", "El usuario debe estar activo y tener rol docente.");
        const [asignatura, grupo, anio] = await Promise.all([tx.asignatura.findUnique({ where: { id: d.asignaturaId } }), tx.grupo.findUnique({ where: { id: d.grupoId } }), tx.anioLectivo.findUnique({ where: { id: d.anioLectivoId } })]);
        if (!asignatura) throw noEncontrado("La asignatura");
        if (!grupo) throw noEncontrado("El grupo");
        if (!anio) throw noEncontrado("El año lectivo");
        if (grupo.anioLectivoId !== d.anioLectivoId) throw conflicto("GRUPO_ANIO_INVALIDO", "El grupo no pertenece al año lectivo.");
        if (anio.estado === "CERRADO") throw conflicto("ANIO_CERRADO", "El año lectivo está cerrado y es de solo lectura.");
        return tx.asignacionDocente.create({ data: { ...d, creadoPorId }, include: { docente: { select: { id: true, nombres: true, apellidos: true } }, asignatura: true, grupo: true, anioLectivo: true } });
      });
    },
    async desactivar(id: string) { return db.asignacionDocente.update({ where: { id }, data: { estado: "INACTIVA" } }); },
  };

  const acudientesEstudiantes = {
    async listar(f: Entrada<typeof E.filtroAsignacionesDocente>) { return db.acudienteEstudiante.findMany({ skip: (f.page - 1) * f.pageSize, take: f.pageSize, orderBy: { creadoEn: "desc" } }); },
    async crear(d: Entrada<typeof E.crearAcudienteEstudiante>) {
      if (d.acudienteId === d.estudianteId) throw conflicto("VINCULO_INVALIDO", "Un usuario no puede vincularse consigo mismo.");
      const [acudiente, estudiante] = await Promise.all([db.usuario.findUnique({ where: { id: d.acudienteId }, include: { roles: { include: { rol: true } } } }), db.usuario.findUnique({ where: { id: d.estudianteId }, include: { roles: { include: { rol: true } } } })]);
      if (!acudiente?.roles.some((r) => r.rol.codigo === "ACUDIENTE") || !estudiante?.roles.some((r) => r.rol.codigo === "ESTUDIANTE")) throw conflicto("ROLES_VINCULO_INVALIDOS", "El vínculo requiere roles acudiente y estudiante.");
      return db.acudienteEstudiante.create({ data: d });
    },
    async actualizar(id: string, d: Entrada<typeof E.actualizarAcudienteEstudiante>) { return db.acudienteEstudiante.update({ where: { id }, data: d }); },
  };

  return { aniosLectivos, periodos, grados, grupos, asignaturas, asignacionesDocente, acudientesEstudiantes };
}

export type ServicioAcademico = ReturnType<typeof crearServicioAcademico>;

/** Traduce violaciones de restricciones únicas a 409 legibles (carreras entre validación e inserción). */
export function traducirErrorPrisma(e: unknown): ErrorDominio | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return conflicto("DUPLICADO", "Ya existe un registro con esos mismos datos.");
    if (e.code === "P2003") return conflicto("REFERENCIA_INVALIDA", "El registro está relacionado con otro que no existe o que lo usa.");
    if (e.code === "P2025") return noEncontrado("El registro");
  }
  return null;
}
