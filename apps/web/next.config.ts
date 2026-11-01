import type { NextConfig } from "next";

// Origen de /libros/* cuando las páginas viven en un bucket (Heroku). Se fija al
// construir. Sin ella: en desarrollo, public/libros; con Docker Compose, Caddy.
const librosUrl = process.env.LIBROS_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Las reglas para agentes de IA viven en el AGENTS.md de la raíz del repo;
  // evita que `next dev` vuelva a crear AGENTS.md/CLAUDE.md dentro de la app.
  agentRules: false,
  // Imagen de contenedor: .next/standalone trae server.js y solo las dependencias trazadas.
  output: "standalone",
  poweredByHeader: false,
  // El currículo (curriculo/actividades/**/*.json) se lee en tiempo de ejecución: va dentro de la salida standalone.
  outputFileTracingIncludes: { "/materias/**": ["./curriculo/**/*.json"] },

  // Las mismas cabeceras que pone Caddy (deploy/Caddyfile), para cuando no hay
  // proxy propio delante (Heroku). Detrás de Caddy, este las reemplaza.
  async headers() {
    return [
      {
        source: "/:ruta*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // HTTP → HTTPS cuando el balanceador (Heroku) avisa que la petición llegó
      // en claro. Sin la cabecera (desarrollo) o con https (Caddy) no actúa.
      {
        source: "/:ruta*",
        has: [
          { type: "header", key: "x-forwarded-proto", value: "http" },
          { type: "host", value: "(?<host>.+)" },
        ],
        destination: "https://:host/:ruta*",
        permanent: true,
      },
      ...(librosUrl
        ? [{ source: "/libros/:ruta*", destination: `${librosUrl}/:ruta*`, permanent: false }]
        : []),
    ];
  },
};

export default nextConfig;
