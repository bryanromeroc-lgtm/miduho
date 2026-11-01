import type { Escena } from "./escenas";
import type { ActividadResumen } from "./materias";

/**
 * «Mi agenda» del estudiante: sus actividades autorizadas, agrupadas por
 * fecha, y el mes del calendario. Todo en hora de Colombia (America/Bogota).
 * Las actividades por abrir nunca llegan aquí: el servidor no las entrega.
 */

export type ActividadAgenda = ActividadResumen & {
  materia: { id: string; nombre: string; escena: Escena };
};

export type DatosAgenda = {
  grupo: { id: string; etiqueta: string } | null;
  materias: { id: string; nombre: string; escena: Escena }[];
  actividades: ActividadAgenda[];
  /** Hoy en Bogotá, AAAA-MM-DD (lo fija el servidor: sin desfases de hidratación). */
  hoy: string;
};

export const ZONA = "America/Bogota";

const CLAVE = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" });

/** Día en Bogotá (AAAA-MM-DD) de un instante ISO. */
export function diaDe(iso: string): string {
  return CLAVE.format(new Date(iso));
}

/** Fecha civil AAAA-MM-DD → Date a mediodía UTC: el día no cambia en ninguna zona al formatear. */
function civil(clave: string): Date {
  const [a, m, d] = clave.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

const LARGA = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const DIA_MES = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" });
const HORA = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: ZONA });
const HORA_24 = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: ZONA });
const MES = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" });

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** «Viernes 11 de septiembre». */
export function tituloDia(clave: string): string {
  return mayuscula(LARGA.format(civil(clave)).replace(",", ""));
}

/** «11 de septiembre». */
export function diaMes(clave: string): string {
  return DIA_MES.format(civil(clave));
}

/** «Septiembre de 2026». */
export function tituloMes(anio: number, mes: number): string {
  return mayuscula(MES.format(new Date(Date.UTC(anio, mes - 1, 1, 12))));
}

/** «15 de septiembre · 7:00 a. m.» cuando el instante trae hora distinta de medianoche en Bogotá. */
export function fechaConHora(iso: string): string {
  const instante = new Date(iso);
  const dia = diaMes(diaDe(iso));
  return HORA_24.format(instante) === "00:00" ? dia : `${dia} · ${HORA.format(instante)}`;
}

export type Estado = { texto: string; tono: "pendiente" | "curso" | "hecha" | "cerrada" | "libre"; accion: boolean };

/** Etiqueta de estado derivada solo de los datos; una cerrada no ofrece acción. */
export function estadoDe(a: Pick<ActividadResumen, "estado" | "cierra">): Estado {
  if (a.estado === "cerrada") return { texto: "Cerrada", tono: "cerrada", accion: false };
  if (a.estado === "hecha") return { texto: "Entregada", tono: "hecha", accion: true };
  if (a.estado === "enCurso") return { texto: "En curso", tono: "curso", accion: true };
  return a.cierra ? { texto: "Por entregar", tono: "pendiente", accion: true } : { texto: "Disponible", tono: "libre", accion: true };
}

export type Grupos = {
  /** Pendientes con fecha de entrega, por día de entrega ascendente. */
  porEntregar: { dia: string; actividades: ActividadAgenda[] }[];
  /** Disponibles sin fecha de entrega. */
  disponibles: ActividadAgenda[];
  /** Entregadas o cerradas. */
  terminadas: ActividadAgenda[];
};

const porTitulo = (a: ActividadAgenda, b: ActividadAgenda) =>
  a.materia.nombre.localeCompare(b.materia.nombre, "es") || a.titulo.localeCompare(b.titulo, "es");

export function agrupar(actividades: ActividadAgenda[]): Grupos {
  const visibles = actividades.filter((a) => a.estado !== "porAbrir");
  const pendientes = visibles.filter((a) => (a.estado === "disponible" || a.estado === "enCurso") && a.cierra);
  const dias = new Map<string, ActividadAgenda[]>();
  for (const a of [...pendientes].sort((x, y) => Date.parse(x.cierra!) - Date.parse(y.cierra!) || porTitulo(x, y))) {
    const d = diaDe(a.cierra!);
    dias.set(d, [...(dias.get(d) ?? []), a]);
  }
  return {
    porEntregar: [...dias].map(([dia, lista]) => ({ dia, actividades: lista })),
    disponibles: visibles.filter((a) => (a.estado === "disponible" || a.estado === "enCurso") && !a.cierra).sort(porTitulo),
    terminadas: visibles.filter((a) => a.estado === "hecha" || a.estado === "cerrada").sort(porTitulo),
  };
}

/** Marcas del calendario por día: entregas y aperturas de las actividades visibles. */
export function marcasPorDia(actividades: ActividadAgenda[]): Map<string, { entregas: number; aperturas: number }> {
  const m = new Map<string, { entregas: number; aperturas: number }>();
  const sumar = (dia: string, k: "entregas" | "aperturas") => {
    const v = m.get(dia) ?? { entregas: 0, aperturas: 0 };
    v[k] += 1;
    m.set(dia, v);
  };
  for (const a of actividades) {
    if (a.estado === "porAbrir") continue;
    if (a.cierra) sumar(diaDe(a.cierra), "entregas");
    if (a.abre) sumar(diaDe(a.abre), "aperturas");
  }
  return m;
}

/** ¿La actividad toca el día (se entrega o se abre ese día)? */
export function tocaDia(a: ActividadAgenda, dia: string): boolean {
  return (!!a.cierra && diaDe(a.cierra) === dia) || (!!a.abre && diaDe(a.abre) === dia);
}

/** Semanas del mes, de lunes a domingo; null en las celdas fuera del mes. Claves AAAA-MM-DD. */
export function semanasDelMes(anio: number, mes: number): (string | null)[][] {
  const dias = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const desfase = (new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay() + 6) % 7; // lunes = 0
  const celdas: (string | null)[] = Array(desfase).fill(null);
  for (let d = 1; d <= dias; d++) celdas.push(`${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  while (celdas.length % 7) celdas.push(null);
  const semanas: (string | null)[][] = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

/** Mes siguiente o anterior. */
export function moverMes(anio: number, mes: number, paso: number): { anio: number; mes: number } {
  const t = anio * 12 + (mes - 1) + paso;
  return { anio: Math.floor(t / 12), mes: (t % 12) + 1 };
}
