# Auditoría de producto, diseño y arquitectura — MIDUHO

**Propósito:** saber qué tan lejos está MIDUHO de poder venderse a un colegio de ~400 usuarios (docentes y estudiantes), qué tan sólido es su diseño visual como producto y cuál es la arquitectura recomendada para este tipo de plataforma.
**Fecha:** 2026-09-26
**Alcance revisado:** código de `app/` (commit `1f6d2df`), `docs/arquitectura-backend.md`, `docs/modelo-de-entidades.md`, `PRODUCT.md`, `DESIGN.md`, `biblioteca/LICENCIA.md`, `flipbook-forge/` y el backlog de la bóveda Obsidian.
**Método:** lectura de código, `npm run lint` y `npm run build`, servidor de producción local (`next start`), medición con Playwright (8 rutas, 1440 px y 390 px), escaneo automático con axe-core (WCAG 2.1 A/AA + buenas prácticas) y revisión visual de capturas.
**Convención:** **[O]** observado · **[I]** inferido · **[P]** propuesto · 🔶 por confirmar.

---

## 0. Veredicto en una página

**MIDUHO hoy es una maqueta de alta fidelidad, no un producto vendible.** [O] Toda la aplicación es frontend estático con datos escritos en el código: no hay inicio de sesión, base de datos, roles, persistencia ni forma de que una docente cree, programe o califique nada. Las 51 páginas que genera `next build` son HTML estático.

Lo que sí tienes es valioso y poco común en un proyecto de este tamaño:

- Una **investigación de producto excelente**: 26 documentos, 54 reglas de negocio, 30 historias de usuario y un hallazgo que da sentido al producto («el aula está vacía»).
- Un **modelo de datos y una arquitectura de backend bien pensados** (autorización por `AsignacionDocente`, auditoría, IDs no adivinables, minimización de datos de menores).
- Una **identidad visual con carácter** y ejecución cuidada: **0 violaciones automáticas de accesibilidad** en 16 combinaciones de ruta y pantalla; el build y el linter pasan limpios.

Hay **cuatro bloqueantes de venta**, en este orden:

| # | Bloqueante | Por qué bloquea |
|---|---|---|
| B1 | **Riesgo legal del contenido de la biblioteca** | 35 libros de Maguaré y el Ministerio de Culturas publicados sin la autorización escrita que tu propio `LICENCIA.md` exige; un libro («¡Préstame tus ojos!») cuyo campo editorial dice `"Trend"` [I: probable origen en la plataforma de referencia]; 85 MB de estas obras subidos a un repositorio de GitHub. Esto se resuelve antes de mostrarle la plataforma a nadie. |
| B2 | **No existe backend** | Sin autenticación, roles ni datos reales no hay producto que instalar. |
| B3 | **Tratamiento de datos de menores sin resolver** | Ley 1581 de 2012: el colegio es responsable y tú serías encargado del tratamiento. Sin política, contrato de transmisión y autorización de acudientes, ningún colegio serio puede firmar. |
| B4 | **Lo que más compra un colegio no está** | Notas y boletines (Decreto 1290 / SIEE), asistencia y comunicación con acudientes. La evaluación está bloqueada por el SIEE y la asistencia no aparece en el backlog. |

**Distancia estimada a un MVP vendible** [P] 🔶: entre 20 y 26 semanas de trabajo a tiempo completo para una persona (incrementos 1, 2, 4 y 6 del backlog, más endurecimiento, cumplimiento legal y un piloto). Con el calendario A (año escolar desde finales de enero), lo realista es **un piloto de un grado en febrero de 2027** y los 400 usuarios en el segundo semestre de 2027.

### Tarjeta de calificación

| Dimensión | Nota (1–5) | Resumen |
|---|:-:|---|
| Definición de producto e investigación | **5** | Sobresaliente. Es el activo más fuerte del proyecto. |
| Arquitectura propuesta (en papel) | **4** | Correcta para la escala. Ajustes: sesiones revocables, login infantil y la decisión de un colegio o varios (§4). |
| Calidad visual de ejecución | **4** | Tipografía, color y jerarquía sólidos, y detalles con oficio. |
| Coherencia del sistema visual | **2** | Cuatro «mundos» visuales y tres lenguajes de ilustración conviven sin un sistema común (§3). |
| Accesibilidad | **3** | Automática impecable; falla donde el producto promete diferenciarse, en el lector (texto como imagen). |
| Rendimiento | **3** | Páginas ligeras; el lector descarga el libro completo (4,4 MB) al abrirlo. |
| Funcionalidad | **1** | Solo navegación y lectura. |
| Seguridad y datos de menores | **1** | Diseñado en los documentos, sin implementar. |
| Legal y derechos de contenido | **1** | Riesgo alto y activo (B1). |
| Operación (tests, CI, backups, monitoreo) | **1** | No hay pruebas, CI, monitoreo ni respaldos. |

