## Context

- **Hoy (observado):** coordinación pide planillas, sobre todo Excel, con fecha y hora límite, y las docentes las suben a una carpeta del Drive de la coordinadora. La plataforma no participa en ese ciclo.
- **Roles (observado):** `ADMIN`, `DOCENTE` y `ESTUDIANTE`. «Coordinación» es una sección del rol `ADMIN` (`/admin/coordinacion` con las tarjetas Estructura y Asignaciones), no un rol aparte.
- **Autenticación (observado):** Auth.js v5 solo con credenciales. No hay proveedor de Google y no se agregará como forma de iniciar sesión.
- **Cuenta de Google (confirmado por el usuario):** es un **Gmail personal**, sin Google Workspace. Gmail no se integra; solo Drive.
- **Decisiones del usuario:** la coordinadora elige la carpeta y los archivos van directo ahí; la entrega tardía se permite y se marca, nunca se bloquea; se aceptan los valores por defecto propuestos (versiones, destinatarias todas o una selección, nombre uniforme, coordinación = `ADMIN`).
- **Restricciones:** WCAG 2.1 AA; Ley 1581 de 2012 (las planillas pueden contener datos de menores); despliegue con Docker Compose más Caddy, y demo en Heroku (límite de 30 s por petición en el enrutador); Next.js 16 (consultar `node_modules/next/dist/docs/` antes de escribir Route Handlers y Server Actions).

## Goals / Non-Goals

**Goals:**
- Que la coordinadora cree, edite, archive y siga solicitudes de entrega desde la plataforma.
- Que la docente vea qué le piden y hasta cuándo, y suba el archivo sin tener cuenta de Google.
- Que los archivos terminen en la carpeta de Drive que elija la coordinadora, con nombres uniformes.
- Pedir el mínimo permiso de Google y no custodiar el contenido de los archivos.

**Non-Goals:**
- Devolver un archivo para corrección, comentarios o revisión.
- Notificaciones por correo (ni Gmail ni SMTP) o push.
- Solicitudes «una por grupo o asignatura».
- Un rol `COORDINACION` separado de `ADMIN`.
- Que la docente descargue o vea en la plataforma lo que subió.
- Iniciar sesión con Google.

## Decisions

### D1. Permiso `drive.file` y Google Picker
Se pide solo `drive.file` (más `openid` y `email` para mostrar con qué cuenta se conectó). Con ese permiso, la app solo ve los archivos que crea y las carpetas que la persona le abre explícitamente con el **Google Picker**. Eso encaja exactamente con «la coordinadora escoge la carpeta».
- *Alternativa descartada:* el permiso `drive` completo. Es restringido: para una app publicada exige una auditoría de seguridad anual (CASA), que es costosa, y da acceso a todo el Drive personal.
- *Alternativa descartada:* que la app cree su propia carpeta «MIDUHO · Entregas». Funciona sin Picker, pero contradice la decisión del usuario. Queda como **plan B** si el spike (D10) falla.

### D2. App OAuth publicada («En producción»)
Con un Gmail personal no existe el tipo «Interna» de Workspace. En modo «Prueba», los refresh tokens caducan a los 7 días, y la coordinadora tendría que reconectar cada semana. La app se publica; como `drive.file` no es sensible, no requiere auditoría. Sí requiere la verificación de marca: nombre, logo opcional, página de inicio y política de privacidad en un **dominio propio verificado** 🔶. Si el dominio no está listo, se puede operar temporalmente en «Prueba», asumiendo la reconexión semanal, y la UI de «Conexión revocada» (D7) cubre ese caso.

