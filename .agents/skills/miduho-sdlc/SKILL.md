---
name: miduho-sdlc
description: Usa la fábrica MIDUHO para cambios de producto.
version: 0.1.0
author: Bryan Alberto Romero Cifuentes, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [miduho, sdlc, kanban, education]
---

# MIDUHO SDLC

Usa esta skill al trabajar dentro del repositorio MIDUHO. Complementa `AGENTS.md`: sus reglas de privacidad de menores, contenido protegido y WCAG son obligatorias.

## Procedimiento

1. Lee `docs/software-factory/README.md` y los artefactos enlazados antes de diseñar o modificar una funcionalidad. Distingue confirmado, propuesto y pendiente.
2. Para cambios de código, prepara una tarjeta con alcance, criterios de aceptación, archivos esperados y comando de verificación. Claude Code es el ejecutor de implementación.
3. Para QA, usa OpenCode para ejecutar validaciones, reproducir fallos y producir evidencia. No cierres una tarjeta sin resultados de las verificaciones aplicables.
4. Usa Antigravity para automatizaciones de soporte: entorno temporal, navegador, capturas, matrices de pruebas, logs y consolidación de evidencia. No lo uses para editar en paralelo el mismo worktree.
5. Conserva decisiones, diseños, reportes QA y resultados de revisión en `docs/software-factory/`; no dejes conocimiento de proyecto solo en una sesión o memoria local.
6. Antes de declarar terminado un cambio, verifica `npm run lint`, `npm run build` y las pruebas específicas que correspondan. Registra el resultado en el artefacto de la tarjeta.

## Estructura

- `.hermes/factory.json`: configuración portable de roles y modelos, sin secretos.
- `docs/modelo-de-entidades.md`: modelo de entidades del Incremento 1.
- `docs/arquitectura-backend.md`: arquitectura backend del Incremento 1.
- `docs/software-factory/`: índice y artefactos operativos de la fábrica.

## Límites

No versionar credenciales, `auth.json`, `.env`, sesiones, memoria automática ni logs. No modificar artefactos existentes sin enlazar la decisión o la tarjeta que lo justifica.
