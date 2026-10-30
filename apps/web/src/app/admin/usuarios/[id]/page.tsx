import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { ETIQUETA_COMBINACION } from "@/lib/usuarios";
import { ErrorDominio } from "@/server/errores";
import { servicioUsuarios } from "@/server/modules/usuarios";
import { exigirRolPagina } from "@/server/pagina";
import { FichaUsuario } from "./ficha";

export const metadata: Metadata = { title: "Editar cuenta · Administración MIDUHO" };

async function cargar(id: string) {
  try {
    return await servicioUsuarios.obtener(id);
  } catch (e) {
    if (e instanceof ErrorDominio && e.status === 404) notFound();
    throw e;
  }
}

export default async function PaginaUsuario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await exigirRolPagina(["ADMIN"], `/admin/usuarios/${encodeURIComponent(id)}`);
  const [u, grupos] = await Promise.all([cargar(id), servicioUsuarios.gruposDisponibles()]);

  const ficha = {
    id: u.id,
    nombres: u.nombres,
    apellidos: u.apellidos,
    correo: u.correo,
    estado: u.estado,
    combinacion: u.combinacion,
    debeCambiarContrasena: u.debeCambiarContrasena,
    ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null,
    creadoEn: u.creadoEn.toISOString(),
    grupoActual: u.grupoActual,
    historialGrupos: u.historialGrupos.map((h) => ({
      id: h.id,
      etiqueta: h.grupo.etiqueta,
      anio: h.grupo.anio,
      inicioEn: h.inicioEn.toISOString(),
      finEn: h.finEn?.toISOString() ?? null,
    })),
    asignacionesActivas: u.asignacionesActivas,
    gruposDirigidos: u.gruposDirigidos,
    anioActivo: u.anioActivo?.anio ?? null,
  };

  return (
    <Marco>
      <Link href="/admin/usuarios" className="admin-volver">
        <ChevronLeft size={18} aria-hidden="true" /> Volver a usuarios
      </Link>
      <Cabecera
        kicker={`Administración · ${u.combinacion ? ETIQUETA_COMBINACION[u.combinacion] : "Sin rol válido"}`}
        titulo={`${u.nombres} ${u.apellidos}`}
        nota="Solo la administración modifica identidad, correo, rol, estado y grupo."
      />
      <FichaUsuario ficha={ficha} grupos={grupos} esPropia={actor.id === u.id} />
    </Marco>
  );
}
