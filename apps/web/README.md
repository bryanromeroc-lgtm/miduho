# MIDUHO — app web

Plataforma educativa del Colegio Mi Dulce Hogar, construida con Next.js 16, NextAuth y Prisma/SQLite.

## Estado del Incremento 1

El Incremento 1 está integrado en `main` e incluye:

- autenticación con credenciales y recuperación de contraseña;
- roles `ADMIN`, `COORDINACION`, `DOCENTE`, `ESTUDIANTE` y `ACUDIENTE`;
- años lectivos, períodos, grados, grupos, áreas y asignaturas;
- asignación de docentes con alcance de lectura restringido al docente autenticado;
- pruebas automáticas y evidencia QA en [`docs/software-factory/`](../../docs/software-factory/).

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
