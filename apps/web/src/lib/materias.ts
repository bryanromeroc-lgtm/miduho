/**
 * Contrato de «Mis materias» (D3), compartido por el servidor que lo arma y
 * la interfaz que lo pinta. Los campos de progreso y material son opcionales:
 * en null, el cromo los omite. Nunca se rellenan con valores de ejemplo.
 */
import type { Escena } from "./escenas";

export type Estrellas = 0 | 1 | 2 | 3;

export type ResumenMateria = {
  id: string;
  nombre: string;
  area: { nombre: string; orden: number | null };
  escena: Escena;
  claseHref: string;
  estrellas: Estrellas | null;
  avance: { hechas: number; total: number } | null;
  sigue: string | null;
  nuevo: boolean | null;
  conMaterial: boolean | null;
};

export type MisMaterias = {
  grupo: { id: string; etiqueta: string } | null;
  materias: ResumenMateria[];
};

/** Qué partes muestra un cromo según los campos que traen valor. */
export type PartesCromo = {
  sigue: boolean;
  avance: boolean;
  estrellas: boolean;
  invitacion: boolean;
  preparacion: boolean;
  jugar: boolean;
  nuevo: boolean;
  dominada: boolean;
};

export function partesDelCromo(m: Pick<ResumenMateria, "sigue" | "avance" | "estrellas" | "nuevo" | "conMaterial">): PartesCromo {
  const preparacion = m.conMaterial === false;
  const sigue = !preparacion && !!m.sigue?.trim();
  const avance = !preparacion && m.avance !== null && m.avance.total > 0;
  const estrellas = !preparacion && m.estrellas !== null;
  return {
    sigue,
    avance,
    estrellas,
    invitacion: !preparacion && !sigue && !avance && !estrellas,
    preparacion,
    jugar: !preparacion,
    nuevo: m.nuevo === true && !preparacion,
    dominada: !preparacion && m.estrellas === 3,
  };
}

/** Nombre accesible del botón que elige el cromo. */
export function etiquetaElegir(m: Pick<ResumenMateria, "nombre" | "sigue" | "estrellas" | "conMaterial">): string {
  const partes = [`Elegir ${m.nombre}`];
  if (m.conMaterial === false) partes.push("sin material todavía");
  else {
    if (m.estrellas !== null) partes.push(`${m.estrellas} de 3 estrellas`);
    if (m.sigue?.trim()) partes.push(`sigue con ${m.sigue.trim()}`);
  }
  return partes.join(", ");
}

/** Total «mis estrellas» del encabezado; null (se oculta) si ninguna materia tiene datos. */
export function totalEstrellas(materias: Pick<ResumenMateria, "estrellas">[]): number | null {
  const conDatos = materias.filter((m) => m.estrellas !== null);
  return conDatos.length ? conDatos.reduce((t, m) => t + (m.estrellas ?? 0), 0) : null;
}

/* ---------- Vista de una materia (vistas-de-materia, D3) ---------- */

export type EstadoActividad = "porAbrir" | "disponible" | "enCurso" | "hecha" | "cerrada";

/** Una actividad asignada, tal como la entrega `fundacion-actividades`. Nunca se inventa. */
export type ActividadResumen = {
  id: string;
  titulo: string;
  tipo: string;
  estado: EstadoActividad;
  /** Estrellas del mejor intento; null si no hay intentos. */
  estrellas: Estrellas | null;
  intentosUsados: number;
  /** null = práctica libre, sin límite de intentos (catálogo sin asignación de la docente). */
  intentosMax: number | null;
  /** Fechas ISO; null si no aplican. */
  abre: string | null;
  cierra: string | null;
  href: string;
};

export type VistaMateria = {
  materia: ResumenMateria;
  grupo: { id: string; etiqueta: string };
  /** null = la fuente de actividades aún no está conectada; [] = conectada y sin asignaciones. */
  actividades: ActividadResumen[] | null;
};

export const ACTIVIDADES_POR_PAGINA = 6;

const RANGO_ESTADO: Record<EstadoActividad, number> = { disponible: 0, enCurso: 1, porAbrir: 2, hecha: 3, cerrada: 4 };

function tiempo(fecha: string | null): number {
  const t = fecha ? Date.parse(fecha) : NaN;
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
}

