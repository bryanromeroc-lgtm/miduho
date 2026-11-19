import type { Metadata } from "next";
import { Building2, Users } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { plural, TarjetasAdministracion } from "@/features/administracion/tarjetas";
import { resumenCoordinacion, resumenUsuarios } from "@/server/modules/administracion/resumen";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Administración · MIDUHO" };

/** Puerta única del encabezado: Usuarios (estudiantes y docentes) y Coordinación (estructura y asignaciones). */
export default async function PaginaAdministracion() {
  await exigirRolPagina(["ADMIN"], "/admin/administracion");
  const [u, c] = await Promise.all([resumenUsuarios(), resumenCoordinacion()]);

  return (
    <Marco>
      <Cabecera
        kicker={c.anio ? `Año lectivo ${c.anio}` : "Sin año lectivo activo"}
        titulo="Administración"
        nota="Cuentas de estudiantes y docentes, y la organización académica del colegio. Las cuentas de administración las gestiona el equipo de desarrollo."
      />
      <TarjetasAdministracion
        etiqueta="Secciones de administración"
        tarjetas={[
          {
            id: "usuarios",
            href: "/admin/usuarios",
            titulo: "Usuarios",
            descripcion: "Crear, editar, activar o desactivar cuentas, restablecer contraseñas y ubicar a cada estudiante en su grupo.",
            icono: Users,
            cifra: { valor: (u.estudiantes.activos + u.docentes.activos).toLocaleString("es-CO"), etiqueta: "cuentas activas" },
            atajos: [
              {
                href: "/admin/usuarios/estudiantes",
                etiqueta: "Estudiantes",
                dato: u.estudiantes.sinGrupo ? plural(u.estudiantes.sinGrupo, "sin grupo", "sin grupo") : plural(u.estudiantes.activos, "activo", "activos"),
                alerta: u.estudiantes.sinGrupo > 0,
              },
              {
                href: "/admin/usuarios/docentes",
                etiqueta: "Docentes",
                dato: u.docentes.sinCarga ? plural(u.docentes.sinCarga, "sin carga", "sin carga") : plural(u.docentes.activos, "activo", "activos"),
                alerta: u.docentes.sinCarga > 0,
              },
            ],
            accion: "Abrir usuarios",
          },
          {
            id: "coordinacion",
            href: "/admin/coordinacion",
            titulo: "Coordinación",
            descripcion: "La estructura académica del año y la carga de cada docente por asignatura, grupo y horario.",
            icono: Building2,
            cifra: { valor: `${c.pasosListos}/${c.pasosTotal}`, etiqueta: "pasos de estructura listos" },
            atajos: [
              {
                href: "/admin/estructura",
                etiqueta: "Estructura",
                dato: c.pendiente ? `Falta: ${c.pendiente.titulo.toLowerCase()}` : "Completa",
                alerta: !!c.pendiente,
              },
              {
                href: "/admin/asignaciones",
                etiqueta: "Asignaciones",
                dato: plural(c.asignaciones, "activa", "activas"),
                alerta: c.asignaciones === 0,
              },
            ],
            accion: "Abrir coordinación",
          },
        ]}
      />
    </Marco>
  );
}
