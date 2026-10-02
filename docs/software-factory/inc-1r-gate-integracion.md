# INC1R-14 · Gate de integración en `main` y publicación

**Estado:** integrado y verificado; publicación registrada en GitHub.
**Fecha:** 2026-10-02
**Tarjeta:** `t_7e511096`

## Base integrada

Las entregas de INC1R-12 y INC1R-13 se integraron por *fast-forward* en `main`.
La base recibida para este gate fue `1210724f44550b74d930df7c66fdf396e271cac4`,
igual a `origin/main` antes de la corrección encontrada durante la ejecución.
No quedaron dependencias de ramas de trabajo fuera de `main`.

## Corrección encontrada en el gate

El smoke con `next start -H 0.0.0.0` detectó que el selector de contexto
`ADMIN`/`DOCENTE` devolvía `403 ORIGEN_INVALIDO`: el control CSRF comparaba
`Origin` con el binding `0.0.0.0`, no con el encabezado `Host` solicitado por
el navegador. Se corrigió `verificarOrigen` para comparar contra el Host
efectivo, manteniendo el rechazo de orígenes ajenos. La prueba unitaria cubre
`localhost`, una dirección LAN y un origen no permitido.

## Verificaciones ejecutadas sobre `main`

| Gate | Resultado |
|---|---|
| Dependencias reproducibles | `npm ci` instaló `playwright-core` declarado y bloqueado. |
| Suite completa | `npm test`: 16 archivos, 170 pruebas aprobadas. Incluye 37 pruebas QA de migraciones, dominio y seguridad. |
| Calidad estática | `npm run lint` sin errores. |
| Compilación | `npm run build` completó Prisma y Next.js 16 sin errores. |
| Base vacía y esquema previo | `./e2e/preparar.sh` aplicó todas las migraciones reales sobre SQLite temporal; la suite QA cubre también la actualización desde el esquema previo y `foreign_key_check`. |
| Smoke de producción | `next start -H 0.0.0.0 -p 3113` escuchó en todas las interfaces; E2E con Chromium real: **304/304 PASS** en 1366×900 y 390×844. |
| Credenciales temporales | El E2E eliminó los CSV de credenciales; solo quedaron artefactos ignorados de la ejecución temporal. |
| Alcance | No se introdujeron rutas, entidades ni flujos de los incrementos 2 a 7; se conserva la exclusión de matrícula formal. |
| Árbol y publicación | Se verifican después del commit y `git push` de este gate. |

La IP LAN directa no se invocó desde el agente porque la política de ejecución
bloquea solicitudes HTTP a IP privadas. El proceso quedó verificado escuchando
en `0.0.0.0:3113`, y la prueba unitaria reproduce el `Host` LAN que causaba el
fallo de CSRF.
