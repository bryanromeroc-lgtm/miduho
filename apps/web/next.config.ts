import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las reglas para agentes de IA viven en el AGENTS.md de la raíz del repo;
  // evita que `next dev` vuelva a crear AGENTS.md/CLAUDE.md dentro de la app.
  agentRules: false,
};

export default nextConfig;
