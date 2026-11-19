## ADDED Requirements

### Requirement: Conectar Google Drive desde Cuenta
La página `/cuenta` SHALL mostrar a una cuenta con rol `ADMIN` un panel «Google Drive» con el estado de su conexión: «Sin conectar», «Conectado como <correo de Google>» o «Conexión revocada». Desde «Sin conectar» o «Conexión revocada», la acción «Conectar Google Drive» MUST iniciar el flujo OAuth 2.0 de Google con PKCE y un parámetro `state` de un solo uso ligado a la sesión, solicitando acceso sin conexión y **únicamente** los permisos `https://www.googleapis.com/auth/drive.file`, `openid` y `email`. Las cuentas sin rol `ADMIN` MUST NOT ver el panel, y las rutas del flujo MUST rechazarlas en el servidor.

#### Scenario: Coordinadora sin conexión
- **WHEN** una cuenta `ADMIN` sin integración abre `/cuenta`
- **THEN** ve el panel «Google Drive» con el estado «Sin conectar» y el botón «Conectar Google Drive»

#### Scenario: Permisos mínimos
- **WHEN** la coordinadora activa «Conectar Google Drive»
- **THEN** es redirigida al consentimiento de Google con los permisos `drive.file`, `openid` y `email` y ningún otro (ni `drive` completo ni Gmail)

#### Scenario: Docente
- **WHEN** una cuenta con solo el rol `DOCENTE` abre `/cuenta` o llama a la ruta que inicia el flujo
- **THEN** no ve el panel, y la ruta responde 403 sin redirigir a Google

### Requirement: Retorno del consentimiento
La ruta de retorno SHALL validar que el `state` coincide con el emitido para esa sesión y no se ha usado, intercambiar el código por credenciales con el verificador PKCE y guardar la integración de esa cuenta con el correo de Google, los permisos concedidos y el refresh token **cifrado**. Si Google no concede `drive.file`, o la persona cancela, MUST NOT guardarse una integración activa, y `/cuenta` MUST explicar qué pasó.

#### Scenario: Consentimiento concedido
- **WHEN** la coordinadora acepta el consentimiento y Google redirige con un código y un `state` válidos
- **THEN** la integración queda «Conectada como <correo>» y vuelve a `/cuenta` con un aviso de éxito

#### Scenario: State inválido o reutilizado
- **WHEN** la ruta de retorno recibe un `state` que no corresponde a la sesión o que ya se usó
- **THEN** responde con error, no intercambia el código y no modifica la integración

#### Scenario: Cancelación
- **WHEN** la coordinadora cancela en Google
- **THEN** vuelve a `/cuenta` con el aviso «No se conectó Google Drive» y el estado anterior se mantiene

### Requirement: Custodia de credenciales
El refresh token SHALL guardarse cifrado con AES-256-GCM usando la clave de `CLAVE_CIFRADO_INTEGRACIONES`. Ni el refresh token ni los access tokens MUST aparecer en registros, respuestas HTTP (salvo el token de corta vida del Picker) ni en el HTML de las páginas. Si falta la clave en producción, la conexión MUST quedar deshabilitada con un mensaje de configuración, sin caer a texto plano.

#### Scenario: Token en reposo
- **WHEN** se inspecciona la fila de la integración en la base
- **THEN** el refresh token aparece cifrado y no coincide con el valor en claro

#### Scenario: Falta la clave
- **WHEN** el servidor arranca en producción sin `CLAVE_CIFRADO_INTEGRACIONES`
- **THEN** el panel «Google Drive» dice que la integración no está configurada y no ofrece conectar

### Requirement: Desconectar
La coordinadora SHALL poder desconectar Google Drive desde `/cuenta`, previa confirmación. Al desconectar, el sistema MUST revocar el token ante Google (con mejor esfuerzo) y borrar las credenciales guardadas. Las solicitudes de entrega existentes MUST conservarse, pero las subidas a ellas MUST fallar con el aviso de conexión de la docente hasta que se reconecte.

#### Scenario: Desconexión
- **WHEN** la coordinadora confirma «Desconectar»
- **THEN** el panel vuelve a «Sin conectar», el refresh token se borra de la base y las solicitudes siguen listadas en `/admin/entregas`

### Requirement: Conexión revocada
Si Google responde `invalid_grant` al refrescar el token (porque se revocó el acceso desde la cuenta de Google o cambió la contraseña), la integración SHALL pasar al estado «Conexión revocada». Ese estado MUST verse en `/cuenta`, en la tarjeta «Entregas» de Coordinación y en `/admin/entregas`, con la acción «Volver a conectar». Reconectar con la misma cuenta de Google MUST restablecer las solicitudes existentes sin volver a elegir carpetas.

#### Scenario: Acceso revocado desde Google
- **WHEN** la coordinadora quita el acceso de MIDUHO en su cuenta de Google y luego una docente intenta subir un archivo
- **THEN** la subida falla, la integración queda «Conexión revocada» y coordinación ve el aviso con «Volver a conectar»

#### Scenario: Reconexión
- **WHEN** la coordinadora vuelve a conectar la misma cuenta de Google
- **THEN** las solicitudes abiertas aceptan subidas otra vez a sus mismas carpetas

### Requirement: Token de corta vida para el Picker
El servidor SHALL entregar a una cuenta `ADMIN` con integración conectada un access token de Google de corta vida (≤ 1 hora) solo para abrir el Google Picker en el navegador, junto con la clave de API y el identificador de la app de Picker. La respuesta MUST llevar `Cache-Control: no-store` y MUST NOT incluir el refresh token.

#### Scenario: Pedir token
- **WHEN** la coordinadora abre «Elegir carpeta» en una solicitud
- **THEN** el navegador recibe un access token vigente y abre el Picker con su Drive

#### Scenario: Sin integración
- **WHEN** una cuenta `ADMIN` sin integración pide el token
- **THEN** recibe 409 con el mensaje «Conecta Google Drive desde Cuenta»