### D3. OAuth propio con Route Handlers, no con Auth.js
El proveedor de Google de Auth.js está pensado para iniciar sesión y mezclaría cuentas de Google con la sesión de MIDUHO. Se implementa un flujo propio de autorización (*authorization code* con PKCE S256 y `state`), con `access_type=offline` y `prompt=consent` (este último garantiza recibir el refresh token al reconectar):
- `GET /api/integraciones/google/iniciar`: exige `ADMIN`, genera `state` y `code_verifier`, los guarda en una cookie `httpOnly`, `secure`, `sameSite=lax`, cifrada y con 10 minutos de vida, y redirige a Google.
- `GET /api/integraciones/google/retorno`: valida el `state` contra la cookie y la sesión, intercambia el código, lee el `email` del id_token (vía `userinfo`), verifica que se concedió `drive.file` y guarda la integración.
- `POST /api/integraciones/google/desconectar`: revoca ante Google con mejor esfuerzo y borra las credenciales.
- `GET /api/integraciones/google/token-picker`: devuelve el access token, `GOOGLE_API_KEY` y `GOOGLE_APP_ID`, con `no-store`.

Se usa `fetch` contra `oauth2.googleapis.com` y `www.googleapis.com/drive/v3` y `upload/drive/v3`, sin el SDK `googleapis`: el SDK es pesado y apenas se usan cuatro llamadas. El cliente vive en `src/server/integraciones/google/` (con `server-only`) detrás de una interfaz `ClienteDrive { subir, obtenerCarpeta }`, que permite inyectar una implementación falsa en las pruebas.

### D4. Cifrado de credenciales
AES-256-GCM con `node:crypto`. La clave sale de `CLAVE_CIFRADO_INTEGRACIONES` (32 bytes en base64); el IV es aleatorio por registro y se guarda junto al texto cifrado y la etiqueta (formato `v1:iv:tag:cifrado`). El prefijo de versión permite rotar la clave más adelante. En producción, sin clave, la integración queda deshabilitada (spec). El access token no se persiste: se pide al refrescar y se cachea en memoria por proceso hasta 5 minutos antes de que expire.

### D5. Modelo de datos

```
IntegracionGoogle                 SolicitudEntrega                    EntregaDocente               ArchivoEntrega
─────────────────                 ────────────────                    ──────────────               ──────────────
id                                id                                  id                           id
usuarioId  @unique ──▶ Usuario    titulo, descripcion?                solicitudId ──▶              entregaId ──▶
correoGoogle                      tipoDocumento (enum)                docenteId   ──▶ Usuario      version (1..n)
refreshTokenCifrado?              formatos  String[]                  ultimoFalloEn?               driveFileId
scopes     String[]               cierraEn   timestamptz              creadoEn                     nombreDrive
estado  CONECTADA|REVOCADA        periodoId? ──▶ Periodo              @@unique(solicitud,docente)  nombreOriginal
conectadaEn, actualizadoEn        carpetaDriveId, carpetaDriveNombre                               tamanoBytes, sha256
                                  integracionId ──▶ IntegracionGoogle                              mime
                                  estado  ABIERTA|ARCHIVADA                                        subidoEn (servidor)
                                  creadaPorId ──▶ Usuario                                          @@unique(entrega,version)
                                  creadaEn, actualizadaEn
```

- **El estado de cada entrega no se guarda:** se **deriva** de `cierraEn`, la última versión y `now()`, con la función pura `estadoEntrega()` en `src/lib/entregas.ts`, probada. Así no hace falta un cron y, al ampliar el plazo, todo se recalcula solo (spec «Ampliar plazo»).
- `tipoDocumento` es un enum de Prisma (`PLANILLA_NOTAS`, `PLANEACION`, `OBSERVADOR`, `INFORME`, `OTRO`), con etiquetas en español en `src/lib`.
- Al desconectar, `refreshTokenCifrado` pasa a `null` y la fila se conserva: así las solicitudes no quedan huérfanas y la reconexión de la misma cuenta (comparando `correoGoogle`) las restablece. Si se reconecta **otra** cuenta de Google, las carpetas de las solicitudes anteriores no son accesibles con `drive.file`: el sistema avisa y pide elegir carpeta otra vez en las solicitudes abiertas.
- Las reglas de integridad (versión consecutiva, destinataria con rol `DOCENTE`) se validan en el servicio. Los índices únicos van en SQL, como en la línea base.
- **Ajuste de implementación (2026-11-11):** `integracionId` es opcional en la base para permitir solicitudes ficticias del seed sin conexión de Google, como exige la spec de demo. El servicio de creación real exige una integración `CONECTADA`; las solicitudes demo no aceptan subidas hasta asignar una integración y carpeta válidas. 🔶 La ruta operativa de habilitación de una solicitud demo queda por confirmar.

