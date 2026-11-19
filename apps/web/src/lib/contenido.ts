/**
 * Contrato de «Contenido pedagógico» de la coordinadora (vista-admin-contenido,
 * D2), compartido por el servidor que lo arma y la interfaz que lo pinta.
 * Solo lectura: nunca lleva datos de estudiantes, docentes ni resultados.
 */
import type { ActividadResumen, ResumenMateria } from "./materias";

export type GradoContenido = { id: string; nombre: string; orden: number };

/** Una celda asignatura × grado: exactamente uno de tres estados, nunca una cifra inventada. */
export type CeldaContenido =
  | { estado: "no-se-dicta" }
  | { estado: "sin-contenido"; href: string }
  | { estado: "con-contenido"; actividades: number; href: string };

export type FilaContenido = { id: string; nombre: string; celdas: CeldaContenido[] };

export type AreaContenido = { id: string; nombre: string; asignaturas: FilaContenido[] };

export type IndiceContenido = { grados: GradoContenido[]; areas: AreaContenido[] };

/** Datos de la vista previa de una materia en un grado: sin grupo ni desempeño. */
export type VistaPreviaMateria = {
  materia: ResumenMateria;
  grado: GradoContenido;
  actividades: ActividadResumen[];
};

export const RUTA_CONTENIDO = "/admin/contenido";

export function rutaVistaPrevia(asignaturaId: string, gradoOrden: number): string {
  return `${RUTA_CONTENIDO}/${encodeURIComponent(asignaturaId)}/${gradoOrden}`;
}

export function rutaActividadPrevia(asignaturaId: string, gradoOrden: number, slug: string): string {
  return `${rutaVistaPrevia(asignaturaId, gradoOrden)}/actividades/${encodeURIComponent(slug)}`;
}

/** «8 actividades», «1 actividad», «Sin contenido», «No se dicta». */
export function textoCelda(c: CeldaContenido): string {
  if (c.estado === "no-se-dicta") return "No se dicta";
  if (c.estado === "sin-contenido") return "Sin contenido";
  return `${c.actividades} ${c.actividades === 1 ? "actividad" : "actividades"}`;
}

/** Nombre accesible completo de una celda: «Matemáticas, 5°: 8 actividades». */
export function nombreCelda(asignatura: string, grado: string, c: CeldaContenido): string {
  return `${asignatura}, ${grado}: ${textoCelda(c).toLowerCase()}`;
}
