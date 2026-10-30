import type { NextRequest } from "next/server";
import { ErrorImportacion, esquemaImportacion, servicioImportacion } from "@/server/modules/importacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/**
 * ADMIN: importa docentes o estudiantes (§9). Todo o nada: con cualquier
 * error responde 422 con el reporte por fila y no crea cuentas. Si todo es
 * válido, responde el CSV de correo + contraseña inicial UNA sola vez: no se
 * guarda en texto plano y no existe ruta para volver a descargarlo.
 */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { tipo, contenido } = await leerCuerpo(req, esquemaImportacion);
    try {
      const { csv, creadas, duplicadas } = await servicioImportacion.importar(tipo, contenido);
      const fecha = new Date().toISOString().slice(0, 10);
      return new Response(csv, {
        status: 201,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="credenciales-${tipo}-${fecha}.csv"`,
          "Cache-Control": "no-store",
          "X-Total-Creadas": String(creadas),
          "X-Total-Omitidas": String(duplicadas.length),
        },
      });
    } catch (e) {
      if (e instanceof ErrorImportacion) {
        return Response.json(
          { error: { code: e.code, message: e.message }, revision: e.revision },
          { status: 422, headers: { "Cache-Control": "no-store" } },
        );
      }
      throw e;
    }
  });
}
