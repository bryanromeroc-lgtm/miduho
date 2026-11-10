## ADDED Requirements

### Requirement: PostgreSQL como único motor de base de datos
El sistema SHALL usar PostgreSQL (versión 17) como único motor de base de datos en desarrollo, pruebas y producción. La conexión SHALL configurarse solo con la variable `DATABASE_URL`; el código MUST NOT tener una URL de base de datos por defecto que apunte a un archivo local.

#### Scenario: Arranque con DATABASE_URL de PostgreSQL
- **WHEN** la app arranca con `DATABASE_URL=postgresql://…` válida
- **THEN** el cliente Prisma se conecta a PostgreSQL y las consultas funcionan

#### Scenario: Arranque sin DATABASE_URL en producción
- **WHEN** la app arranca con `NODE_ENV=production` y sin `DATABASE_URL`
- **THEN** el proceso falla al iniciar con un mensaje que nombra la variable faltante, en vez de crear un archivo `dev.db`

### Requirement: Línea base de migraciones para PostgreSQL
Las migraciones SHALL reiniciarse como una única migración inicial para PostgreSQL que crea todo el esquema actual. `prisma migrate deploy` sobre una base vacía MUST dejar el esquema idéntico al definido en `schema.prisma`.

#### Scenario: Base vacía
- **WHEN** se ejecuta `prisma migrate deploy` contra una base PostgreSQL vacía
- **THEN** termina sin errores y `prisma migrate diff` entre la base y `schema.prisma` no reporta diferencias

#### Scenario: Semilla sobre base migrada
- **WHEN** se ejecuta la semilla después de migrar
- **THEN** crea la cuenta administradora ficticia y los catálogos base sin errores, y repetirla no duplica registros

### Requirement: Paridad de reglas de integridad
Cada regla de integridad que hoy imponen los triggers y `CHECK` de SQLite SHALL existir en PostgreSQL con el mismo efecto, usando `CHECK`, índices únicos parciales o funciones PL/pgSQL. Cuando una regla rechaza una escritura, el error MUST conservar el código que la app ya interpreta (por ejemplo `ROL_NO_PERMITIDO`, `COMBINACION_ROLES_INVALIDA`).

#### Scenario: Rol no permitido
- **WHEN** se inserta un rol con un código fuera de la lista permitida
- **THEN** PostgreSQL rechaza la escritura y el mensaje de error contiene `ROL_NO_PERMITIDO`

#### Scenario: Combinación de roles inválida
- **WHEN** se asigna a un usuario una combinación de roles que hoy está prohibida
- **THEN** PostgreSQL rechaza la escritura y el mensaje contiene `COMBINACION_ROLES_INVALIDA`

#### Scenario: Inventario completo
- **WHEN** se revisan las migraciones SQLite anteriores
- **THEN** cada trigger y `CHECK` tiene una prueba de integración equivalente que pasa contra PostgreSQL

### Requirement: Pruebas de integración contra PostgreSQL
Las pruebas que hoy crean archivos SQLite temporales SHALL correr contra un PostgreSQL de pruebas, con una base de datos aislada por suite, creada a partir de una plantilla ya migrada y eliminada al final. `npm test` MUST pasar con el PostgreSQL de `docker-compose.dev.yml` levantado.

#### Scenario: Suites en paralelo
- **WHEN** Vitest ejecuta varias suites de integración a la vez
- **THEN** cada una usa su propia base y ninguna ve los datos de otra

#### Scenario: Sin PostgreSQL disponible
- **WHEN** se ejecuta `npm test` sin un PostgreSQL alcanzable
- **THEN** las suites de integración fallan con un mensaje que indica cómo levantar la base de desarrollo
