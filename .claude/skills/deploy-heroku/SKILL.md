---
name: deploy-heroku
description: Despliega MIDUHO en la demo de Heroku (app `miduho`) con verificación previa y posterior. Se activa con /deploy-heroku, "despliega en heroku", "sube a heroku" o "publica la demo".
disable-model-invocation: true
---

# Desplegar MIDUHO en Heroku

Demo en Heroku (app `miduho`, stack container, remoto git `heroku`). Detalle en `docs/operacion.md` §10. Solo datos ficticios.

Pedir el despliegue con este comando ya autoriza `git push heroku`, pero NO autoriza commit ni push a GitHub: eso solo si el usuario lo pide (ver memoria «Commit/push solo si lo pide»).

## Pasos

1. **Estado del repositorio** (desde la raíz):
   - `git status --short` y `git log -1 --oneline`. Heroku despliega lo que está **confirmado** (`HEAD`), no el árbol de trabajo.
   - Si hay cambios sin confirmar que forman parte de lo que el usuario quiere ver, avisarlo y preguntar si los confirma (con rutas explícitas, nunca `git add apps/web`; puede haber otra sesión trabajando en paralelo). No confirmar por iniciativa propia.
   - Si hay archivos sin confirmar ajenos, ignorarlos y mencionarlos.

2. **Verificación previa** (omitir solo si el usuario dice «sin verificar»):
   - `npm run lint` y `npm run build` desde la raíz. Si fallan, detenerse e informar; no desplegar.
   - `npm test` solo si el cambio toca lógica de servidor y el PostgreSQL de desarrollo está arriba (`docker compose -f docker-compose.dev.yml up -d`).

3. **Respaldo si hay migraciones nuevas**: si `git diff --stat <release anterior>..HEAD -- apps/web/prisma/migrations` muestra migraciones, ejecutar `heroku pg:backups:capture -a miduho` antes del push (la base no se revierte con `rollback`).

4. **Desplegar**: `git push heroku HEAD:main` (funciona desde cualquier rama). La fase release corre `prisma migrate deploy`; si falla, Heroku conserva la versión anterior. Usar timeout largo (≈10 min) o ejecutarlo en segundo plano.

5. **Verificar**:
   - `heroku releases -a miduho | head -5` → la versión nueva debe decir «Deploy <sha>» y estar activa.
   - `heroku ps -a miduho` → `web.1` en `up`.
   - `curl -s -o /dev/null -w "%{http_code}\n" https://miduho-80c6012f139a.herokuapp.com/login` → 200.
   - Si algo falla: `heroku logs -n 100 -a miduho`.

6. **Informar** en español: versión (vNN), commit, URL de la demo (https://miduho-80c6012f139a.herokuapp.com/), si hubo migraciones y qué quedó sin verificar (p. ej. rutas tras login). Si el despliegue falla, ofrecer `heroku rollback vNN -a miduho`, sin ejecutarlo por iniciativa propia.

## Reglas

- Nunca `git push --force` ni `heroku pg:reset` / comandos destructivos sobre la base.
- No exponer secretos (`heroku config` solo si se pide, y sin imprimir `AUTH_SECRET` ni `DATABASE_URL`).
- Si `heroku` no está autenticado (`heroku auth:whoami` falla), pedir al usuario `heroku login`.
