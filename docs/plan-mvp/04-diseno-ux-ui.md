# Diseño UX/UI — MIDUHO

**Propósito:** unificar el sistema visual y diseñar las interfaces por rol.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

El diseño unifica los cuatro mundos visuales en un solo sistema y separa tres interfaces por rol en ~34 días, 23 de ellos P0. Diseñar directamente en código sobre la maqueta, en lugar de en una herramienta aparte, recorta parte de ese tiempo.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| UX-01 | Arquitectura de información por rol (docente, estudiante, acudiente, coordinación y administración) a partir de `Mapa-de-navegacion.md` | Mapa aprobado; cada rol llega a su tarea principal en ≤ 3 clics | P0 | 1,5 | DSC-12 | Pendiente |
| UX-02 | Dirección visual unificada: un solo lenguaje de ilustración, color con significado único y presupuesto de movimiento (V1–V3); actualizar `DESIGN.md` | `DESIGN.md` v2 aprobado | P0 | 2 | DSC-06 | Pendiente |
| UX-03 | Tokens consolidados y tematización por institución: logo y 2 colores de marca, con los colores de área fijos (V13, V16) | Cambiar el tema no toca ningún componente | P1 | 1,5 | UX-02 | Pendiente |
| UX-04 | Librería de componentes accesibles sobre shadcn y Base UI: tabla de datos, formularios, diálogos, avisos, paginación y selector de fecha | Cada componente con sus estados, teclado y axe sin violaciones | P0 | 3 | UX-02 | Pendiente |
| UX-05 | Refactor de `globals.css` (2.506 líneas, 16 % duplicado) hacia tokens y componentes (V14) | CSS global de menos de 800 líneas, sin reglas duplicadas | P1 | 2,5 | UX-04 | Pendiente |
| UX-06 | Flujos de acceso: docente y administración, estudiante con QR o PIN, acudiente con enlace mágico, recuperación y primer ingreso con aceptación de datos | Prototipo navegable de los 5 flujos | P0 | 2 | DSC-08 | Pendiente |
| UX-07 | Interfaz docente: inicio con el friso del día, clase con pestañas reales, subir y asociar material, programar la liberación | Prototipo de alta fidelidad validado con 2 docentes | P0 | 3 | UX-01, UX-04 | Pendiente |
| UX-08 | Interfaz estudiante de 6 a 10 años: clases de hoy, material, lector y entregas; audio en las instrucciones; objetivos táctiles de 56 px | Prototipo probado con 3 niños | P0 | 2,5 | UX-01, UX-04 | Pendiente |
| UX-09 | Interfaz acudiente para celular: desempeño, comunicados, mensajes y autorización de datos | Prototipo validado con 2 acudientes | P1 | 2 | DSC-07 | Pendiente |
| UX-10 | Interfaz de administración y coordinación: año lectivo, períodos, grupos, usuarios, importación CSV con errores por fila, asignaciones y auditoría | Prototipo validado con coordinación | P0 | 2 | UX-04 | Pendiente |
| UX-11 | Lector accesible: una página en vertical, texto real ajustable, fuente para dislexia, lectura en voz alta e índice | Prototipo revisado a 390 y 1440 px | P0 | 2 | UX-02 | Pendiente |
| UX-12 | Evaluación y asistencia: planilla por período con la escala del SIEE, modelo de boletín PDF y toma de asistencia en ≤ 30 s | Prototipo validado con coordinación | P1 | 2 | DSC-02 | Pendiente |
| UX-13 | Estados de sistema: vacío, error, sin conexión, cargando, 403, 404 y sesión expirada (V15) | Un estado diseñado por caso y por rol | P0 | 1 | UX-04 | Pendiente |
| UX-14 | Pruebas de usabilidad moderadas con 5 docentes, 5 niños y 3 acudientes, con tareas cronometradas | Informe con hallazgos y cambios aplicados | P0 | 3 | UX-07, UX-08 | Pendiente |
| UX-15 | Revisión de accesibilidad del diseño: contraste de toda la paleta, orden de foco, textos alternativos y lectura fácil para niños | Checklist WCAG 2.1 AA completo | P0 | 1 | UX-07, UX-08 | Pendiente |
| UX-16 | Guía de voz y microcopia por rol, mensajes de error comprensibles (RNF-USA-5) y glosario curricular | Guía publicada en `docs/` | P1 | 1 | UX-02 | Pendiente |
| UX-17 | Set de ilustraciones propio y coherente para la interfaz infantil; retirar el osito 3D y las fotos (V1) 🔶 ilustrador externo | Assets con licencia registrada | P1 | 2 | UX-02 | Pendiente |

---

[← Anterior](03-descubrimiento.md) · [Índice](README.md) · [Siguiente →](05-arquitectura-plataforma.md)
