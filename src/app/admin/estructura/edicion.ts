/**
 * Contrato entre los formularios de /admin/estructura y las APIs académicas
 * (INC1R-07H). Puro: convierte el FormData de alta o edición en el cuerpo
 * JSON que aceptan los esquemas `crear*` / `actualizar*` y lo valida con esos
 * mismos esquemas antes de enviarlo. Las reglas de dominio (un solo año
 * activo, cierre con 100 %, solapes, inmutabilidad) siguen en el servicio.
 */
import type { z } from "zod";
import * as E from "@/server/modules/academico/esquemas";

/** Segmento de la API (`/api/<tipo>`) de cada entidad del panel. */
export type TipoApi = "anios-lectivos" | "periodos" | "areas" | "grados" | "grupos" | "asignaturas";
export type Modo = "crear" | "editar";
type Cuerpo = Record<string, unknown>;

/** Cuerpo del PATCH que cierra un año: la única transición de estado permitida (ACTIVO → CERRADO). */
export const CUERPO_CIERRE = { estado: "CERRADO" } as const;

export const ESQUEMAS: Record<TipoApi, Record<Modo, z.ZodType>> = {
  "anios-lectivos": { crear: E.crearAnioLectivo, editar: E.actualizarAnioLectivo },
  periodos: { crear: E.crearPeriodo, editar: E.actualizarPeriodo },
  areas: { crear: E.crearArea, editar: E.actualizarArea },
  grados: { crear: E.crearGrado, editar: E.actualizarGrado },
  grupos: { crear: E.crearGrupo, editar: E.actualizarGrupo },
  asignaturas: { crear: E.crearAsignatura, editar: E.actualizarAsignatura },
};

const cadena = (fd: FormData, campo: string) => {
  const v = fd.get(campo);
  return typeof v === "string" ? v.trim() : "";
};
/** Número obligatorio: vacío queda ausente para que el esquema explique qué falta. */
const numero = (fd: FormData, campo: string) => {
  const v = cadena(fd, campo);
  return v === "" ? undefined : Number(v);
};
/** Número u opción que admite `null`: vacío significa "quitar el valor". */
const numeroONulo = (fd: FormData, campo: string) => {
  const v = cadena(fd, campo);
  return v === "" ? null : Number(v);
};
const idONulo = (fd: FormData, campo: string) => cadena(fd, campo) || null;

/** Nombre del campo de intensidad semanal de un grado habilitado en una asignatura. */
export const campoIntensidad = (gradoId: string) => `intensidad-${gradoId}`;

/**
 * Arma el cuerpo JSON de un formulario. En edición solo envía los campos que
 * el esquema `actualizar*` admite (son `.strict()`): el año de un período o de
 * un grupo y el número de un año no se cambian; el estado del año solo cambia
 * con el cierre. Al crear un año nunca se envía `estado`: nace ACTIVO.
 */
export function cuerpoFormulario(tipo: TipoApi, fd: FormData, modo: Modo, original?: Cuerpo): Cuerpo {
  const fechas = { fechaInicio: cadena(fd, "fechaInicio"), fechaFin: cadena(fd, "fechaFin") };
  switch (tipo) {
    case "anios-lectivos":
      return modo === "crear" ? { anio: numero(fd, "anio"), ...fechas } : fechas;
    case "periodos": {
      const cuerpo = { nombre: cadena(fd, "nombre"), orden: numero(fd, "orden"), ponderacion: numero(fd, "ponderacion"), ...fechas };
      return modo === "crear" ? { anioLectivoId: cadena(fd, "anioLectivoId"), ...cuerpo } : cuerpo;
    }
    case "areas":
      return { nombre: cadena(fd, "nombre"), tipo: cadena(fd, "tipo"), idioma: cadena(fd, "idioma"), orden: numeroONulo(fd, "orden") };
    case "grados":
      return { nombre: cadena(fd, "nombre"), nivel: cadena(fd, "nivel"), orden: numero(fd, "orden") };
    case "grupos": {
      const cuerpo: Cuerpo = { identificador: cadena(fd, "identificador"), directorId: idONulo(fd, "directorId") };
      if (modo === "crear") return { anioLectivoId: cadena(fd, "anioLectivoId"), gradoId: cadena(fd, "gradoId"), ...cuerpo };
      // Un director que ya no es docente activo se conserva si no se toca; el servicio solo valida un cambio.
      if (original && cuerpo.directorId === (original.directorId ?? null)) delete cuerpo.directorId;
      return cuerpo;
    }
    case "asignaturas":
      return {
        nombre: cadena(fd, "nombre"),
        areaId: cadena(fd, "areaId"),
        intensidadHoraria: numeroONulo(fd, "intensidadHoraria"),
        // En edición la lista reemplaza el conjunto completo (RN-09): desmarcar un grado lo deshabilita.
        grados: fd.getAll("gradoId").map(String).map((gradoId) => ({ gradoId, intensidad: numeroONulo(fd, campoIntensidad(gradoId)) })),
      };
  }
}

/** Valida el cuerpo con el esquema de la API; devuelve el mensaje para la UI o `null`. */
export function errorCuerpo(tipo: TipoApi, modo: Modo, cuerpo: Cuerpo): string | null {
  const r = ESQUEMAS[tipo][modo].safeParse(cuerpo);
  return r.success ? null : r.error.issues.map((i) => i.message).join(" ");
}

/** Qué acciones ofrece la fila de un año según su estado. Un año cerrado es de solo lectura (RN-52). */
export function accionesAnio(estado: unknown) {
  const activo = estado === "ACTIVO";
  return { editar: activo, cerrar: activo, eliminar: activo };
}

/** Períodos y grupos de un año cerrado no se editan ni se borran (RN-52). */
export const anioCerrado = (anio: unknown) =>
  typeof anio === "object" && anio !== null && (anio as { estado?: unknown }).estado === "CERRADO";
