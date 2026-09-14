# Escena de la Biblioteca · «El valle de los cuentos»

La escena del hero de `/biblioteca` está **autorada en SVG** en
`src/components/biblioteca/valle.tsx` (colinas, aldea de casas-libro,
árbol-biblioteca con farol, páginas volando) más pictogramas Twemoji de
`public/images/portal/`. No hay ningún raster generado en esta carpeta.

Se pidió generarla con Gemini (2026-09-13), pero la clave configurada no
tiene cuota de generación de imágenes (free tier, límite 0 en todos los
modelos `*-image`). Cuando exista cuota, el prompt de referencia es:

> Ultra-wide panoramic children's storybook landscape for a school library
> web page. Foreground and right side: a whimsical "valley of stories" —
> rolling warm green hills, a winding sandy path, a small village of houses
> built from stacked colorful books (terracotta, deep blue, forest green,
> cream), a cozy tree-house library with a round window and a glowing warm
> lamp, a few fluffy round trees, floating pages and golden stars. Left third:
> calm open sky with soft clouds so text can be placed there. Sky: warm
> late-afternoon gradient from peach at the horizon to light blue at the top.
> Flat vector storybook illustration, soft shading, clean rounded shapes,
> no people, no characters, no animals, no text. Horizon at ~60% height,
> elements concentrated on the right two thirds. Aspect 21:9.

Si se genera, guardarla aquí como `valle.webp` y sustituir el SVG por
`<Image>` en `valle.tsx`, conservando `aria-hidden` (es ambientación) y el
scrim de lectura sobre el tercio izquierdo.
