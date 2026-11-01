/**
 * Registro de tipos (fundacion-actividades, 2.2) y esquema del archivo de
 * actividad de `curriculo/actividades/<asignatura>/<grado>/<slug>.json` (D1).
 */
import { z } from "zod";
import type { DefinicionTipoActividad } from "./contrato";
import { palabraSecreta, sopaLetras } from "./palabras";
import { completar, concurso, seleccionMultiple } from "./preguntas";
import { clasificar, emparejar, memoria, ordenar } from "./relaciones";

const DEFINICIONES = [seleccionMultiple, concurso, completar, emparejar, ordenar, clasificar, memoria, sopaLetras, palabraSecreta];

function registrar(lista: DefinicionTipoActividad<never, never>[]) {
  const mapa = new Map<string, DefinicionTipoActividad>();
  for (const d of lista) {
    const llave = `${d.tipo}@${d.versionEsquema}`;
    if (mapa.has(llave)) throw new Error(`Tipo de actividad duplicado: ${llave}`);
    mapa.set(d.tipo, d as unknown as DefinicionTipoActividad);
    mapa.set(llave, d as unknown as DefinicionTipoActividad);
  }
  return mapa;
}

const REGISTRO = registrar(DEFINICIONES as unknown as DefinicionTipoActividad<never, never>[]);

export const TIPOS_ACTIVIDAD = DEFINICIONES.map((d) => d.tipo);

export function definicionDe(tipo: string): DefinicionTipoActividad | undefined {
  return REGISTRO.get(tipo);
}

/** Nombre corto del tipo para la tarjeta; un tipo desconocido se llama «Actividad». */
export function nombreTipo(tipo: string): string {
  return definicionDe(tipo)?.nombre ?? "Actividad";
}

/** Archivo de actividad. El contenido se valida después con el esquema de su tipo. */
export const esquemaArchivoActividad = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug en minúsculas con guiones"),
  titulo: z.string().trim().min(3).max(70),
  tipo: z.string(),
  grado: z.number().int().min(1).max(5),
  /** Qué hay que hacer, en una o dos frases, dicho al estudiante. */
  instruccion: z.string().trim().min(5).max(220),
  /** Tema curricular en palabras propias. 🔶 Los códigos DBA llegan con curriculo/referentes (3.2). */
  tema: z.string().trim().min(3).max(120),
  contenido: z.unknown(),
});

export type ArchivoActividad = z.infer<typeof esquemaArchivoActividad>;

export type ActividadCurricular = Omit<ArchivoActividad, "contenido"> & { contenido: unknown };

/** Valida un archivo completo (general + tipo). Devuelve la actividad o la lista de errores legibles. */
export function leerActividad(datos: unknown): { ok: true; actividad: ActividadCurricular } | { ok: false; errores: string[] } {
  const general = esquemaArchivoActividad.safeParse(datos);
  if (!general.success) return { ok: false, errores: general.error.issues.map((i) => `${i.path.join(".") || "archivo"}: ${i.message}`) };
  const definicion = definicionDe(general.data.tipo);
  if (!definicion) return { ok: false, errores: [`tipo: «${general.data.tipo}» no está registrado`] };
  const contenido = definicion.esquemaContenido.safeParse(general.data.contenido);
  if (!contenido.success) {
    return { ok: false, errores: contenido.error.issues.map((i) => `contenido.${i.path.join(".")}: ${i.message}`) };
  }
  const ids = definicion.items(contenido.data).map((i) => i.itemId);
  if (new Set(ids).size !== ids.length) return { ok: false, errores: ["contenido: hay itemId repetidos"] };
  return { ok: true, actividad: { ...general.data, contenido: contenido.data } };
}
