---
version: 1
slug: "src-app-biblioteca-page-tsx"
primary_target: "src/app/biblioteca/page.tsx"
related_targets: ["src/app/biblioteca/biblioteca.module.css","src/components/biblioteca/valle.tsx","src/components/biblioteca/portada.tsx"]
---

# Biblioteca — surface brief

Scope: `/biblioteca` (src/app/biblioteca/page.tsx + biblioteca.module.css + components/biblioteca/valle.tsx, portada.tsx). Visitor mode: Operate (la docente busca, filtra y abre un título) enmarcado por el portal ilustrado del home.

Audience: docente de primaria preparando o dictando clase. Job: encontrar un título por nombre/autor o recorrer el catálogo por tipo, edad e idioma; abrir los libros digitalizados. Proof/content: 26 fichas de muestra del corpus de 317; solo 2 obras tienen páginas (portada real); el resto lleva cubierta compuesta en código. Constraints: paginado, texto real, WCAG AA, un solo menú, sin texturas fotográficas ni grapas, sin colores de área mezclados, movimiento reducible. La pastilla de tipo solo aparece cuando el tipo no es «Libro» (el defecto no lleva etiqueta).

Confirmed answers (2026-09-13): portadas reales solo para los libros leíbles; escena del hero pedida a Gemini pero la clave no tiene cuota de imagen → escena autorada en SVG/Twemoji con el prompt guardado en public/images/biblioteca/README.md para regenerarla después.

## Direction contract

THESIS: La Biblioteca es un lugar —el valle de los cuentos— y no una lista. Rechaza la plancha de filtros pesada seguida de una rejilla de tarjetas beige del mismo tamaño; los libros son objetos de pie sobre estantes.

OWN-WORLD: Mismo sistema del home: cielo/colinas/camino a sangre, Nunito 850, pastillas, familia naranja Literatura. Lo nuevo de esta superficie: un cielo de atardecer melocotón visible sobre la línea de montañas, una aldea de casas hechas de libros apilados, un árbol-biblioteca con farol encendido y páginas que vuelan; abajo, estantes con raíl de madera plana (la misma familia cálida del camino del hero: #e2bb7b→#a9713e, sin textura) y sombra ambiental, sobre los que los libros se apoyan con lomo, canto de páginas y cubierta. Las cubiertas compuestas usan la paleta de las casas-libro (azul, rojo, verde, mostaza, terracotas) en tres composiciones y cuatro formatos físicos para que ningún par de vecinos sea igual.

STORY: La docente llega al valle, ve de inmediato los dos libros que puede abrir hoy (portada real, grande, en la mesa de lectura), busca por título/autor desde el propio hero y recorre los estantes filtrando por tipo, edad e idioma; cada obra muestra su hermana (guía/audio) de forma explícita.

FIRST VIEWPORT: Hero panorámico a sangre (min 460px): izquierda, «Biblioteca» en display + «317 títulos · español, inglés y francés» + una frase + el campo de búsqueda en pastilla de 52px como acción primaria; derecha, la escena SVG (aldea de libros, árbol con farol, páginas volando, estrellas). Sobre el borde inferior del hero se posa la «Mesa de lectura»: los dos libros leíbles de pie con portada real, resumen y botón «Leer el libro». Debajo: cinta de filtros blanca de una línea y los estantes del catálogo (6 libros por estante en escritorio, 12 por página).

FORM: Estantes de biblioteca ilustrada — primera de la lista propia (estantes / valle / mesa de lectura / cinta de filtros). Seed key: n/a — exención deliberada: petición precisa del usuario («estilo similar al home pero ambientado para literatura», portadas en cada libro) dentro de un mundo ya establecido en DESIGN.md; new-work.md §3 excluye el concept-seed para «a precisely specified narrow request». Registrado como waiver el 2026-09-13.

MOTION: Momento focal único: al entrar, la escena se arma —colinas suben, el farol se enciende, las casas-libro brotan escalonadas— en ≤700 ms con cubic-bezier(.16,1,.3,1); páginas y estrellas flotan en bucle lento. Continuidad: al filtrar, los libros vuelven a entrar al estante con escalonado ≤400 ms. Feedback: hover/focus abre la cubierta (rotateY) y eleva el libro; chips confirman. Con prefers-reduced-motion: solo opacidad, sin bucles ni giros.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
