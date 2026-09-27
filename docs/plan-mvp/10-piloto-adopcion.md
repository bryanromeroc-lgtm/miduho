# Piloto, migración y adopción — MIDUHO

**Propósito:** probar la adopción real con un grado antes de escalar a todo el colegio.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

El piloto prueba la adopción real antes de escalar: ~23 días, con una regla que manda sobre todo lo demás: el contenido se carga antes de liberar (PIL-04), porque ese fue el fracaso de la referencia.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| PIL-01 | Plan del piloto: grupos, 6 semanas de duración, responsables del colegio, criterios de éxito (DSC-13) y canal de soporte | Plan aprobado por rectoría | P0 | 1 | DSC-13 | Pendiente |
| PIL-02 | Cargar los datos reales en producción (estructura académica, usuarios y matrícula por CSV) con verificación del colegio; nunca datos reales fuera de producción | Coordinación valida listas y asignaciones | P0 | 1 | IMP-ACA-06, LEG-04 | Pendiente |
| PIL-03 | Recoger las autorizaciones de los acudientes antes de activar las cuentas de estudiantes | ≥ 95 % de autorizaciones registradas | P0 | 1 | LEG-04 | Pendiente |
| PIL-04 | Cargar el contenido del grado piloto antes del inicio: al menos un recurso por clase y por semana del primer mes | Ninguna clase del primer mes está vacía | P0 | 3 | IMP-CLA-05, DSC-11 | Pendiente |
| PIL-05 | Capacitación docente: 2 sesiones de 90 min y videos de ≤ 3 min por tarea | 100 % de docentes del piloto capacitados | P0 | 2 | PIL-02 | Pendiente |
| PIL-06 | Manual docente, guía de acudiente de 1 página, guía pictográfica para niños y preguntas frecuentes | Materiales publicados en la plataforma | P0 | 2 | UX-16 | Pendiente |
| PIL-07 | Entregar las tarjetas de acceso y dar la primera sesión guiada en cada salón | Cada estudiante entró al menos una vez | P0 | 1 | IMP-AUT-03, PIL-03 | Pendiente |
| PIL-08 | Acompañamiento: presencia en el colegio la primera semana, canal de soporte y registro de incidencias | Incidencias registradas y atendidas según el SLA | P0 | 3 | PIL-07 | Pendiente |
| PIL-09 | Medición semanal de las métricas y retrospectiva con docentes cada 2 semanas | Informe semanal con las métricas de adopción | P0 | 2 | PIL-01 | Pendiente |
| PIL-10 | Informe de cierre con la decisión de continuar hacia los 400 usuarios y los ajustes necesarios | Decisión firmada con el colegio | P0 | 1 | PIL-09 | Pendiente |
| PIL-11 | Despliegue por olas al resto del colegio: grado por grado, capacitación del resto de docentes y carga masiva | Los ~400 usuarios activos | P1 | 4 | PIL-10 | Pendiente |
| PIL-12 | Migración de lo que se decida conservar del sistema anterior 🔶 según DSC-04 | Datos migrados y verificados por el colegio | P1 | 2 | DSC-04 | Pendiente |

---

[← Anterior](09-operacion.md) · [Índice](README.md) · [Siguiente →](11-comercial-soporte.md)
