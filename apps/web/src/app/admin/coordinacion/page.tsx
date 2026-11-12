import type { Metadata } from "next";
import { Building2, CalendarClock, ClipboardList } from "lucide-react";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { plural, TarjetasAdministracion } from "@/features/administracion/tarjetas";
import { resumenCoordinacion } from "@/server/modules/administracion/resumen";
import { exigirRolPagina } from "@/server/pagina";
import { db } from "@/server/db";
import { formatoCierre } from "@/lib/entregas";

export const metadata: Metadata = { title: "Coordinación · Administración MIDUHO" };

/** Coordinación: estructura académica y asignaciones docentes. */
export default async function PaginaCoordinacion() {
  const usuario = await exigirRolPagina(["ADMIN"], "/admin/coordinacion");
  const [c, abiertas, proxima, integracion] = await Promise.all([
    resumenCoordinacion(),
    db.solicitudEntrega.count({ where: { estado: "ABIERTA" } }),
    db.solicitudEntrega.findFirst({ where: { estado: "ABIERTA" }, orderBy: { cierraEn: "asc" }, select: { titulo: true, cierraEn: true } }),
    db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id } }),
  ]);

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Coordinación" }]} />
      <Cabecera
        kicker={c.anio ? `Año lectivo ${c.anio}` : "Sin año lectivo activo"}
        titulo="Coordinación"
        nota="Primero la estructura (año, períodos, áreas, grados, grupos y asignaturas); después, quién dicta qué y cuándo."
      />
      <TarjetasAdministracion
        etiqueta="Secciones de coordinación"
        tarjetas={[
          {
            id: "estructura",
            href: "/admin/estructura",
            titulo: "Estructura",
            descripcion: "Años lectivos, períodos, áreas, grados, grupos y asignaturas del plan de estudios.",
            icono: Building2,
            cifra: { valor: `${c.pasosListos}/${c.pasosTotal}`, etiqueta: "pasos listos" },
            atajos: [
              { href: "/admin/estructura?ver=grupos", etiqueta: "Grupos", dato: c.gruposSinDirector ? plural(c.gruposSinDirector, "sin director", "sin director") : plural(c.grupos, "grupo", "grupos"), alerta: c.gruposSinDirector > 0 },
              { href: "/admin/estructura?ver=asignaturas", etiqueta: "Asignaturas", dato: plural(c.asignaturas, "asignatura", "asignaturas"), alerta: c.asignaturas === 0 },
            ],
            accion: "Abrir estructura",
          },
          {
            id: "asignaciones",
            href: "/admin/asignaciones",
            titulo: "Asignaciones",
            descripcion: "Docentes por asignatura y grupo, con sus bloques de horario semanal.",
            icono: CalendarClock,
            cifra: { valor: c.asignaciones.toLocaleString("es-CO"), etiqueta: c.asignaciones === 1 ? "asignación activa" : "asignaciones activas" },
            atajos: [{ href: "/admin/asignaciones#listado-asignaciones", etiqueta: "Listado por docente, grupo o asignatura" }],
            accion: "Abrir asignaciones",
          },
          {
            id: "entregas", href: "/admin/entregas", titulo: "Entregas",
            descripcion: "Solicitudes de documentos y cumplimiento de las docentes.", icono: ClipboardList,
            cifra: { valor: String(abiertas), etiqueta: abiertas === 1 ? "solicitud abierta" : "solicitudes abiertas" },
            atajos: [
              ...(proxima ? [{ href: "/admin/entregas", etiqueta: `Próximo cierre: ${proxima.titulo}`, dato: formatoCierre(proxima.cierraEn) }] : []),
              ...(!integracion?.refreshTokenCifrado || integracion.estado !== "CONECTADA" ? [{ href: "/cuenta", etiqueta: "Drive desconectado: las docentes no pueden subir", alerta: true }] : []),
            ], accion: "Abrir entregas",
          },
        ]}
      />
    </Marco>
  );
}
