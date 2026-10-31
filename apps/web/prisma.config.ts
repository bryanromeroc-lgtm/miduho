import "dotenv/config";
import { defineConfig } from "prisma/config";
import { conSsl } from "./src/lib/entorno";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // PostgreSQL en todos los entornos. `prisma generate` no se conecta, así que
    // admite que falte; migrate/seed/studio sí la exigen. DATABASE_SSL: ver entorno.ts.
    url: conSsl(process.env.DATABASE_URL ?? "", "require"),
  },
});
