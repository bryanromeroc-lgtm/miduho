# syntax=docker/dockerfile:1
# Imagen de la app MIDUHO (Next.js standalone). Contexto: raíz del repositorio.
#   docker build -t miduho-app .
# La etapa `builder` también la usa el servicio `migrate` (trae la CLI de Prisma).

# ---------- deps: dependencias exactas del lockfile ----------
FROM node:22-alpine AS deps
WORKDIR /app/apps/web
# `postinstall` ejecuta `prisma generate`: necesita el esquema y la configuración
# (que importa src/lib/entorno.ts).
COPY apps/web/package.json apps/web/package-lock.json apps/web/prisma.config.ts ./
COPY apps/web/prisma ./prisma
COPY apps/web/src/lib/entorno.ts ./src/lib/entorno.ts
RUN npm ci --no-audit --no-fund

# ---------- builder: cliente Prisma + next build ----------
FROM node:22-alpine AS builder
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/apps/web/node_modules ./node_modules
COPY apps/web/ ./
# Opcional: bucket con las páginas de los libros (heroku.yml). Ver next.config.ts.
ARG LIBROS_URL=""
# Ninguna página consulta la base al construir; la URL solo satisface la lectura
# estricta de DATABASE_URL al cargar los módulos. La real llega en ejecución.
RUN DATABASE_URL="postgresql://construccion:construccion@localhost:5432/construccion" npm run build
USER node

# ---------- runner: solo la salida standalone ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
# El código queda de root y solo lectura; node solo escribe la caché de Next.
RUN mkdir -p .next/cache && chown node:node .next/cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