---

## 1. Estado real, pantalla por pantalla [O]

| Pantalla | Ruta | Qué funciona | Qué es decorativo o falso |
|---|---|---|---|
| Inicio | `/` | Enlace a la primera clase y a los tres mundos | Fecha fija («Martes 9 de septiembre»), saludo al grupo y no a la docente; el día completo no aparece en el inicio |
| Mis clases | `/clases` | Friso de 4 clases con su material | «+ Añadir material» solo enlaza a la biblioteca y no añade nada |
| Clase | `/clases/c1…c4` | Contenido asociado, próxima entrega, tamaño del grupo | Pestañas «Planeación · Actividades · Notas · Estudiantes» son `<span>` sin acción; cifras fijas (12/25, 25) |
| Biblioteca | `/biblioteca` | Búsqueda y filtros en el cliente, paginación, 37 libros legibles | «317 títulos» está fijo en el código y solo existen 61 fichas; los filtros no quedan en la URL |
| Lector | `/biblioteca/leer/[libro]` | Hojeo, índice, pantalla completa, teclado | Páginas como imagen (§3.2 V8) |
| Laboratorios | `/laboratorios` | Dos planetas, misiones y ficha de misión | Progreso («1 de 4 misiones») fijo en el código |
| Ruta didáctica | `/laboratorios/u7` | Las 7 secciones con texto real, estándares y DBA | «Cambiar programación» enlaza a la Agenda y no programa nada; solo existe una ruta (u7) |
| Agenda | `/agenda` | Calendario de septiembre y lista «Sin programar» | Mes fijo sin navegación; eventos escritos en el código |

**Implicación comercial:** en una demostración, la persona del colegio va a hacer clic en «Notas» o «Estudiantes». Hoy no pasa nada, y eso resta más confianza que no mostrar la pestaña.

---

## 2. Evaluación como producto para un colegio de ~400 usuarios

### 2.1 Lo que un colegio colombiano espera comprar

| Capacidad | Estado | Nota |
|---|:-:|---|
| Inicio de sesión y 5 roles (admin, coordinación, docente, estudiante, acudiente) | ❌ | Diseñado (`arquitectura-backend.md` §5–6) |
| **Acceso de niños de 6–10 años** | ❌ | Ver §2.3: correo + contraseña no sirve a esta edad |
| Carga masiva de usuarios y matrícula (CSV) | ❌ | Diseñado (HU-07). 🔶 ¿El colegio reporta a SIMAT? Un formato compatible ahorra doble digitación |
| Contenido asociado a la clase | 🟡 | Solo visual. **Falta quién crea y administra el contenido**: hoy vive en archivos `.ts` y requiere a un programador |
| Biblioteca digital | 🟡 | La mejor pieza del demo, pero con riesgo legal (B1) y un lector poco eficiente |
| Planeación con Estándares y DBA | ❌ | La ruta didáctica muestra estándares; no hay editor |
| Actividades y entregas | ❌ | Incremento 4 |
| **Notas y boletines (Decreto 1290, escala Superior/Alto/Básico/Bajo)** | ❌ | Bloqueado por el SIEE. 🔶 Pregunta clave: ¿el colegio ya tiene un sistema de notas? Si lo tiene, MIDUHO puede **complementarlo** (exportar) en lugar de reemplazarlo, y el MVP se acorta unas 4 semanas |
| **Asistencia** | ❌ | **No está en el backlog.** Es de uso diario y las inasistencias suelen contar en el SIEE |
| Comunicación con acudientes (circulares, mensajes) | ❌ | Incremento 6. Suele ser lo que más valoran rectoría y familias |
| Reportes para coordinación y rectoría | ❌ | Sin diseño |
| Móvil para acudientes | 🟡 | Responsive, sin PWA ni notificaciones |
| Soporte, capacitación, SLA, respaldos y contrato | ❌ | Ver §5 |

### 2.2 Capacidad: 400 usuarios es poca carga para el servidor; el cuello de botella es el internet del colegio

**Carga del servidor** [P]:

- 400 cuentas (~30 docentes y ~370 estudiantes). **Si entran los acudientes, se suman 300–600 cuentas más** 🔶.
- Pico escolar realista: 3–4 grupos conectados a la vez, unas 100 sesiones simultáneas. A razón de una petición cada 5 segundos por sesión, son unas **20 peticiones por segundo**.
- Pico de acudientes: el día que se publican boletines, unos 300 acudientes en una hora.
- Un solo proceso de Next.js con PostgreSQL atiende esto con mucho margen. **No se necesitan microservicios, Kubernetes ni Redis.**

**Ancho de banda: el riesgo real** [O, medido]:

