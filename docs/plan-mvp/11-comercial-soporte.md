# Comercial y soporte — MIDUHO

**Propósito:** preparar contrato, SLA, precio y soporte para poder vender.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

Vender exige documentos además de código: ~10 días para el contrato, el SLA, el precio y el soporte. Hay una fecha que no depende de ti: si el costo se cobra a las familias, debe entrar en los costos que el colegio fija antes de cada año escolar 🔶 (COM-04).

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| COM-01 | Demo guiada de 15 minutos con el guion docente: material en 3 clics, biblioteca accesible y comunicación con familias | Guion ensayado sobre `demo-v0` | P0 | 1 | F0-18 | Pendiente |
| COM-02 | Análisis de 3–4 plataformas que usan los colegios de la región: funciones y precio 🔶 | Tabla comparativa con fuentes | P0 | 1 | — | Pendiente |
| COM-03 | Modelo de precio: cargo único de implementación más suscripción anual por estudiante, con el escenario de 400 usuarios y el costo por usuario | Propuesta económica con el margen calculado | P0 | 1 | COM-02, OPS-09 | Pendiente |
| COM-04 | Confirmar con rectoría cómo se paga (presupuesto propio o cobro a familias) y el plazo para incluirlo en los costos del año siguiente 🔶 | Respuesta de rectoría con fechas | P0 | 0,5 | DSC-01 | Pendiente |
| COM-05 | Contrato de servicio: objeto, licencia de uso, propiedad de los datos, SLA, soporte, precio y reajuste, confidencialidad, terminación y salida de datos | Contrato revisado por el abogado | P0 | 1 | LEG-03, LEG-15 | Pendiente |
| COM-06 | SLA: disponibilidad ≥ 99,5 % en jornada, tiempos de respuesta por severidad (crítico 2 h, alto 8 h, medio 2 días), exclusiones y compensaciones | Anexo del contrato aprobado | P0 | 0,5 | OPS-05 | Pendiente |
| COM-07 | Formalizar la facturación: RUT, facturación electrónica ante la DIAN y figura legal (persona natural o SAS) 🔶 | Primera factura electrónica de prueba emitida | P0 | 1 | — | Pendiente |
| COM-08 | Mesa de ayuda: canal, horario, registro de casos y base de conocimiento | Canal activo y primeros artículos publicados | P1 | 1 | PIL-06 | Pendiente |
| COM-09 | Documentación comercial: ficha técnica, resumen de seguridad y privacidad de 1 página y declaración de accesibilidad WCAG | Paquete PDF listo para rectoría | P1 | 1 | QA-08, LEG-02 | Pendiente |
| COM-10 | Acuerdo de piloto (gratis o con descuento) con criterios de éxito que conviertan a contrato anual | Acuerdo firmado antes de PIL-02 | P0 | 0,5 | COM-03 | Pendiente |
| COM-11 | Hoja de ruta posterior al MVP para compartir con el colegio (actividades gamificadas, cuestionarios, foros, promoción de año) | Hoja de ruta publicada | P2 | 0,5 | PIL-10 | Pendiente |
| COM-12 | Caso de éxito del piloto, con permiso del colegio y sin datos de menores, para vender a otros colegios | Caso publicado | P2 | 1 | PIL-10 | Pendiente |

---

[← Anterior](10-piloto-adopcion.md) · [Índice](README.md) · [Siguiente →](12-cronograma-riesgos.md)
