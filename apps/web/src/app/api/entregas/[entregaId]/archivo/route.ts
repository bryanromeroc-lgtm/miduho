import { NextRequest } from "next/server";
import { TAMANO_MAXIMO_ENTREGA } from "@/lib/entregas";
import { ErrorDominio } from "@/server/errores";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";
import { subirArchivo } from "@/server/modules/entregas/subida";

export const runtime = "nodejs";
export function POST(req: NextRequest, ctx: { params: Promise<{ entregaId: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    const usuario = await requerirRol(["DOCENTE"]);
    const longitud = Number(req.headers.get("content-length") ?? 0);
    if (longitud > TAMANO_MAXIMO_ENTREGA + 20_000) throw new ErrorDominio("ARCHIVO_GRANDE", "El archivo supera 20 MB", 413);
    const formulario = await req.formData();
    const archivo = formulario.get("archivo");
    if (!(archivo instanceof File)) throw new ErrorDominio("ARCHIVO_REQUERIDO", "Elige un archivo para subir");
    const { entregaId } = await ctx.params;
    const registro = await subirArchivo(entregaId, usuario.id, archivo);
    return Response.json({ id: registro.id, version: registro.version, subidoEn: registro.subidoEn }, { status: 201, headers: { "Cache-Control": "no-store" } });
  });
}
