# INC1R-12 · Suite backend de dominio, seguridad y migraciones (QA)

**Estado:** verificado — 37/37 pruebas pasan sobre `main` (93560d7)
**Fecha:** 2026-10-02
**Perfil:** qa
**Tarjeta:** `t_9233333f`

## Objetivo

Verificación independiente del backend del Incremento 1R, escrita desde el
requerimiento aprobado (`inc-1r-requerimiento-aprobado.md`) y no desde la
implementación. La suite usa una SQLite temporal con las **migraciones reales**
(`prisma/migrations/`), nunca un esquema de prueba, y ejercita los servicios
reales de cuentas, usuarios, académico y Mi curso.

## Cómo ejecutarla

```bash
./node_modules/.bin/vitest run src/server/qa/
# o, junto con el resto de la suite del proyecto:
npm test
```

## Cobertura por criterio

| Criterio (tarjeta / requerimiento) | Archivo | Pruebas | Resultado |
|---|---|---:|---|
| Migración desde base vacía | `migraciones.test.ts` | roles permitidos, estados, combinaciones, asociación, bloques, revocación | PASS |
| Migración desde esquema previo | `migraciones.test.ts` | conserva cuentas, retira roles, normaliza combinaciones, `foreign_key_check` limpio | PASS |
| Roles retirados (COORDINACION, ACUDIENTE) | `migraciones.test.ts` | trigger rechaza inserción y update; migración los elimina | PASS |
| Combinaciones válidas (§2) | `dominio.test.ts` | lógica pura + alta `DOCENTE_ADMIN` + rechazo de conversión estudiante↔personal | PASS |
| Estados de cuenta (§4) | `dominio.test.ts`, `seguridad.test.ts` | PENDIENTE/ACTIVO/INACTIVO, desactivar conserva historial, reactivar | PASS |
| Último ADMIN (§2.1) | `dominio.test.ts` | no se degrada ni desactiva; pendiente no cuenta como activo | PASS |
| Revocación inmediata (§4.4) | `migraciones.test.ts`, `seguridad.test.ts` | triggers estado/clave/roles + servicio incrementa `versionSesion` | PASS |
| Tokens / rate limit (§4.4) | `seguridad.test.ts` | token un solo uso y 24 h, reenvío invalida, límites de recuperación y login | PASS |
| Secretos no recuperables (§4.4) | `seguridad.test.ts` | bcrypt/SHA-256, contraseña legible una sola vez, sin ruta de recuperación | PASS |
| Asociación estudiante–grupo (§6) | `dominio.test.ts`, `migraciones.test.ts` | única activa por año, traslado con confirmación, historial | PASS |
| Año cerrado / 100 % (§7) | `dominio.test.ts` | cierre exige períodos y suma exacta 100 %, inmutabilidad posterior | PASS |
| Asignatura–grado (§8) | `dominio.test.ts` | `ASIGNATURA_GRADO_INVALIDA` | PASS |
| Cruces horarios (§8) | `dominio.test.ts`, `migraciones.test.ts` | `CRUCE_DOCENTE`, `CRUCE_GRUPO`, CHECK de bloques | PASS |
| Reactivación / reasignación (§8) | `dominio.test.ts` | reactivación revalida conflictos, reasignación con confirmación e historial | PASS |
| Autorización horizontal (§2.2/§3/§10) | `dominio.test.ts` | Mi curso solo grupos propios, 404 homogéneo para ajeno, restablecimiento acotado | PASS |

## Resultado

- `vitest run src/server/qa/`: **37 passed / 3 archivos**.
- BD temporal por archivo con migraciones reales aplicadas desde vacío.

## Notas

- La suite es complementaria (no sustituye) a las pruebas por módulo
  (`usuarios.test.ts`, `academico.test.ts`, `mi-curso.test.ts`, etc.): verifica
  los mismos invariantes desde los servicios reales y desde el esquema migrado,
  como red de seguridad ante regresiones.
- El grupo del año cerrado se siembra por Prisma directo (no por el servicio),
  porque el servicio rechaza correctamente crear en un año `CERRADO`.
