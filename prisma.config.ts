import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Desarrollo: SQLite local. Producción: definir DATABASE_URL (🔶 hospedaje pendiente).
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