| Escenario | Datos | Tiempo con 20 Mbps | Tiempo con 50 Mbps |
|---|---|---|---|
| **Hoy:** 25 estudiantes abren el mismo libro | 25 × 4,4 MB ≈ **110 MB** | **~44 s** | ~17 s |
| **Propuesto:** carga solo las 4 primeras hojas y el resto bajo demanda | 25 × ~0,25 MB ≈ 6 MB | ~2,5 s | ~1 s |

Medición: al abrir *La voz de los hermanos mayores* en un teléfono de 390 px se descargan **72 imágenes de página (4,4 MB) de inmediato**. El código pide `loading="lazy"` desde la página 5 en adelante, pero la librería `page-flip` clona los nodos (136 nodos `data-pagina` para 68 hojas) y anula esa carga diferida.

**Tamaño de las páginas** [O]: el inicio transfiere ~235 KB con caché vacía y la biblioteca ~435 KB, casi todo imágenes; el CSS principal pesa 22 KB comprimido. Está bien. Las transiciones animadas, en cambio, suman latencia artificial (§3.2 V10).

### 2.3 Seguridad y datos de menores

**Riesgos del diseño actual** [I/P]:

1. **Los niños no tienen correo.** Un estudiante de 1° (6 años) no puede entrar con correo y contraseña. La arquitectura solo contempla credenciales de correo. [P] Propuesta:
   - **Estudiantes:** código de grupo + usuario + PIN o «contraseña de imágenes», o **tarjeta QR impresa** que la docente reparte, sin correo. La docente puede restablecer el acceso desde su panel.
   - **Acudientes:** correo o celular con enlace mágico o código de un solo uso.
   - **Docentes y administración:** correo + contraseña, con **segundo factor obligatorio para admin y coordinación**. SSO de Google Workspace for Education como opción si el colegio ya lo usa 🔶.
2. **Sesiones JWT con los roles adentro** (`arquitectura-backend.md` §5): no se pueden revocar. Si una docente se retira, pierde su celular o le cambian una asignación, el token sigue siendo válido hasta que expire. Para datos de menores conviene usar **sesiones en base de datos, revocables**.
3. **`/public` es público.** Todo lo que se sirve desde ahí lo puede abrir cualquiera que tenga la URL, incluidas las guías «Solo docente» cuando tengan archivo. El material restringido tiene que ir en almacenamiento privado con URLs firmadas y de corta duración.
4. **Sin cabeceras de seguridad**: `next.config.ts` está vacío. Faltan CSP, HSTS, `X-Frame-Options` o `frame-ancestors`, `Referrer-Policy` y `Permissions-Policy`.
5. **Sin `noindex`**: una plataforma escolar privada no debe aparecer en buscadores.
6. **Límite de intentos de login «en memoria»**: se pierde en cada reinicio. Debe guardarse en la base de datos.

**Cumplimiento legal** (resumen; 🔶 validar con un abogado):

- **Ley 1581 de 2012 y Decreto 1377 de 2013** (compilado en el Decreto 1074 de 2015): el tratamiento de datos de niños solo procede si responde a su **interés superior** y respeta sus derechos fundamentales, con **autorización del representante legal**.
- **Roles:** el colegio es **responsable** del tratamiento y tú, como proveedor, **encargado**. Se necesita un **contrato de transmisión de datos**, además de una **política de tratamiento** y un **aviso de privacidad** publicados.
- **Nube fuera de Colombia:** hay que verificar las reglas de transferencia internacional (art. 26 de la Ley 1581 y la lista de países con nivel adecuado de la SIC).
- **RNBD:** el colegio podría tener que registrar la base de datos en el Registro Nacional de Bases de Datos, según su tamaño 🔶.
- **Plan de salida:** el contrato debe garantizar que el colegio puede exportar todos sus datos y que se borran al terminar.

### 2.4 Legal y derechos de contenido — **prioridad máxima**

[O] Hechos verificados:

- `biblioteca/LICENCIA.md` dice textualmente que los términos de Maguaré **prohíben por defecto reproducir, transformar y divulgar** los contenidos, y que la autorización está **«PENDIENTE DE ADJUNTAR»**. Aun así, 35 obras de Maguaré y el Ministerio de Culturas están convertidas en `public/libros/`, se muestran en el demo y están en commits enviados a `origin/main` (GitHub). Los PDF (p. ej. *La muñeca negra*) incluyen la línea «© Ministerio de las Culturas, las Artes y los Saberes de Colombia».
- «¡Préstame tus ojos!» (Gerardo Meneses Claros, autor vivo) tiene `editorial: "Trend"` en `src/lib/libros.ts:82`, y su fuente en `biblioteca/prestame_tus_ojos/` son 38 PDF de una página (`page0001.pdf`…). [I] Ese patrón y el campo editorial sugieren que la obra se obtuvo de la plataforma de referencia, lo que viola la regla dura n.º 2 de `AGENTS.md`. El nombre «Trend» aparece además visible en la tarjeta de la Biblioteca.
- El pie de página dice «Los títulos de literatura son obras de dominio público». **Es falso** para las 37 obras digitalizadas, que son contemporáneas y tienen derechos de autor vigentes o licencias específicas.
- Los pictogramas Twemoji (CC BY 4.0) exigen atribución visible. Hoy la atribución solo está en comentarios del código.

