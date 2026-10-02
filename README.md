# MIDUHO

Plataforma educativa del Colegio Mi Dulce Hogar, construida con Next.js 16, NextAuth y Prisma/SQLite.

## Estado del Incremento 1

El Incremento 1 está integrado en `main` e incluye:

- autenticación con credenciales y recuperación de contraseña;
- roles `ADMIN`, `COORDINACION`, `DOCENTE`, `ESTUDIANTE` y `ACUDIENTE`;
- años lectivos, períodos, grados, grupos, áreas y asignaturas;
- asignación de docentes con alcance de lectura restringido al docente autenticado;
- pruebas automáticas y evidencia QA en `docs/software-factory/`.

La matrícula de estudiantes no forma parte del alcance actual.

## Acceso local y desde la red

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev -- --hostname 0.0.0.0
```

En el mismo equipo: `http://localhost:3000`. Desde otro equipo conectado a la misma red, usa `http://IP_DEL_SERVIDOR:3000`.

Para ejecutar el build de producción:

```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