/**
 * Orden de la cuadrícula: disponibles con el cierre más próximo, en curso,
 * por abrir (la que abre antes primero), hechas y cerradas; empates por título.
 */
export function ordenarActividades<T extends Pick<ActividadResumen, "estado" | "titulo" | "abre" | "cierra">>(lista: T[]): T[] {
  const fecha = (a: T) => (a.estado === "porAbrir" ? tiempo(a.abre) : tiempo(a.cierra));
  return [...lista].sort(
    (a, b) => RANGO_ESTADO[a.estado] - RANGO_ESTADO[b.estado] || fecha(a) - fecha(b) || a.titulo.localeCompare(b.titulo, "es"),
  );
}

export type Pagina<T> = { elementos: T[]; pagina: number; total: number };

/** Página `pagina` (desde 1) de la lista; un número fuera de rango se ajusta al más cercano. */
export function paginar<T>(lista: T[], pagina: number, tamano = ACTIVIDADES_POR_PAGINA): Pagina<T> {
  const total = Math.max(1, Math.ceil(lista.length / tamano));
  const actual = Math.min(total, Math.max(1, Math.trunc(Number.isFinite(pagina) ? pagina : 1)));
  return { elementos: lista.slice((actual - 1) * tamano, actual * tamano), pagina: actual, total };
}

const FECHA_CORTA = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "America/Bogota" });

/** «5 de noviembre», en hora de Colombia. */
export function fechaCorta(iso: string): string {
  return FECHA_CORTA.format(new Date(iso));
}

const FECHA_MINIMA = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });

/** «Hasta el 6 de nov.»: cierre de una actividad que aún se puede jugar; null si no aplica. */
export function textoCierre(a: Pick<ActividadResumen, "estado" | "cierra">): string | null {
  if (!a.cierra || (a.estado !== "disponible" && a.estado !== "enCurso")) return null;
  return `Hasta el ${FECHA_MINIMA.format(new Date(a.cierra)).replace(/\.$/, "")}.`;
}

/**
 * Desempeño en palabras para el nombre accesible de la tarjeta. Un intento
 * en curso aún no tiene resultado: no se dice «sin intentos».
 */
export function resumenTarjeta(a: Pick<ActividadResumen, "estado" | "estrellas" | "intentosUsados" | "intentosMax">): string {
  if (a.intentosMax === null) return "Práctica libre · Sin límite de intentos";
  const quedan = Math.max(0, a.intentosMax - a.intentosUsados);
  const intentos = quedan === 0 ? "Sin intentos disponibles" : `${quedan} ${quedan === 1 ? "intento disponible" : "intentos disponibles"}`;
  const resultado =
    a.estrellas !== null ? `${a.estrellas} de 3 estrellas` : a.estado === "enCurso" ? "Tienes un intento sin terminar" : "Sin intentos todavía";
  return `${resultado} · ${intentos}`;
}

export const CHIP_ESTADO: Record<EstadoActividad, string> = {
  disponible: "Para jugar",
  enCurso: "En curso",
  porAbrir: "Por abrir",
  hecha: "Hecha",
  cerrada: "Cerrada",
};

/** `principal`: la acción que invita a jugar (Jugar, Continuar); las demás son secundarias. */
export type AccionActividad = { texto: string; habilitada: boolean; principal: boolean };

/** Texto del botón de la tarjeta y si lleva a la actividad (D7). */
export function accionDe(a: Pick<ActividadResumen, "estado" | "intentosUsados" | "intentosMax" | "abre">): AccionActividad {
  const quedan = a.intentosMax === null || a.intentosMax - a.intentosUsados > 0;
  switch (a.estado) {
    case "disponible":
      return { texto: "Jugar", habilitada: true, principal: true };
    case "enCurso":
      return { texto: "Continuar", habilitada: true, principal: true };
    case "hecha":
      return { texto: quedan ? "Repetir para mejorar" : "Ver resultado", habilitada: true, principal: false };
    case "porAbrir":
      return { texto: a.abre ? `Abre el ${fechaCorta(a.abre)}` : "Abre pronto", habilitada: false, principal: false };
    case "cerrada":
      return a.intentosUsados > 0
        ? { texto: "Ver resultado", habilitada: true, principal: false }
        : { texto: "Cerrada", habilitada: false, principal: false };
  }
}
