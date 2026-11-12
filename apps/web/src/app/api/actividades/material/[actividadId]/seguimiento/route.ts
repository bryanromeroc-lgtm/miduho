import { manejar, requerirRol } from "@/server/http";
import { servicioActividades as S } from "@/server/modules/actividades";

export async function GET(_req: Request, { params }: { params: Promise<{ actividadId: string }> }) {
  return manejar(async () => {
    const docente = await requerirRol(["DOCENTE"]);
    return Response.json(await S.seguimiento(docente.id, (await params).actividadId));
  });
}
