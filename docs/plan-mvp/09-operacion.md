# Despliegue, operación y observabilidad — MIDUHO

**Propósito:** sostener la disponibilidad, los respaldos y la respuesta a incidentes.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

La operación sostiene la meta de 99,5 % de disponibilidad y responde «¿y si se pierde todo?»: ~8 días, 5 de ellos P0. Con 400 usuarios, la infraestructura cuesta del orden de USD 30–70 al mes 🔶.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| OPS-01 | Aprovisionar el hosting gestionado (app, PostgreSQL con PITR y almacenamiento de objetos) en una región de baja latencia hacia Colombia, con cuentas a nombre de la empresa | Producción creada; ninguna cuenta personal | P0 | 1 | ARQ-01, LEG-06 | Pendiente |
| OPS-02 | Dominio, DNS y TLS automático; correo con SPF, DKIM y DMARC | HTTPS en todo el dominio y correos autenticados | P0 | 0,5 | OPS-01 | Pendiente |
| OPS-03 | Despliegue reproducible documentado (scripts, variables, migraciones) o infraestructura como código | El entorno de pruebas se recrea desde cero con la guía | P1 | 1 | ARQ-14 | Pendiente |
| OPS-04 | Respaldos diarios con PITR de ≥ 7 días, copia semanal cifrada fuera del proveedor, retención de 30 y 90 días y versionado de objetos | Respaldo verificado y restaurado en QA-12 | P0 | 1 | OPS-01 | Pendiente |
| OPS-05 | Monitoreo y alertas: disponibilidad cada minuto, errores, latencia p95, uso de la base y cola atascada, con alerta al celular | Una caída provocada genera alerta en menos de 2 min | P0 | 1 | ARQ-16 | Pendiente |
| OPS-06 | Runbooks: caída del servicio, restauración de la base, rotación de secretos, bloqueo masivo de cuentas y fuga de datos | 5 runbooks en `docs/ops/`, cada uno probado una vez | P0 | 1,5 | OPS-04, LEG-09 | Pendiente |
| OPS-07 | Mantenimientos fuera de la jornada escolar (RNF-DISP-2) y página de estado para el colegio | Calendario de mantenimiento publicado | P1 | 0,5 | OPS-05 | Pendiente |
| OPS-08 | Gestión de versiones: versionado semántico, notas de versión en español para el colegio y migraciones reversibles | Cada despliegue a producción tiene notas y plan de reversa | P1 | 0,5 | ARQ-14 | Pendiente |
| OPS-09 | Tablero mensual de costo por usuario con alertas de gasto del proveedor | Costo mensual visible y alerta configurada | P1 | 0,5 | OPS-01 | Pendiente |
| OPS-10 | Plan de continuidad si el desarrollador no está disponible: acceso de emergencia, custodia de credenciales y segundo contacto técnico | Documento firmado y entregado al colegio | P1 | 0,5 | OPS-06 | Pendiente |

---

[← Anterior](08-legal-privacidad.md) · [Índice](README.md) · [Siguiente →](10-piloto-adopcion.md)
