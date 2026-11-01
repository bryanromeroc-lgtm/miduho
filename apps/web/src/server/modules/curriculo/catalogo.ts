/**
 * Catálogo de actividades del currículo en git (fundacion-actividades, D1).
 *
 * Lee `curriculo/actividades/<asignatura>/<grado>/<slug>.json`, valida cada
 * archivo con el esquema general y el de su tipo, y agrupa por asignatura y
 * grado. La carpeta de la asignatura es su nombre normalizado
 * («Ciencias naturales» → `ciencias-naturales`). Un archivo inválido no entra
 * al catálogo y queda en `errores()`; la prueba del currículo exige cero.
 *
 * 🔶 Mientras no exista la importación a la base (3.3), esta lectura es la
 * fuente: en producción se lee una vez; en desarrollo, en cada consulta.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizar } from "@/lib/escenas";
import { leerActividad, type ActividadCurricular } from "@/features/actividades/tipos/registro";

export type ActividadDeCatalogo = ActividadCurricular & { asignatura: string };

export function carpetaAsignatura(nombre: string): string {
  return normalizar(nombre).replace(/ /g, "-");
}

type Cargado = { porClave: Map<string, ActividadDeCatalogo[]>; errores: string[] };

function cargar(raiz: string): Cargado {
  const porClave = new Map<string, ActividadDeCatalogo[]>();
  const errores: string[] = [];
  const slugs = new Map<string, string>();
  if (!existsSync(raiz)) return { porClave, errores };
  const carpetas = (ruta: string) =>
    readdirSync(ruta, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

  for (const asignatura of carpetas(raiz)) {
    for (const grado of carpetas(join(raiz, asignatura))) {
      const dir = join(raiz, asignatura, grado);
      for (const archivo of readdirSync(dir)
        .filter((a) => a.endsWith(".json"))
        .sort()) {
        const ruta = `${asignatura}/${grado}/${archivo}`;
        let datos: unknown;
        try {
          datos = JSON.parse(readFileSync(join(dir, archivo), "utf8"));
        } catch {
          errores.push(`${ruta}: no es JSON válido`);
          continue;
        }
        const leido = leerActividad(datos);
        if (!leido.ok) {
          errores.push(...leido.errores.map((e) => `${ruta}: ${e}`));
          continue;
        }
        const a = leido.actividad;
        const problemas = [
          String(a.grado) !== grado && `el grado ${a.grado} no coincide con la carpeta ${grado}`,
          `${a.slug}.json` !== archivo && `el slug «${a.slug}» no coincide con el nombre del archivo`,
          slugs.has(a.slug) && `el slug «${a.slug}» ya existe en ${slugs.get(a.slug)}`,
        ].filter(Boolean);
        if (problemas.length) {
          errores.push(...problemas.map((p) => `${ruta}: ${p}`));
          continue;
        }
        slugs.set(a.slug, ruta);
        const clave = `${asignatura}/${grado}`;
        porClave.set(clave, [...(porClave.get(clave) ?? []), { ...a, asignatura }]);
      }
    }
  }
  return { porClave, errores };
}

export function crearCatalogo(raiz: string, { conCache = process.env.NODE_ENV === "production" } = {}) {
  let cargado: Cargado | null = null;
  const datos = () => (conCache ? (cargado ??= cargar(raiz)) : cargar(raiz));
  return {
    /** Actividades de una asignatura (por nombre) en un grado (por su orden, 1–5). */
    de(asignatura: string, grado: number): ActividadDeCatalogo[] {
      return datos().porClave.get(`${carpetaAsignatura(asignatura)}/${grado}`) ?? [];
    },
    una(asignatura: string, grado: number, slug: string): ActividadDeCatalogo | null {
      return this.de(asignatura, grado).find((a) => a.slug === slug) ?? null;
    },
    todas(): ActividadDeCatalogo[] {
      return [...datos().porClave.values()].flat();
    },
    errores(): string[] {
      return datos().errores;
    },
  };
}

export type Catalogo = ReturnType<typeof crearCatalogo>;

export const RAIZ_CURRICULO = join(process.cwd(), "curriculo", "actividades");
