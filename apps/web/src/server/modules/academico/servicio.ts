/**
 * Capa de datos del módulo académico: AnioLectivo, Periodo, Grado, Grupo y
 * Asignatura (+ AsignaturaGrado). Aplica las reglas que SQL no expresa
 * (RN-01, RN-02, RN-03, RN-06, RN-07, RN-09, RN-52).
 *
 * Recibe el cliente Prisma por parámetro para poder probarla contra una base
 * temporal; las rutas usan `servicioAcademico` (singleton de src/server/db).
 * La autorización ADMIN se verifica antes, en el handler.
 */
import type { z } from "zod";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import type * as E from "./esquemas";
import { dentroDe, ponderacionExcede, rangoValido, seSolapan, sumaPonderaciones, ponderacionCompleta } from "./reglas";

type Entrada<T extends z.ZodType> = z.output<T>;
type Pagina = { page: number; pageSize: number };
type Busqueda = Pagina & { q?: string };
type Tx = Prisma.TransactionClient;

const saltar = ({ page, pageSize }: Pagina) => ({ skip: (page - 1) * pageSize, take: pageSize });

/**
 * Divide la búsqueda en palabras (máx. 5); cada palabra debe coincidir con
 * alguno de los campos. En SQLite `contains` usa LIKE: ignora mayúsculas solo en ASCII.
 */
