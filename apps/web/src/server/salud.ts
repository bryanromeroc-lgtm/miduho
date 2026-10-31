/**
 * Chequeo de salud para el proxy, `deploy.sh` y el monitor externo.
 * Solo dice si la base contesta: nunca expone versiones, usuarios ni conexión.
 */
export const TOPE_SALUD_MS = 2_000;

export async function comprobarSalud(consultar: () => Promise<unknown>, topeMs = TOPE_SALUD_MS): Promise<Response> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const tope = new Promise<never>((_, rechazar) => {
    temporizador = setTimeout(() => rechazar(new Error("tope de espera")), topeMs);
  });
  const cabeceras = { "Cache-Control": "no-store" };
  try {
    await Promise.race([consultar(), tope]);
    return Response.json({ estado: "ok" }, { headers: cabeceras });
  } catch {
    return Response.json({ estado: "sin-base" }, { status: 503, headers: cabeceras });
  } finally {
    clearTimeout(temporizador);
  }
}
