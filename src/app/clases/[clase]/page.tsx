import { notFound } from "next/navigation";
import { Marco, Migas } from "@/components/friso/marco";
import { Ficha, RanuraLibre } from "@/components/friso/plancha";
import { Boton, Panel } from "@/components/friso/piezas";
import { HOY, AREAS, DOCENTE } from "@/lib/datos";
import { cn } from "@/lib/utils";

/*
  LA PANTALLA DE LA CLASE — la más importante del sistema y el destino de la
  regla de 3 clics: Hoy → Mis clases → Asignatura·Grupo → contenido a la vista.
  Debe responder de un vistazo: qué doy, con qué, y cómo van.

  Aquí el trecho se ha desplegado: la plancha de área ya no es una banda
  entre otras, es el encabezado a página completa de la clase abierta.
*/

export function generateStaticParams() {
  return HOY.map((c) => ({ clase: c.id }));
}

const PESTANAS = ["Contenidos", "Planeación", "Actividades", "Notas", "Estudiantes"];

export default async function PantallaClase({
  params,
}: {
  params: Promise<{ clase: string }>;
}) {
  const { clase: id } = await params;
  const clase = HOY.find((c) => c.id === id);
  if (!clase) notFound();

  const a = clase.area ? AREAS[clase.area] : null;
  const libres = Math.max(0, clase.ranuras - clase.contenidos.length);

  return (
    <Marco>
      <Migas
        pasos={[
          { etiqueta: "Hoy", href: "/" },
          { etiqueta: "Mis clases", href: "/clases" },
          { etiqueta: `${clase.asignatura} · ${clase.grupo}` },
        ]}
      />

      {/* La plancha desplegada: el trecho a página completa. */}
      <header
        className="trecho-entra rounded-[20px] px-8 py-7"
        style={{
          background: a ? a.plancha : "var(--color-apagado)",
          color: a ? "#fff" : "var(--color-tinta)",
          viewTransitionName: `plancha-${clase.id}`,
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: a ? "#fff" : "var(--color-rob-tinta)" }}
            >
              {clase.asignatura} · {clase.grupo}
            </p>
            <h1 className="mt-2 font-heading text-[clamp(34px,5vw,54px)] font-bold leading-[0.96]">
              {clase.tema ?? "Sin material todavía"}
            </h1>
          </div>
          <p className="font-heading text-[15px] font-bold uppercase tracking-[0.08em]">
            {DOCENTE.periodo} · hoy a las {clase.hora}
          </p>
        </div>
      </header>

      {/* Pestañas: la activa es tinta sólida; las demás viven sobre el hueso. */}
      <nav aria-label="Secciones de la clase" className="mt-6 flex flex-wrap gap-2">
        {PESTANAS.map((p, i) => (
          <span
            key={p}
            aria-current={i === 0 ? "page" : undefined}
            className={cn(
              "rounded-full px-5 py-2.5 text-[13px] font-bold",
              i === 0
                ? "bg-tinta text-white"
                : "bg-papel text-gris shadow-[inset_0_0_0_1.5px_var(--color-linea)]"
            )}
          >
            {p}
          </span>
        ))}
      </nav>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[15px] bg-papel p-5">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-tinta">
              Contenidos de este período
            </h2>
            <span className="text-[13px] text-gris">
              {clase.contenidos.length} de {clase.ranuras} puestos
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {clase.contenidos.map((t) => {
              const [tipo, ...resto] = t.pie.split(" · ");
              const meta = resto.join(" · ").replace(/^(\d+-\d+)$/, "$1 años");
              return (
                <Ficha
                  key={t.id}
                  area={t.area}
                  tipo={tipo}
                  titulo={t.titulo}
                  meta={meta || undefined}
                />
              );
            })}
            {libres > 0 && <RanuraLibre />}
          </div>

          <p className="mt-4 max-w-[68ch] text-[13.5px] leading-[1.6] text-gris">
            Este material ya está asociado a la clase: la docente no tuvo que moverlo
            desde ningún catálogo. Esa asociación automática es la diferencia entre un
            aula con contenido y un aula vacía.
          </p>
        </section>

        <div className="flex flex-col gap-4">
          {clase.proximaEntrega && (
            <Panel titulo="Próxima entrega">
              <p className="text-[15px] font-semibold leading-[1.35] text-tinta">
                {clase.proximaEntrega.titulo}
              </p>
              <p className="mt-1 text-[13px] text-gris">
                Vence {clase.proximaEntrega.vence}
              </p>
              <p className="mt-4 font-heading text-[38px] font-bold leading-none text-tinta">
                {clase.proximaEntrega.entregadas}
                <span className="text-gris">/{clase.proximaEntrega.total}</span>
              </p>
              <p className="text-[12px] text-gris">entregas recibidas</p>
            </Panel>
          )}

          <Panel titulo="Grupo">
            <p className="font-heading text-[38px] font-bold leading-none text-tinta">25</p>
            <p className="text-[12px] text-gris">
              estudiantes ficticios en {clase.grupo}
            </p>
            <p className="mt-3 text-[12px] leading-[1.5] text-gris">
              La maqueta no muestra nombres ni datos de menores. La planilla real
              requiere revisión jurídica del tratamiento de datos.
            </p>
          </Panel>

          <Boton href="/" tono="claro" className="w-full justify-center">
            Volver al día
          </Boton>
        </div>
      </div>
    </Marco>
  );
}
