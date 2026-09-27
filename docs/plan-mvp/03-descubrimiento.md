# Descubrimiento y requisitos con el colegio — MIDUHO

**Propósito:** convertir las preguntas abiertas de la bóveda en decisiones firmadas por el colegio.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

El descubrimiento convierte las preguntas abiertas de la bóveda (P2 a P15) en decisiones firmadas por el colegio en ~13,5 días. Sin el SIEE (DSC-02) y el inventario de contenido (DSC-11), el piloto repetiría el aula vacía.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| DSC-01 | Reunión de arranque con rectoría y coordinación: objetivos, responsables del colegio y calendario 2027 | Acta firmada con responsables y fechas | P0 | 1 | F0-18 | Pendiente |
| DSC-02 | Obtener el SIEE vigente (escala, períodos, ponderaciones, promoción, inasistencias) y modelarlo | SIEE archivado y resumido en la bóveda | P0 | 1 | DSC-01 | Pendiente |
| DSC-03 | Confirmar el alcance del piloto: grado, grupos, asignaturas (3 o 14, P12), usuarios por rol y si entran acudientes desde R1 (P2) | Alcance escrito con cifras por rol | P0 | 0,5 | DSC-01 | Pendiente |
| DSC-04 | Inventariar los sistemas actuales (notas, matrícula, contrato con la plataforma de referencia) y decidir si MIDUHO reemplaza o complementa (P5) | Decisión escrita con fechas de fin de cada contrato | P0 | 1 | DSC-01 | Pendiente |
| DSC-05 | Inventario técnico: dispositivos, navegadores, Wi-Fi y ancho de banda medido en 3 salones en horario de clase (P7, RNF-COMP-2) | Informe con Mbps reales y parque de equipos | P0 | 1 | DSC-01 | Pendiente |
| DSC-06 | Entrevistar y observar a 3–5 docentes de primaria y a 1 coordinador mientras preparan, dictan y califican | Mapa de tareas semanales y 10 hallazgos priorizados | P0 | 2 | DSC-01 | Pendiente |
| DSC-07 | Sesión con 3–5 acudientes: canal preferido, dispositivos y alfabetización digital | Canal de comunicación con familias definido | P1 | 1 | DSC-01 | Pendiente |
| DSC-08 | Validar con docentes el acceso de estudiantes sin correo (tarjeta QR, PIN o imágenes) | Método elegido y probado con un grupo | P0 | 1 | DSC-06 | Pendiente |
| DSC-09 | Recoger los formatos exigidos: boletín actual, reportes a SIMAT y listas de clase | Formatos archivados como referencia de diseño | P1 | 0,5 | DSC-04 | Pendiente |
| DSC-10 | Ubicar el catálogo oficial de Estándares y DBA del MEN para las asignaturas del piloto: fuente, formato y licencia (P9) | Archivos fuente y licencia registrados | P1 | 1 | DSC-03 | Pendiente |
| DSC-11 | Inventario de contenido del piloto: qué existe, qué se produce y quién lo carga | Lista por clase y semana, con responsable | P0 | 1 | DSC-03 | Pendiente |
| DSC-12 | Requisitos del MVP v1: HU-01 a HU-30 revalidadas más las nuevas (asistencia, acceso infantil, horario), con criterios de aceptación | Documento aprobado por coordinación | P0 | 2 | DSC-02 a DSC-08 | Pendiente |
| DSC-13 | Métricas de éxito del piloto y línea base actual (tiempo para encontrar material, clases con material) | Tabla de métricas con valores iniciales | P0 | 0,5 | DSC-06 | Pendiente |

---

[← Anterior](02-fase-0-saneamiento.md) · [Índice](README.md) · [Siguiente →](04-diseno-ux-ui.md)
