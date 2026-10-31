## 0. Prerrequisito

- [ ] 0.1 Confirmar que `preparar-despliegue-produccion` está aplicado: PostgreSQL en desarrollo y pruebas, con `npm test` en verde

## 1. Modelo de datos

- [ ] 1.1 Añadir a `schema.prisma` los modelos `ReferenteCurricular`, `Actividad`, `ActividadReferente`, `VersionActividad`, `AsignacionActividad`, `IntentoActividad`, `RespuestaItem` y `ResultadoActividad`, con sus enums, relaciones e índices (design D5)
- [ ] 1.2 Generar la migración y añadirle a mano: índice único parcial de un intento `EN_CURSO`, los `CHECK` de fechas, intentos y porcentaje, y el trigger que impide `UPDATE`/`DELETE` en `versiones_actividad`
- [ ] 1.3 Pruebas de integración de cada restricción SQL (segundo intento abierto, cierre antes de apertura, porcentaje fuera de rango, modificar una versión)

## 2. Contrato y registro de tipos

- [ ] 2.1 Crear `src/features/actividades/tipos/contrato.ts` con `DefinicionTipoActividad` (design D3)
- [ ] 2.2 Crear `registro.ts` (vacío en producción) con detección de `tipo` + `versionEsquema` duplicados al iniciar
- [ ] 2.3 Crear en las pruebas un tipo de prueba (`tests/soporte/tipo-prueba.ts`) que cubra puntaje parcial y puntos de juego
- [ ] 2.4 Prueba genérica que recorre todos los tipos registrados y verifica que `paraEstudiante` no expone campos de solución
- [ ] 2.5 Documentar en `docs/actividades/tipos.md` el catálogo de tipos planeados (design D4) y los requisitos de accesibilidad y dispositivos que debe cumplir cada uno

## 3. Currículo e importación

- [ ] 3.1 Crear `curriculo/` con `referentes/` y `actividades/`, y los esquemas Zod generales de referente y de archivo de actividad en `src/server/modules/curriculo/esquemas.ts`
- [ ] 3.2 Cargar en `curriculo/referentes/` los DBA de 1.° a 5.° de las asignaturas con contenido previsto, transcritos con su fuente del MEN (sin parafrasear ni inventar)
- [ ] 3.3 Implementar `scripts/importar-curriculo.ts` (`npm run curriculo:importar`): validación general y por tipo, verificación de referentes y rango de grados, `itemId` sin repetir, medios existentes, hash canónico, versión nueva solo si cambia el hash y `RETIRADA` para los archivos eliminados; todo en una transacción
- [ ] 3.4 Pruebas: archivo inválido (no importa nada y lista los errores), tipo no registrado, referente de otro grado, reimportación sin cambios (0 nuevos), corrección (versión 2) y retiro con intentos
- [ ] 3.5 Añadir el paso de importación a `deploy/deploy.sh` después de `migrate`

## 4. Asignación

- [ ] 4.1 Crear `src/server/modules/actividades/` (`servicio.ts`, `reglas.ts`, `esquemas.ts`, `index.ts`) siguiendo la convención de `academico`
- [ ] 4.2 Reglas de asignación: asignación docente activa para la asignatura y el grupo, grado coincidente, período del año del grupo, cierre dentro del período y valores por defecto
- [ ] 4.3 Edición (fechas e intentos), cambio de versión o período solo sin intentos (`409`) y anulación conservando los intentos
- [ ] 4.4 Catálogo de la docente con filtros por período sugerido y referente
- [ ] 4.5 Route Handlers `catalogo` y `asignaciones` con control de rol y pruebas de `403`/`404`/`409`/`422`

## 5. Intentos y resultados

- [ ] 5.1 `iniciarOReanudar`: ventana abierta, no anulada, intentos disponibles, un solo `EN_CURSO` y respuesta con la vista segura más las respuestas ya guardadas
- [ ] 5.2 `guardarRespuesta`: validar con el esquema del tipo, calificar en el servidor (ignorando cualquier puntaje del cliente), upsert idempotente, contador de cambios y `409` si el intento está enviado
- [ ] 5.3 `enviar` y `cerrarVencidos` (perezoso, idempotente, en transacción), con cálculo de puntaje, porcentaje (2 decimales), duración y puntos de juego aparte
- [ ] 5.4 Recalcular `ResultadoActividad` en la misma transacción: mayor porcentaje y, en empate, el primer enviado
- [ ] 5.5 Consultas: resultados por asignación («sin entregar» distinto de 0), «mis actividades» con estado e intentos restantes, y resumen por referente (los ítems sin referente propio heredan los de su actividad); excluir lo `ANULADA` y lo que no cuenta como nota
- [ ] 5.6 Route Handlers de estudiante (`mias`, `intentos`, `respuestas`, `envio`) y de docente (`resultados`, `resumen-referentes`), con `404` para recursos ajenos
- [ ] 5.7 Pruebas con el tipo de prueba: reanudar en otro dispositivo, intentos agotados, asignación cerrada, reintento de red, mejor intento que no baja, cierre automático y empate

## 6. Verificación

- [ ] 6.1 Ampliar el escenario k6 con 250 estudiantes guardando una respuesta cada 5 s durante 10 min: p95 < 300 ms y cero errores de unicidad
- [ ] 6.2 `npm test`, `npm run lint` y `npm run build` en verde
- [ ] 6.3 Actualizar `docs/arquitectura-backend.md` y `docs/modelo-de-entidades.md` con el módulo de actividades, y `docs/plan-mvp/01-definicion-mvp.md` para que las actividades gamificadas y los cuestionarios autocalificables dejen de estar fuera del MVP
