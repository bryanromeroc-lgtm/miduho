import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Flag,
  Orbit,
  Sparkles,
} from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { PlanetaEmprendimiento, PlanetaRobotica } from "@/features/laboratorios/components/planetas";
import { RUTAS, PROGRAMAS, AREAS } from "@/data/demo";
import { MUNDOS, type MundoId } from "@/features/laboratorios/laboratorios";
import styles from "./actividad.module.css";

/*
  BITÁCORA DE MISIÓN

  La ruta conserva la superficie Read de las siete secciones, pero ya no
  abandona el universo de Laboratorios. La cabina, el cielo, el mundo de
  origen y la ilustración de la estación acompañan toda la experiencia.
  El contenido sigue siendo texto real, seleccionable y con medida de lectura
  controlada; la ambientación nunca sustituye información pedagógica.
*/

const TEMA: Record<
  MundoId,
  { acento: string; brillo: string; hondo: string; cielo: string; cieloSecundario: string }
> = {
  robotica: {
    acento: "#5cc8ff",
    brillo: "#a7e6ff",
    hondo: "#1d6f96",
    cielo: "#12204a",
    cieloSecundario: "#44206c",
  },
  emprendimiento: {
    acento: "#7ddc8f",
    brillo: "#b6f0be",
    hondo: "#27804a",
    cielo: "#0c3d43",
    cieloSecundario: "#665019",
  },
};

export function generateStaticParams() {
  return Object.keys(RUTAS).map((unidad) => ({ unidad }));
}