[P] Qué hacer, en orden:

1. Retirar «¡Préstame tus ojos!» del demo y del repositorio hasta confirmar su origen y sus derechos.
2. Conseguir **por escrito** la autorización de Maguaré o del Ministerio, con su alcance, vigencia y condiciones de atribución, o retirar esas obras del demo.
3. 🔶 Verificar si el repositorio de GitHub es público. Si lo es, hacerlo privado y considerar reescribir el historial (`git filter-repo`), porque los libros siguen en commits anteriores.
4. Corregir el texto del pie de página y añadir una página de **créditos y licencias** visible (Twemoji, StoryWeaver CC BY 4.0, Maguaré).
5. Para vender: construir el catálogo sobre **dominio público verificable**, licencias abiertas (StoryWeaver, CC BY) y **contenido que el colegio ya tenga licenciado**. El producto es la plataforma; el contenido de terceros no es algo que puedas vender.

### 2.5 Operación [O]

- **0 pruebas** automáticas, sin CI ni monitoreo, sin respaldos (no hay base de datos que respaldar).
- **85 MB de imágenes de libros en git.** Pertenecen a almacenamiento de objetos con CDN, no al repositorio.
- `npm run build` avisa de un `package-lock.json` suelto en `/home/bryan` que confunde la detección de la raíz del proyecto. Se arregla con `turbopack.root` o borrando ese archivo.
- `CLAUDE.md` dice «Git local, sin remote», pero existe `origin` en GitHub y `main` está sincronizada. Conviene corregir el documento.
- **No existe herramienta de contenido**: agregar un libro exige correr `flipbook-forge` por consola y editar `libros.ts`. Un colegio necesita subir un PDF desde un formulario.

---

## 3. Auditoría visual y de diseño

### 3.1 Fortalezas (conservar)

- **El friso de planchas** (Mis clases): idea propia y memorable que resuelve de verdad «qué clase tiene material y cuál no» sin leer una cifra. Es el mejor argumento visual del producto.
- **La ruta didáctica**: layout de lectura ejemplar, con medida de 65–75 caracteres, numeración clara, texto real y la columna lateral de liberación, estándares y DBA.
- **Disciplina de accesibilidad**: un solo `<nav>` para escritorio y móvil, enlace «Saltar al contenido», foco visible de 3 px, `prefers-reduced-motion` respetado, colores «medio» calculados para contraste AA, `aria-pressed` en los filtros y `aria-live` en los resultados. **axe-core: 0 violaciones** en las 8 rutas a 1440 px y a 390 px.
- **La biblioteca como lugar**: estantes, raíl y libros con cuerpo físico. Tiene encanto y sigue siendo usable.
- **El lector inmersivo**: barra compacta, índice, pantalla completa y numeración de página. En escritorio se ve profesional.
- **Tipografía**: Nunito 800–850 legible a distancia, adecuada para proyectar en el aula.
- **Documentación de diseño** (`DESIGN.md`) con tokens, reglas con nombre y lista de qué hacer y qué no. Es poco común y muy útil.

### 3.2 Problemas, por severidad

**Alta**

- **V1. Cuatro mundos visuales sin un sistema común.**
  - Portal pastoral (Inicio, Biblioteca), friso de planchas (Clases, Agenda, Ruta), cosmos oscuro (Laboratorios) y lector azul noche.
  - Además, en una misma pantalla conviven **tres lenguajes de ilustración**: pictogramas planos Twemoji, un **osito con gafas renderizado en 3D** (`aventura-lectora-mundo.webp`) y **fotografías** (robots y papeles en las tarjetas de mundo).
  - Para un comprador se lee como prototipos de estudios distintos.
  - `DESIGN.md` dice «no convertir el paisaje o los emojis en una mascota», y el inicio tiene una mascota.
  - En Laboratorios, el menú cambia de forma y color por completo (pastilla oscura de vidrio). Es el mismo `<nav>`, pero visualmente otro producto.
- **V2. El código de color del menú contradice el de las áreas.**
  - Las pestañas usan colores de área para destinos que no son áreas: **Biblioteca (Literatura) es verde**, que es el color de Emprendimiento; «Mis clases» es naranja (Literatura); «Hoy» es azul (Robótica); Laboratorios y Agenda son morado y mora.
  - Rompe tu propia regla «The Area Owns the Surface». Un niño que aprende «naranja = lectura» encuentra la Biblioteca en verde.
  - [P] Menú neutro (tinta) con estado activo, o Biblioteca en naranja Literatura y los demás destinos en neutro.
