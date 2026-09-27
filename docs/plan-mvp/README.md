# Plan de tareas hacia el MVP vendible (400 usuarios) — MIDUHO

**Propósito:** reunir en el proyecto todas las tareas del ciclo de vida (descubrimiento, diseño, arquitectura, implementación, pruebas, legal, operación, piloto y venta) que llevan a MIDUHO a un MVP vendible para un colegio de ~400 usuarios, para priorizarlas y tomar decisiones sobre ellas.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (`06-Backlog/`, `04-Requerimientos/`), [arquitectura del backend](../arquitectura-backend.md), [modelo de entidades](../modelo-de-entidades.md).
**Nivel de certeza:** estimaciones [P]; fechas, alcance y costos marcados 🔶 dependen de lo que confirme el colegio.

---

El plan tiene **196 tareas y 282 días-persona**. El piloto (P0) pide 172,5 días: con una sola persona ocupa todos los días hábiles hasta junio de 2027, así que la primera decisión es de capacidad ([decisiones pendientes](00-decisiones-pendientes.md)).

## Índice

| # | Archivo | Qué contiene | Tareas | Días P0 | Días total |
| --- | --- | --- | --- | --- | --- |
| 00 | [Decisiones pendientes](00-decisiones-pendientes.md) | Lo que hay que decidir, con opciones y recomendación | — | — | — |
| 01 | [Definición del MVP](01-definicion-mvp.md) | Entregas R0, R1, R2 y criterios de salida medibles (carga de 400 usuarios) | — | — | — |
| 02 | [Fase 0 · saneamiento](02-fase-0-saneamiento.md) | Riesgo legal, demo presentable, decisión de uno o varios colegios | 18 | 10 | 10,75 |
| 03 | [Descubrimiento](03-descubrimiento.md) | SIEE, alcance del piloto, infraestructura y contenido del colegio | 13 | 11 | 13,5 |
| 04 | [Diseño UX/UI](04-diseno-ux-ui.md) | Sistema visual unificado e interfaces por rol | 17 | 23 | 34 |
| 05 | [Arquitectura y plataforma](05-arquitectura-plataforma.md) | Base de datos, autenticación, almacenamiento, CI/CD, seguridad | 21 | 26,5 | 32,5 |
| 06 | [Implementación](06-implementacion.md) | 11 módulos: de la fundación académica a laboratorios | 64 | 46 | 117,5 |
| 07 | [Calidad y pruebas](07-calidad-pruebas.md) | Unitarias, e2e, accesibilidad, carga de 400 usuarios, seguridad | 14 | 19,5 | 22,5 |
| 08 | [Legal y privacidad](08-legal-privacidad.md) | Ley 1581, datos de menores, contratos, derechos de autor | 15 | 8 | 10,25 |
| 09 | [Operación](09-operacion.md) | Hosting, respaldos, monitoreo, runbooks | 10 | 5 | 8 |
| 10 | [Piloto y adopción](10-piloto-adopcion.md) | Carga de datos reales, capacitación, métricas, despliegue por olas | 12 | 17 | 23 |
| 11 | [Comercial y soporte](11-comercial-soporte.md) | Precio, contrato, SLA, facturación, mesa de ayuda | 12 | 6,5 | 10 |
| 12 | [Cronograma y riesgos](12-cronograma-riesgos.md) | Hoja de ruta, ruta crítica, dependencias externas, riesgos | — | — | — |

## Cómo usar este plan

Las tareas están ordenadas por fase del ciclo de vida y cada una se prioriza por la entrega que habilita: P0 para el piloto de julio de 2027, P1 para operar con 400 usuarios desde febrero de 2028 y P2 para después.

- **ID:** prefijo de fase + número (F0-01, DSC-03, UX-05, ARQ-02, IMP-AUT-04, QA-06, LEG-02, OPS-03, PIL-01, COM-04). Un ID no se reutiliza; una tarea descartada conserva el suyo.
- **Prioridad:** P0 = sin ella no arranca el piloto (entrega R1); P1 = necesaria para operar y vender a 400 usuarios (entrega R2); P2 = mejora posterior al MVP.
- **Días:** días-persona de una persona full-stack (6 h efectivas), incluidas las pruebas de la propia tarea. Para planear, multiplica la suma por 1,3 como colchón de imprevistos.
- **Depende de:** IDs que deben estar terminados antes de empezar.
- **Estado:** Pendiente, En curso, Bloqueada, Hecha o Descartada; se cambia editando la celda.
- **Marcas del proyecto:** [O] observado, [I] inferido, [P] propuesto, 🔶 por confirmar (regla 4 de `AGENTS.md`).
- **Referencias:** HU-xx, RN-xx y RNF-xx son IDs de la bóveda de Obsidian; B1–B4 y V1–V17 son hallazgos de la [auditoría](../auditoria-producto-2026-09-26.md).

Una tarea de código está terminada cuando cumple todo esto:

- `npm run lint`, `npm run build` y las pruebas pasan en CI.
- La autorización se verifica en el servidor, con al menos una prueba de acceso denegado.
- axe no reporta violaciones en las pantallas tocadas y el flujo se probó con teclado.
- Está desplegada en el entorno de pruebas y revisada a 390 px y a 1440 px.
- La documentación afectada (`docs/` o la bóveda) está actualizada.

## Resumen de esfuerzo

Sin colchón, P0 y P1 (272,5 días) caben entre octubre de 2026 y diciembre de 2027 con una sola persona; con el colchón de 1,3 no caben, y por eso la capacidad es el riesgo principal del cronograma.

| Prioridad | Entrega | Tareas | Días-persona | Con colchón de 1,3 |
| --- | --- | --- | --- | --- |
| P0 | R1 · piloto, julio de 2027 | 123 | 172,5 | 224 |
| P1 | R2 · colegio completo, febrero de 2028 | 65 | 100 | 130 |
| P2 | Después del MVP | 8 | 9,5 | 12 |
| Total | — | 196 | 282 | 367 |

Estos totales (y los del índice) son una foto del 26 de septiembre de 2026. Cuando cambies estimaciones o prioridades en las tablas, recalcúlalos con:

```bash
node app/docs/plan-mvp/resumen.mjs
```

## Relacionados

[Auditoría de producto](../auditoria-producto-2026-09-26.md) · [Arquitectura del backend](../arquitectura-backend.md) · [Modelo de entidades](../modelo-de-entidades.md) · Backlog en la bóveda: `06-Backlog/Backlog-MVP.md` · Versión inicial de este plan como documento en claude.ai: <https://claude.ai/code/artifact/f545a4ce-e950-4d48-b811-16f4bde4f6f4> (desde ahora, la fuente de verdad son estos archivos).
