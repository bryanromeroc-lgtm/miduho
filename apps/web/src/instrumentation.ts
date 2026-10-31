/** Se ejecuta una vez al iniciar el servidor: sin configuración mínima, no arranca. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./instrumentation-node");
}