- **V3. No está claro a quién le habla la interfaz.**
  - El inicio saluda «¡Hola, grupo 1°-01!» y dice «Un nuevo día. Mil cosas por descubrir», con voz de estudiante.
  - Laboratorios dice «Tu universo… Toca un planeta… tus misiones», con voz de niño y lógica de juego.
  - Clases, Agenda y Ruta hablan de la docente en tercera persona («La docente decide…»).
  - `PRODUCT.md` define a la docente como usuaria primaria y dice que el estudiante necesita **una interfaz propia**. La mezcla actual no es una buena herramienta docente ni una buena interfaz infantil.
- **V4. El inicio no cumple la tesis del producto.**
  - La primera pantalla es ~80 % hero decorativo.
  - El día completo (el friso), que el contrato de dirección en `layout.tsx` pide como primera pantalla, **no aparece en el inicio**: está en «Mis clases».
  - Para una docente con 5 clases, el inicio debería ser el friso del día, a un clic de cada clase.
- **V5. Texto de presentación dentro del producto.** Ejemplos:
  - «Esta banda está vacía. El material no llega solo a la clase: es exactamente el problema que la plataforma existe para resolver.»
  - «Este material ya está asociado a la clase: la docente no tuvo que moverlo desde ningún catálogo…»
  - «La maqueta desarrolla 4…»
  - «La maqueta muestra N fichas de ejemplo… en producción el listado se pagina en servidor…»

  Sirve para validar internamente; en un demo de venta suena a presentación y no a producto. [P] Llevarlo a un «modo presentación» que se pueda apagar, y usar microcopia de producto en su lugar (p. ej. «Sin material. Añade uno desde la biblioteca»).
- **V6. Datos y términos que desmienten el discurso.**
  - «317 títulos» fijo en el código (`TOTAL_TITULOS = 317`) cuando existen 61 fichas.
  - «Kids 2» y «Laboratorio Kids 2» visibles en fichas y migas, un término de marca de la referencia que `AGENTS.md` prohíbe.
  - «Trend» como editorial visible.
  - El pie de página afirma dominio público (§2.4).
- **V7. Controles falsos.** Las pestañas de la clase son `<span>` con el mismo aspecto que botones, y «Cambiar programación» y «+ Añadir material» no hacen lo que dicen. [P] Deshabilitarlos visiblemente con «Próximamente», o quitarlos del demo.
- **V8. El lector contradice el principio diferenciador n.º 3.**
  - El producto critica a la referencia porque «una ruta didáctica completa tiene 32 caracteres de texto en el DOM». **El lector de MIDUHO tiene 140 caracteres de texto en el DOM para un libro de 51 páginas.** Las páginas son imágenes con `alt="La muñeca negra, página 5"`, que no transmite el contenido (WCAG 1.1.1 y 1.4.5).
  - axe no lo detecta porque el atributo `alt` existe.
  - **En un teléfono de 390 px la página ocupa ~180×260 px, un 30 % de la pantalla, con el 60 % vacío debajo.** El texto del libro es ilegible sin zoom, y el celular es el dispositivo típico de estudiantes y familias.
  - [P] Solución barata y concreta: **los PDF de Maguaré traen capa de texto** (`pdftotext` extrae 9.341 caracteres de *La muñeca negra*). `flipbook-forge` puede extraer el texto por página y el lector puede ofrecerlo como texto real, que sirve para lector de pantalla, búsqueda, ajuste tipográfico y lectura en voz alta (síntesis de voz). En vertical, usar una sola página que llene el ancho y permita pellizcar para ampliar.

**Media**

- **V9. Laboratorios en móvil (390 px):** las etiquetas de los planetas se superponen y «Mundo de Emprendimiento» queda cortado por el borde derecho.
- **V10. Latencia artificial.**
  - Ir a Laboratorios cuesta **1,1 s de animación** antes de navegar, más una pantalla de carga con mensajes inventados («Saludando a Boti y a Mía…»).
  - Abrir un libro cuesta **≥1,3 s** de animación.
  - Encanta la primera vez. Con 25 niños esperando, cada transición es tiempo muerto de clase. [P] Mostrar la animación completa solo la primera vez por sesión, limitarla a ≤300 ms y nunca bloquear la navegación.
- **V11. Títulos de página iguales:** todas las rutas, salvo el lector, se titulan «MIDUHO · Colegio Mi Dulce Hogar» (WCAG 2.4.2). Las pestañas del navegador y el historial no se distinguen.
- **V12. Agenda:**
  - Texto de eventos a **10 px**, por debajo de tu propio mínimo de 11 px e ilegible al proyectar.
  - Mes fijo, sin navegación.
  - La celda «Hoy» en negro sólido pesa más que cualquier evento.
  - Sábado y domingo ocupan 2/7 del ancho en un calendario escolar.