export default async function PantallaRuta({
  params,
}: {
  params: Promise<{ unidad: string }>;
}) {
  const { unidad: id } = await params;
  const ruta = RUTAS[id];
  if (!ruta) notFound();

  const area = AREAS[ruta.area];
  const mundoId: MundoId = ruta.area === "emprendimiento" ? "emprendimiento" : "robotica";
  const mundo = MUNDOS[mundoId];
  const tema = TEMA[mundoId];
  const estacion = mundo.estaciones.find((item) => item.unidadId === id);
  const Ilustracion = estacion?.Ilustracion;
  const Planeta = mundoId === "robotica" ? PlanetaRobotica : PlanetaEmprendimiento;
  const retorno = `/laboratorios?mundo=${mundoId}`;

  const programa = PROGRAMAS[0];
  const bloque = programa.bloques.find((item) =>
    item.unidades.some((unidad) => unidad.id === id),
  );
  const unidad = bloque?.unidades.find((item) => item.id === id);

  const secciones: { id: string; n: number; titulo: string; cuerpo: ReactNode }[] = [
    { id: "objetivo", n: 1, titulo: "Objetivo", cuerpo: <Parrafo>{ruta.objetivo}</Parrafo> },
    {
      id: "evidencias",
      n: 2,
      titulo: "Evidencias de aprendizaje",
      cuerpo: <Lista items={ruta.evidencias} />,
    },
    {
      id: "profundizacion",
      n: 3,
      titulo: "Temas de profundización",
      cuerpo: <Lista items={ruta.profundizacion} variante="neutra" />,
    },
    { id: "inicio", n: 4, titulo: "Inicio", cuerpo: <Parrafo>{ruta.inicio}</Parrafo> },
    { id: "desarrollo", n: 5, titulo: "Desarrollo", cuerpo: <Parrafo>{ruta.desarrollo}</Parrafo> },
    { id: "evaluacion", n: 6, titulo: "Evaluación", cuerpo: <Parrafo>{ruta.evaluacion}</Parrafo> },
    {
      id: "calificar",
      n: 7,
      titulo: "¿Qué puedo calificar?",
      cuerpo: (
        <>
          <ul className={styles.criterios}>
            {ruta.queCalificar.map((criterio) => (
              <li key={criterio}>
                <Check size={16} strokeWidth={2.8} aria-hidden="true" />
                {criterio}
              </li>
            ))}
          </ul>
          <p className={styles.notaSiee}>
            La escala de valoración queda pendiente: el módulo de evaluación está
            bloqueado hasta que el colegio entregue su SIEE. Esta propuesta no define
            una escala institucional.
          </p>
        </>
      ),
    },
  ];

  const variables = {
    "--actividad-acento": tema.acento,
    "--actividad-brillo": tema.brillo,
    "--actividad-hondo": tema.hondo,
    "--actividad-cielo": tema.cielo,
    "--actividad-cielo-2": tema.cieloSecundario,
    "--actividad-palido": area.pale,
    "--actividad-tinta": area.tinta,
  } as CSSProperties;

  return (
    <div className={`cosmos ${styles.actividad}`} data-mundo={mundoId} style={variables}>
      <Marco>
        <div className={styles.contenido}>
          <nav aria-label="Ruta de navegación" className={styles.migas}>
            <Link href={retorno}>Laboratorios</Link>
            <span aria-hidden="true">/</span>
            <Link href={retorno}>{mundo.nombre}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{ruta.titulo}</span>
          </nav>

          <Link href={retorno} className={styles.regreso}>
            <ArrowLeft size={18} strokeWidth={2.6} aria-hidden="true" />
            Volver a las estaciones de {mundo.area}
          </Link>

          <header className={styles.hero}>
            <div className={styles.heroTexto}>
              <h1>{ruta.titulo}</h1>
              {estacion ? <p className={styles.subtitulo}>{estacion.subtitulo}</p> : null}

              <ul className={styles.metadatos} aria-label="Datos de la ruta">
                <li>
                  <Compass size={16} aria-hidden="true" />
                  {area.nombre} · Unidad {unidad?.orden}
                </li>
                <li>
                  <Clock3 size={16} aria-hidden="true" />
                  {unidad?.sesiones ?? estacion?.sesiones} sesiones
                </li>
                <li>
                  <Flag size={16} aria-hidden="true" />
                  Ruta disponible
                </li>
              </ul>
            </div>

            {Ilustracion ? (
              <div className={styles.heroArte} aria-hidden="true">
                <Ilustracion className={styles.ilustracion} />
              </div>
            ) : null}
          </header>

          <div className={styles.disposicion}>
            <article className={styles.bitacora}>
              <header className={styles.bitacoraCabecera}>
                <div>
                  <h2>Bitácora de la misión</h2>
                  <p>Sigue las siete etapas para preparar y acompañar la actividad.</p>
                </div>
                <Orbit size={30} strokeWidth={1.8} aria-hidden="true" />
              </header>

              <nav aria-label="Secciones de la ruta" className={styles.indice}>
                <ol>
                  {secciones.map((seccion) => (
                    <li key={seccion.id}>
                      <a href={`#${seccion.id}`}>
                        <span aria-hidden="true">{seccion.n}</span>
                        {seccion.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className={styles.secciones}>
                {secciones.map((seccion) => (
                  <section id={seccion.id} key={seccion.id}>
                    <h2>
                      <span aria-hidden="true">{seccion.n}</span>
                      {seccion.titulo}
                    </h2>
                    <div className={styles.seccionCuerpo}>{seccion.cuerpo}</div>
                  </section>
                ))}
              </div>
            </article>

            <aside className={styles.panelMision} aria-label="Información de la misión">
              <div className={styles.mundoActual}>
                <span className={styles.planeta} aria-hidden="true">
                  <Planeta className={styles.planetaSvg} />
                </span>
                <div>
                  <h2>{mundo.nombre}</h2>
                  <p>{mundo.lema}</p>
                </div>
              </div>

              <section>
                <h2>Ubicación de la misión</h2>
                <dl className={styles.datosMision}>
                  <div>
                    <dt>Programa</dt>
                    <dd>{programa.nombre}</dd>
                  </div>
                  <div>
                    <dt>Bloque</dt>
                    <dd>{bloque?.nombre}</dd>
                  </div>
                  <div>
                    <dt>Disponibilidad</dt>
                    <dd>{unidad?.liberacion ?? "Sin programar"}</dd>
                  </div>
                </dl>
                <Link href="/agenda" className={styles.accionSecundaria}>
                  <CalendarDays size={17} aria-hidden="true" />
                  Ir a Agenda
                </Link>
              </section>

              <section>
                <h2>Alineación curricular propuesta</h2>
                <ul className={styles.alineacion}>
                  {ruta.estandares.map((estandar) => (
                    <li key={estandar}>{estandar}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2>DBA por confirmar</h2>
                <ul className={styles.alineacion}>
                  {ruta.dba.map((dba) => (
                    <li key={dba}>{dba}</li>
                  ))}
                </ul>
              </section>

              <Link href={retorno} className={styles.accionPrincipal}>
                <Sparkles size={17} aria-hidden="true" />
                Explorar otra misión
              </Link>
            </aside>
          </div>
        </div>
      </Marco>
    </div>
  );
}

function Parrafo({ children }: { children: ReactNode }) {
  return <p className={styles.parrafo}>{children}</p>;
}

function Lista({
  items,
  variante = "acento",
}: {
  items: string[];
  variante?: "acento" | "neutra";
}) {
  return (
    <ul className={styles.lista} data-variante={variante}>
      {items.map((item) => (
        <li key={item}>
          <span aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
