# Accessibility Audit Project Context

## Project

- name: MIDUHO
- base_url: http://localhost:3000
- repo_root: .
- app_root: apps/web

## Audit Scope

- standards: WCAG 2.1 AA
- scan_mode: changed routes
- include_routes:
  - /cuenta
  - /admin/coordinacion
  - /admin/entregas
  - /admin/entregas/nueva
  - /admin/entregas/solicitud-entrega-demo

## Output Configuration

- output_mode: markdown
- report_path: docs/accessibility/audits/audit-2026-11-11.md