### D6. Subida: la docente → servidor → Drive, sin persistir
`POST /api/entregas/[entregaId]/archivo` recibe `multipart/form-data` (`request.formData()`), valida la sesión, que la cuenta sea la destinataria, el estado `ABIERTA`, la extensión, la firma de bytes y el tamaño (≤ 20 MB), calcula el SHA-256 y sube a Drive con **multipart upload** hasta 5 MB y **resumable upload** por encima de 5 MB (`parents=[carpetaDriveId]`, `supportsAllDrives=true`). Luego registra `ArchivoEntrega` con `subidoEn = now()` del servidor dentro de una transacción que asigna la siguiente `version`.
- El archivo vive solo en memoria durante la petición (máximo 20 MB). No se escribe a disco ni a la base.
- *Alternativa descartada:* subida resumable directa desde el navegador a Drive con una URL de sesión creada por el servidor. Ahorra pasar el archivo por el servidor, pero expone una URL con permiso de escritura al cliente y complica la validación de contenido. Para planillas de pocos MB no compensa. Si aparecen archivos grandes en Heroku (límite de 30 s), se revisa.
- **Orden ante fallos:** primero Drive, después la base. Si Drive responde pero la base falla, queda un archivo huérfano en Drive (es visible, inocuo y se registra en el log). Es preferible eso a un registro sin archivo.
- **Nombre:** `<título> — <apellidos nombres> — <AAAA-MM-DD>[ _vN].<ext>` con la fecha de Colombia, sin `/\:*?"<>|` ni caracteres de control y limitado a 200 caracteres. Lo genera una función pura probada.
- **Límite del cuerpo de la petición:** consultar en la documentación de Next 16 el límite por defecto de Route Handlers y Server Actions (`serverActions.bodySizeLimit` aplica solo a las acciones) y configurar Caddy para aceptar 21 MB.

### D7. Errores de Drive y conexión revocada
Un `invalid_grant` al refrescar marca la integración como `REVOCADA` (spec). Las respuestas 404 o 403 de Drive sobre la carpeta marcan `ultimoFalloEn` en la entrega y muestran a la docente el mensaje genérico. Los detalles van al log del servidor, sin tokens ni contenido. No hay reintentos automáticos en la primera versión.

### D8. Google Picker en el cliente
Un componente cliente `SelectorCarpetaDrive` carga `https://apis.google.com/js/api.js` bajo demanda, pide `/token-picker` y abre `google.picker` con `DocsView(ViewId.FOLDERS).setSelectFolderEnabled(true).setMimeTypes('application/vnd.google-apps.folder')`, `setOAuthToken`, `setDeveloperKey` y `setAppId`. `setAppId` es imprescindible para que `drive.file` conceda acceso a la carpeta elegida. Del resultado se guardan `id` y `name` en campos ocultos del formulario. Hoy no hay CSP en `next.config.ts` ni en el Caddyfile; si se agrega, hay que permitir `apis.google.com` y `docs.google.com`. El `X-Frame-Options: DENY` actual no afecta al Picker, porque el Picker es un iframe de Google dentro de MIDUHO y no al revés.

### D9. Ubicación en la UI
- **Coordinación:** una tercera tarjeta, «Entregas», en `/admin/coordinacion`, más las rutas `/admin/entregas`, `/nueva` y `/[id]`. No va dentro de «Asignaciones», que ya significa carga docente. Las páginas son delgadas; la lógica va en `src/server/modules/entregas/` (servicio y esquemas Zod) y la UI en `src/features/entregas/`.
- **Docente:** un panel en `/cuenta`, `/cuenta/entregas` y `/cuenta/entregas/[id]`, más un aviso en `/` («Hoy»). No se agrega una entrada nueva al menú de la docente: la tesis es encontrar las cosas sin buscarlas, y el aviso en Hoy cumple ese papel.
- La UI se diseña con la skill `impeccable`, usando los componentes `friso` y `admin-*` existentes.

