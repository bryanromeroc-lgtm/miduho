## ADDED Requirements

### Requirement: Imagen de contenedor de la app
El repositorio SHALL incluir un `Dockerfile` multietapa que construye la app con salida `standalone` de Next.js. La imagen final MUST correr como usuario sin privilegios, con `NODE_ENV=production`, y MUST NOT contener el código fuente, `node_modules` completos, archivos `.env`, bases de datos ni los libros.

#### Scenario: Construcción reproducible
- **WHEN** se construye la imagen desde un clon limpio del repositorio
- **THEN** la construcción termina sin acceso a `content/` ni a archivos `.env`

#### Scenario: Usuario sin privilegios
- **WHEN** se inspecciona el contenedor `app` en ejecución
- **THEN** el proceso de Node no corre como `root`

### Requirement: Chequeo de salud
La app SHALL exponer `GET /api/health`, sin autenticación, que responde `200` cuando la base de datos contesta y `503` cuando no. La respuesta MUST NOT incluir datos de usuarios, versiones de dependencias ni detalles de conexión.

#### Scenario: Base disponible
- **WHEN** se llama `GET /api/health` con PostgreSQL disponible
- **THEN** responde `200` con `{"estado":"ok"}`

#### Scenario: Base caída
- **WHEN** se llama `GET /api/health` con PostgreSQL detenido
- **THEN** responde `503` en menos de 3 segundos

### Requirement: Stack de producción con Docker Compose
`docker-compose.yml` SHALL definir los servicios `proxy`, `app`, `migrate`, `db` y `backup`. Solo `proxy` MUST publicar puertos (80 y 443). `db` MUST estar en una red interna sin acceso desde fuera. Todos los servicios de larga vida SHALL tener `healthcheck`, `restart: unless-stopped` y rotación de logs.

#### Scenario: Orden de arranque
- **WHEN** se ejecuta `docker compose up -d` en un servidor limpio
- **THEN** `db` queda sano, luego `migrate` aplica las migraciones y termina con código 0, y solo entonces arranca `app`

#### Scenario: Migración fallida
- **WHEN** `migrate` termina con error
- **THEN** `app` no arranca y la versión anterior de la app, si existía, sigue atendiendo

#### Scenario: Base no expuesta
- **WHEN** se intenta conectar al puerto 5432 desde fuera del host
- **THEN** la conexión es rechazada

### Requirement: Proxy con HTTPS y cabeceras de seguridad
El servicio `proxy` (Caddy) SHALL terminar TLS, redirigir HTTP a HTTPS y añadir las cabeceras `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `X-Frame-Options` (o `frame-ancestors`). SHALL comprimir las respuestas y reenviar a la app las cabeceras `X-Forwarded-*` que Auth.js necesita.

#### Scenario: Acceso por HTTP
- **WHEN** un navegador abre `http://<dominio>/`
- **THEN** recibe una redirección permanente a `https://<dominio>/`

#### Scenario: Inicio de sesión detrás del proxy
- **WHEN** un usuario inicia sesión por `https://<dominio>`
- **THEN** la cookie de sesión se emite con `Secure` y los redirects de Auth.js usan el dominio público

### Requirement: Servicio de los libros digitalizados
Las páginas de los libros SHALL servirse desde `content/libros` montado como volumen de solo lectura en el proxy, bajo la ruta `/libros/*`, con `Cache-Control` de larga duración. La imagen de la app MUST NOT incluir esos archivos, y las páginas que muestran imágenes de `/libros/*` MUST funcionar sin el optimizador de imágenes de Next.js.

#### Scenario: Página de libro
- **WHEN** se pide `/libros/<slug>/p01.webp`
- **THEN** el proxy la entrega desde el volumen con `Cache-Control: public, max-age` de al menos 7 días

#### Scenario: Portada en la biblioteca
- **WHEN** se abre la biblioteca en producción
- **THEN** las portadas cargan sin errores de `/_next/image`

### Requirement: Gestión de secretos
Los secretos (`AUTH_SECRET`, credenciales de PostgreSQL, `SMTP_*`) SHALL leerse de `.env.production`, que MUST NOT versionarse. El repositorio SHALL incluir `.env.production.example` con todas las variables y sin valores reales.

#### Scenario: Plantilla completa
- **WHEN** se compara `.env.production.example` con las variables que leen la app, `migrate`, `db` y `backup`
- **THEN** cada variable usada aparece en la plantilla

#### Scenario: Secreto ausente
- **WHEN** se arranca el stack sin `AUTH_SECRET`
- **THEN** `app` falla al iniciar con un mensaje que nombra la variable

### Requirement: Entorno local con PostgreSQL
`docker-compose.dev.yml` SHALL levantar solo PostgreSQL para desarrollo, con un volumen propio y el puerto publicado únicamente en `127.0.0.1`. La guía de arranque SHALL permitir que alguien nuevo tenga el proyecto corriendo en menos de 30 minutos.

#### Scenario: Arranque local
- **WHEN** se sigue la guía de arranque en un equipo limpio con Docker y Node
- **THEN** `npm run dev` abre la app conectada al PostgreSQL local y `npm test` pasa
