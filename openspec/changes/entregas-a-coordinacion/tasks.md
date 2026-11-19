## 1. Spike y preparación

- [ ] 1.1 Spike D10: con un Gmail personal de prueba y un cliente OAuth en modo «Prueba», elegir una carpeta en el Picker (`setAppId`) y comprobar que `files.create` con `parents=[carpeta]` funciona desde el servidor con el refresh token (al momento y al día siguiente). Registrar el resultado en `design.md` y, si falla, aplicar el plan B de D1
- [x] 1.2 Leer en `apps/web/node_modules/next/dist/docs/` las guías de Route Handlers (cuerpo multipart, límites de tamaño, cookies) y de Server Actions en Next 16
- [x] 1.3 Agregar las variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_API_KEY`, `GOOGLE_APP_ID` y `CLAVE_CIFRADO_INTEGRACIONES` a `.env.production.example` y al `.env` de desarrollo, con comentarios de cómo generarlas

## 2. Modelo de datos

- [x] 2.1 Agregar a `prisma/schema.prisma` los enums `EstadoIntegracion`, `TipoDocumentoEntrega` y `EstadoSolicitudEntrega`, y los modelos `IntegracionGoogle`, `SolicitudEntrega`, `EntregaDocente` y `ArchivoEntrega` con sus relaciones (D5)
- [x] 2.2 Crear la migración PostgreSQL con los índices únicos (`usuarioId`; `solicitudId+docenteId`; `entregaId+version`) y verificarla contra la base de desarrollo
- [x] 2.3 Agregar al seed solicitudes de demostración con títulos genéricos para las docentes ficticias, sin integración ni archivos ni datos de estudiantes

## 3. Lógica pura (`src/lib/entregas.ts`)

- [x] 3.1 `estadoEntrega({ cierraEn, ultimaSubida, ahora })` → Pendiente | Sin entregar | Entregada | Tardía, más el retraso; con pruebas, incluido el cierre exacto y la ampliación del plazo
- [x] 3.2 `nombreArchivoDrive(titulo, docente, fecha, version, ext)` con fecha de Colombia, saneamiento de caracteres y tope de 200; con pruebas
- [x] 3.3 `formatoRetraso` y `formatoCierre` (es-CO, America/Bogota) y las etiquetas de `TipoDocumentoEntrega`; con pruebas
- [x] 3.4 Validación de la firma de bytes por formato (ZIP, OLE2, `%PDF`, CSV de texto) y del tamaño máximo; con pruebas

## 4. Integración con Google (`src/server/integraciones/google/`)

- [x] 4.1 Cifrado AES-256-GCM `cifrar`/`descifrar` con formato `v1:iv:tag:cifrado` y deshabilitación sin clave en producción; con pruebas
- [x] 4.2 Cliente OAuth con `fetch`: URL de autorización con PKCE S256, intercambio de código, refresco (detecta `invalid_grant`), revocación y `userinfo`
- [x] 4.3 Interfaz `ClienteDrive` con `subir` (multipart, `parents`) y `obtenerCarpeta`, su implementación real y una falsa para pruebas; caché en memoria del access token
- [x] 4.4 Route Handlers `iniciar`, `retorno`, `desconectar` y `token-picker` bajo `src/app/api/integraciones/google/`, con guarda `ADMIN`, cookie de `state`/verificador de un solo uso y `Cache-Control: no-store`
- [x] 4.5 Pruebas de integración: state inválido o reutilizado, cancelación, falta de `drive.file`, rechazo de `DOCENTE` y desconexión que conserva solicitudes

## 5. Servicio de entregas (`src/server/modules/entregas/`)

- [x] 5.1 Esquemas Zod de crear y editar solicitud (título, descripción, tipo, formatos, cierre en hora de Colombia, período, destinatarias, carpeta) y de filtros
- [x] 5.2 Servicio: crear (genera las entregas por destinataria y exige integración conectada), editar (agregar o quitar destinatarias con la regla «ya entregó», cambiar carpeta y cierre), archivar y eliminar solo sin archivos
- [x] 5.3 Consultas: listado con cumplimiento resumido, tablero por solicitud, entregas de una docente y pendientes para el aviso de Hoy
- [x] 5.4 Subida: autorización de destinataria, validaciones, SHA-256, `ClienteDrive.subir`, asignación transaccional de `version`, registro de `ultimoFalloEn` y paso a `REVOCADA` ante `invalid_grant`
- [x] 5.5 Route Handler `POST /api/entregas/[entregaId]/archivo` (multipart, ≤ 20 MB, sin escribir a disco) y el ajuste del límite de cuerpo en el Caddyfile
- [x] 5.6 Pruebas de integración del servicio con `ClienteDrive` falso: a tiempo, tardía, versiones `_v2`, formato no permitido, extensión falsa, ajena (404), archivada, fallo de Drive y ampliación del plazo

## 6. UI de coordinación (con la skill impeccable)

- [x] 6.1 Panel «Google Drive» en `/cuenta` para `ADMIN`: estados Sin conectar, Conectado como… y Conexión revocada; conectar, desconectar con confirmación y avisos de retorno
- [x] 6.2 Tarjeta «Entregas» en `/admin/coordinacion` (cifra de abiertas, la de cierre más próximo y alerta de Drive) y la ruta en `SECCIONES_ADMINISTRACION`
- [x] 6.3 `/admin/entregas`: listado con filtro de abiertas o archivadas, ordenado por cierre más próximo
- [x] 6.4 Componente `SelectorCarpetaDrive` (Picker bajo demanda, solo carpetas, manejo del fallo de carga, operable con teclado)
- [x] 6.5 `/admin/entregas/nueva` y la edición: formulario con errores por campo, selección de destinatarias y aviso sin Drive conectado
- [x] 6.6 `/admin/entregas/[id]`: tablero con estados por texto, filtro y orden, retraso, número de versiones, «Último intento falló», «Abrir en Drive» y acciones de archivar o eliminar

## 7. UI de la docente (con la skill impeccable)

- [x] 7.1 Panel «Entregas a coordinación» en `/cuenta` para `DOCENTE`, con el número de pendientes
- [x] 7.2 `/cuenta/entregas`: listado propio con estado y plazo
- [x] 7.3 `/cuenta/entregas/[id]`: descripción, formatos y tamaño, control de archivo accesible, progreso anunciado (`aria-live`), confirmación, aviso de tardía y de paso a tardía, y lista de versiones
- [x] 7.4 Aviso en `/` (Hoy) con la entrega de cierre más próximo y «y N más»

## 8. Operación, accesibilidad y verificación

- [x] 8.1 Documentar en `docs/operacion.md` la creación del proyecto de Google Cloud (APIs, cliente OAuth, clave restringida, consentimiento publicado con `drive.file`), las variables, la transferencia de la carpeta si cambia la coordinadora y la nota de Ley 1581
- [ ] 8.2 Auditoría WCAG 2.1 AA (skill a11y-audit) de las rutas nuevas: contraste, foco visible, teclado y estados no dependientes del color
- [ ] 8.3 Prueba manual de punta a punta con una cuenta de Google de prueba: conectar, elegir carpeta, crear solicitud, subir como docente a tiempo y tarde, revocar desde Google y reconectar
- [x] 8.4 `npm run build`, `npm run lint` y `npm test` en verde