- **V13. Inconsistencias de tokens:**
  - `--destructive: #24617f` es el azul de Robótica, así que una acción destructiva se vería como una ficha de Robótica.
  - La variable de fuente se llama `--font-archivo` pero carga Nunito.
  - El comentario de `layout.tsx` dice «azul Literatura, naranja Robótica», al revés de lo implementado.
  - La tinta es `#20334b` en `DESIGN.md` y `#1b1b1f` en `globals.css`.
- **V14. Deuda de CSS:** `globals.css` tiene **2.506 líneas** y ~16 % de las reglas sustantivas están duplicadas (156 de 965 líneas; por ejemplo, el bloque `.school-nav-link` aparece dos veces, en las líneas 294 y 562). Se mezclan utilidades de Tailwind, clases a medida, CSS Modules y 43 estilos en línea. `html, body { overflow-x: hidden }` oculta desbordes en lugar de corregirlos.
- **V15. Sin estados de sistema:** no hay `error.tsx`, `not-found.tsx` propio, estados de carga (salvo Laboratorios) ni estados sin conexión, y en un colegio con internet inestable se van a ver.

**Baja**

- **V16. Identidad provisional:** el escudo y «MIDUHO Virtual» están inventados, como reconoce `DESIGN.md`. Para vender a más colegios hace falta **tematización**: logo y 1–2 colores de marca por institución, con los colores de área fijos.
- **V17. Los filtros de la biblioteca no viven en la URL:** el botón «atrás» pierde el filtro y no se puede compartir un enlace filtrado.

### 3.3 Recomendación de dirección visual [P]

1. **Tres interfaces, un solo sistema de tokens:**
   - **Docente:** sobria y densa. El friso es la pantalla de inicio. Sin paisaje en la primera pantalla y con un máximo de 3 clics a cualquier material.
   - **Estudiante (6–10 años):** ilustrada y lúdica, con botones grandes, **audio en las instrucciones**, menos texto e iconos siempre con etiqueta. Aquí caben el cosmos de Laboratorios y el valle de cuentos.
   - **Acudiente:** pensada primero para el celular, con informes, circulares y mensajes.
2. **Un solo lenguaje de ilustración:** vector plano coherente con las escenas SVG que ya tienes. Retirar el osito 3D y las fotografías, o encargar un set propio completo.
3. **Color con significado único:** naranja, azul y verde solo para áreas; menú y acciones en tinta y naranja de marca.
4. **Presupuesto de movimiento:** ≤300 ms en navegación y nunca bloquear. Las animaciones de autor, una vez por sesión.
5. **Un «modo demo» explícito** que muestre las notas de la maqueta y se apague para producción.

---

## 4. Arquitectura recomendada para este tipo de proyecto

### 4.1 Primero, una decisión de negocio 🔶

Toda la documentación parte de **«un solo colegio, sin multi-tenancy, sin `institucion_id`»**. Tu objetivo ahora es **vender**, y eso cambia la premisa:

| Si vendes… | Arquitectura | Consecuencia |
|---|---|---|
| **Solo al Colegio Mi Dulce Hogar** | Una instancia dedicada (lo que ya está diseñado) | Simple. Cada cambio es solo para ellos. |
| **A varios colegios** | **Multi-colegio desde el día 1**: `institucionId` en cada tabla y Row-Level Security de PostgreSQL | Una sola base de código, un despliegue y un respaldo. **Añadirlo ahora cuesta poco porque el esquema aún no existe; añadirlo con datos reales en producción cuesta semanas.** |

Una instancia separada por colegio parece más segura, pero una sola persona no sostiene 5 o más despliegues, bases y respaldos. **Recomendación:** si hay la mínima intención de vender a un segundo colegio, añade `institucionId` y RLS en el Incremento 1.

### 4.2 Arquitectura objetivo (400 usuarios, con margen hasta ~5.000)

```
 Docentes (PC/proyector) · Estudiantes (tablets/PC) · Acudientes (celular)
                              │  HTTPS
          ┌───────────────────┴───────────────────┐
          │                                       │
   CDN + almacenamiento de objetos         Next.js 16 · monolito modular
   (libros, imágenes, entregas)            ├─ Server Components / Server Actions
   · público: portadas                     ├─ Route Handlers (API interna, Zod)
   · privado: URLs firmadas                ├─ server/auth  → sesiones en BD, revocables
     (guías docentes, entregas)            ├─ server/permisos → AsignacionDocente (+ institución)
                                           ├─ server/modules → académico · usuarios · matrícula ·
                                           │   currículo · contenidos · actividades ·
                                           │   evaluación · asistencia · comunicación
                                           └─ auditoría transversal
                                                   │
                         ┌─────────────────────────┼──────────────────────┐
                         │                         │                      │
                PostgreSQL gestionado     Worker de tareas (cola en    Correo transaccional
                · respaldo diario + PITR  Postgres: pg-boss/Graphile)   (recuperación, avisos)
                · RLS si multi-colegio    · importación CSV
                · búsqueda de texto       · PDF de boletines
                  completo en español     · conversión de libros
                                            (flipbook-forge + pdftotext)
                              Observabilidad: Sentry · logs · monitor de disponibilidad
```

