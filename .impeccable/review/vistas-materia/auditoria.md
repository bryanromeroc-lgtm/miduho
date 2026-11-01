# Auditoría técnica — vista de materia (2026-10-31)

Superficie: `/materias/[asignatura]` y su muestra `/muestras/materia` (cambio `vistas-de-materia`). Comando: `/impeccable audit`.

## Puntaje

| # | Dimensión | Puntaje | Hallazgo clave |
|---|-----------|---------|----------------|
| 1 | Accesibilidad | 4 | axe-core sin violaciones (WCAG 2.1 A/AA + buenas prácticas) en 22 páginas: 11 materias, con y sin actividades |
| 2 | Rendimiento | 4 | Arte 100 % SVG en línea, sin raster salvo el escudo; animaciones solo con `transform`/`opacity` |
| 3 | Responsive | 4 | Sin scroll a 1440×900, 1024×768 y 900×640; sin scroll horizontal a 390 |
| 4 | Theming | 3 | Tokens `--m-*` por materia con contraste probado; el arte usa hex propios del kit (intencional, documentado en `tematica/README.md`) |
| 5 | Integridad de implementación | 4 | Detector de impeccable sin hallazgos; guardia del estilo flat en `vista.estilos.test.ts` |
| **Total** | | **19/20** | **Excelente** |

## Evidencia

- **Contraste:** `tematica/tokens.test.ts` verifica 8 pares de texto × 11 materias ≥ 4.5:1. La auditoría encontró y corrigió un par que fallaba: tinta sobre `apoyo` (3.65–3.97 en Lectura, Emprendimiento y Sociales) en el rótulo «Datos de ejemplo». `apoyo` queda prohibido para fondos de texto.
- **Teclado:** orden lógico (saltar al contenido → Volver → cuenta → tarjetas habilitadas → paginador). Las tarjetas «por abrir» o «cerradas» sin intento quedan fuera del orden (`aria-disabled`). El foco es visible en cada paso (anillo de 3 px).
- **Lector de pantalla:** un solo `h1` (nombre de la materia); la cuadrícula es una lista con nombre; cada tarjeta tiene un solo enlace con nombre completo («título. estado. desempeño. acción.»); toda la decoración es `aria-hidden`. El aviso de primera visita usa `role="status"`.
- **Objetivos táctiles:** tarjetas, Volver, paginador y aviso ≥ 44 px. El selector de la muestra (herramienta de revisión) se llevó de 36 a 44 px.
- **Movimiento reducido:** sin entrada escalonada, flotar, balanceo ni desplazamientos al pasar el puntero.
- **Texto real:** las marcas de agua y la escenografía quedaron `user-select: none` para no aparecer en la búsqueda con Ctrl+F.

## Pendiente (P3)

- El arte de cada kit usa colores hexadecimales propios, no los tokens `--m-*`. Es deliberado (cada objeto tiene sus colores reales), pero un cambio de paleta exige tocar `arte/<materia>.tsx`.
