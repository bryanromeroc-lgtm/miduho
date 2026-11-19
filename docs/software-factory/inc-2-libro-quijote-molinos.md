# Inc. 2 · «Don Quijote y los molinos»

## Tarjeta de producto

**Estado:** implementado y verificado. **Solicitud:** adaptación ilustrada de *Don Quijote de la Mancha* para quinto grado, integrada en la Biblioteca MIDUHO con pliegos continuos a doble página. La persona usuaria añadió una dirección editorial concreta: portada con escudo, página de procedencia y cierre con marca institucional, siguiendo las capturas de «La liebre y la tortuga».

**Observado:** el episodio de los molinos pertenece a la primera parte, capítulo VIII. Don Quijote cree ver gigantes; Sancho identifica molinos y le advierte; el viento mueve un aspa, rompe la lanza y derriba a caballero y caballo; Sancho lo ayuda y don Quijote atribuye lo ocurrido a un encantador. La guía de Lenguaje del MEN para grado quinto propone contrastar hipótesis, buscar pistas explícitas e implícitas y sustentar interpretaciones en el texto.

**Decisión editorial:** adaptación breve de **un episodio**, no resumen de la novela completa. Título: «Don Quijote y los molinos». Público propuesto: quinto grado, rango 9–11 de la Biblioteca. Objetivo: comparar las perspectivas de los personajes y justificar una interpretación con evidencias narrativas. Relato nuevo de MIDUHO en español de Colombia; conserva los hechos esenciales del capítulo VIII y presenta la escena sin burlarse de los personajes. Portada editorial, página «Detrás de este cuento», apertura narrativa, cinco pliegos narrativos y página de cierre con preguntas y escudo. Toda la tipografía de la edición es HTML.

