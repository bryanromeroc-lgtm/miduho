# Arquitectura y plataforma — MIDUHO

**Propósito:** construir la base técnica antes de la primera funcionalidad.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

La plataforma es un monolito modular en Next.js 16 con PostgreSQL, sesiones revocables y archivos fuera de git: ~32,5 días, 26,5 de ellos P0, y casi todo va antes de la primera funcionalidad. La decisión F0-16 define si ARQ-04 sube a P0.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| ARQ-01 | Registrar las decisiones de arquitectura como ADR en `docs/adr/`: monolito modular, PostgreSQL, autenticación, almacenamiento, uno o varios colegios y hospedaje | ADR aprobados y enlazados desde `arquitectura-backend.md` | P0 | 1 | F0-16 | Pendiente |
| ARQ-02 | Entorno local reproducible con Docker Compose (PostgreSQL 16 y MinIO), `.env.example` y guía de arranque (RNF-MAN-6) | Un equipo nuevo levanta el proyecto en < 30 min siguiendo la guía | P0 | 1 | ARQ-01 | Pendiente |
| ARQ-03 | Esquema Prisma inicial (Anexo A de la arquitectura), `institucionId` si aplica, migraciones y semilla ficticia sin datos de menores | Las migraciones y la semilla corren en una base limpia | P0 | 2 | ARQ-02 | Pendiente |
| ARQ-04 | Row-Level Security por institución en PostgreSQL con pruebas de aislamiento; sube a P0 si F0-16 decide varios colegios | Una consulta sin contexto de institución no devuelve filas | P1 | 2 | ARQ-03 | Pendiente |
| ARQ-05 | Capa `src/server/**` con `server-only`, cliente Prisma único y un envoltorio de acciones: sesión, permisos, Zod y auditoría | Ninguna acción del servidor queda fuera del envoltorio (verificado por lint o prueba) | P0 | 2 | ARQ-03 | Pendiente |
| ARQ-06 | Autenticación con sesiones revocables en base de datos (Better Auth, o Auth.js con estrategia de base de datos), cookie segura y límite de intentos persistente | Cerrar una sesión la invalida al instante; la prueba de bloqueo pasa | P0 | 3 | ARQ-03 | Pendiente |
| ARQ-07 | `permisos.ts` puro y probado: AsignacionDocente, acudiente verificado, estudiante; `forbidden()` y `unauthorized()` | Matriz rol × recurso cubierta por pruebas unitarias | P0 | 3 | ARQ-05 | Pendiente |
| ARQ-08 | Almacenamiento de objetos S3 compatible (p. ej. R2) con CDN, subida por URL prefirmada y lectura privada con URL firmada de corta vida; sacar `public/libros` de git | El repositorio pesa < 10 MB; una guía docente no se abre sin sesión | P0 | 2 | ARQ-01 | Pendiente |
| ARQ-09 | Cola de trabajos en PostgreSQL (pg-boss o Graphile Worker) con un proceso worker separado | Un trabajo fallido se reintenta y queda registrado | P0 | 1,5 | ARQ-03 | Pendiente |
| ARQ-10 | Correo transaccional con plantillas en español y dominio verificado (SPF, DKIM, DMARC) | Los correos de prueba llegan a la bandeja de entrada de Gmail y Outlook | P0 | 1 | ARQ-09 | Pendiente |
| ARQ-11 | Cabeceras de seguridad en `next.config.ts` (CSP con nonce, HSTS, frame-ancestors, Referrer-Policy, Permissions-Policy) y `noindex` | Calificación A en un analizador de cabeceras | P0 | 1 | ARQ-05 | Pendiente |
| ARQ-12 | Marco del layout en el servidor, enlace activo en un componente cliente pequeño y grupos de rutas por rol: `(docente)`, `(estudiante)`, `(acudiente)`, `(admin)` | El menú se decide en el servidor según el rol | P0 | 1,5 | ARQ-06 | Pendiente |
| ARQ-13 | CI en GitHub Actions: lint, tipos, Vitest, build y Playwright con axe; no se fusiona si algo falla | Un PR con una violación de axe queda bloqueado | P0 | 2 | ARQ-02 | Pendiente |
| ARQ-14 | Tres entornos (desarrollo, pruebas, producción): despliegue automático a pruebas desde `main`, a producción con aprobación manual, migraciones controladas | Un cambio llega a pruebas sin intervención y a producción con un clic | P0 | 2 | ARQ-13 | Pendiente |
| ARQ-15 | Secretos solo en variables del proveedor, rotación documentada y escaneo de secretos en CI (gitleaks) | CI falla si detecta un secreto | P0 | 0,5 | ARQ-13 | Pendiente |
| ARQ-16 | Observabilidad base: Sentry en cliente y servidor, logs estructurados con id de petición y monitor externo de disponibilidad | Un error provocado aparece en Sentry con contexto en < 1 min | P0 | 1,5 | ARQ-14 | Pendiente |
| ARQ-17 | Búsqueda de texto completo en PostgreSQL con `unaccent`, diccionario español e índices GIN; API paginada | Buscar «muneca» encuentra «muñeca» en < 1 s | P0 | 1,5 | ARQ-03 | Pendiente |
| ARQ-18 | Caché de catálogos con las APIs de caché de Next 16 (leer `node_modules/next/dist/docs/`) y revalidación por etiqueta tras cada cambio | El catálogo sale de caché y se actualiza al editar | P1 | 1 | ARQ-17 | Pendiente |
| ARQ-19 | PWA: manifiesto y service worker que guarda la interfaz y los libros de la semana para red inestable | Un libro asignado se abre sin conexión | P1 | 2 | IMP-BIB-08 | Pendiente |
| ARQ-20 | Actualización automática de dependencias (Renovate o Dependabot) y `npm audit` en CI | PR semanal de dependencias; CI falla con vulnerabilidades altas | P1 | 0,5 | ARQ-13 | Pendiente |
| ARQ-21 | Banderas de funcionalidad para activar módulos por grado o colegio | Un módulo se activa sin desplegar | P1 | 0,5 | ARQ-05 | Pendiente |

---

[← Anterior](04-diseno-ux-ui.md) · [Índice](README.md) · [Siguiente →](06-implementacion.md)
