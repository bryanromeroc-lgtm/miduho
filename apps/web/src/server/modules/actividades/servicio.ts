import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";
import { conflicto, ErrorDominio } from "@/server/errores";
import { esquemaVideoPreguntas } from "@/features/actividades/tipos/video";
import { calificarIntento } from "@/features/actividades/tipos/contrato";
import { videoPreguntas } from "@/features/actividades/tipos/video";
import { crearMaterial as esquemaCrearMaterial, editarMaterial as esquemaEditarMaterial, editarAsignacion as esquemaEditarAsignacion, enviarIntento as esquemaEnviarIntento } from "./esquemas";
import { comprobarVideo, extraerVideo, type ClienteHttpVideo } from "./youtube";

type DatosCrearMaterial = z.input<typeof esquemaCrearMaterial>;
type DatosEditarMaterial = z.input<typeof esquemaEditarMaterial>;
type DatosEditarAsignacion = z.input<typeof esquemaEditarAsignacion>;
const hash = (valor: unknown) => createHash("sha256").update(JSON.stringify(valor)).digest("hex");

export function crearServicioActividades(
  db: PrismaClient,
  dependencias: { http?: ClienteHttpVideo; reloj?: () => Date } = {},
) {
  const ahora = dependencias.reloj ?? (() => new Date());

  async function opcionesDeCreacion(docenteId: string) {
    const momento = ahora();
    const anio = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" } });
    if (!anio) return { periodo: null, opciones: [] };
    const [periodos, asignaciones] = await Promise.all([
      db.periodo.findMany({ where: { anioLectivoId: anio.id }, orderBy: { orden: "asc" } }),
      db.asignacionDocente.findMany({
        where: { docenteId, anioLectivoId: anio.id, estado: "ACTIVA" },
        include: { asignatura: true, grupo: { include: { grado: true } } },
        orderBy: [{ asignatura: { nombre: "asc" } }, { grupo: { identificador: "asc" } }],
      }),
    ]);
    const diaColombia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(momento);
    const periodo = periodos.find((p) => p.fechaInicio.toISOString().slice(0, 10) <= diaColombia && p.fechaFin.toISOString().slice(0, 10) >= diaColombia);
    const opciones = new Map<string, {
      asignaturaId: string; asignatura: string; gradoId: string; grado: string;
      grupos: { grupoId: string; identificador: string; asignacionDocenteId: string }[];
    }>();
    for (const asignacion of asignaciones) {
      const clave = `${asignacion.asignaturaId}:${asignacion.grupo.gradoId}`;
      let opcion = opciones.get(clave);
      if (!opcion) {
        opcion = { asignaturaId: asignacion.asignaturaId, asignatura: asignacion.asignatura.nombre,
          gradoId: asignacion.grupo.gradoId, grado: asignacion.grupo.grado.nombre, grupos: [] };
        opciones.set(clave, opcion);
      }
      opcion.grupos.push({ grupoId: asignacion.grupoId, identificador: asignacion.grupo.identificador, asignacionDocenteId: asignacion.id });
    }
    return {
      periodo: periodo ? { id: periodo.id, fin: new Date(`${periodo.fechaFin.toISOString().slice(0, 10)}T23:59:00-05:00`) } : null,
      opciones: [...opciones.values()],
    };
  }

  async function crearMaterial(docenteId: string, entrada: DatosCrearMaterial) {
    const datos = esquemaCrearMaterial.parse(entrada);
    const extraido = extraerVideo(datos.url);
    const opciones = await opcionesDeCreacion(docenteId);
    const opcion = opciones.opciones.find((o) => o.asignaturaId === datos.asignaturaId && o.gradoId === datos.gradoId);
    if (!opcion) throw new ErrorDominio("ASIGNATURA_AJENA", "No tienes una asignación activa para esa asignatura y grado.", 403);
    if (!opciones.periodo) throw new ErrorDominio("PERIODO_NO_VIGENTE", "No hay un período vigente para asignar el material.");
    const grupos = [...new Set(datos.grupoIds)].sort();
    if (grupos.length !== datos.grupoIds.length || grupos.some((id) => !opcion.grupos.some((g) => g.grupoId === id))) {
      throw new ErrorDominio("GRUPO_AJENO", "Selecciona grupos donde dictas esta asignatura.", 403);
    }
    const abreEn = datos.abreEn ?? ahora();
    const cierraEn = datos.cierraEn ?? opciones.periodo.fin;
    if (cierraEn <= abreEn || cierraEn > opciones.periodo.fin) {
      throw new ErrorDominio("FECHAS_INVALIDAS", "El cierre debe ser posterior a la apertura y estar dentro del período.");
    }
    const periodo = await db.periodo.findUniqueOrThrow({ where: { id: opciones.periodo.id } });
    if (abreEn < periodo.fechaInicio || cierraEn < periodo.fechaInicio) {
      throw new ErrorDominio("FECHAS_INVALIDAS", "La apertura y el cierre deben estar dentro del período.");
    }
    const inicio = datos.inicio ?? extraido.inicio;
    if (datos.fin !== undefined && datos.fin <= (inicio ?? 0)) {
      throw new ErrorDominio("VIDEO_INTERVALO_INVALIDO", "El fin del video debe ser posterior al inicio.");
    }
    const huellaCreacion = hash({ docenteId, titulo: datos.titulo, instruccion: datos.instruccion ?? "",
      videoId: extraido.id, inicio: inicio ?? null, fin: datos.fin ?? null,
      preguntas: datos.contenido.preguntas, asignaturaId: datos.asignaturaId,
      gradoId: datos.gradoId, grupos, abreEn: datos.abreEn?.toISOString() ?? null,
      cierraEn: datos.cierraEn?.toISOString() ?? null, maxIntentos: datos.maxIntentos });
    if (await db.actividad.findUnique({ where: { huellaCreacion }, select: { id: true } })) {
      throw conflicto("MATERIAL_IDENTICO", "Ya creaste este mismo material para estos grupos.");
    }
    const videoComprobado = await comprobarVideo(extraido.id, dependencias.http);
    const contenido = esquemaVideoPreguntas.parse({
      video: { proveedor: "youtube", id: extraido.id, inicio, fin: datos.fin,
        tituloOriginal: videoComprobado.tituloOriginal },
      preguntas: datos.contenido.preguntas,
    });
    const contenidoHash = hash(contenido);
    try {
      return await db.$transaction(async (tx) => {
        // La asignación puede revocarse entre la consulta inicial y esta transacción.
        const activas = await tx.asignacionDocente.findMany({
          where: { id: { in: opcion.grupos.filter((g) => grupos.includes(g.grupoId)).map((g) => g.asignacionDocenteId) },
            docenteId, estado: "ACTIVA", anioLectivo: { estado: "ACTIVO" } },
        });
        if (activas.length !== grupos.length) throw new ErrorDominio("GRUPO_AJENO", "La asignación docente ya no está activa.", 403);
        const actividad = await tx.actividad.create({ data: {
          titulo: datos.titulo, instruccion: datos.instruccion ?? null,
          tipo: "video-preguntas", asignaturaId: datos.asignaturaId, gradoId: datos.gradoId,
          origen: "DOCENTE", autorId: docenteId, estado: "PUBLICADA", huellaCreacion,
        } });
        const version = await tx.versionActividad.create({ data: {
          actividadId: actividad.id, numero: 1, tipo: "video-preguntas", versionEsquema: 1,
          contenido: contenido as Prisma.InputJsonValue, puntajeMaximo: contenido.preguntas.length,
          hash: contenidoHash,
        } });
        const asignaciones = await Promise.all(activas.map((asignacion) => tx.asignacionActividad.create({ data: {
          versionActividadId: version.id, asignacionDocenteId: asignacion.id,
          grupoId: asignacion.grupoId, periodoId: opciones.periodo!.id,
          abreEn, cierraEn, maxIntentos: datos.maxIntentos, cuentaComoNota: true,
          estado: "PUBLICADA", creadoPorId: docenteId,
        } })));
        return { actividad, version, asignaciones };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw conflicto("MATERIAL_IDENTICO", "Ya creaste este mismo material para estos grupos.");
      }
      throw error;
    }
  }

  async function editarMaterial(docenteId: string, actividadId: string, entrada: DatosEditarMaterial) {
    const datos = esquemaEditarMaterial.parse(entrada);
    const actividad = await db.actividad.findFirst({ where: { id: actividadId, autorId: docenteId, origen: "DOCENTE" },
      include: { versiones: { include: { asignaciones: { select: { id: true } } } } } });
    if (!actividad) throw new ErrorDominio("NO_ENCONTRADO", "El material no existe.", 404);
    const version = actividad.versiones[0];
    if (!version) throw new ErrorDominio("NO_ENCONTRADO", "La versión del material no existe.", 404);
    const cambiaContenido = datos.url !== undefined || datos.contenido !== undefined || datos.inicio !== undefined || datos.fin !== undefined;
    if (cambiaContenido) {
      const enviados = await db.intentoActividad.count({ where: { asignacion: { versionActividadId: version.id }, estado: "ENVIADO" } });
      if (enviados) throw conflicto("CONTENIDO_CON_RESPUESTAS", "Ya hay respuestas; anula esta actividad y crea otra.");
    }
    const anterior = esquemaVideoPreguntas.parse(version.contenido);
    const extraido = datos.url ? extraerVideo(datos.url) : { id: anterior.video.id, inicio: anterior.video.inicio };
    const comprobado = datos.url ? await comprobarVideo(extraido.id, dependencias.http) :
      { tituloOriginal: anterior.video.tituloOriginal };
    const inicio = datos.inicio ?? extraido.inicio;
    const fin = datos.fin === null ? undefined : datos.fin ?? anterior.video.fin;
    const contenido = cambiaContenido ? esquemaVideoPreguntas.parse({
      video: { proveedor: "youtube", id: extraido.id, inicio, fin, tituloOriginal: comprobado.tituloOriginal },
      preguntas: datos.contenido?.preguntas ?? anterior.preguntas,
    }) : null;
    return db.$transaction(async (tx) => {
      if (cambiaContenido) {
        // El trigger de la base protege ante un envío que gane la carrera.
        await tx.intentoActividad.updateMany({ where: { asignacion: { versionActividadId: version.id }, estado: "EN_CURSO" },
          data: { estado: "ABANDONADO" } });
        await tx.versionActividad.update({ where: { id: version.id }, data: {
          contenido: contenido as Prisma.InputJsonValue, puntajeMaximo: contenido!.preguntas.length,
          hash: hash(contenido),
        } });
      }
      return tx.actividad.update({ where: { id: actividad.id }, data: {
        ...(datos.titulo !== undefined ? { titulo: datos.titulo } : {}),
        ...(datos.instruccion !== undefined ? { instruccion: datos.instruccion } : {}),
        huellaCreacion: null,
      } });
    });
  }

  async function editarAsignacion(docenteId: string, asignacionId: string, entrada: DatosEditarAsignacion) {
    const datos = esquemaEditarAsignacion.parse(entrada);
    const asignacion = await db.asignacionActividad.findFirst({
      where: { id: asignacionId, versionActividad: { actividad: { autorId: docenteId } } },
      include: { periodo: true, intentos: { where: { estado: "ENVIADO" }, select: { estudianteId: true } } },
    });
    if (!asignacion) throw new ErrorDominio("NO_ENCONTRADO", "La asignación no existe.", 404);
    const abreEn = datos.abreEn ?? asignacion.abreEn;
    const cierraEn = datos.cierraEn ?? asignacion.cierraEn;
    const finPeriodo = new Date(`${asignacion.periodo.fechaFin.toISOString().slice(0, 10)}T23:59:00-05:00`);
    if (abreEn < asignacion.periodo.fechaInicio || cierraEn <= abreEn || cierraEn > finPeriodo) {
      throw new ErrorDominio("FECHAS_INVALIDAS", "Las fechas deben estar dentro del período y el cierre debe ser posterior a la apertura.");
    }
    if (datos.cierraEn && asignacion.intentos.length && cierraEn < ahora()) {
      throw conflicto("CIERRE_CON_INTENTOS", "No puedes cerrar en el pasado una actividad con intentos.");
    }
    const usados = new Map<string, number>();
    for (const intento of asignacion.intentos) usados.set(intento.estudianteId, (usados.get(intento.estudianteId) ?? 0) + 1);
    if (datos.maxIntentos && [...usados.values()].some((n) => n > datos.maxIntentos!)) {
      throw conflicto("INTENTOS_USADOS", "El máximo no puede ser menor que los intentos usados.");
    }
    return db.$transaction((tx) => tx.asignacionActividad.update({ where: { id: asignacionId }, data: {
      abreEn, cierraEn, maxIntentos: datos.maxIntentos ?? asignacion.maxIntentos,
    } }));
  }

  async function anularAsignacion(docenteId: string, asignacionId: string, todas = false) {
    const asignacion = await db.asignacionActividad.findFirst({
      where: { id: asignacionId, versionActividad: { actividad: { autorId: docenteId } } },
    });
    if (!asignacion) throw new ErrorDominio("NO_ENCONTRADO", "La asignación no existe.", 404);
    return db.$transaction(async (tx) => {
      const where = todas ? { versionActividadId: asignacion.versionActividadId } : { id: asignacionId };
      const anuladas = await tx.asignacionActividad.updateMany({ where, data: { estado: "ANULADA" } });
      await tx.intentoActividad.updateMany({ where: { asignacion: where, estado: "EN_CURSO" }, data: { estado: "ABANDONADO" } });
      return anuladas.count;
    });
  }

  async function cerrarVencidos() {
    return db.intentoActividad.updateMany({ where: { estado: "EN_CURSO", asignacion: { cierraEn: { lte: ahora() } } },
      data: { estado: "ABANDONADO" } });
  }

  async function iniciarIntento(estudianteId: string, asignacionId: string) {
    await cerrarVencidos();
    const momento = ahora();
    try {
      return await db.$transaction(async (tx) => {
        const asignacion = await tx.asignacionActividad.findUnique({ where: { id: asignacionId },
          include: { versionActividad: true, grupo: true } });
        if (!asignacion || asignacion.estado !== "PUBLICADA") {
          throw new ErrorDominio("NO_ENCONTRADO", "La actividad asignada no existe.", 404);
        }
        const asociado = await tx.asociacionEstudianteGrupo.findFirst({ where: {
          estudianteId, grupoId: asignacion.grupoId, anioLectivoId: asignacion.grupo.anioLectivoId,
          inicioEn: { lte: momento }, finEn: null,
        } });
        if (!asociado) throw new ErrorDominio("NO_ENCONTRADO", "La actividad asignada no existe.", 404);
        if (asignacion.abreEn > momento || asignacion.cierraEn <= momento) {
          throw conflicto("ASIGNACION_CERRADA", "La actividad aún no está abierta o ya cerró.");
        }
        const actual = await tx.intentoActividad.findFirst({ where: { asignacionId, estudianteId, estado: "EN_CURSO" } });
        if (actual) return { intento: actual, contenido: esquemaVideoPreguntas.parse(asignacion.versionActividad.contenido),
          maxIntentos: asignacion.maxIntentos };
        const usados = await tx.intentoActividad.count({ where: { asignacionId, estudianteId, estado: "ENVIADO" } });
        if (usados >= asignacion.maxIntentos) throw conflicto("INTENTOS_AGOTADOS", "Ya usaste todos los intentos.");
        const ultimo = await tx.intentoActividad.findFirst({ where: { asignacionId, estudianteId }, orderBy: { numero: "desc" } });
        const intento = await tx.intentoActividad.create({ data: { asignacionId, estudianteId,
          numero: (ultimo?.numero ?? 0) + 1, estado: "EN_CURSO" } });
        return { intento, contenido: esquemaVideoPreguntas.parse(asignacion.versionActividad.contenido),
          maxIntentos: asignacion.maxIntentos };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const actual = await db.intentoActividad.findFirst({ where: { asignacionId, estudianteId, estado: "EN_CURSO" },
          include: { asignacion: { include: { versionActividad: true } } } });
        if (actual) return { intento: actual, contenido: esquemaVideoPreguntas.parse(actual.asignacion.versionActividad.contenido),
          maxIntentos: actual.asignacion.maxIntentos };
      }
      throw error;
    }
  }

  async function marcarVisto(estudianteId: string, intentoId: string) {
    await cerrarVencidos();
    return db.$transaction(async (tx) => {
      const intento = await tx.intentoActividad.findFirst({ where: { id: intentoId, estudianteId } });
      if (!intento) throw new ErrorDominio("NO_ENCONTRADO", "El intento no existe.", 404);
      if (intento.vioVideoEn) return intento;
      if (intento.estado !== "EN_CURSO") throw conflicto("INTENTO_CERRADO", "Este intento ya no está en curso.");
      return tx.intentoActividad.update({ where: { id: intentoId }, data: { vioVideoEn: ahora() } });
    });
  }

  async function enviarIntento(estudianteId: string, intentoId: string, entrada: z.input<typeof esquemaEnviarIntento>) {
    const datos = esquemaEnviarIntento.parse(entrada);
    await cerrarVencidos();
    return db.$transaction(async (tx) => {
      // Serializa reenvíos concurrentes del mismo intento.
      await tx.$queryRaw`SELECT id FROM intentos_actividad WHERE id = ${intentoId} FOR UPDATE`;
      const intento = await tx.intentoActividad.findFirst({ where: { id: intentoId, estudianteId },
        include: { asignacion: { include: { versionActividad: true } }, respuestas: true } });
      if (!intento) throw new ErrorDominio("NO_ENCONTRADO", "El intento no existe.", 404);
      const contenido = esquemaVideoPreguntas.parse(intento.asignacion.versionActividad.contenido);
      if (intento.estado === "ENVIADO") {
        const respuestas = Object.fromEntries(intento.respuestas.map((r) => [r.itemId, r.respuesta]));
        return { intento, resultado: calificarIntento(videoPreguntas, contenido, respuestas) };
      }
      if (intento.estado !== "EN_CURSO") throw conflicto("INTENTO_CERRADO", "Este intento ya no está en curso.");
      if (!intento.vioVideoEn) throw conflicto("VIDEO_NO_VISTO", "Marca «Ya lo vi» antes de enviar tus respuestas.");
      const resultado = calificarIntento(videoPreguntas, contenido, datos.respuestas);
      for (const item of resultado.items) {
        await tx.respuestaItem.create({ data: { intentoId, itemId: item.itemId,
          respuesta: (datos.respuestas[item.itemId] ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          correcta: item.correcta, puntaje: item.puntaje } });
      }
      const enviado = await tx.intentoActividad.update({ where: { id: intentoId }, data: {
        estado: "ENVIADO", enviadoEn: ahora(), puntaje: resultado.puntaje, porcentaje: resultado.porcentaje,
      } });
      const anterior = await tx.resultadoActividad.findUnique({ where: {
        asignacionId_estudianteId: { asignacionId: intento.asignacionId, estudianteId },
      } });
      if (!anterior) {
        await tx.resultadoActividad.create({ data: { asignacionId: intento.asignacionId, estudianteId,
          mejorIntentoId: intentoId, porcentaje: resultado.porcentaje } });
      } else if (resultado.porcentaje > anterior.porcentaje.toNumber()) {
        await tx.resultadoActividad.update({ where: { id: anterior.id }, data: {
          mejorIntentoId: intentoId, porcentaje: resultado.porcentaje,
        } });
      }
      return { intento: enviado, resultado };
    });
  }

  async function seguimiento(docenteId: string, actividadId: string) {
    await cerrarVencidos();
    const actividad = await db.actividad.findUnique({ where: { id: actividadId },
      include: { versiones: { include: { asignaciones: { include: { grupo: true } } } } } });
    if (!actividad) throw new ErrorDominio("NO_ENCONTRADO", "El material no existe.", 404);
    const asignaciones = actividad.versiones.flatMap((v) => v.asignaciones);
    const visibles = [];
    for (const asignacion of asignaciones) {
      if (actividad.autorId !== docenteId) {
        const permiso = await db.asignacionDocente.findFirst({ where: { docenteId, estado: "ACTIVA",
          grupoId: asignacion.grupoId, asignaturaId: actividad.asignaturaId,
          anioLectivoId: asignacion.grupo.anioLectivoId } });
        if (!permiso) continue;
      }
      const asociaciones = await db.asociacionEstudianteGrupo.findMany({
        where: { grupoId: asignacion.grupoId, anioLectivoId: asignacion.grupo.anioLectivoId,
          inicioEn: { lte: ahora() }, finEn: null },
        include: { estudiante: true }, orderBy: [{ estudiante: { apellidos: "asc" } }, { estudiante: { nombres: "asc" } }],
      });
      const ids = asociaciones.map((a) => a.estudianteId);
      const [intentos, resultados] = await Promise.all([
        db.intentoActividad.findMany({ where: { asignacionId: asignacion.id, estudianteId: { in: ids } },
          orderBy: { iniciadoEn: "desc" } }),
        db.resultadoActividad.findMany({ where: { asignacionId: asignacion.id, estudianteId: { in: ids } } }),
      ]);
      const estudiantes = asociaciones.map((asociacion) => {
        const suyos = intentos.filter((i) => i.estudianteId === asociacion.estudianteId);
        const enviados = suyos.filter((i) => i.estado === "ENVIADO");
        const enCurso = suyos.find((i) => i.estado === "EN_CURSO");
        const resultado = resultados.find((r) => r.estudianteId === asociacion.estudianteId);
        const estado = enviados.length ? "RESPONDIO" : enCurso?.vioVideoEn ? "VIO_VIDEO" : enCurso ? "EN_CURSO" :
          asignacion.cierraEn <= ahora() ? "SIN_ENTREGAR" : "SIN_EMPEZAR";
        return { estudianteId: asociacion.estudianteId,
          nombres: asociacion.estudiante.nombres, apellidos: asociacion.estudiante.apellidos,
          estado, intentosUsados: enviados.length, nota: resultado?.porcentaje.toNumber() ?? null,
          ultimoEnvio: enviados[0]?.enviadoEn ?? null };
      });
      const respondieron = estudiantes.filter((e) => e.intentosUsados > 0).length;
      const notas = estudiantes.map((e) => e.nota).filter((nota): nota is number => nota !== null);
      visibles.push({ asignacionId: asignacion.id, grupoId: asignacion.grupoId,
        grupo: asignacion.grupo.identificador, estado: asignacion.estado,
        estudiantes, resumen: { respondieron, total: estudiantes.length,
          promedio: notas.length ? Math.round(notas.reduce((suma, nota) => suma + nota, 0) / notas.length * 100) / 100 : null } });
    }
    if (!visibles.length) throw new ErrorDominio("NO_ENCONTRADO", "El material no existe.", 404);
    return { actividadId: actividad.id, titulo: actividad.titulo, grupos: visibles };
  }

  async function clasesDocente(docenteId: string) {
    const anio = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" } });
    if (!anio) return [];
    return db.asignacionDocente.findMany({ where: { docenteId, anioLectivoId: anio.id, estado: "ACTIVA" },
      include: { asignatura: { include: { area: true } }, grupo: { include: { grado: true } } },
      orderBy: [{ asignatura: { nombre: "asc" } }, { grupo: { identificador: "asc" } }],
    });
  }

  async function detalleClase(docenteId: string, asignacionDocenteId: string) {
    await cerrarVencidos();
    const clase = await db.asignacionDocente.findFirst({ where: { id: asignacionDocenteId, docenteId,
      estado: "ACTIVA", anioLectivo: { estado: "ACTIVO" } },
      include: { asignatura: { include: { area: true } }, grupo: { include: { grado: true } },
        asignacionesActividad: { include: { versionActividad: { include: { actividad: true } } },
          orderBy: { creadoEn: "desc" } } },
    });
    if (!clase) throw new ErrorDominio("NO_ENCONTRADO", "La clase no existe.", 404);
    const total = await db.asociacionEstudianteGrupo.count({ where: { grupoId: clase.grupoId,
      anioLectivoId: clase.anioLectivoId, finEn: null, inicioEn: { lte: ahora() } } });
    const actividades = await Promise.all(clase.asignacionesActividad.map(async (asignacion) => {
      const respondieron = await db.intentoActividad.findMany({ where: { asignacionId: asignacion.id, estado: "ENVIADO" },
        select: { estudianteId: true }, distinct: ["estudianteId"] });
      return { id: asignacion.versionActividad.actividadId, asignacionId: asignacion.id,
        titulo: asignacion.versionActividad.actividad.titulo, estado: asignacion.estado,
        cierraEn: asignacion.cierraEn, respondieron: respondieron.length, total };
    }));
    return { id: clase.id, asignatura: clase.asignatura.nombre, area: clase.asignatura.area.nombre,
      grupo: `${clase.grupo.grado.nombre}-${clase.grupo.identificador}`, gradoId: clase.grupo.gradoId,
      actividades };
  }

  async function materialDocente(docenteId: string, actividadId: string, asignacionDocenteId: string) {
    await cerrarVencidos();
    const actividad = await db.actividad.findFirst({ where: { id: actividadId, autorId: docenteId },
      include: { versiones: { include: { asignaciones: { include: { intentos: { where: { estado: "ENVIADO" }, select: { id: true } } } } } } } });
    if (!actividad || !actividad.versiones.some((v) => v.asignaciones.some((a) => a.asignacionDocenteId === asignacionDocenteId))) {
      throw new ErrorDominio("NO_ENCONTRADO", "El material no existe.", 404);
    }
    const version = actividad.versiones[0];
    return { id: actividad.id, titulo: actividad.titulo, instruccion: actividad.instruccion,
      contenido: esquemaVideoPreguntas.parse(version.contenido),
      contenidoBloqueado: version.asignaciones.some((a) => a.intentos.length > 0),
      asignaciones: version.asignaciones.map((a) => ({ id: a.id, grupoId: a.grupoId,
        abreEn: a.abreEn, cierraEn: a.cierraEn, maxIntentos: a.maxIntentos, estado: a.estado })) };
  }

  async function asignacionDeEstudiante(estudianteId: string, grupoId: string, asignaturaId: string, asignacionId: string) {
    await cerrarVencidos();
    const asignacion = await db.asignacionActividad.findFirst({ where: { id: asignacionId, grupoId,
      estado: "PUBLICADA", abreEn: { lte: ahora() },
      versionActividad: { actividad: { asignaturaId, estado: "PUBLICADA" } } },
      include: { versionActividad: { include: { actividad: true } },
        grupo: true, intentos: { where: { estudianteId }, include: { respuestas: true }, orderBy: { numero: "desc" } },
        resultados: { where: { estudianteId } } },
    });
    if (!asignacion) throw new ErrorDominio("NO_ENCONTRADO", "La actividad asignada no existe.", 404);
    const asociacion = await db.asociacionEstudianteGrupo.findFirst({ where: { estudianteId, grupoId,
      anioLectivoId: asignacion.grupo.anioLectivoId, inicioEn: { lte: ahora() }, finEn: null } });
    if (!asociacion) throw new ErrorDominio("NO_ENCONTRADO", "La actividad asignada no existe.", 404);
    const contenido = esquemaVideoPreguntas.parse(asignacion.versionActividad.contenido);
    const ultimoEnviado = asignacion.intentos.find((i) => i.estado === "ENVIADO") ?? null;
    return { id: asignacion.id, titulo: asignacion.versionActividad.actividad.titulo,
      instruccion: asignacion.versionActividad.actividad.instruccion,
      contenido,
      cierraEn: asignacion.cierraEn, maxIntentos: asignacion.maxIntentos,
      intentosUsados: asignacion.intentos.filter((i) => i.estado === "ENVIADO").length,
      enCurso: asignacion.intentos.find((i) => i.estado === "EN_CURSO") ?? null,
      mejorPorcentaje: asignacion.resultados[0]?.porcentaje.toNumber() ?? null,
      ultimoEnviado: ultimoEnviado ? { id: ultimoEnviado.id, numero: ultimoEnviado.numero } : null,
      ultimoResultado: ultimoEnviado ? calificarIntento(videoPreguntas, contenido,
        Object.fromEntries(ultimoEnviado.respuestas.map((r) => [r.itemId, r.respuesta]))) : null };
  }

  return { opcionesDeCreacion, crearMaterial, editarMaterial, editarAsignacion, anularAsignacion,
    cerrarVencidos, iniciarIntento, marcarVisto, enviarIntento, seguimiento, clasesDocente, detalleClase,
    materialDocente, asignacionDeEstudiante };
}