**Derechos y fuentes:** la novela original en español de Miguel de Cervantes se publicó en 1605 y 1615; el autor murió en 1616. La Ley 23 de 1982 de Colombia, art. 21, fija protección patrimonial de vida más ochenta años para persona natural. Se toma como base el texto original del [capítulo VIII en Project Gutenberg](https://www.gutenberg.org/files/2000/2000-h/2000-h.htm); no se incorporan traducciones, notas editoriales ni ilustraciones de una edición moderna. La redacción de esta adaptación y las ilustraciones se generaron para MIDUHO con asistencia de IA el 5 de noviembre de 2026. El escudo proviene del archivo `LOGOMIDUHO.jpeg` proporcionado por el usuario; se optimizó sin redibujarlo. Se acredita a Cervantes y se identifica expresamente la adaptación. 🔶 La titularidad institucional formal y licencia de redistribución de estos nuevos recursos deben definirse con el colegio.

**Orientación pedagógica:** [Guía docente de Lenguaje, grado quinto (MEN)](https://contenidos.mineducacion.gov.co/ntg/men/archivos/Referentes_Calidad/Modelos_Flexibles/Grado%20Quinto/Grado%20Quinto/LIBRO%205%20GUIA%20DOCENTE/LIBRO%205%20GUIA%20DOCENTE%20-%2001a.pdf), sección de lectura y literatura. **Verificación histórica:** [Instituto Cervantes, cronología de Cervantes](https://cvc.cervantes.es/literatura/clasicos/quijote/introduccion/resumen/). **Norma:** [Ley 23 de 1982, art. 21](https://normativa.colpensiones.gov.co/colpens/docs/ley_0023_1982.htm).

**Criterios de aceptación**

1. Ficha 9–11 en Biblioteca; «Leer» abre `/biblioteca/leer/don-quijote-y-los-molinos`.
2. Portada y cierre llevan el escudo oficial; la página 2 explica origen, adaptación, realización y fuentes con enlaces. Las páginas 4–13 forman cinco escenas continuas, emparejadas 4–5, 6–7, etc. Cada mitad y miniatura existe.
3. La narración y los créditos son HTML seleccionable. Cada mitad tiene descripción alternativa útil por separado; en móvil se lee una hoja por vez.
4. La ficha y el libro declaran «Miguel de Cervantes · adaptación MIDUHO», sin atribuir al colegio el texto original.
5. Pasan lint, build y pruebas pertinentes. Se documenta la revisión visual y cualquier límite.

**Archivos:** `apps/web/src/features/biblioteca/paginas/don-quijote-y-los-molinos.ts`, `apps/web/src/features/biblioteca/libros.ts`, `apps/web/src/data/demo.ts`, `apps/web/src/features/biblioteca/components/flipbook.tsx` y `flipbook.module.css`, recursos WebP en `apps/web/public/images/biblioteca/don-quijote-y-los-molinos/`, escudo optimizado en `apps/web/public/images/biblioteca/escudo-editorial.webp`, pruebas de integridad, skill local de libros ilustrados, `.gitignore` y esta tarjeta.

## Evidencia de implementación y QA

**Contenido publicado:** 14 hojas: portada, créditos editoriales, apertura, diez mitades narrativas que forman cinco pliegos, y cierre. Hay 13 ilustraciones WebP de página y 14 miniaturas, más el escudo compartido (320 × 320 px); los recursos de página suman ~2,5 MiB. Las imágenes de origen sin cortar se guardan en `content/biblioteca/don-quijote-y-los-molinos/fuentes/`, fuera de git; una regla de `.gitignore` protege esas fuentes pesadas. El arte final está en `/public` y viaja con la app standalone.

**Accesibilidad y diseño:** portada, procedencia, títulos, preguntas y relato son HTML, no texto dentro de imágenes. La página de fuentes tiene enlaces reales y foco visible. Las ilustraciones informativas tienen `alt`; la página de créditos no finge tener ilustración. El texto editorial usa tinta `#20343e`, azul `#086783`, verde `#276342` o terracota `#9c492c` sobre `#fffdf8`, con contrastes calculados entre 6,07:1 y 12,73:1. El escudo proviene del archivo entregado por la persona usuaria y solo se convirtió a WebP.

**QA ejecutado el 5 de noviembre de 2026:** `npm run build` pasó con Next.js 16.3.4; `npm run lint` pasó; `npm test` pasó (66 archivos, 769 pruebas); la prueba específica de la adaptación pasó (3 casos); el validador de la skill pasó y el detector mecánico de interfaz no reportó hallazgos. Se revisó la ruta autenticada en navegador con base de datos desechable: portada, créditos y pliego a 1440 × 1000; portada, créditos, una hoja narrativa y cierre a 390 × 844. El DOM expuso los textos, enlaces y descripciones alternativas. Las capturas locales están en `output/playwright/quijote-*.png` (ignoradas por git).

**Defectos corregidos durante QA:** al abrir la ruta directamente en móvil, la escena calculaba su altura desde el marcador de carga y dibujaba la hoja a media anchura; se fijó la altura antes de crear PageFlip. En la página de créditos móvil, el texto y el pie se solapaban y las flechas tapaban párrafos; se condensó la redacción y se colocaron las flechas bajo la hoja. La captura final de 390 × 844 muestra la hoja completa, ambos enlaces y el pie sin recortes.

🔶 **Pendiente institucional:** confirmar la titularidad patrimonial y la licencia de redistribución de la adaptación y de sus ilustraciones nuevas. Esto no afecta el dominio público de la novela original ni la atribución a Cervantes.

## Ajuste de la ficha de Biblioteca

**Solicitud:** la cubierta del resultado de búsqueda debe mostrar la misma identidad MIDUHO que la portada del lector. **Observado:** el catálogo componía todos los libros con contenido a partir de ilustración arriba y rótulo abajo; por eso la ficha de Don Quijote omitía el escudo aunque la hoja 1 del lector sí lo incluía. **Cambio:** la disposición `portada-editorial` tiene ahora una miniatura HTML con título, ilustración y escudo oficial con nombre del colegio; las demás cubiertas conservan su presentación. La ficha mantiene el título y la autoría legibles fuera de la miniatura.

**Verificación del ajuste:** sesión ficticia de quinto en `/biblioteca`, búsqueda «quijote», capturas de escritorio y 390 × 844 en `.playwright-cli/` (fuera de git). La miniatura muestra escudo y marca en ambos tamaños. `npm run lint` pasó con una advertencia ajena en `ruta-palabras/juego.tsx`; `npm run build` pasó; `npm test` pasó (67 archivos, 782 pruebas). El detector mecánico de interfaz reportó `[]`. La app volvió a iniciarse en `localhost:3000`.