### 4.3 Decisiones concretas (qué conservar y qué cambiar del documento actual)

| Tema | Documento actual | Recomendación | Por qué |
|---|---|---|---|
| Estilo | Monolito modular Next.js | ✅ **Conservar** | Correcto para la escala |
| ORM | Prisma | ✅ Conservar | — |
| BD en desarrollo | SQLite → PostgreSQL en producción | **PostgreSQL también en desarrollo** (Docker) | Las migraciones dependen del motor; usar el mismo en ambos entornos evita diferencias y habilita RLS y la búsqueda de texto completo en español |
| Autenticación | Auth.js v5 (beta), solo credenciales | **Better Auth** (estable, con usuario sin correo, límite de intentos, 2FA y organizaciones), o Auth.js con sesiones en BD | Login infantil, revocación de sesiones y multi-colegio |
| Sesiones | JWT con roles | **Sesiones en base de datos** | Revocables al instante (retiro de una docente, celular perdido) |
| Límite de intentos | En memoria | En la BD | Sobrevive a reinicios y a varias instancias |
| Archivos | `public/` + disco | **Almacenamiento S3 compatible + CDN** (p. ej. Cloudflare R2, sin costo de salida) y URLs firmadas | 85 MB fuera de git; material «solo docente» realmente privado |
| Lector | `page-flip` carga todo | Ventana de ±2 hojas, `srcset` (500/1000 px), **capa de texto** por página | De 4,4 MB a ~0,25 MB al abrir; accesible |
| Búsqueda | Filtro en el cliente | PostgreSQL FTS (`unaccent` + diccionario español), paginada en el servidor, filtros en la URL | Escala a miles de títulos |
| Tareas en segundo plano | — | Cola en Postgres (pg-boss o Graphile Worker) | Sin Redis; CSV, PDF y correos no bloquean peticiones |
| Uso sin conexión | — | **PWA** con caché de los libros de la semana | Internet escolar inestable |
| Seguridad HTTP | — | Cabeceras en `next.config.ts` (CSP, HSTS, frame-ancestors…) + `noindex` | Básico para datos de menores |
| Calidad | Vitest (propuesto) | Vitest + **Playwright e2e con axe** en CI (GitHub Actions) | Mantiene las 0 violaciones que ya tienes |
| Operación | «Del hosting» 🔶 | Respaldo diario, copia externa, **restauración probada cada mes**, Sentry y monitor de disponibilidad | Un colegio pregunta «¿y si se pierde todo?» |
| Capa de presentación | `Marco` es `"use client"` | Dejar el marco en el servidor y aislar el enlace activo en un componente cliente pequeño | El menú por rol se decidirá en el servidor |

### 4.4 Hospedaje para ~400 usuarios [P] 🔶 (costos aproximados, verificar)

| Opción | Composición | Costo aprox./mes | Operación |
|---|---|---|---|
| **A. Gestionado (recomendado para empezar)** | App en Vercel o una PaaS de contenedores (Render, Railway, Fly) + PostgreSQL gestionado con PITR (Neon, Supabase, RDS) + R2 | USD 30–70 | Mínima: respaldos y TLS incluidos |
| B. VPS propio | Un servidor de 2 vCPU y 4 GB con Docker Compose (Next.js + Postgres + Caddy) | USD 10–30 | Actualizaciones, respaldos y seguridad corren por tu cuenta |
| C. Servidor en el colegio | — | — | **No recomendado**: energía, internet y respaldos dependen del colegio. Como mucho, un caché local de libros |

A 400 usuarios, la infraestructura cuesta del orden de **USD 0,10–0,20 por usuario al mes**. El costo real del producto está en el soporte, la capacitación y la producción de contenido, y eso es lo que debe reflejar el precio.

### 4.5 Alternativas que un comprador te va a mencionar

- **Google Classroom** (gratis con Workspace for Education) y **Moodle** (código abierto, el mismo LMS de la referencia que no se adoptó).
- **Plataformas colombianas de gestión escolar** con notas, boletines y comunicación. 🔶 Levantar una lista de 3–4 competidores reales con precios antes de fijar el tuyo.
- **Tu diferencial defendible**: (1) el contenido ya está en la clase, (2) una biblioteca colombiana accesible de verdad, (3) una planeación anclada a Estándares y DBA, y (4) la escala del SIEE nativa. Los puntos 2 y 4 hoy no se cumplen (§3.2 V8 y §2.1). Cerrarlos es lo que convierte el discurso en producto.

---

## 5. Plan hacia un producto vendible [P] 🔶

