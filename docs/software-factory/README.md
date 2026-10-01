# Software factory — MIDUHO

Índice versionado de la evidencia de producto, arquitectura, decisiones y operación de los agentes. Este repositorio es la fuente de verdad de los artefactos; las memorias y sesiones de los agentes solo son apoyo temporal.

## Artefactos existentes

| Artefacto | Estado | Propósito |
|---|---|---|
| [Modelo de entidades](../modelo-de-entidades.md) | Confirmado para Inc. 1 | Entidades, relaciones y reglas del dominio educativo. |
| [Arquitectura backend](../arquitectura-backend.md) | Propuesta técnica para Inc. 1 | Decisiones de backend, auth, Prisma y contratos. |
| [Auditoría de producto](../auditoria-producto-2026-09-26.md) | Observado / propuesto | Evaluación de diseño, arquitectura y preparación del producto. |
| [Plan MVP](../plan-mvp/README.md) | En evolución | Definición, fases, riesgos, operación y piloto. |
| [Configuración portable Hermes](../../.hermes/factory.json) | Activa | Roles, modelos y ejecutores, sin secretos. |
| [Inc. 1 · Autenticación](inc-1-autenticacion.md) | Implementado (t_85913f5b), pendiente revisión | Login, recuperación de contraseña y evidencia de verificación. |
| [Inc. 1 · Entidades base](inc-1-entidades-base.md) | Implementado (t_b089e01a), pendiente revisión | Año lectivo, períodos, grados, grupos y asignaturas: esquema, API y evidencia. |

## Ciclo de evidencia por tarjeta

Cada tarjeta relevante debe dejar, dentro de esta carpeta o en el documento del incremento:

1. **Decisión o especificación:** alcance, supuestos, criterios de aceptación y enlaces al backlog.
2. **Implementación:** commit o diff, archivos modificados y migraciones si aplica.
3. **QA:** comandos ejecutados, resultado, escenarios cubiertos y defectos abiertos.
4. **Revisión:** gate de seguridad, privacidad, WCAG y arquitectura.
5. **Cierre:** evidencia que justifica el estado `done`.

## Convenciones

- Nombres: `inc-<n>-<tema>.md` para especificaciones y `inc-<n>-<tema>-qa.md` para reportes QA.
- Usar español de Colombia.
- Marcar lo no confirmado con 🔶 y no inventar datos de menores.
- Mantener los documentos seleccionables, editables y auditables; no reemplazarlos por capturas o resúmenes de chat.
