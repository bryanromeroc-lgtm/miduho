# Calidad y pruebas — MIDUHO

**Propósito:** demostrar con números que la plataforma aguanta a 400 usuarios y protege a los menores.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

Las pruebas demuestran con números que la plataforma aguanta a 400 usuarios y protege a los menores: ~22,5 días, 19,5 de ellos P0. La prueba de carga (QA-06) se corre antes del piloto con el perfil completo de 400 usuarios, no después.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| QA-01 | Estrategia de pruebas en una página: unitarias para permisos, notas, matrícula e importación; integración de acciones contra PostgreSQL real; e2e de los flujos críticos | Documento en `docs/` aplicado en CI | P0 | 0,5 | ARQ-13 | Pendiente |
| QA-02 | Pruebas unitarias de las reglas de negocio (RN-01 a RN-12, RN-22 a RN-24) y del cálculo de notas | Cobertura ≥ 90 % en `src/server/auth` y en evaluación | P0 | 3 | ARQ-07 | Pendiente |
| QA-03 | Pruebas de autorización horizontal y vertical: docente de otro grupo, acudiente sin verificar, estudiante abriendo una guía docente, IDs ajenos en la URL | Matriz rol × recurso automatizada; todas las pruebas de acceso denegado pasan | P0 | 2 | ARQ-07 | Pendiente |
| QA-04 | E2E con Playwright y axe de los flujos críticos: acceso por rol, material en ≤ 3 clics, abrir un libro, importar CSV, liberar una unidad, entregar, calificar y emitir un boletín | Suite en verde en CI a 390 y 1440 px | P0 | 3 | ARQ-13 | Pendiente |
| QA-05 | Generador de un colegio sintético de 400 usuarios con identificadores neutros (Estudiante 001…), sin nombres ni datos personales de menores | Un comando crea el colegio sintético en pruebas | P0 | 1 | ARQ-03 | Pendiente |
| QA-06 | Prueba de carga con k6: 150 sesiones concurrentes, 20 peticiones/s durante 30 min, pico de 300 acudientes en una hora y 25 aperturas simultáneas del mismo libro | Se cumplen las metas de carga del MVP; informe archivado | P0 | 2 | QA-05, ARQ-14 | Pendiente |
| QA-07 | Prueba de red escolar con limitación a 10–20 Mbps compartidos y 4G lento, en los equipos reales del colegio (DSC-05) | LCP ≤ 2 s y libro abierto en menos de 5 s | P0 | 1 | DSC-05, IMP-BIB-08 | Pendiente |
| QA-08 | Accesibilidad manual de 10 flujos con teclado, NVDA (Windows) y TalkBack (Android) contra WCAG 2.1 AA | Informe sin fallas bloqueantes | P0 | 2 | QA-04 | Pendiente |
| QA-09 | Compatibilidad con Chrome, Edge, Firefox y Safari (2 últimas versiones) y con las tabletas del colegio | Matriz de compatibilidad sin fallas bloqueantes | P1 | 1 | QA-04 | Pendiente |
| QA-10 | Seguridad: escaneo con OWASP ZAP, checklist OWASP ASVS nivel 2 (autenticación, sesión, control de acceso, validación, archivos) y revisión de cabeceras | 0 hallazgos altos o críticos abiertos | P0 | 2 | ARQ-11, QA-03 | Pendiente |
| QA-11 | Pentest externo antes de R2 🔶 por su costo | Informe del tercero con los hallazgos corregidos | P1 | 1 | QA-10 | Pendiente |
| QA-12 | Simulacro de restauración de respaldo y de respuesta a incidente | RPO y RTO medidos dentro de las metas | P0 | 1 | OPS-04 | Pendiente |
| QA-13 | Pruebas de aceptación con el colegio por incremento, con guion por rol | Acta de aceptación firmada por coordinación | P0 | 2 | DSC-12 | Pendiente |
| QA-14 | Regresión visual con capturas de Playwright a 390, 1024 y 1440 px en CI | Un cambio visual no intencional bloquea el PR | P2 | 1 | QA-04 | Pendiente |

---

[← Anterior](06-implementacion.md) · [Índice](README.md) · [Siguiente →](08-legal-privacidad.md)
