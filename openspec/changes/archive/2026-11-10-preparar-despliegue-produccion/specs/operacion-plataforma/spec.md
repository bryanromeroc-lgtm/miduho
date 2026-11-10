## ADDED Requirements

### Requirement: Respaldos diarios con rotación
El servicio `backup` SHALL generar un `pg_dump` comprimido de la base cada día y conservar 7 diarios, 4 semanales y 6 mensuales. Los respaldos SHALL guardarse en un volumen o carpeta del host separada del volumen de datos de PostgreSQL, y SHALL poder copiarse fuera del servidor.

#### Scenario: Respaldo diario
- **WHEN** pasa la hora programada del respaldo
- **THEN** aparece un archivo nuevo con fecha en el nombre y tamaño mayor que cero

#### Scenario: Rotación
- **WHEN** existen más respaldos diarios que los que dicta la política
- **THEN** se eliminan los más antiguos y se conservan los semanales y mensuales

### Requirement: Restauración probada
El repositorio SHALL incluir `deploy/restore.sh`, que restaura un respaldo elegido en una base PostgreSQL. La restauración SHALL probarse al menos una vez al mes en una base aparte, y el resultado SHALL registrarse en la bitácora de operación.

#### Scenario: Restaurar en base aparte
- **WHEN** se ejecuta `restore.sh` con un respaldo y una base de destino vacía
- **THEN** la base queda con el mismo número de filas por tabla que el origen en el momento del respaldo

### Requirement: Despliegue controlado
`deploy/deploy.sh` SHALL actualizar el stack en este orden: construir u obtener la imagen nueva, respaldar la base, ejecutar `migrate`, reiniciar `app` y esperar a que `/api/health` responda `200`. Si alguna etapa falla, el script SHALL detenerse y dejar las instrucciones para volver a la versión anterior.

#### Scenario: Despliegue exitoso
- **WHEN** se ejecuta `deploy.sh` con una versión nueva válida
- **THEN** queda un respaldo previo, las migraciones se aplican y `/api/health` responde `200`

#### Scenario: Chequeo de salud que no pasa
- **WHEN** después del reinicio `/api/health` no responde `200` en 60 segundos
- **THEN** el script termina con error y muestra los últimos logs de `app`

### Requirement: Requisitos no funcionales medibles
La plataforma SHALL cumplir en producción:
- 250 usuarios concurrentes navegando.
- Latencia p95 menor que 500 ms en páginas y API (sin contar la descarga de imágenes de libros).
- Disponibilidad de 99,5 % en horario escolar (lunes a viernes, 6:00–18:00, hora de Colombia).
- RPO de 24 horas y RTO de 4 horas.

#### Scenario: Prueba de carga
- **WHEN** se ejecuta el escenario k6 versionado con 250 usuarios virtuales durante 10 minutos (inicio de sesión, inicio, biblioteca, abrir un libro, mi curso)
- **THEN** la latencia p95 es menor que 500 ms y la tasa de errores es menor que 1 %

#### Scenario: Recuperación ante pérdida del servidor
- **WHEN** se pierde el servidor y se monta uno nuevo con el último respaldo
- **THEN** la plataforma vuelve a atender en menos de 4 horas, con datos de hace a lo sumo 24 horas

### Requirement: Logs y monitoreo básico
Todos los contenedores SHALL escribir logs a la salida estándar con rotación (tamaño máximo por archivo y número de archivos). Un monitor externo de disponibilidad SHALL consultar `/api/health` cada 5 minutos y avisar al operador si falla.

#### Scenario: Disco protegido
- **WHEN** la app escribe logs durante semanas
- **THEN** el espacio que ocupan sus logs no supera el límite configurado

#### Scenario: Caída detectada
- **WHEN** `/api/health` deja de responder `200` durante dos consultas seguidas
- **THEN** el operador recibe un aviso