| Fase | Duración estimada | Resultado |
|---|---|---|
| **0. Saneamiento** | 1–2 semanas | Legal (§2.4), decisión de uno o varios colegios (§4.1), *quick wins* de diseño (abajo). **Un demo que se pueda mostrar sin riesgo** |
| **1. Fundación** (Inc. 1) | 4–5 semanas | PostgreSQL, autenticación con login infantil, 5 roles, matrícula CSV, auditoría, R2, CI, respaldos, cabeceras |
| **2. La clase real** (Inc. 2) + CMS mínimo | 3–4 semanas | Docentes que suben y asocian material; libros subidos desde un formulario; lector optimizado |
| **3. Actividades + asistencia + comunicación** (Inc. 4, nueva, Inc. 6) | 5–6 semanas | Lo que el colegio usa todos los días y lo que ven las familias |
| **4. Evaluación** (Inc. 5) | 4 semanas | Solo con el SIEE en mano. Alternativa: exportar hacia el sistema de notas del colegio |
| **5. Piloto** | 4–6 semanas | 1 grado (25–75 usuarios). Métricas: % de clases con material, docentes activos por semana, tiempo hasta el material |
| **6. Despliegue a 400** | — | Capacitación por grupos, soporte en las primeras semanas |

**Para firmar con un colegio también necesitas** documentos, no solo código: contrato de servicio con SLA (p. ej. 99,5 % en horario escolar y tiempos de respuesta), política de tratamiento de datos y contrato de transmisión, plan de respaldo y recuperación, manual de docente y de acudiente, plan de capacitación, canal de soporte, cláusula de salida con exportación de datos, y precio (usual: por estudiante al año, más un cargo único de implementación 🔶).

### Quick wins de la Fase 0 (1–3 días de trabajo)

1. Retirar «¡Préstame tus ojos!», el término «Trend», «Kids 2» y «Laboratorio Kids 2»; calcular el número de títulos en lugar de fijarlo en 317; corregir el texto de dominio público.
2. Añadir la página de créditos y licencias (Twemoji, StoryWeaver, Maguaré).
3. Mover el texto de presentación (V5) a un modo demo que se pueda apagar.
4. Marcar como «Próximamente» las pestañas y botones sin función (V7).
5. Dar título propio a cada ruta con `metadata` (V11).
6. Corregir los colores del menú (V2) y el token `--destructive` (V13).
7. Corregir las etiquetas de Laboratorios en móvil (V9).
8. Lector: página única que llene el ancho en vertical y carga por ventana (V8, §2.2).
9. Limitar las transiciones a ≤300 ms o mostrarlas una vez por sesión (V10).
10. Subir el texto de eventos de la agenda a ≥12 px (V12).

---

## Anexo A — Mediciones [O]

**Build y lint:** `npm run lint` sin errores ni advertencias. `npm run build` compila en 1,3 s y genera 51 páginas estáticas, con una advertencia por el `package-lock.json` en `/home/bryan`.

**Rutas** (servidor de producción local, 1440×900; el LCP en localhost no representa una red real):

| Ruta | Transferido | Peticiones | Nodos DOM | Texto en DOM | Imágenes |
|---|---|---|---|---|---|
| `/` (caché vacía) | 235 KB | 47 | 237 | 763 car. | 26 |
| `/clases` | 38 KB* | 39 | 216 | 1.312 | 6 |
| `/clases/c1` | 26 KB* | 33 | 178 | 1.064 | 6 |
| `/biblioteca` | 435 KB* | 85 | 1.387 | 16.565 | 68 |
| `/laboratorios` | 23 KB* | 33 | 267 | 460 | 6 |
| `/laboratorios/u7` | 28 KB* | 33 | 207 | 3.019 | 6 |
| `/agenda` | 27 KB* | 33 | 249 | 1.141 | 6 |
| `/biblioteca/leer/la-muneca-negra` | **4.025 KB*** | 69 | 297 | **140** | 102 |

\* con JS y CSS ya en caché de visitas anteriores: lo transferido es sobre todo HTML e imágenes nuevas.

**Lector en móvil** (390×844, caché vacía, *La voz de los hermanos mayores*): 72 imágenes de página, **4.368 KB**, sin interacción del usuario.

**Bundles:** JS total 1,1 MB sin comprimir (el chunk mayor pesa 229 KB, 72 KB comprimido); CSS principal 117 KB (22 KB comprimido).

**Accesibilidad (axe-core 4, etiquetas wcag2a, wcag2aa, wcag21a, wcag21aa y best-practice):** 0 violaciones en `/`, `/clases`, `/clases/c1`, `/biblioteca`, `/laboratorios`, `/laboratorios/u7`, `/agenda` y el lector, tanto a 1440 px como a 390 px. Las pruebas automáticas cubren solo una parte de WCAG. **Faltan la prueba manual con teclado y con lector de pantalla (NVDA o TalkBack) y la prueba con niños reales.**

**Contenido:** 61 fichas en `TITULOS` frente a «317» mostrado; 37 libros con páginas; 85 MB en `public/libros/`; 0 archivos de prueba.