export function palabrasBusqueda(q?: string, separadores: RegExp = /\s+/) {
  return (q ?? "").split(separadores).map((p) => p.trim()).filter(Boolean).slice(0, 5);
}

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
    async listar(f: Entrada<typeof E.filtroAnios>) {
      const where: Prisma.AnioLectivoWhereInput = f.q !== undefined ? { anio: f.q } : {};
      const [data, total] = await Promise.all([
        db.anioLectivo.findMany({ where, orderBy: { anio: "desc" }, ...saltar(f) }),
        db.anioLectivo.count({ where }),
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
        if (d.estado === "CERRADO") {
          throw conflicto("CIERRE_REQUIERE_PERIODOS", "Crea el año activo y ciérralo solo cuando tenga períodos que sumen 100 %.");
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
        if (d.estado === "CERRADO") {
          const ponderaciones = actual.periodos.map((p) => p.ponderacion.toNumber());
          if (actual.periodos.length === 0) {
            throw conflicto("CIERRE_REQUIERE_PERIODOS", "No puedes cerrar un año sin períodos configurados.");
          }
          if (!ponderacionCompleta(ponderaciones)) {
            throw conflicto("PONDERACION_INCOMPLETA", "Las ponderaciones de los períodos deben sumar exactamente 100 % para cerrar el año.");
          }
        }
        return tx.anioLectivo.update({ where: { id }, data: { ...rango, estado: d.estado } });
      });
    },
    async eliminar(id: string) {
      return db.$transaction(async (tx) => {
        await anioEditable(tx, id);
        const [periodos, grupos, asignaciones, asociaciones] = await Promise.all([
          tx.periodo.count({ where: { anioLectivoId: id } }),
          tx.grupo.count({ where: { anioLectivoId: id } }),
          tx.asignacionDocente.count({ where: { anioLectivoId: id } }),
          tx.asociacionEstudianteGrupo.count({ where: { anioLectivoId: id } }),
        ]);
        if (periodos || grupos || asignaciones || asociaciones) {
          throw conflicto("REGISTRO_UTILIZADO", "No puedes eliminar un año que tiene períodos, grupos, asignaciones o historial.");
        }
        await tx.anioLectivo.delete({ where: { id } });
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
      const where: Prisma.PeriodoWhereInput = {
        ...(f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {}),
        ...(f.q ? { AND: palabrasBusqueda(f.q).map((p) => ({ nombre: { contains: p } })) } : {}),
      };
      const [data, total] = await Promise.all([
        db.periodo.findMany({
          where,
          include: { anioLectivo: { select: { id: true, anio: true, estado: true } } },
          orderBy: [{ anioLectivo: { anio: "desc" } }, { orden: "asc" }],
          ...saltar(f),
        }),
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
    async eliminar(id: string) {
      return db.$transaction(async (tx) => {
        const periodo = await tx.periodo.findUnique({ where: { id } });
        if (!periodo) throw noEncontrado("El período");
        await anioEditable(tx, periodo.anioLectivoId);
        await tx.periodo.delete({ where: { id } });
      });
    },
  };

  // ---------------- Grado ----------------
  const grados = {
    async listar(f: Busqueda) {
      const where: Prisma.GradoWhereInput = f.q ? { AND: palabrasBusqueda(f.q).map((p) => ({ nombre: { contains: p } })) } : {};
      const [data, total] = await Promise.all([
        db.grado.findMany({ where, orderBy: { orden: "asc" }, ...saltar(f) }),
        db.grado.count({ where }),
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
    async eliminar(id: string) {
      const [grupos, asignaturas] = await Promise.all([
        db.grupo.count({ where: { gradoId: id } }),
        db.asignaturaGrado.count({ where: { gradoId: id } }),
      ]);
      if (grupos || asignaturas) throw conflicto("REGISTRO_UTILIZADO", "No puedes eliminar un grado que tiene grupos o asignaturas relacionadas.");
      await db.grado.delete({ where: { id } });
    },
  };

  // ---------------- Área ----------------
  const areas = {
    async listar(f: Busqueda) {
      const where: Prisma.AreaWhereInput = f.q ? { AND: palabrasBusqueda(f.q).map((p) => ({ nombre: { contains: p } })) } : {};
      const [data, total] = await Promise.all([
        db.area.findMany({ where, orderBy: [{ orden: "asc" }, { nombre: "asc" }], ...saltar(f) }),
        db.area.count({ where }),
      ]);
      return { data, total };
    },
    async obtener(id: string) {
      const area = await db.area.findUnique({ where: { id } });
      if (!area) throw noEncontrado("El área");
      return area;
    },
    crear: (d: Entrada<typeof E.crearArea>) => db.area.create({ data: { ...d, orden: d.orden ?? null } }),
    async actualizar(id: string, d: Entrada<typeof E.actualizarArea>) {
      await areas.obtener(id);
      return db.area.update({ where: { id }, data: d });
    },
    async eliminar(id: string) {
      if (await db.asignatura.count({ where: { areaId: id } })) {
        throw conflicto("REGISTRO_UTILIZADO", "No puedes eliminar un área que tiene asignaturas relacionadas.");
      }
      await db.area.delete({ where: { id } });
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
      // "1° 01" o "1°-01": cada palabra coincide con el grado o el identificador.
      const where: Prisma.GrupoWhereInput = {
        ...(f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {}),
        ...(f.gradoId ? { gradoId: f.gradoId } : {}),
        ...(f.q
          ? {
              AND: palabrasBusqueda(f.q, /[\s-]+/).map((p) => ({
                OR: [{ identificador: { contains: p } }, { grado: { nombre: { contains: p } } }],
              })),
            }
          : {}),
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
    async eliminar(id: string) {
      return db.$transaction(async (tx) => {
        const grupo = await tx.grupo.findUnique({ where: { id } });
        if (!grupo) throw noEncontrado("El grupo");
        await anioEditable(tx, grupo.anioLectivoId);
        const [asignaciones, asociaciones] = await Promise.all([
          tx.asignacionDocente.count({ where: { grupoId: id } }),
          tx.asociacionEstudianteGrupo.count({ where: { grupoId: id } }),
        ]);
        if (asignaciones || asociaciones) throw conflicto("REGISTRO_UTILIZADO", "No puedes eliminar un grupo que tiene asignaciones o historial de estudiantes.");
        await tx.grupo.delete({ where: { id } });
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
      const where: Prisma.AsignaturaWhereInput = {
        ...(f.areaId ? { areaId: f.areaId } : {}),
        ...(f.gradoId ? { grados: { some: { gradoId: f.gradoId } } } : {}),
        ...(f.q
          ? { AND: palabrasBusqueda(f.q).map((p) => ({ OR: [{ nombre: { contains: p } }, { area: { nombre: { contains: p } } }] })) }
          : {}),
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
    async eliminar(id: string) {
      const [asignaciones, gradosHabilitados] = await Promise.all([
        db.asignacionDocente.count({ where: { asignaturaId: id } }),
        db.asignaturaGrado.count({ where: { asignaturaId: id } }),
      ]);
      if (asignaciones || gradosHabilitados) {
        throw conflicto("REGISTRO_UTILIZADO", "No puedes eliminar una asignatura que tiene grados habilitados o asignaciones relacionadas.");
      }
      await db.asignatura.delete({ where: { id } });
    },
  };

  const asignacionesDocente = {
    async listar(f: Entrada<typeof E.filtroAsignacionesDocente>) {
      const palabras = palabrasBusqueda(f.q);
      const where: Prisma.AsignacionDocenteWhereInput = {
        ...(f.docenteId ? { docenteId: f.docenteId } : {}), ...(f.grupoId ? { grupoId: f.grupoId } : {}),
        ...(f.anioLectivoId ? { anioLectivoId: f.anioLectivoId } : {}), ...(f.estado ? { estado: f.estado } : {}),
        ...(palabras.length ? { AND: palabras.map((p) => ({ OR: [
          { docente: { nombres: { contains: p } } }, { docente: { apellidos: { contains: p } } },
          { asignatura: { nombre: { contains: p } } }, { grupo: { identificador: { contains: p } } },
          { grupo: { grado: { nombre: { contains: p } } } },
        ] })) } : {}),
      };
      const include = { docente: { select: { id: true, nombres: true, apellidos: true } }, asignatura: true, grupo: { include: { grado: true } }, anioLectivo: true, bloques: { orderBy: [{ dia: "asc" as const }, { horaInicio: "asc" as const }] } };
      const [data, total] = await Promise.all([
        db.asignacionDocente.findMany({ where, include, orderBy: { creadoEn: "desc" }, ...saltar(f) }),
        db.asignacionDocente.count({ where }),
      ]);
      return { data, total };
    },
    async crear(d: Entrada<typeof E.crearAsignacionDocente>, creadoPorId?: string) {
      return db.$transaction((tx) => crearAsignacion(tx, d, creadoPorId));
    },
    async desactivar(id: string) {
      return db.$transaction(async (tx) => {
        const actual = await tx.asignacionDocente.findUnique({ where: { id } });
        if (!actual) throw noEncontrado("La asignación");
        await anioEditable(tx, actual.anioLectivoId);
        if (actual.estado === "INACTIVA") return actual;
        return tx.asignacionDocente.update({ where: { id }, data: { estado: "INACTIVA" } });
      });
    },
    async reactivar(id: string) {
      return db.$transaction(async (tx) => {
        const actual = await tx.asignacionDocente.findUnique({ where: { id }, include: { bloques: true } });
        if (!actual) throw noEncontrado("La asignación");
        await validarAsignacion(tx, actual, actual.bloques, id);
        return tx.asignacionDocente.update({ where: { id }, data: { estado: "ACTIVA" }, include: { bloques: true } });
      });
    },
    async reasignar(id: string, d: { docenteId: string; bloques: Entrada<typeof E.bloqueHorario>[]; confirmar: boolean }, creadoPorId?: string) {
      if (!d.confirmar) throw conflicto("CONFIRMACION_REQUERIDA", "Confirma la reasignación de la carga docente.");
      return db.$transaction(async (tx) => {
        const anterior = await tx.asignacionDocente.findUnique({ where: { id } });
        if (!anterior) throw noEncontrado("La asignación");
        await anioEditable(tx, anterior.anioLectivoId);
        const nueva = await crearAsignacion(tx, { ...anterior, docenteId: d.docenteId, bloques: d.bloques }, creadoPorId, id);
        await tx.asignacionDocente.update({ where: { id }, data: { estado: "INACTIVA" } });
        return nueva;
      });
    },
  };

  async function validarAsignacion(tx: Tx, d: { docenteId: string; asignaturaId: string; grupoId: string; anioLectivoId: string }, bloques: { dia: string; horaInicio: string; horaFin: string }[], ignorarId?: string) {
    const [docente, asignatura, grupo, anio] = await Promise.all([
      tx.usuario.findUnique({ where: { id: d.docenteId }, include: { roles: { include: { rol: true } } } }),
      tx.asignatura.findUnique({ where: { id: d.asignaturaId }, include: { grados: true } }),
      tx.grupo.findUnique({ where: { id: d.grupoId } }), tx.anioLectivo.findUnique({ where: { id: d.anioLectivoId } }),
    ]);
    if (!docente || docente.estado !== "ACTIVO" || !docente.roles.some((r) => r.rol.codigo === "DOCENTE")) throw new ErrorDominio("DOCENTE_INVALIDO", "El usuario debe estar activo y tener rol docente.");
    if (!asignatura) throw noEncontrado("La asignatura"); if (!grupo) throw noEncontrado("El grupo"); if (!anio) throw noEncontrado("El año lectivo");
    if (grupo.anioLectivoId !== d.anioLectivoId) throw conflicto("GRUPO_ANIO_INVALIDO", "El grupo no pertenece al año lectivo.");
    if (anio.estado === "CERRADO") throw conflicto("ANIO_CERRADO", "El año lectivo está cerrado y es de solo lectura.");
    if (!asignatura.grados.some((g) => g.gradoId === grupo.gradoId)) throw conflicto("ASIGNATURA_GRADO_INVALIDA", "La asignatura no está habilitada para el grado del grupo.");
    for (const b of bloques) {
      const comunes = { estado: "ACTIVA" as const, anioLectivoId: d.anioLectivoId, ...(ignorarId ? { id: { not: ignorarId } } : {}), bloques: { some: { dia: b.dia as never, horaInicio: { lt: b.horaFin }, horaFin: { gt: b.horaInicio } } } };
      if (await tx.asignacionDocente.count({ where: { ...comunes, docenteId: d.docenteId } })) throw conflicto("CRUCE_DOCENTE", `El docente ya tiene una asignación que cruza el bloque ${b.dia} ${b.horaInicio}–${b.horaFin}.`);
      if (await tx.asignacionDocente.count({ where: { ...comunes, grupoId: d.grupoId } })) throw conflicto("CRUCE_GRUPO", `El grupo ya tiene una asignación que cruza el bloque ${b.dia} ${b.horaInicio}–${b.horaFin}.`);
    }
  }

  async function crearAsignacion(tx: Tx, d: Entrada<typeof E.crearAsignacionDocente>, creadoPorId?: string, ignorarId?: string) {
    await validarAsignacion(tx, d, d.bloques, ignorarId);
    const { bloques, ...datos } = d;
    return tx.asignacionDocente.create({ data: { docenteId: datos.docenteId, asignaturaId: datos.asignaturaId, grupoId: datos.grupoId, anioLectivoId: datos.anioLectivoId, creadoPorId, bloques: { create: bloques } }, include: { docente: { select: { id: true, nombres: true, apellidos: true } }, asignatura: true, grupo: { include: { grado: true } }, anioLectivo: true, bloques: true } });
  }

  /** Catálogos completos (id + etiqueta legible) para selects de filtros y formularios. */
  async function opciones() {
    const [anios, grados, areas, docentes] = await Promise.all([
      db.anioLectivo.findMany({ select: { id: true, anio: true, estado: true }, orderBy: { anio: "desc" } }),
      db.grado.findMany({ select: { id: true, nombre: true }, orderBy: { orden: "asc" } }),
      db.area.findMany({ select: { id: true, nombre: true }, orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
      // Mismo criterio que validarDirector: solo docentes activos pueden dirigir grupo.
      db.usuario.findMany({
        where: { estado: "ACTIVO", roles: { some: { rol: { codigo: "DOCENTE" } } } },
        select: { id: true, nombres: true, apellidos: true },
        orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      }),
    ]);
    return { anios, grados, areas, docentes };
  }

  return { aniosLectivos, periodos, grados, areas, grupos, asignaturas, asignacionesDocente, opciones };
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
