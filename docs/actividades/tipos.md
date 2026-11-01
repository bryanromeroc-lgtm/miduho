# Tipos de actividad

Catálogo de los tipos de actividad de MIDUHO: qué hace cada uno, cómo se califica y qué exige de accesibilidad. Los tipos viven en `apps/web/src/features/actividades/tipos/` (contrato de `fundacion-actividades`, D3) y el reproductor en `apps/web/src/features/actividades/reproductor/`.

## Implementados (cambio `actividades-primeros-tipos`, 2026-10-31)

| Tipo | Nombre en la tarjeta | Ítems | Calificación | Interacción |
|---|---|---|---|---|
| `seleccion-multiple` | Quiz | Una pregunta = 1 punto | Acierta la opción correcta. V/F es el caso de 2 opciones | Tocar una opción; retroalimentación inmediata con explicación |
| `concurso` | Concurso | Igual que el quiz | Igual que el quiz: el reloj no cambia la nota | Reloj por pregunta que **no corta** al llegar a cero (WCAG 2.2.1) |
| `completar` | Completar | Una frase = 1 punto | Opción exacta, **con tildes** (hay actividades de ortografía) | Banco de palabras; el hueco se llena con lo elegido |
| `emparejar` | Emparejar | Un par = 1 punto | Cuenta el **primer** intento de cada par | Tocar una tarjeta de cada columna, en cualquier orden; los errores se avisan y se puede seguir |
| `ordenar` | Ordenar | Uno, vale N | Una parte por elemento en su posición exacta 🔶 (regla abierta en D4) | Botones de subir y bajar; el foco acompaña al elemento |
| `clasificar` | Clasificar | Un elemento = 1 punto | Primera cesta elegida | Un elemento a la vez y un botón por categoría; lo ubicado queda a la vista en su cesta correcta |
| `memoria` | Memoria | Uno, vale N parejas | Completar el tablero = puntaje máximo; los volteos no restan (D4) | Voltear dos cartas; si no son pareja, se voltean solas |
| `sopa-letras` | Sopa de letras | Una palabra = 1 punto | La línea marcada forma la palabra, en cualquier sentido | Tocar la primera y la última letra; flechas del teclado recorren la cuadrícula; se puede terminar en cualquier momento |
| `palabra-secreta` | Palabra secreta | Una palabra = 1 punto | Se completa antes de agotar los fallos | Teclado en pantalla y teclado físico; las tildes no importan al proponer |

`sopa-letras` y `palabra-secreta` no estaban en el catálogo D4: se añadieron por la investigación de abajo. La palabra secreta es la mecánica del «ahorcado» **sin el ahorcado**: los fallos se muestran como puntos, sin imagen violenta.

Reglas comunes:

- **Nada exige arrastrar** (WCAG 2.5.7): todo se resuelve tocando o con el teclado.
- **El acierto y el error nunca son solo color**: llevan ícono (✓ / ✗) y texto, y se anuncian en una región `status`.
- **Sin puntos, monedas ni rankings** (PRODUCT.md, «Sin economía de juego»): el resultado son estrellas propias (`estrellasDe`, umbrales 60 % y 90 % 🔶) y un repaso con la respuesta correcta de cada ítem.
- **Objetivos táctiles ≥ 44 px**, salvo las letras de la sopa (≈32 px a 390 px de ancho; AA no lo exige, pero es el punto más justo).
- **Movimiento reducido**: sin animaciones con `prefers-reduced-motion`.

## Investigado y no implementado (por ahora)

Tipos comunes en herramientas de actividades interactivas (plantillas de Wordwall, Educaplay, el módulo Game de Moodle y herramientas de autor del Ministerio de Educación de España). Se toma solo la idea de la mecánica, nunca contenido ni identidad.

| Tipo | Por qué no todavía |
|---|---|
| Crucigrama | Muy útil para vocabulario, pero la cuadrícula con escritura es difícil de hacer accesible en tableta; candidato siguiente |
| Ruleta (pregunta al azar) | Es una forma de elegir preguntas, no un tipo: puede volver como modo del quiz en clase |
| Mapa o imagen interactiva (etiquetar) | Necesita imágenes propias con texto alternativo y una alternativa sin imagen; depende de los medios de `content/actividades/` (D1) |
| Bingo, «millonario», serpientes y escaleras | Juegos de grupo o de azar: encajan con las salas en vivo, fuera de alcance |
| Anagrama / letras desordenadas | Fácil de añadir; queda para cuando haya más contenido de ortografía |

## Contenido

Las actividades viven en `apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json` (D1; la carpeta es el nombre normalizado de la asignatura: «Ética y valores» → `etica-y-valores`). Hoy hay 55, cinco por cada asignatura de 5.°, de redacción propia. `curriculo.test.ts` exige que todos los archivos sean válidos. Los textos no usan nombres de personas (regla dura 1). 🔶 El campo `tema` describe el tema curricular en palabras propias; los códigos DBA llegan con `curriculo/referentes` (`fundacion-actividades` 3.2).

Fuentes de la investigación:

- [Wordwall: plantillas de cuestionario, emparejar, ruleta y sopa de letras](https://www.educaciontrespuntocero.com/tecnologia/juegos-con-wordwall/)
- [Moodle, módulo Game: ahorcado, crucigrama, sopa de letras, millonario…](https://docs.moodle.org/es/Game_module)
- [Redined (Ministerio de Educación de España): plantillas de actividades interactivas](https://redined.educacion.gob.es/xmlui/handle/11162/254050)
- [WCAG 2.2, criterio 2.5.7 Movimientos de arrastre](https://orases.com/blog/wcag-2-2-drag-and-drop-accessibility/)
- [Alternativas accesibles al arrastrar y soltar](https://accessinghigherground.org/?p=29378)
