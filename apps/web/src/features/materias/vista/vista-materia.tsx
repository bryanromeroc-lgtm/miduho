import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DESCRIPCION_ESCENA, type Escena } from "@/lib/escenas";
import { paginar, type VistaMateria as Datos } from "@/lib/materias";
import { Cinta, PatronMarcas, Pieza } from "../tematica/piezas";
import { kitDe, variablesDe } from "../tematica";
import { EncabezadoMateria } from "./encabezado";
import { TarjetaPlana } from "./tarjeta-plana";
import s from "./vista.module.css";

/*
  🔶 `fisica` es Física (decisión del operador del 2026-10-31), pero
  DESCRIPCION_ESCENA aún describe Educación física porque «Mis materias» la
  usa así. Mientras se decide la escena de Educación física, la vista usa
  su propia descripción.
*/
const DESCRIPCION_VISTA: Partial<Record<Escena, string>> = {
  fisica: "Fuerzas, movimiento, luz y energía.",
};

// Dónde flotan los sueltos: en los márgenes, fuera de la columna de texto.
const LUGAR_SUELTO = ["arribaIzq", "abajoIzq", "arribaDer", "abajoDer"] as const;

/*
  VISTA DE MATERIA — pantalla completa de una asignatura del estudiante
  (vistas-de-materia, D6). Encabezado flat, cabecera temática, cuadrícula
  centrada de 3×2 y paginador, sobre el fondo pastel con marcas de agua. Sin
  panel lateral. Una pantalla sin scroll desde 900×640.
*/
export function VistaMateria({
  datos,
  pagina,
  hrefPagina,
  volverHref,
  rotulo,
  extra,
}: {
  datos: Datos;
  pagina: number;
  /** Enlace a otra página de la cuadrícula. */
  hrefPagina: (n: number) => string;
  volverHref: string;
  /** Rótulo visible en el encabezado, p. ej. «Datos de ejemplo». */
  rotulo?: string;
  /** Herramienta extra en el encabezado (selector de la muestra). */
  extra?: ReactNode;
}) {
  const { materia, actividades } = datos;
  const kit = kitDe(materia.escena);
  const mitad = Math.ceil(kit.cabecera.length / 2);
  const hoja = actividades?.length ? paginar(actividades, pagina) : null;

  return (
    <div className={s.pagina} data-escena={materia.escena} style={variablesDe(materia.escena) as CSSProperties}>
      <PatronMarcas kit={kit} color="var(--m-marca)" className={s.marcas} />
      <div className={s.sueltos} aria-hidden="true">
        {kit.sueltos.slice(0, LUGAR_SUELTO.length).map((id, i) => (
          <Pieza key={id} kit={kit} id={id} className={`${s.suelto} ${s[LUGAR_SUELTO[i]]}`} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>

      <EncabezadoMateria
        volverHref={volverHref}
        rotulo={rotulo}
        extra={extra}
        bienvenida={{ materiaId: materia.id, conActividades: !!hoja }}
      />

      <main className={s.contenido} id="actividades" tabIndex={-1}>
        <section className={s.cabecera} aria-labelledby="materia-titulo">
          <span className={s.escenografia} aria-hidden="true">
            {kit.cabecera.slice(0, mitad).map((id) => (
              <Pieza key={id} kit={kit} id={id} className={s.decorado} />
            ))}
          </span>
          <div className={s.plano}>
            <Cinta kit={kit} className={`${s.cinta} ${s.cintaIzq}`} />
            <Cinta kit={kit} className={`${s.cinta} ${s.cintaDer}`} />
            <Pieza kit={kit} id={kit.utileria.chinche} className={s.chinche} />
            <h1 id="materia-titulo" className={s.nombre}>
              {materia.nombre}
            </h1>
            <p className={s.descripcion}>{DESCRIPCION_VISTA[materia.escena] ?? DESCRIPCION_ESCENA[materia.escena]}</p>
          </div>
          <span className={s.escenografia} aria-hidden="true">
            {kit.cabecera.slice(mitad).map((id) => (
              <Pieza key={id} kit={kit} id={id} className={s.decorado} />
            ))}
          </span>
        </section>

        {materia.conMaterial === false ? (
          <Vacio
            kit={kit}
            volverHref={volverHref}
            titulo="Esta materia está en preparación"
            texto="Tu docente está alistando el material. Vuelve pronto."
          />
        ) : !hoja ? (
          <Vacio
            kit={kit}
            volverHref={volverHref}
            titulo="Aún no hay actividades"
            texto="Cuando tu docente asigne actividades, aparecerán aquí."
          />
        ) : (
          <>
            <ul className={s.cuadricula} aria-label={`Actividades de ${materia.nombre}`}>
              {hoja.elementos.map((a, i) => (
                <TarjetaPlana key={a.id} actividad={a} kit={kit} indice={i} />
              ))}
            </ul>
            {hoja.total > 1 && (
              <nav className={s.paginador} aria-label="Páginas de actividades">
                <PaginaEnlace href={hoja.pagina > 1 ? hrefPagina(hoja.pagina - 1) : null}>
                  <ArrowLeft size={20} strokeWidth={2.8} aria-hidden="true" />
                  Anteriores
                </PaginaEnlace>
                <p className={s.paginaActual}>
                  Página {hoja.pagina} de {hoja.total}
                </p>
                <PaginaEnlace href={hoja.pagina < hoja.total ? hrefPagina(hoja.pagina + 1) : null}>
                  Siguientes
                  <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
                </PaginaEnlace>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function PaginaEnlace({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <span className={s.paginaBoton} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={s.paginaBoton} scroll={false}>
      {children}
    </Link>
  );
}

function Vacio({ kit, titulo, texto, volverHref }: { kit: ReturnType<typeof kitDe>; titulo: string; texto: string; volverHref: string }) {
  return (
    <section className={s.vacio} aria-labelledby="vacio-titulo">
      <span className={s.vacioEscena} aria-hidden="true">
        {kit.sueltos.slice(0, 3).map((id) => (
          <Pieza key={id} kit={kit} id={id} className={s.vacioPieza} />
        ))}
      </span>
      <h2 id="vacio-titulo" className={s.vacioTitulo}>
        {titulo}
      </h2>
      <p className={s.vacioTexto}>{texto}</p>
      <Link href={volverHref} className={s.vacioAccion}>
        <ArrowLeft size={20} strokeWidth={2.8} aria-hidden="true" />
        Volver a Mis materias
      </Link>
    </section>
  );
}
