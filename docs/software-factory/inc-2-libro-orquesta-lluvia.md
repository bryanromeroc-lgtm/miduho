# Inc. 2 · Libro original «La orquesta de la lluvia»

## Tarjeta de producto

**Estado:** en ejecución. **Solicitud:** crear e integrar un cuento original para 6–8 años, tras aprobar dos muestras visuales. La persona usuaria precisó que quiere pliegos de dos páginas con una ilustración continua y texto en ambas hojas.

**Observado:** el catálogo asigna 6–8 años a «Al ritmo del corazón» (`lit-132`). Su ficha pública en Maguaré presenta el ritmo y el apoyo afectivo entre personajes. El PDF de esa obra prohíbe su reproducción y venta. El lector de MIDUHO ya empareja las páginas 2–3, 4–5, etc. y admite páginas compuestas con texto HTML.

**Decisión de contenido:** «La orquesta de la lluvia» es una historia distinta de un copetón y una rana que descubren sonidos del patio, escuchan, toman turnos y construyen un ritmo compartido. Sus personajes, redacción, escenas y técnica de collage son propios de este proyecto. No se usan ilustraciones, personajes, texto ni maquetación de Maguaré. Las imágenes fueron generadas para MIDUHO y deben almacenarse con su procedencia.

**Procedencia de activos:** el texto se redactó en esta tarea a partir de la premisa anterior. La portada, cinco escenas continuas y contraportada se generaron con ImageGen para MIDUHO el 4 de noviembre de 2026; las escenas posteriores tomaron como única referencia visual la portada original generada en la misma tarea. Los WebP `i02`–`i11` son mitades consecutivas de esas cinco escenas; `i01` e `i12` son portada y contraportada independientes. Los WebP y miniaturas son los activos de publicación. 🔶 La atribución jurídica formal de la obra dentro del colegio y su eventual licencia de redistribución quedan por definir con la institución; la ficha muestra «MIDUHO» como crédito editorial del proyecto.

**Alcance:** portada, cinco pliegos narrativos continuos, página de cierre/créditos, ficha de catálogo, recursos WebP y texto seleccionable en cada hoja. Los recursos optimizados de esta obra propia se incluyen en `apps/web/public/images/biblioteca/la-orquesta-de-la-lluvia/` para que el despliegue standalone no dependa del volumen de libros de terceros.

**Criterios de aceptación**

1. El título se busca en Biblioteca y el botón «Leer» abre `/biblioteca/leer/la-orquesta-de-la-lluvia`.
2. En pantalla amplia, las hojas 2–3, 4–5, 6–7, 8–9 y 10–11 muestran mitades contiguas del mismo pliego. En móvil se leen en orden sin texto cortado.
3. Todo texto narrativo está en HTML, se puede seleccionar y tiene contraste legible; cada ilustración informativa tiene descripción alternativa específica.
4. Las imágenes y miniaturas existen en la ruta publicada y el libro tiene créditos y declaración de procedencia sin atribuir derechos ajenos.
5. Pasan `npm run lint`, `npm run build` y las pruebas pertinentes; se documentan resultados y pendientes.

**Archivos previstos:** `apps/web/src/data/demo.ts`, `apps/web/src/features/biblioteca/libros.ts`, `apps/web/src/features/biblioteca/paginas/la-orquesta-de-la-lluvia.ts`, `apps/web/src/features/biblioteca/components/flipbook.tsx`, `apps/web/src/features/biblioteca/components/flipbook.module.css`, pruebas de catálogo y recursos WebP optimizados.

**Verificación prevista:** `npm run lint`, `npm run build`, `npm test` (requiere PostgreSQL de desarrollo) y comprobación visual de un pliego en escritorio y hoja suelta en móvil.

## Evidencia y cierre

**Implementado:** ficha `lit-181` y entrada del lector; portada, diez hojas narrativas y contraportada; cinco pliegos alineados por pares; 24 WebP optimizados (12 ilustraciones y 12 miniaturas, ~1,4 MB en total). La contraportada tiene ilustración propia. Los textos se guardan como datos de `PaginaCompuesta` y se representan en HTML. Cada hoja tiene descripción alternativa específica. Los archivos del libro se incluyen en el paquete web, a diferencia del volumen externo de libros de terceros.

**Verificación ejecutada:** `npm run build` pasó con Next.js 16.3.4; después de reducir la prueba nueva a cuatro casos que cubren catálogo, recursos, texto y compatibilidad de miniaturas, `npm run lint` y `npm test` volvieron a pasar (64 archivos, 752 pruebas). Tras sustituir la ilustración de contraportada y ajustar su `alt`, las cuatro pruebas específicas volvieron a pasar. Se verificó además la composición del pliego 8–9 en navegador a 1440×1000 y 390×844 con los mismos recursos y reglas visuales; las mitades se unen y el texto cabe.

**Revisión de derechos y accesibilidad:** ilustraciones nuevas generadas para este proyecto, sin activos de Maguaré; texto narrativo en HTML, no incluido en el raster; panel de texto crema casi opaco con tinta `#20334b`; foco y navegación del lector reutilizan los controles existentes.

🔶 La sesión local de QA no pudo entrar a la ruta autenticada porque las credenciales de prueba fueron rechazadas. La captura visual corresponde a una vista temporal de composición, no a la ruta final. Es necesario repetir la inspección visual autenticada con una sesión válida cuando esté disponible. Esta limitación no afecta al resultado de compilación ni a las pruebas de datos y recursos.

**Fuentes de orientación:** [ficha de la obra de referencia en Maguaré](https://maguare.gov.co/ritmo-corazon/) (solo temas generales), [lecturas para 5–8 años de Reading Rockets](https://www.readingrockets.org/topics/childrens-books/articles/choosing-childs-book). El libro final no adapta el texto ni las ilustraciones de la obra de referencia.
