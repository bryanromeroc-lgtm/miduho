# Kits temáticos de la vista de materia — procedencia

Todo el arte de esta carpeta es **SVG vectorial de autoría propia**, escrito a mano en código para MIDUHO (cambio `vistas-de-materia`, octubre de 2026). No hay imágenes raster, fuentes de íconos ni recursos de terceros.

- **Sin copia de referentes.** La imagen de referencia que aportó el operador (2026-10-31) solo dio el esquema de la vista: título, cuadrícula de tarjetas y un botón por tarjeta. No se reutilizó su mascota, sus escenas, sus textos ni su identidad. Tampoco se copió nada de la plataforma Trendi (regla dura 2): de Robótica y Emprendimiento solo se usa el nombre de la materia.
- **Estilo flat (D5).** Rellenos sólidos, sin sombras, relieves, texturas ni contornos de tinta oscura. Los pocos trazos que hay (marcas de regla, clip, cuerdas) usan los colores del kit.
- **Temática estricta (D4).** Cada pieza pertenece a su materia; `kits.test.ts` verifica los mínimos, que ningún id se repita entre kits y que no haya bosques, madera ni paisajes.
- **Símbolos.** Las letras, números y fórmulas (A, ñ, ¿?, «», π, F=ma, $) son texto SVG en Baloo 2, la fuente del proyecto. La clave de sol está dibujada como trazo.
- **Bandera de Colombia** (kit de Sociales): se incluye por decisión del operador del 2026-10-31, con sus colores. No hay banderas de otros países.
- **Paleta.** Los colores de cada materia (`tokens.ts`) son propios del proyecto. No son una paleta oficial del colegio.

Estructura: `kits.ts` (catálogo, solo datos), `arte/<escena>.tsx` (una pieza por id), `piezas.tsx` (componentes parametrizables: pieza, cinta, marco y patrón de marcas) y `tokens.ts` (color y contraste).
