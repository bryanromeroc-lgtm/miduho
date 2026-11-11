import type { Metadata } from "next";
import { GraduationCap, School } from "lucide-react";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { plural, TarjetasAdministracion } from "@/features/administracion/tarjetas";
import { resumenUsuarios } from "@/server/modules/administracion/resumen";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Usuarios · Administración MIDUHO" };

/** Usuarios: dos puertas, Estudiantes y Docentes. Las cuentas ADMIN no se gestionan desde la aplicación. */
export default async function PaginaUsuarios() {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios");
  const u = await resumenUsuarios();
  const sinAnio = u.anio === null;

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Usuarios" }]} />
      <Cabecera
        kicker={u.anio ? `Año lectivo ${u.anio}` : "Sin año lectivo activo"}
        titulo="Usuarios"
        nota="Elige a quién vas a administrar. Desactivar una cuenta conserva su historial: ninguna se elimina."
      />
      <TarjetasAdministracion
        etiqueta="Tipos de usuario"
        tarjetas={[
          {
            id: "estudiantes",
            href: "/admin/usuarios/estudiantes",
            titulo: "Estudiantes",
            descripcion: "Cuentas, contraseñas legibles y el grupo de cada estudiante en el año, con su historial de traslados.",
            icono: GraduationCap,
            cifra: { valor: u.estudiantes.activos.toLocaleString("es-CO"), etiqueta: u.estudiantes.activos === 1 ? "activo" : "activos" },
            atajos: [
              {
                href: "/admin/usuarios/estudiantes/grupos?situacion=SIN_GRUPO",
                etiqueta: "Asignar y trasladar grupos",
                dato: sinAnio ? "Sin año activo" : u.estudiantes.sinGrupo ? plural(u.estudiantes.sinGrupo, "sin grupo", "sin grupo") : "Todos con grupo",
                alerta: sinAnio || u.estudiantes.sinGrupo > 0,
              },
              { href: "/admin/usuarios/nuevo?tipo=estudiantes", etiqueta: "Nuevo estudiante" },
              { href: "/admin/usuarios/importar?tipo=estudiantes", etiqueta: "Importar desde CSV" },
            ],
            accion: "Ver estudiantes",
          },
          {
            id: "docentes",
            href: "/admin/usuarios/docentes",
            titulo: "Docentes",
            descripcion: "Cuentas de las docentes y los docentes, con contraseña temporal que cambian en su primer ingreso.",
            icono: School,
            cifra: { valor: u.docentes.activos.toLocaleString("es-CO"), etiqueta: u.docentes.activos === 1 ? "activo" : "activos" },
            atajos: [
              {
                href: "/admin/asignaciones",
                etiqueta: "Carga en Asignaciones",
                dato: u.docentes.sinCarga ? plural(u.docentes.sinCarga, "sin carga", "sin carga") : "Todos con carga",
                alerta: u.docentes.sinCarga > 0,
              },
              { href: "/admin/usuarios/nuevo?tipo=docentes", etiqueta: "Nuevo docente" },
              { href: "/admin/usuarios/importar?tipo=docentes", etiqueta: "Importar desde CSV" },
            ],
            accion: "Ver docentes",
          },
        ]}
      />
    </Marco>
  );
}
