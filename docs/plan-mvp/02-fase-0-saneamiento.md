# Fase 0 — Saneamiento y decisiones — MIDUHO

**Propósito:** quitar los riesgos que impiden mostrar la plataforma y cerrar la decisión que cambia la arquitectura.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

La Fase 0 quita en ~11 días los riesgos que impiden mostrar la plataforma (B1 y casi todos los hallazgos V1–V17) y cierra la decisión de negocio que cambia la arquitectura (F0-16).

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| F0-01 | Retirar «¡Préstame tus ojos!» de `public/libros`, `biblioteca/` y `libros.ts`. La bóveda (RNF-MAN-3) la ubica en la Literatura de la plataforma de referencia | No queda ningún archivo de la obra y el build pasa | P0 | 0,5 | — | Pendiente |
| F0-02 | Verificar si el repositorio de GitHub es público, hacerlo privado y purgar del historial las obras sin autorización (`git filter-repo`) | Repositorio privado; `git log --all` no encuentra esas rutas | P0 | 0,5 | F0-01 | Pendiente |
| F0-03 | Pedir por escrito a Maguaré y al Ministerio de las Culturas la autorización: títulos, uso en una plataforma privada con fines comerciales, vigencia y atribución | Solicitud radicada; respuesta archivada en `biblioteca/LICENCIA.md` | P0 | 0,5 | — | Pendiente |
| F0-04 | Mientras no haya respuesta, ocultar tras un indicador las obras sin licencia verificada; el demo usa solo dominio público y CC BY | El demo solo muestra obras con licencia documentada | P0 | 1 | F0-01 | Pendiente |
| F0-05 | Página «Créditos y licencias» (Twemoji y StoryWeaver CC BY 4.0, Maguaré si se autoriza) y corrección del pie que afirma dominio público | Página enlazada desde el pie; pie corregido | P0 | 0,5 | F0-04 | Pendiente |
| F0-06 | Reemplazar «Kids 2», «Laboratorio Kids 2», «Trend», «Circuito» y «Labs» visibles por la terminología curricular | Ningún texto visible de `src/` contiene esos términos | P0 | 0,5 | — | Pendiente |
| F0-07 | Calcular el total de títulos desde los datos en lugar de `TOTAL_TITULOS = 317` | La cifra mostrada coincide con el catálogo | P0 | 0,25 | — | Pendiente |
| F0-08 | Llevar las notas de maqueta (V5) a un «modo presentación» conmutable, con microcopia de producto por defecto | Con el modo apagado no aparece ninguna nota de maqueta | P0 | 1 | — | Pendiente |
| F0-09 | Marcar como «Próximamente» las pestañas y botones sin función (V7), deshabilitados de forma accesible | Ningún control visible queda sin respuesta | P0 | 0,5 | — | Pendiente |
| F0-10 | Título propio por ruta con `metadata` (V11) | Cada pestaña del navegador muestra un título distinto | P0 | 0,25 | — | Pendiente |
| F0-11 | Menú en color neutro o alineado al área; token `--destructive` propio con contraste AA (V2, V13) | Ningún destino usa el color de otra área; contraste verificado | P0 | 0,5 | — | Pendiente |
| F0-12 | Etiquetas de los planetas de Laboratorios sin solaparse ni cortarse entre 360 y 390 px (V9) | Capturas a 360 y 390 px sin cortes | P0 | 0,5 | — | Pendiente |
| F0-13 | Lector: una página a lo ancho en vertical y carga por ventana de ±2 hojas (V8) | Abrir un libro en móvil descarga ≤ 300 KB y la página ocupa el ancho | P0 | 2 | — | Pendiente |
| F0-14 | Transiciones de ≤ 300 ms o solo la primera vez por sesión, sin bloquear la navegación (V10) | Ir a Laboratorios o abrir un libro no espera más de 300 ms | P0 | 0,5 | — | Pendiente |
| F0-15 | Agenda: eventos a ≥ 12 px y navegación entre meses (V12) | Texto legible al proyectar; se puede cambiar de mes | P1 | 0,5 | — | Pendiente |
| F0-16 | Decidir si se vende solo a Mi Dulce Hogar o a varios colegios; registrar la decisión y actualizar RNF-MAN-1 | Decisión escrita en `08-Decisiones` y reflejada en la arquitectura | P0 | 0,5 | — | Pendiente |
| F0-17 | Corregir `AGENTS.md` (sí hay remoto) y el aviso del `package-lock.json` suelto con `turbopack.root` | Build sin advertencias; documento correcto | P1 | 0,25 | — | Pendiente |
| F0-18 | Etiquetar la maqueta como `demo-v0` y publicarla con acceso protegido para las reuniones con el colegio | URL privada con contraseña funcionando | P0 | 0,5 | F0-01 a F0-14 | Pendiente |

---

[← Anterior](01-definicion-mvp.md) · [Índice](README.md) · [Siguiente →](03-descubrimiento.md)
