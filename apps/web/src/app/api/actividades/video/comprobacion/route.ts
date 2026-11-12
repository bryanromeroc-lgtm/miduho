import type { NextRequest } from "next/server";
import { z } from "zod";
import { leerCuerpo, manejar, requerirRol, verificarOrigen } from "@/server/http";
import { comprobarVideo, extraerVideo } from "@/server/modules/actividades/youtube";

export function POST(req: NextRequest) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["DOCENTE"]);
    const { url } = await leerCuerpo(req, z.object({ url: z.string().min(1) }));
    const video = extraerVideo(url);
    return Response.json({ ...video, ...await comprobarVideo(video.id) });
  });
}