### D10. Spike primero
Antes de construir sobre el Picker, hay que comprobar con una cuenta de Gmail personal de prueba que, con `drive.file` y una carpeta elegida en el Picker (con `setAppId`), un `files.create` con `parents=[carpeta]` funciona **desde el servidor, con el refresh token y horas después**. Si falla, se aplica el plan B de D1 y se ajusta la spec «Carpeta elegida con el Picker».

🔶 **Estado del spike (2026-11-11): pendiente de prueba externa.** Se implementó el flujo y se verificó con dobles de prueba, pero las variables de Google en desarrollo aún no tienen valores y no se ha elegido una carpeta real ni probado la subida al día siguiente. No se infiere un resultado favorable de las pruebas locales.

## Risks / Trade-offs

- **[Riesgo] El permiso sobre la carpeta elegida no se conserva para escribir desde el servidor.** → Mitigación: spike D10 como primera tarea; el plan B ya está definido.
- **[Riesgo] Falta un dominio verificado para publicar la app**, y en modo «Prueba» el token caduca cada 7 días. → Mitigación: la UI de «Conexión revocada» y la reconexión rápida; la tarea de operación documenta la publicación. 🔶 Hay que definir el dominio de producción.
- **[Riesgo] Los archivos quedan en el Drive personal de la coordinadora**, y si deja el colegio se los lleva. → Mitigación: documentar en `docs/operacion.md` la transferencia de carpeta y de cada archivo, porque cambiar el propietario de la carpeta no cambia la propiedad de su contenido en Drive personal; es una decisión asumida por el usuario.
- **[Riesgo] Datos de menores en tránsito.** → Mitigación: el archivo solo está en memoria durante la petición, viaja por TLS, no queda en la base ni en el disco y nunca se registra en logs. Solo se guardan metadatos y el hash.
- **[Riesgo] Límite de 30 s de Heroku con archivos grandes o conexiones lentas.** → Mitigación: tope de 20 MB. Es aceptable en la demo; en producción con Caddy no existe ese tope.
- **[Riesgo] Archivo huérfano en Drive si la base falla después de subir.** → Mitigación: se registra en el log con `driveFileId`. Es raro e inocuo.
- **[Trade-off] Sin notificaciones por correo**, la docente se entera al entrar a la plataforma. El aviso en Hoy reduce el problema; el correo vía el SMTP existente (`src/server/correo.ts`) es una extensión natural en un cambio posterior.
- **[Trade-off] El estado derivado se calcula en cada lectura.** Con decenas de docentes y solicitudes, el costo es despreciable.

## Migration Plan

1. Migración Prisma solo aditiva: modelos y enums nuevos, sin tocar tablas existentes. El rollback consiste en revertir el despliegue; las tablas nuevas pueden quedar.
2. Agregar las variables nuevas a `.env.production.example` y a Heroku. Sin ellas, la sección muestra «Integración no configurada» y el resto de la plataforma no cambia.
3. Crear el proyecto de Google Cloud: habilitar Drive API y Picker API, crear el cliente OAuth web con la URI de retorno, crear una clave de API restringida por referrer a Picker API, y configurar la pantalla de consentimiento con `drive.file` y publicarla.
4. Desplegar. La coordinadora conecta Drive desde Cuenta y crea la primera solicitud.

## Open Questions

- 🔶 ¿Cuál es el dominio de producción para la verificación de marca de Google y la política de privacidad?
- 🔶 ¿Basta con 20 MB, o hay planillas con imágenes que pesen más?
- 🔶 ¿Quién es la persona real que administra el proyecto de Google Cloud (credenciales y facturación, aunque el uso sea gratuito)?
