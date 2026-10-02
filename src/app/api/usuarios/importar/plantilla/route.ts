import type { NextRequest } from "next/server";
import { esquemaTipo, plantillaCsv } from "@/server/modules/importacion";
import { leerConsulta, manejar, requerirRol } from "@/server/http";
import { z } from "zod";

/** ADMIN: plantilla con los encabezados exactos (§9). `?tipo=estudiantes|docentes`. */
export function GET(req: NextRequest) {
  return manejar(async () => {
    await requerirRol(["ADMIN"]);
    const { tipo } = leerConsulta(req, z.object({ tipo: esquemaTipo }));
    return new Response(plantillaCsv(tipo), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="plantilla-${tipo}.csv"`,
      },
    });
  });
}
