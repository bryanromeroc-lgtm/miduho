import "server-only";
import { db } from "@/server/db";

export async function datosFormulario() {
  const [docentes, periodos] = await Promise.all([
    db.usuario.findMany({ where: { estado: "ACTIVO", roles: { some: { rol: { codigo: "DOCENTE" } } } }, select: { id: true, nombres: true, apellidos: true }, orderBy: { apellidos: "asc" } }),
    db.periodo.findMany({ where: { anioLectivo: { estado: "ACTIVO" } }, select: { id: true, nombre: true }, orderBy: { orden: "asc" } }),
  ]);
  return { docentes, periodos };
}
