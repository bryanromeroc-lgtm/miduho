# MIDUHO — reglas de proyecto

Plataforma educativa **dedicada** al Colegio Mi Dulce Hogar (Madrid, Cundinamarca, Colombia), educación primaria. Un solo colegio, no SaaS. La tesis del producto: **"el contenido ya está en la clase"** — la docente encuentra su material sin buscarlo.

## Reglas duras (no negociables — si las violas, el cambio se rechaza)

1. **No inventar datos personales de menores.** No hay datos reales de estudiantes, docentes ni acudientes. Todo dato en la maqueta es ficticio y debe leerse como tal. Nunca generes nombres, cédulas ni datos personales de menores, ni siquiera "de ejemplo".
2. **No copiar contenido protegido.** La plataforma Trendi es referencia funcional únicamente. No se copia código, texto, imágenes ni identidad visual. Solo esquema estructural y redacción propia. Material de Robótica/Emprendimiento: solo el esquema (bloque → unidad → ruta de 7 secciones).
3. **WCAG 2.1 AA obligatorio.** Ningún texto pedagógico como imagen: todo seleccionable, buscable, responsive. Contraste ≥ 4.5:1. Alt text en imágenes informativas, `alt=""` en decorativas. Navegación por teclado, foco visible.
4. **Distinguir observado / inferido / propuesto / por confirmar.** Nunca presentes algo con más certeza de la que tiene. Marca lo no confirmado con 🔶.
5. **Español de Colombia.** Sin lenguaje de marca comercial: "Circuito"→Unidad, "Curious/Kids/Labs"→terminología curricular. Terminología: Área · Nivel · Bloque · Unidad · Sesión · Ruta didáctica · Grupo · Período · Asignatura · Acudiente · Estándares · DBA · SIEE.

## Next.js 16: no es el Next.js que conoces

Esta versión tiene cambios incompatibles en APIs, convenciones y estructura de archivos. Antes de escribir código lee la guía correspondiente en `apps/web/node_modules/next/dist/docs/` y respeta los avisos de deprecación. (`agentRules: false` en `apps/web/next.config.ts` evita que `next dev` regenere este aviso dentro de la app.)

## Estructura del repositorio

```
miduho/
├─ apps/web/            # aplicación Next.js full-stack (frontend + backend)
├─ tools/flipbook-forge/# CLI: PDF de libro → páginas webp para el lector (no se despliega)
├─ content/             # contenido pesado, FUERA de git
│  ├─ biblioteca/       #   PDFs fuente (+ LICENCIA.md, versionada)
│  └─ libros/           #   páginas generadas; apps/web/public/libros es un enlace a esta carpeta
├─ docs/                # arquitectura, modelo de entidades, plan MVP, software factory, investigación
├─ openspec/            # cambios y specs (flujo spec-driven, /opsx:*)
├─ PRODUCT.md DESIGN.md # producto y sistema de diseño
├─ .claude/ .agents/ .hermes/ .impeccable/   # configuración de agentes de IA
└─ AGENTS.md            # este archivo (CLAUDE.md lo incluye)
```

### Dentro de `apps/web/`

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn (base-nova), `@base-ui/react`, `page-flip`, Prisma 7 + SQLite (dev), Auth.js v5, Zod, Vitest.
- `src/app/` — solo rutas (páginas, layouts, Route Handlers en `api/`). Deben ser delgadas.
- `src/features/<dominio>/` — componentes y datos de UI de cada dominio (biblioteca, laboratorios, …).
- `src/components/` — UI compartida: `ui/` (shadcn) y `shell/`.
- `src/server/` — backend (`import "server-only"`): `db.ts`, `auth/`, `modules/<dominio>/`. **Nunca** se importa desde un Componente Cliente.
- `src/lib/` — utilidades puras, importables desde cliente y servidor.
- `prisma/` — esquema, migraciones y seed (datos ficticios).
- `e2e/`, `scripts/` — smoke E2E y scripts de QA/demo.

Detalle de capas y decisiones: `docs/arquitectura-backend.md`.

## Verificación antes de dar por hecho un cambio

Desde la raíz (delegan en `apps/web`):

```bash
npm run build    # debe compilar sin errores
npm run lint     # eslint debe pasar
npm test         # Vitest debe pasar
```

Si agregas lógica nueva, acompáñala con pruebas (Vitest), junto al archivo que prueban (`*.test.ts`).

## Backlog (fuente de verdad)

Vault Obsidian en `/home/bryan/Documentos/OBSIDIAN/MIDUHO/MIDUHO/` (26 docs). Backlog priorizado en `06-Backlog/Backlog-MVP.md`: 7 incrementos, 30 historias de usuario. El desarrollo sigue el orden de los incrementos. El Incremento 1 construye la fundación: autenticación, entidades académicas, roles y asignación docente. **La matrícula de estudiantes (entidad, flujo e importación CSV) está fuera del alcance por decisión de producto.**
