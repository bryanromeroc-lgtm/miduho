# Definición del MVP vendible — MIDUHO

**Propósito:** fijar qué entregas componen el MVP y con qué criterios medibles se considera vendible para ~400 usuarios.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

El MVP es vendible cuando el colegio opera un período completo con sus ~400 usuarios en la plataforma y se cumplen los criterios de salida de abajo. La carga se dimensiona con ~30 docentes, ~370 estudiantes y hasta 600 acudientes 🔶, con 3–4 grupos conectados a la vez como pico escolar.

| Entrega | Fecha objetivo | Usuarios | Alcance | Pasa a la siguiente si… |
| --- | --- | --- | --- | --- |
| R0 · Demo saneada | noviembre de 2026 | Solo presentación | Maqueta sin riesgo legal ni controles falsos (Fase 0) | El colegio acepta el descubrimiento |
| R1 · Piloto | julio de 2027, inicio del 2.º semestre 🔶 | 1 grado: ~3 docentes y ~50–75 estudiantes 🔶 | Acceso por rol, estructura académica, la clase con contenido, biblioteca accesible, liberación programada | Se cumplen los criterios de adopción de la tabla siguiente |
| R2 · Colegio completo | febrero de 2028, año escolar 2028 🔶 | ~400 usuarios y sus acudientes | R1 + actividades, asistencia, comunicación, evaluación y boletines (o exportación), planeación y laboratorios | Contrato anual firmado |

| Criterio de salida | Meta | Cómo se verifica | Tareas |
| --- | --- | --- | --- |
| Carga concurrente | 150 sesiones simultáneas y 20 peticiones/s durante 30 min, p95 < 800 ms, 0 % de errores | Prueba k6 en el entorno de pruebas con 400 usuarios sintéticos | QA-06 |
| Pico de acudientes | 300 acudientes en 1 hora consultando boletines, p95 < 1,5 s | Mismo escenario de carga | QA-06 |
| Libro en el aula | 25 estudiantes abren el mismo libro en < 5 s con 20 Mbps compartidos; ≤ 300 KB por apertura | Prueba de red con limitación de ancho de banda | QA-07, IMP-BIB-08 |
| Carga inicial | LCP ≤ 2 s en un Android de gama media con 4G lento | Playwright y Lighthouse con limitación de red | QA-07 |
| Búsqueda | ≤ 1 s con el catálogo completo | Prueba de rendimiento de la API | ARQ-17 |
| Disponibilidad | ≥ 99,5 % de lunes a viernes, 6:00–18:00 | Monitor externo e informe mensual | OPS-05 |
| Respaldos | Pérdida máxima de 24 h (RPO) y recuperación en ≤ 4 h (RTO) | Simulacro de restauración documentado | OPS-04, QA-12 |
| Seguridad | 0 hallazgos altos o críticos abiertos; aislamiento por rol y grupo probado | OWASP ZAP, checklist ASVS nivel 2 y pruebas de autorización | QA-03, QA-10 |
| Accesibilidad | 0 violaciones axe en CI; 10 flujos probados con teclado, NVDA y TalkBack; texto real en todo el contenido pedagógico | Informe de accesibilidad | QA-08, IMP-BIB-06 |
| Adopción del piloto | ≥ 80 % de docentes activos cada semana, ≥ 90 % de clases con material, material en ≤ 3 clics | Panel de uso y observación en aula | PIL-09 |
| Legal | Contratos firmados, política publicada, ≥ 95 % de autorizaciones de acudientes antes de activar estudiantes, licencia documentada para todo el catálogo | Carpeta legal revisada por abogado | LEG-02 a LEG-05, LEG-11, PIL-03 |
| Soporte | Primera respuesta en < 4 h hábiles; manuales publicados | Registro de casos | COM-06, PIL-06 |

Quedan fuera del MVP las actividades gamificadas (HU-20), los cuestionarios autocalificables, los foros, la promoción y cierre de año, un panel de indicadores avanzado, una app nativa y el módulo de pagos o cartera.

---

[← Anterior](00-decisiones-pendientes.md) · [Índice](README.md) · [Siguiente →](02-fase-0-saneamiento.md)
