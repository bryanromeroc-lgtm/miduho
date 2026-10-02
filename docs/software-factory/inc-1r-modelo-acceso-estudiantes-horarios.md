# Inc. 1R · Modelo de acceso, estudiantes y horarios

**Tarjeta:** `t_828e2d73`  
**Estado:** implementado, pendiente de integración  
**Alcance:** Prisma, migración, seed y pruebas de migración; sin interfaz.

## Decisiones implementadas

- Roles vigentes: `ADMIN`, `DOCENTE` y `ESTUDIANTE`.
- Combinaciones admitidas: cada rol individual y `DOCENTE + ADMIN`; la base rechaza mezclar `ESTUDIANTE` con roles de personal.
- Estados de cuenta: `PENDIENTE_ACTIVACION`, `ACTIVO` e `INACTIVO`.
- `Usuario` incorpora `debeCambiarContrasena`, `versionSesion` y `sesionesRevocadasEn`; `hashContrasena` admite `NULL` mientras una invitación está pendiente.
- `AsociacionEstudianteGrupo` conserva `inicioEn`/`finEn` e historial. Un índice único parcial garantiza una sola asociación activa por estudiante y año.
- `BloqueHorario` pertenece a una asignación docente y valida día, formato `HH:mm` y que la hora inicial sea anterior a la final.
- Se retiraron `COORDINACION`, `ACUDIENTE`, `AcudienteEstudiante` y sus rutas previas.

## Compatibilidad de migración

La migración `20261002000000_inc1r_modelo_acceso_estudiantes_horarios` funciona después de las tres migraciones previas y, por lo tanto, tanto sobre una base existente del Incremento 1 como sobre una base vacía mediante `prisma migrate deploy`.

En una base previa:

- conserva cuentas, hashes, estados y relaciones académicas;
- elimina únicamente vínculos y roles retirados;
- normaliza una combinación histórica `ESTUDIANTE + ADMIN/DOCENTE` conservando el rol de personal;
- no convierte la nueva asociación estudiante–grupo en matrícula formal.

## Seed

El seed crea los tres roles y la estructura académica ficticia. `SEED_ADMIN_PASSWORD` habilita el primer ADMIN. Al definir además `SEED_DOCENTE_PASSWORD` y `SEED_ESTUDIANTE_PASSWORD`, crea cuentas genéricas ficticias, una asociación estudiante–grupo, una asignación docente y un bloque horario. Ninguna contraseña se versiona ni se imprime.

## Evidencia

- `npm test`: 23 pruebas aprobadas, incluidas base vacía, actualización desde esquema previo, restricciones de rol, historial de grupo y validaciones de horario.
- `npm run lint`: aprobado sin errores.
- `npm run build`: compilación de producción aprobada.
- `prisma migrate deploy` sobre SQLite vacía: 4 migraciones aplicadas correctamente.
- `prisma db seed` sobre la base migrada: escenario ficticio de Inc. 1R creado correctamente.
