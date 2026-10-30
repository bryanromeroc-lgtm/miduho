import type { NextRequest } from "next/server";
import { esquemaImportacion, servicioImportacion } from "@/server/modules/importacion";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";

/** ADMIN: valida el archivo completo y devuelve el reporte por fila. No escribe. */
export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { tipo, contenido } = await leerCuerpo(req, esquemaImportacion);
    const revision = await servicioImportacion.vistaPrevia(tipo, contenido);
    return Response.json(revision, { headers: { "Cache-Control": "no-store" } });
  });
}
