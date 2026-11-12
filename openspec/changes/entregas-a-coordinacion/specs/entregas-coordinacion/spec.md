## ADDED Requirements

### Requirement: Sección Entregas en Coordinación
`/admin/coordinacion` SHALL mostrar una tarjeta «Entregas», después de «Estructura» y «Asignaciones», que lleve a `/admin/entregas`. La tarjeta muestra el número de solicitudes abiertas y, como alerta, la que cierra más pronto y si la conexión de Drive está sin conectar o revocada. Las rutas `/admin/entregas/**` MUST autorizar el rol `ADMIN` en el servidor; las demás cuentas son redirigidas a `/cuenta?sinPermiso=1`. Las migas MUST ser Administración › Coordinación › Entregas.

#### Scenario: Tarjeta
- **WHEN** una cuenta `ADMIN` abre `/admin/coordinacion` con 2 solicitudes abiertas
- **THEN** ve la tarjeta «Entregas» con «2 solicitudes abiertas» y un enlace a `/admin/entregas`

#### Scenario: Drive revocado
- **WHEN** la integración de la coordinadora está «Conexión revocada»
- **THEN** la tarjeta «Entregas» muestra la alerta «Drive desconectado: las docentes no pueden subir»

#### Scenario: Docente
- **WHEN** una cuenta sin rol `ADMIN` abre `/admin/entregas`
- **THEN** es redirigida a `/cuenta?sinPermiso=1`

### Requirement: Crear una solicitud de entrega
En `/admin/entregas/nueva`, la coordinadora SHALL crear una solicitud con:
- título (obligatorio, 3–120 caracteres);
- descripción (opcional, hasta 2000 caracteres, texto plano);
- tipo de documento, del catálogo: Planilla de notas, Planeación, Observador del estudiante, Informe, Otro;
- formatos permitidos, uno o más de `.xlsx`, `.xls`, `.csv`, `.pdf`, `.docx` (por defecto `.xlsx` y `.xls`);
- fecha y hora de cierre, interpretadas en la hora de Colombia (America/Bogota);
- período opcional del año lectivo activo;
- destinatarias: «Todas las docentes activas» o una selección de docentes activas (al menos una);
- carpeta de destino en su Google Drive, elegida con el Google Picker (solo carpetas).

La creación MUST exigir una integración de Drive conectada y una carpeta elegida. La validación MUST hacerse en el servidor (Zod) y los errores MUST mostrarse junto a cada campo. Al crearla, el sistema MUST generar una entrega pendiente para cada destinataria. La lista de destinatarias queda fija; las docentes que se activen después no se agregan solas.

#### Scenario: Solicitud válida
- **WHEN** la coordinadora completa los campos, elige la carpeta «Notas 2026» y guarda
- **THEN** la solicitud aparece en `/admin/entregas` como abierta, con una entrega pendiente por cada destinataria y la carpeta «Notas 2026» como destino

#### Scenario: Sin carpeta
- **WHEN** la coordinadora intenta guardar sin elegir carpeta
- **THEN** el formulario muestra «Elige la carpeta de Drive donde se guardarán los archivos» y no crea la solicitud

#### Scenario: Sin Drive conectado
- **WHEN** la coordinadora abre `/admin/entregas/nueva` sin integración conectada
- **THEN** ve el aviso «Conecta Google Drive desde Cuenta para crear entregas», con un enlace a `/cuenta`, y el formulario no permite guardar

#### Scenario: Cierre en el pasado
- **WHEN** la fecha y hora de cierre es anterior al momento actual
- **THEN** el servidor rechaza la solicitud con «La fecha de cierre ya pasó»

### Requirement: Carpeta elegida con el Picker
El selector de carpeta SHALL abrir el Google Picker con el Drive de la coordinadora, mostrando solo carpetas y permitiendo elegir una. La solicitud MUST guardar el identificador y el nombre de la carpeta. Los archivos de las docentes MUST subirse directamente a esa carpeta, sin crear subcarpetas. Si el Picker no puede cargarse, la página MUST mostrar un mensaje claro en lugar de fallar en silencio. El Picker y su botón MUST ser operables con teclado.

