import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarClock, Users } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { db } from "@/server/db";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Dashboard · Administración MIDUHO" };

/** Inicio del contexto ADMIN: cifras reales del colegio y accesos a cada sección. */
export default async function PaginaDashboard() {
  await exigirRolPagina(["ADMIN"], "/admin");

  const anio = await db.anioLectivo.findFirst({ where: { estado: "ACTIVO" }, select: { id: true, anio: true } });
  const activos = (codigo: string) =>
    db.usuario.count({ where: { estado: "ACTIVO", roles: { some: { rol: { codigo } } } } });
  const [docentes, estudiantes, grupos, asignaciones] = await Promise.all([
    activos("DOCENTE"),
    activos("ESTUDIANTE"),
    anio ? db.grupo.count({ where: { anioLectivoId: anio.id } }) : 0,
    anio ? db.asignacionDocente.count({ where: { anioLectivoId: anio.id, estado: "ACTIVA" } }) : 0,
  ]);

  return (
    <Marco>
      <Cabecera
        kicker={anio ? `Año lectivo ${anio.anio}` : "Sin año lectivo activo"}
        titulo="Administración"
        nota="Usuarios, estructura académica y asignaciones docentes del colegio."
      />
      <dl className="panel-cifras">
        <div className="panel-cifra"><dt>Docentes activos</dt><dd>{docentes}</dd></div>
        <div className="panel-cifra"><dt>Estudiantes activos</dt><dd>{estudiantes}</dd></div>
        <div className="panel-cifra"><dt>Grupos del año</dt><dd>{grupos}</dd></div>
        <div className="panel-cifra"><dt>Asignaciones activas</dt><dd>{asignaciones}</dd></div>
      </dl>
      <section aria-labelledby="accesos-admin">
        <div className="section-heading"><h2 id="accesos-admin">Secciones</h2></div>
        <div className="panel-accesos">
          <Link href="/admin/usuarios" className="panel-acceso">
            <strong><Users size={20} aria-hidden="true" /> Usuarios</strong>
            <span>Crear, editar, activar o desactivar cuentas y asignar roles.</span>
          </Link>
          <Link href="/admin/estructura" className="panel-acceso">
            <strong><Building2 size={20} aria-hidden="true" /> Estructura</strong>
            <span>Años, períodos, áreas, grados, grupos y asignaturas.</span>
          </Link>
          <Link href="/admin/asignaciones" className="panel-acceso">
            <strong><CalendarClock size={20} aria-hidden="true" /> Asignaciones</strong>
            <span>Docentes por asignatura y grupo, con sus bloques de horario.</span>
          </Link>
        </div>
      </section>
    </Marco>
  );
}
