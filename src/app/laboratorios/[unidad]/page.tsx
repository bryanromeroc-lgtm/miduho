import { notFound } from "next/navigation";
import { Marco, Migas } from "@/components/friso/marco";
import { Boton, Panel } from "@/components/friso/piezas";
import { RUTAS, PROGRAMAS, AREAS } from "@/lib/datos";

/*
  LA RUTA DIDÁCTICA — el trecho desplegado a página completa, con sus 7
  secciones. Esta superficie es Read: la comprensión manda sobre la
  expresión, y la medida de lectura se mantiene entre 65 y 75 caracteres.

  Todo el texto es TEXTO REAL: seleccionable, buscable, traducible y
  legible por lector de pantalla. Es el defecto central de la referencia
  —una ruta completa con 32 caracteres de texto en el DOM— y el que no se
  hereda bajo ninguna circunstancia.
*/

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

  const a = AREAS[ruta.area];
  const programa = PROGRAMAS[0];
  const bloque = programa.bloques.find((b) => b.unidades.some((u) => u.id === id));
  const unidad = bloque?.unidades.find((u) => u.id === id);

  const secciones = [
    { n: 1, titulo: "Objetivo", cuerpo: <Parrafo>{ruta.objetivo}</Parrafo> },
    {
      n: 2,
      titulo: "Evidencias de aprendizaje",
      cuerpo: <Lista items={ruta.evidencias} color={a.plancha} />,
    },
    {
      n: 3,
      titulo: "Temas de profundización",
      cuerpo: <Lista items={ruta.profundizacion} color="var(--color-linea)" />,
    },
    { n: 4, titulo: "Inicio", cuerpo: <Parrafo>{ruta.inicio}</Parrafo> },
    { n: 5, titulo: "Desarrollo", cuerpo: <Parrafo>{ruta.desarrollo}</Parrafo> },
    { n: 6, titulo: "Evaluación", cuerpo: <Parrafo>{ruta.evaluacion}</Parrafo> },
    {
      n: 7,
      titulo: "¿Qué puedo calificar?",
      cuerpo: (
        <>
          <ul className="flex flex-col gap-2">
            {ruta.queCalificar.map((q) => (
              <li
                key={q}
                className="rounded-[9px] px-4 py-3 text-[15px] leading-[1.5]"
                style={{ background: a.pale, color: a.tinta }}
              >
                {q}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[70ch] rounded-[9px] bg-apagado px-4 py-3 text-[13px] leading-[1.55] text-gris">
            La escala de valoración queda pendiente: el módulo de evaluación está
            bloqueado hasta que el colegio entregue su SIEE. Esta maqueta no propone
            una escala institucional.
          </p>
        </>
      ),
    },
  ];

  return (
    <Marco>
      <Migas
        pasos={[
          { etiqueta: "Hoy", href: "/" },
          { etiqueta: "Laboratorios", href: "/laboratorios" },
          { etiqueta: programa.nombre, href: "/laboratorios" },
          { etiqueta: ruta.titulo },
        ]}
      />

      {/* El trecho desplegado. */}
      <header
        className="trecho-entra rounded-[20px] px-8 py-7"
        style={{ background: a.plancha, color: "#fff" }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
          {a.nombre} · Unidad {unidad?.orden} · {programa.nombre}
        </p>
        <h1 className="mt-2 font-heading text-[clamp(34px,5vw,54px)] font-bold leading-[0.96]">
          {ruta.titulo}
        </h1>
        {unidad && (
          <p className="mt-3 text-[14px] text-white">
            {unidad.sesiones} sesiones · {bloque?.nombre}
          </p>
        )}
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Las 7 secciones — plantilla fija heredada del análisis. */}
        <article className="rounded-[15px] bg-papel px-7 py-6">
          {secciones.map((s, i) => (
            <section key={s.n} className={i > 0 ? "mt-8" : undefined}>
              <h2 className="flex items-baseline gap-3 font-heading text-[17px] font-bold uppercase tracking-[0.08em] text-tinta">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                  style={{ background: a.pale, color: a.tinta }}
                  aria-hidden
                >
                  {s.n}
                </span>
                {s.titulo}
              </h2>
              <div className="mt-3">{s.cuerpo}</div>
            </section>
          ))}
        </article>

        <div className="flex flex-col gap-4">
          <Panel titulo="Liberación">
            <p className="text-[14px] leading-[1.55] text-tinta">
              {unidad?.liberacion ?? "Sin programar"}. Hasta entonces los estudiantes
              no la ven.
            </p>
            <Boton
              href="/agenda"
              tono="claro"
              className="mt-4 w-full justify-center !py-2.5 !text-[13px]"
            >
              Cambiar programación
            </Boton>
          </Panel>

          <Panel titulo="Estándares MEN">
            <ul className="flex flex-col gap-3">
              {ruta.estandares.map((e) => (
                <li key={e} className="text-[13.5px] leading-[1.5] text-gris">
                  {e}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel titulo="Derechos básicos de aprendizaje">
            <ul className="flex flex-col gap-3">
              {ruta.dba.map((d) => (
                <li key={d} className="text-[13.5px] leading-[1.5] text-gris">
                  {d}
                </li>
              ))}
            </ul>
          </Panel>

          <Boton href="/laboratorios" tono="area" area={ruta.area} className="w-full justify-center">
            Volver al bloque
          </Boton>
        </div>
      </div>
    </Marco>
  );
}

/* Medida de lectura 65–75ch: requisito de la superficie Read. */
function Parrafo({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[70ch] text-[15.5px] leading-[1.65] text-tinta">{children}</p>
  );
}

function Lista({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="flex max-w-[70ch] flex-col gap-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[15.5px] leading-[1.6] text-tinta">
          <span
            aria-hidden
            className="mt-[9px] h-2 w-2 shrink-0 rounded-full"
            style={{ background: color }}
          />
          {t}
        </li>
      ))}
    </ul>
  );
}
