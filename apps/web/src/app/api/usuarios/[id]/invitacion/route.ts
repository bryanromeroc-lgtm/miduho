import { type NextRequest } from "next/server";
import { servicioCuentas } from "@/server/auth/recuperacion";
import { manejar, requerirRol, verificarOrigen } from "@/server/http";

/** Reenvía la invitación de un ADMIN pendiente; invalida el enlace anterior. */
export function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return manejar(async () => {
    verificarOrigen(req);
    await requerirRol(["ADMIN"]);
    const { id } = await params;
    await servicioCuentas.reenviarInvitacion(id);
    return new Response(null, { status: 204 });
  });
}
