<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MIDUHO — reglas de proyecto

Plataforma educativa **dedicada** al Colegio Mi Dulce Hogar (Madrid, Cundinamarca, Colombia), educación primaria. Un solo colegio, no SaaS. La tesis del producto: **"el contenido ya está en la clase"** — la docente encuentra su material sin buscarlo.

## Reglas duras (no negociables — si las violas, el cambio se rechaza)

1. **No inventar datos personales de menores.** No hay datos reales de estudiantes, docentes ni acudientes. Todo dato en la maqueta es ficticio y debe leerse como tal. Nunca generes nombres, cédulas ni datos personales de menores, ni siquiera "de ejemplo".
2. **No copiar contenido protegido.** La plataforma Trendi es referencia funcional únicamente. No se copia código, texto, imágenes ni identidad visual. Solo esquema estructural y redacción propia. Material de Robótica/Emprendimiento: solo el esquema (bloque → unidad → ruta de 7 secciones).
3. **WCAG 2.1 AA obligatorio.** Ningún texto pedagógico como imagen: todo seleccionable, buscable, responsive. Contraste ≥ 4.5:1. Alt text en imágenes informativas, `alt=""` en decorativas. Navegación por teclado, foco visible.
4. **Distinguir observado / inferido / propuesto / por confirmar.** Nunca presentes algo con más certeza de la que tiene. Marca lo no confirmado con 🔶.
5. **Español de Colombia.** Sin lenguaje de marca comercial: "Circuito"→Unidad, "Curious/Kids/Labs"→terminología curricular. Terminología: Área · Nivel · Bloque · Unidad · Sesión · Ruta didáctica · Grupo · Período · Asignatura · Acudiente · Estándares · DBA · SIEE.

## Stack y estructura

- **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, **shadcn** (base-nova), `@base-ui/react`, `page-flip` (lector flipbook).
- `src/app/` — rutas: inicio, biblioteca (lector flipbook), clases, laboratorios, agenda, emprendimiento.
- `src/lib/` — datos demo ficticios: `datos.ts` (áreas, títulos, clases del día), `laboratorios.ts` (mundos/estaciones), `libros.ts`.
- `public/libros/<libro>/` — páginas digitalizadas (webp) + `libro.json`.
- El Incremento 1 construye la fundación: autenticación, entidades académicas, roles y asignación docente. **La matrícula de estudiantes (entidad, flujo e importación CSV) está fuera del alcance por decisión de producto.**
- Git **local, sin remote**. Hay cambios sin commitear (carpetas de libros nuevas + `datos.ts`/`libros.ts` modificados).

## Verificación antes de dar por hecho un cambio

```bash
npm run build    # debe compilar sin errores
npm run lint     # eslint debe pasar
```

No hay suite de tests aún. Si agregas lógica nueva, acompaña con pruebas mínimas (Vitest o similar) cuando aplique.

## Backlog (fuente de verdad)

Vault Obsidian en `/home/bryan/Documentos/OBSIDIAN/MIDUHO/MIDUHO/` (26 docs). Backlog priorizado en `06-Backlog/Backlog-MVP.md`: 7 incrementos, 30 historias de usuario. La maqueta actual cubre la capa de presentación; el desarrollo sigue el orden de los incrementos.
