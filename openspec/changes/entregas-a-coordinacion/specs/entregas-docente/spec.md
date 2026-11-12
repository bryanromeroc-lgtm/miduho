## ADDED Requirements

### Requirement: Mis entregas en el perfil de la docente
`/cuenta/entregas` SHALL listar, para una cuenta con rol `DOCENTE`, las solicitudes no archivadas en las que es destinataria. Cada una muestra el título, el tipo de documento, la fecha y hora de cierre en formato es-CO y hora de Colombia, el tiempo restante o vencido y su estado (Pendiente, Sin entregar, Entregada, Tardía, con el mismo criterio que el tablero de coordinación). Las pendientes y sin entregar van primero, por cierre más próximo. `/cuenta` MUST mostrar a la docente un panel «Entregas a coordinación» con el número de pendientes y un enlace a `/cuenta/entregas`. Una docente MUST NOT ver solicitudes de las que no es destinataria, ni el estado de otras docentes.

#### Scenario: Pendiente
- **WHEN** una docente es destinataria de «Notas Período 1», que cierra el viernes a las 6:00 p. m., y no ha subido nada
- **THEN** ve «Notas Período 1 · Planilla de notas · Cierra vie. 14 nov., 6:00 p. m. · Pendiente»

#### Scenario: Ajena
- **WHEN** una docente abre `/cuenta/entregas/[id]` de una solicitud en la que no es destinataria
- **THEN** recibe 404 y ningún dato de la solicitud

#### Scenario: Otros roles
- **WHEN** una cuenta sin rol `DOCENTE` abre `/cuenta/entregas`
- **THEN** es redirigida a `/cuenta?sinPermiso=1`

### Requirement: Aviso en Hoy
El inicio de la docente (`/`) SHALL mostrar un aviso cuando tenga entregas Pendientes o Sin entregar, con la de cierre más próximo. Por ejemplo: «Coordinación: Notas Período 1 cierra en 2 días», más «y N más» si hay varias, y un enlace a la entrega. Sin entregas por hacer, el aviso MUST NOT aparecer.

#### Scenario: Con pendiente
- **WHEN** una docente con una entrega pendiente que cierra en 2 días abre `/`
- **THEN** ve el aviso con el título, el plazo y un enlace a la entrega

#### Scenario: Todo entregado
- **WHEN** una docente ya entregó todas sus solicitudes
- **THEN** `/` no muestra el aviso

### Requirement: Subir el documento
`/cuenta/entregas/[id]` SHALL mostrar la descripción de la solicitud, los formatos permitidos, el tamaño máximo (20 MB) y un control para elegir y subir un archivo, operable con teclado y con etiqueta visible. El servidor MUST:
1. verificar que la cuenta es destinataria y que la solicitud no está archivada;
2. validar la extensión contra los formatos permitidos y el contenido por su firma (`.xlsx` y `.docx` como ZIP, `.xls` como OLE2, `.pdf` por `%PDF`, `.csv` como texto UTF-8 sin bytes nulos), además del tamaño máximo;
3. subir el archivo a la carpeta de Drive de la solicitud con la integración de coordinación, con el nombre uniforme `<Título> — <Apellidos Nombres> — <AAAA-MM-DD>[ _vN].<ext>`, sin caracteres no válidos;
4. registrar la versión con la hora del servidor, el identificador del archivo en Drive, el nombre original, el tamaño y el SHA-256.

El contenido del archivo MUST NOT guardarse en la base ni en el disco del servidor más allá de la petición. Durante la subida, la página MUST anunciar el progreso a lectores de pantalla y, al terminar, MUST confirmar «Entregado el <fecha y hora>».

#### Scenario: Entrega a tiempo
- **WHEN** la docente sube `notas.xlsx` (2 MB) antes del cierre
- **THEN** el archivo aparece en la carpeta elegida por coordinación como «Notas Período 1 — Apellidos Nombres — 2026-11-12.xlsx», y la docente ve «Entregada · 12 nov., 3:40 p. m.»

#### Scenario: Formato no permitido
- **WHEN** la docente sube un `.pdf` a una solicitud que solo permite `.xlsx` y `.xls`
- **THEN** el servidor lo rechaza con «Este documento debe ser Excel (.xlsx o .xls)» y no llama a Drive

#### Scenario: Extensión falsa
- **WHEN** la docente sube un archivo con extensión `.xlsx` que no es un ZIP
- **THEN** el servidor lo rechaza con «El archivo no parece un Excel válido»

#### Scenario: Muy grande
- **WHEN** el archivo pesa más de 20 MB
- **THEN** se rechaza con «El archivo supera 20 MB»

### Requirement: Entrega tardía permitida
Una subida posterior a la fecha y hora de cierre SHALL aceptarse siempre (mientras la solicitud no esté archivada) y quedar marcada como tardía según la hora del servidor. Antes de subir después del cierre, la página MUST avisar «El plazo cerró el <fecha>; tu entrega quedará como tardía», sin impedir la subida.

#### Scenario: Después del cierre
- **WHEN** la docente sube el archivo 1 día después del cierre
- **THEN** el archivo llega a Drive, y tanto ella como coordinación ven «Tardía · 1 día después del cierre»

### Requirement: Reemplazar con versiones
La docente SHALL poder subir el archivo de nuevo. Cada subida MUST crear un archivo nuevo en Drive con el sufijo `_v2`, `_v3`…; las versiones anteriores no se borran ni se sobrescriben. La última versión es la vigente, y el estado de la entrega se calcula con ella: si la última llega después del cierre, la entrega es tardía aunque una anterior haya llegado a tiempo. La página MUST listar las versiones con su hora y advertir, antes de subir después del cierre teniendo una versión a tiempo, que la entrega pasará a tardía.

#### Scenario: Corrección a tiempo
- **WHEN** la docente subió la v1 el martes y la v2 el jueves, y el cierre es el viernes
- **THEN** en Drive están ambas, con `_v2` en la segunda, y la entrega figura «Entregada» con la hora del jueves

#### Scenario: Corrección tarde
- **WHEN** la docente tenía la v1 a tiempo y sube la v2 después del cierre
- **THEN** ve antes la advertencia, y tras subir la entrega figura «Tardía»

### Requirement: Fallo de Drive al subir
Si la subida a Drive falla (conexión de coordinación revocada o ausente, carpeta borrada o sin permiso, error de Google), el servidor SHALL responder sin registrar la versión, registrar la hora del intento fallido en la entrega y mostrar a la docente un mensaje accionable que no exponga detalles técnicos. Por ejemplo: «No se pudo guardar en el Drive de coordinación. Ya les avisamos; intenta más tarde». Si la causa es la conexión revocada, la integración MUST pasar a «Conexión revocada».

#### Scenario: Carpeta eliminada
- **WHEN** la coordinadora borró en Drive la carpeta de la solicitud y una docente sube su archivo
- **THEN** la docente ve el mensaje de fallo, no se registra la versión y el tablero de coordinación muestra en su fila «Último intento falló · <hora>»

### Requirement: Datos ficticios en la demo
El seed SHALL poder crear solicitudes de entrega de demostración con títulos genéricos («Planilla de notas · Período 1») asignadas a las docentes ficticias existentes, sin integración de Google ni archivos reales. El seed MUST NOT generar nombres ni datos de estudiantes.

#### Scenario: Seed
- **WHEN** se ejecuta el seed de demostración
- **THEN** las docentes ficticias ven entregas pendientes y ningún archivo, ni dato de estudiante, aparece en la base
