import { type NextRequest } from "next/server";
import { esquemaRestablecerEstudiantes } from "@/server/auth/esquemas";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * Restablecimiento individual o múltiple (§4.3). ADMIN: cualquier estudiante;
 * DOCENTE: solo los de sus grupos (asignación activa o dirección de grupo).
 * Responde el CSV de nuevas credenciales; no se puede volver a descargar.
 */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    const usuario = await requerirRol(["ADMIN", "DOCENTE"]);
    const { estudianteIds } = await leerCuerpo(req, esquemaRestablecerEstudiantes);
    const { csv, total } = await servicioCuentas.restablecerEstudiantes(
      { id: usuario.id, roles: usuario.roles },
      estudianteIds,
    );
    const fecha = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="credenciales-estudiantes-${fecha}.csv"`,
        "Cache-Control": "no-store",
        "X-Total-Restablecidos": String(total),
      },
    });
  });
}
