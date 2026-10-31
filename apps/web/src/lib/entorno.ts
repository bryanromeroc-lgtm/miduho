/**
 * Lectura estricta de variables de entorno obligatorias. Sin valores por defecto:
 * si falta una, el proceso falla con un mensaje que la nombra.
 */
export function variableObligatoria(nombre: string, ayuda?: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}.${ayuda ? ` ${ayuda}` : ""}`);
  return valor;
}

/**
 * Añade `sslmode` a una URL de PostgreSQL si `DATABASE_SSL=no-verify`. Lo usan
 * las bases administradas (Heroku Postgres) que exigen TLS con un certificado
 * que el cliente no puede verificar. Respeta un `sslmode` que ya traiga la URL.
 *
 * `modo`: `no-verify` para `pg` (la app y los scripts); `require` para la CLI
 * de Prisma, que no conoce `no-verify` y por defecto acepta ese certificado.
 */
export function conSsl(url: string, modo: "no-verify" | "require" = "no-verify"): string {
  if (process.env.DATABASE_SSL !== "no-verify" || !url || /[?&]sslmode=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=${modo}`;
}

/** URL de PostgreSQL (`postgresql://…`). */
export const urlBaseDatos = () =>
  conSsl(
    variableObligatoria(
      "DATABASE_URL",
      "Define una URL postgresql://… (en desarrollo: copia .env.example a .env y ejecuta `docker compose -f docker-compose.dev.yml up -d`).",
    ),
  );
