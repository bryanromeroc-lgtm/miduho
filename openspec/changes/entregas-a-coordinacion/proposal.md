## Why

A lo largo del año, coordinación pide a las docentes documentos (sobre todo planillas de Excel) con fecha y hora límite, y ellas los suben a una carpeta del Google Drive de la coordinadora. Hoy eso se coordina por fuera de la plataforma: la coordinadora no ve de un vistazo quién entregó, quién va tarde ni quién falta, y la docente no tiene en MIDUHO un lugar donde ver qué le piden ni hasta cuándo. Llevar la solicitud y la entrega a la plataforma cierra ese ciclo sin cambiar el lugar donde coordinación guarda los archivos, que sigue siendo su Drive.

## What Changes

- **Conexión con Google Drive desde Cuenta (rol `ADMIN`).** La coordinadora conecta su cuenta de Google, que es un Gmail personal, con el permiso mínimo `drive.file`. Puede ver el estado de la conexión, desconectarla y volver a conectarla. Gmail no se integra: no se envían ni se leen correos.
- **Solicitudes de entrega en Coordinación.** Se agrega una tarjeta nueva, «Entregas», en `/admin/coordinacion`, separada de «Asignaciones» (carga docente). La coordinadora crea una solicitud con título, descripción, tipo de documento, formatos permitidos (Excel por defecto), fecha y hora de cierre, destinatarias (todas las docentes activas o una selección) y **la carpeta de su Drive, elegida con el Google Picker**. Los archivos de las docentes se suben directamente a esa carpeta, sin subcarpetas.
- **Tablero de cumplimiento por solicitud:** a tiempo, tardías y sin entregar, con la hora de cada entrega y un enlace al archivo en Drive.
- **Entregas en el perfil de la docente.** La docente ve sus entregas pendientes en un aviso en «Hoy» y en «Cuenta», y sube el archivo desde la plataforma. **No necesita cuenta de Google:** el servidor reenvía el archivo al Drive de la coordinadora y no guarda copia.
- **Entrega tardía permitida, nunca bloqueada.** La hora que cuenta es la del servidor. Lo que llega después del cierre queda marcado como «tardía», con el tiempo de retraso.
- **Reemplazo con versiones:** la docente puede volver a subir el archivo. Cada subida es un archivo nuevo en Drive (`_v2`, `_v3`…) y la última versión es la vigente.
- **Nombre uniforme en Drive:** `<Solicitud> — <Apellidos Nombres> — <AAAA-MM-DD>[ _vN].<ext>`.

## Capabilities

### New Capabilities

- `integracion-google-drive`: conectar, desconectar y verificar la cuenta de Google Drive de una cuenta `ADMIN`. Cubre la custodia cifrada de credenciales, el token de corta vida para el Picker y la detección de una conexión revocada.
- `entregas-coordinacion`: solicitudes de entrega creadas por coordinación (datos, carpeta de Drive, destinatarias, edición, archivo) y el tablero de cumplimiento.
- `entregas-docente`: la vista de la docente con sus entregas, la subida del archivo al Drive de coordinación, las versiones y la marca de tardía.

### Modified Capabilities

(ninguna: la tarjeta en Coordinación y el aviso en «Hoy» se especifican dentro de las capacidades nuevas)

## Impact

- **Base de datos (Prisma):** tres modelos nuevos (`IntegracionGoogle`, `SolicitudEntrega`, `EntregaDocente`) y uno más para las versiones (`ArchivoEntrega`), con una migración de PostgreSQL.
- **Servidor:** un módulo nuevo `src/server/modules/entregas/` y un cliente de Google (OAuth y Drive REST v3 con `fetch`, sin SDK) en `src/server/integraciones/google/`. Se agregan Route Handlers para el flujo OAuth, el token del Picker y la subida de archivos.
- **Rutas:** `/admin/entregas`, `/admin/entregas/nueva` y `/admin/entregas/[id]` para coordinación; `/cuenta/entregas` y `/cuenta/entregas/[id]` para la docente. Se agregan un panel en `/cuenta` y un aviso en `/`.
- **Configuración y secretos nuevos:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_API_KEY` (Picker, restringida por origen), `GOOGLE_APP_ID` y `CLAVE_CIFRADO_INTEGRACIONES`. Hay que actualizar `.env.production.example` y `docs/operacion.md`.
- **Externo:** un proyecto en Google Cloud con la pantalla de consentimiento **publicada («En producción»)** para que el permiso no caduque a los 7 días. Para eso hacen falta una política de privacidad y un dominio propio 🔶.
- **Privacidad:** las planillas pueden contener datos de estudiantes menores de edad (Ley 1581 de 2012). El servidor no persiste el contenido de los archivos.
- **Fuera de alcance:** devolver un archivo para corrección, notificaciones por correo, solicitudes «una por grupo», un rol de coordinación separado de `ADMIN` y que la docente descargue sus propios archivos.
