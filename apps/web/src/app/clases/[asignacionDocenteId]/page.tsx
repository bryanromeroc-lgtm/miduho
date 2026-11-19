import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Marco, Migas } from "@/components/friso/marco";
import { Boton } from "@/components/friso/piezas";
import { AREAS } from "@/components/friso/areas";
import { ErrorDominio } from "@/server/errores";
import { servicioActividades } from "@/server/modules/actividades";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Actividades de la clase · MIDUHO" };

function colorArea(nombre: string) {
  const normal = nombre.toLocaleLowerCase("es-CO");
  if (normal.includes("robótica")) return AREAS.robotica.plancha;
  if (normal.includes("emprendimiento")) return AREAS.emprendimiento.plancha;
  if (normal.includes("literatura") || normal.includes("comprensión lectora")) return AREAS.literatura.plancha;
  return "var(--color-tinta)";
}

export default async function PantallaClase({ params }: { params: Promise<{ asignacionDocenteId: string }> }) {
  const { asignacionDocenteId } = await params;
  const docente = await exigirRolPagina(["DOCENTE"], `/clases/${encodeURIComponent(asignacionDocenteId)}`);
  const clase = await servicioActividades.detalleClase(docente.id, asignacionDocenteId).catch((error) => {
    if (error instanceof ErrorDominio && error.status === 404) notFound();
    throw error;
  });
  const activas = clase.actividades.filter((a) => a.estado === "PUBLICADA");
  const anuladas = clase.actividades.filter((a) => a.estado === "ANULADA");

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Mis clases", href: "/clases" },
        { etiqueta: `${clase.asignatura} · ${clase.grupo}` }]} />
      <header className="rounded-[22px] px-6 py-7 text-white shadow-[0_18px_40px_-26px_#0a3d6b80]"
        style={{ background: colorArea(clase.area), viewTransitionName: `plancha-${clase.id}` }}>
        <h1 className="font-heading text-3xl font-extrabold">{clase.asignatura}</h1>
        <p className="mt-2 font-semibold">Grupo {clase.grupo}</p>
      </header>
      <nav aria-label="Secciones de la clase" className="mt-6 flex flex-wrap gap-2">
        <span aria-current="page" className="inline-flex min-h-11 items-center rounded-full bg-[var(--dia-azul)] px-5 font-bold text-white">Actividades</span>
        {["Contenidos", "Planeación", "Notas", "Estudiantes"].map((nombre) =>
          <span key={nombre} className="inline-flex min-h-11 items-center rounded-full border border-[var(--dia-borde)] bg-papel px-5 font-semibold text-tinta">
            {nombre} · Demostración 🔶
          </span>)}
      </nav>
      <section className="sticker-panel mt-5 p-5" aria-labelledby="actividades-titulo">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="actividades-titulo" className="font-heading text-xl font-extrabold text-tinta">Actividades</h2>
            <p className="mt-1 text-tinta">Material asignado a este grupo.</p>
          </div>
          <Boton href={`/clases/${clase.id}/material/nuevo`} tono="tinta">Nuevo material audiovisual</Boton>
        </div>
        {activas.length === 0 ? <p className="mt-6 text-tinta">Aún no hay actividades asignadas a este grupo.</p> :
          <ul className="mt-5 space-y-3">
            {activas.map((actividad) => <li key={actividad.asignacionId} className="rounded-xl border border-linea bg-papel p-4">
              <h3 className="font-heading text-lg font-bold text-tinta">
                <Link className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
                  href={`/clases/${clase.id}/material/${actividad.id}`}>{actividad.titulo}</Link>
              </h3>
              <p className="mt-1 text-tinta">{actividad.respondieron} de {actividad.total} respondieron · Cierre: {actividad.cierraEn.toLocaleDateString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium" })}</p>
            </li>)}
          </ul>}
      </section>
      {anuladas.length > 0 && <section className="mt-6" aria-labelledby="anuladas-titulo">
        <h2 id="anuladas-titulo" className="font-heading text-xl font-bold text-tinta">Anuladas</h2>
        <ul className="mt-3 space-y-2">{anuladas.map((actividad) => <li key={actividad.asignacionId}>
          <Link href={`/clases/${clase.id}/material/${actividad.id}`} className="font-semibold text-tinta underline underline-offset-4">{actividad.titulo}</Link>
        </li>)}</ul>
      </section>}
    </Marco>
  );
}