#### Scenario: Elegir carpeta
- **WHEN** la coordinadora elige «Notas 2026» en el Picker
- **THEN** el formulario muestra «Carpeta: Notas 2026» con la opción «Cambiar»

#### Scenario: Picker bloqueado
- **WHEN** el navegador bloquea el script de Google
- **THEN** la página dice «No se pudo abrir el selector de Google Drive. Revisa la conexión o los bloqueadores e inténtalo de nuevo»

### Requirement: Editar y archivar una solicitud
La coordinadora SHALL poder editar el título, la descripción, el tipo, los formatos, el período, la fecha de cierre (incluso a una fecha posterior, para ampliar el plazo) y la carpeta de una solicitud. También puede agregar destinatarias o quitar las que no han subido nada. Cambiar la carpeta MUST afectar solo a las subidas futuras, y los archivos ya subidos no se mueven. Cambiar la fecha de cierre MUST recalcular la marca de tardía de cada versión según la nueva fecha. Una solicitud puede **archivarse**: deja de mostrarse a las docentes y no acepta subidas. Se puede eliminar solo si nadie ha subido archivos.

#### Scenario: Ampliar plazo
- **WHEN** la coordinadora mueve el cierre del viernes al lunes
- **THEN** las docentes ven la nueva fecha, y una entrega hecha el sábado deja de figurar como tardía

#### Scenario: Quitar destinataria con archivo
- **WHEN** la coordinadora intenta quitar a una docente que ya subió un archivo
- **THEN** el servidor lo rechaza con «Esta docente ya entregó; no se puede quitar»

#### Scenario: Archivar
- **WHEN** la coordinadora archiva una solicitud
- **THEN** desaparece de las entregas de las docentes y sus intentos de subida reciben «Esta entrega ya no está abierta»

### Requirement: Listado de solicitudes
`/admin/entregas` SHALL listar las solicitudes con título, tipo, fecha y hora de cierre (formato es-CO), carpeta de destino y cumplimiento resumido (por ejemplo «18 de 22 entregadas · 2 tardías»). Las abiertas aparecen primero, ordenadas por el cierre más próximo; las archivadas van en un filtro aparte. Las cifras MUST salir de la base, nunca estimadas.

#### Scenario: Orden
- **WHEN** hay una solicitud que cierra mañana y otra que cierra en un mes
- **THEN** la que cierra mañana aparece primero

### Requirement: Tablero de cumplimiento
`/admin/entregas/[id]` SHALL mostrar los datos de la solicitud y una tabla con una fila por destinataria: nombre, estado, hora de la última subida, número de versiones, tiempo de retraso si es tardía, y un enlace «Abrir en Drive» a la última versión, que se abre en una pestaña nueva. Los estados son:
- **Pendiente**: sin archivo y antes del cierre.
- **Sin entregar**: sin archivo y después del cierre.
- **Entregada**: la última versión llegó antes del cierre o en el mismo instante.
- **Tardía**: la última versión llegó después del cierre.

Los estados MUST distinguirse por texto, no solo por color. La tabla MUST poder filtrarse por estado y ordenarse por nombre o por hora de entrega. Si la última subida de una docente falló por Drive, la fila MUST mostrarlo.

#### Scenario: Resumen
- **WHEN** de 22 destinatarias, 18 subieron antes del cierre, 2 después y 2 nada, y el cierre ya pasó
- **THEN** el tablero muestra «18 entregadas · 2 tardías · 2 sin entregar», con esos mismos estados por fila

#### Scenario: Tardía con retraso
- **WHEN** una docente subió 2 horas y 10 minutos después del cierre
- **THEN** su fila dice «Tardía · 2 h 10 min después del cierre»

#### Scenario: Abrir en Drive
- **WHEN** la coordinadora activa «Abrir en Drive» en una fila entregada
- **THEN** se abre en una pestaña nueva el archivo de la última versión en su Google Drive
