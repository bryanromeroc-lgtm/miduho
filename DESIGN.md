---
name: MIDUHO
description: Un friso de aula cálido y legible para encontrar el contenido de cada clase.
colors:
  literature: "#aa461e"
  literature-deep: "#903712"
  literature-pale: "#fff0d9"
  literature-ink: "#79370f"
  literature-muted: "#825325"
  robotics: "#24617f"
  robotics-deep: "#1c506b"
  robotics-pale: "#e9f3f9"
  robotics-ink: "#20495f"
  robotics-muted: "#4d6b7c"
  enterprise: "#466232"
  enterprise-deep: "#384e28"
  enterprise-pale: "#edf3e6"
  enterprise-ink: "#334a23"
  enterprise-muted: "#586d47"
  school-orange: "#bc461c"
  school-orange-pale: "#fff0e2"
  living-blue: "#00adef"
  ink: "#20334b"
  muted-ink: "#626776"
  paper: "#ffffff"
  bone: "#fffcf7"
  line: "#e9e4dc"
  inactive: "#e8e4dc"
  nav-purple: "#6b55ad"
  nav-berry: "#b04273"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(38px, 4.5vw, 60px)"
    fontWeight: 850
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 850
    lineHeight: 1.16
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  focus: "4px"
  ficha: "9px"
  control: "11px"
  estante: "15px"
  card: "16px"
  plancha: "20px"
  hero: "24px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  xl: "16px"
  2xl: "20px"
  3xl: "24px"
  4xl: "32px"
  5xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.school-orange}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "14px 25px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.literature-deep}"
    textColor: "{colors.paper}"
  input-search:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "48px"
  chip-filter:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    height: "44px"
  chip-filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card-world:
    backgroundColor: "{colors.literature-pale}"
    textColor: "{colors.literature-ink}"
    rounded: "{rounded.card}"
    padding: "18px"
  plancha-literature:
    backgroundColor: "{colors.literature}"
    textColor: "{colors.paper}"
    rounded: "{rounded.plancha}"
  plancha-robotics:
    backgroundColor: "{colors.robotics}"
    textColor: "{colors.paper}"
    rounded: "{rounded.plancha}"
  plancha-enterprise:
    backgroundColor: "{colors.enterprise}"
    textColor: "{colors.paper}"
    rounded: "{rounded.plancha}"
---

# Design System: MIDUHO

## Overview

**Creative North Star: "Friso de Aula"**

MIDUHO se siente como el friso que una docente fija sobre el tablero: una banda de planchas de color que ordena el día de izquierda a derecha y deja ver, aun a distancia, qué clase tiene material y cuál sigue vacía. Es una herramienta adulta, clara y operativa con la escala amable de un aula de primaria; no es un panel LMS corporativo ni una escenografía infantil.

El portal escolar ilustrado amplía ese mundo sin sustituirlo. En escritorio, una franja breve de cielo, colinas, árboles y escuela enmarca el encabezado, y la navegación adopta pestañas de “mundos” por color. La ilustración siempre queda detrás de la tarea docente: el contenido, las fichas y el friso siguen siendo texto real sobre superficies de lectura claras. En móvil, el paisaje desaparece, el encabezado vuelve a una barra sobria y el mismo menú ocupa la navegación inferior.

La personalidad es institucional, cálida, optimista y muy legible. La identidad y los personajes de productos de referencia no son autoridad visual; los recursos ilustrados son propios o de procedencia compatible y nunca reemplazan contenido pedagógico.

**Key Characteristics:**

- Friso envolvente de planchas saturadas con estantes blancos interiores.
- Paleta institucional provisional, clara y codificada por área.
- Portal escolar ilustrado solo como marco ambiental en escritorio.
- Pestañas de navegación con colores de mundo y un único menú adaptable.
- Tipografía Nunito de gran peso, amable y legible a distancia.
- Movimiento breve que confirma continuidad, siempre reducible.

## Colors

La paleta combina tres familias pedagógicas —naranja Literatura, azul Robótica y verde Emprendimiento— con tinta azul profunda, papel cálido y dos acentos secundarios reservados para las pestañas de navegación.

### Primary

- **Naranja Literatura:** posee las planchas, acciones y señales vinculadas a Literatura; sus variantes profunda, pálida, tinta y atenuada mantienen jerarquía y contraste.
- **Azul Robótica:** identifica las superficies y fichas de Robótica con una familia completa equivalente.
- **Verde Emprendimiento:** identifica Emprendimiento y sus proyectos sin mezclarlo con las otras áreas.

### Secondary

- **Naranja Colegio:** enfatiza marca provisional, llamada principal, selección y navegación móvil activa.
- **Azul Vivo:** se reserva para marcas pequeñas e ilustración; no carga texto normal.

### Tertiary

- **Morado Laboratorio y Mora Agenda:** distinguen pestañas de mundos de navegación. Son colores de orientación, no nuevas áreas curriculares ni rellenos de contenido.

### Neutral

- **Tinta Azul Profunda:** texto principal y acción neutra de máxima prioridad.
- **Gris de Apoyo:** metadatos y texto secundario sobre superficies claras.
- **Papel:** estantes, tarjetas y superficies elevadas.
- **Hueso Luminoso:** fondo continuo de página, ligeramente cálido.
- **Línea Suave:** separadores, contornos de campos y ranuras disponibles.
- **Apagado:** estado de clase sin área o sin material asignado.

### Named Rules

**The Area Owns the Surface Rule.** Cuando un área codifica una unidad, su color posee la plancha completa; no se reduce a una línea decorativa y siempre aparece acompañado por el nombre textual del área.

**The Clear Classroom Rule.** El sistema permanece claro y proyectable; no existe tema oscuro ni texto normal sobre Azul Vivo.

**The Provisional Identity Rule.** Esta paleta es la identidad visual implementada de la maqueta, no un manual oficial del colegio; debe revisarse cuando exista una identidad institucional aprobada.

## Typography

**Display Font:** Nunito (con `system-ui` y `sans-serif` como respaldo)  
**Body Font:** Nunito (con `system-ui` y `sans-serif` como respaldo)

**Character:** Una sola familia redondeada sostiene tanto la escala de cartel como la lectura cotidiana. Los pesos 800–850 crean rótulos firmes sin recurrir a condensación agresiva; el cuerpo conserva aire, formas familiares y buena lectura para docentes, familias y lectores emergentes.

### Hierarchy

- **Display** (850, escala fluida hasta 60px, interlínea 1.08): títulos de página y mensaje principal del inicio.
- **Headline** (850, 25px, interlínea 1.16): secciones, encabezados de plancha y filtros importantes.
- **Title** (850, 20px, interlínea 1.2): nombres de mundos, tarjetas y recursos destacados.
- **Body** (400–700, 14px, interlínea 1.55): instrucciones, metadatos y contenido de interfaz; las rutas didácticas limitan la medida a 65–75 caracteres.
- **Label** (800, 11px, espaciado 0.08em): tipos, estados y rótulos breves en versales. Nunca se usa para párrafos.

### Named Rules

**The Real Text Rule.** Todo texto pedagógico es seleccionable, buscable, traducible y accesible; ninguna ilustración ni imagen contiene la explicación que la persona necesita para completar una tarea.

## Layout

El contenido opera dentro de un contenedor centrado de 1240px con márgenes de 16px en móvil y 32px desde pantallas pequeñas. El ritmo combina incrementos cortos de 6–16px dentro de controles con separaciones de 20–40px entre grupos y secciones.

El friso usa una rejilla envolvente de columnas con mínimo legible de 266px. Al agotarse el ancho, cada trecho continúa en la línea siguiente junto con su marca horaria: nunca aparece desplazamiento horizontal. Catálogos y tarjetas también usan rejillas responsivas, y los listados grandes se pagan en servidor.

En escritorio, el encabezado reserva 108px para el paisaje y coloca las pestañas de mundo en una banda propia. A 700px o menos, se oculta la franja ilustrada, el encabezado recupera fondo blanco y el mismo `nav` se fija abajo con áreas táctiles de 56px. Las tarjetas de mundo pasan de tres columnas a una lista ilustrada 42/58, y los filtros de dos columnas se apilan.

**The One Menu Rule.** Escritorio y móvil comparten un solo menú en el DOM; la adaptación ocurre únicamente por CSS.

**The Frieze Wraps Rule.** Ninguna cantidad de asignaturas autoriza scroll horizontal: el friso siempre envuelve.

## Elevation & Depth

El sistema es tonal por defecto y utiliza sombras ambientales solo para separar elementos interactivos del paisaje o confirmar un estado. Las planchas y fichas no simulan cartulina: el color, el encaje del estante y el contorno aportan estructura; las sombras nunca representan pliegues, grapas o papel físico.

### Shadow Vocabulary

- **Ambient Card** (`0 12px 30px rgb(32 51 75 / .09)`): tarjetas de mundo en reposo.
- **Ambient Card Hover** (`0 18px 38px rgb(32 51 75 / .14)`): elevación breve de una tarjeta interactiva.
- **Portal Surface** (`0 10px 24px rgb(44 93 116 / .12)`): marca y controles blancos sobre el paisaje.
- **Status Lift** (`0 7px 18px rgb(32 51 75 / .14)`): selección o confirmación compacta.

### Named Rules

**The Tonal First Rule.** Una superficie se distingue primero por color y encaje; la sombra aparece solo cuando mejora la separación o explica interacción.

## Shapes

La forma es generosa y moderna: fichas y controles pequeños usan curvas de 9–11px; estantes y tarjetas, 15–16px; planchas, 20px; el hero, 24px. Botones, chips, etiquetas y datos de grupo son pastillas completas. Las pestañas de escritorio son la excepción expresiva: esquinas superiores de 17px y base de 7px para leerse como mundos insertados en la interfaz.

Los bordes son suaves y funcionales. El foco visible usa un trazo de 3px con separación de 3px; las ranuras disponibles son punteadas, nunca rayadas. La ilustración puede recortarse y solaparse en un badge, pero las superficies de contenido mantienen siluetas limpias.

## Components

### Buttons

- **Shape:** acciones principales y secundarias en pastilla completa; altura principal mínima de 52px.
- **Primary:** Naranja Colegio sobre Papel, con relleno horizontal amplio y flecha que avanza 4px al pasar el puntero.
- **Hover / Focus:** el fondo se profundiza; el foco conserva el contorno global de 3px. Con movimiento reducido no hay traslación.
- **Secondary:** Papel con anillo interior Línea Suave; acciones neutras de alta prioridad pueden usar Tinta Azul Profunda.

### Chips

- **Style:** pastilla Hueso con texto Gris de Apoyo y anillo interior Línea Suave.
- **State:** al seleccionar, pasa a Tinta Azul Profunda con texto blanco y un icono de confirmación; `aria-pressed` comunica el estado.

### Cards / Containers

- **Corner Style:** tarjeta de mundo de 16px; plancha de 20px con estante interior de 15px; ficha de 9px.
- **Background:** cada tarjeta o ficha usa el pálido de su área y la tinta correspondiente. Las planchas usan el color saturado completo.
- **Shadow Strategy:** las tarjetas de mundo usan Ambient Card y se elevan 3px en hover; las fichas permanecen planas.
- **Internal Padding:** 14–18px en tarjetas compactas y 20–24px en contenedores de trabajo.

### Inputs / Fields

- **Style:** búsqueda de 48px en pastilla Hueso, sin borde exterior duro y con anillo interior Línea Suave.
- **Focus:** el anillo interior cambia al color del área y coexiste con el foco global visible.
- **Error / Disabled:** los estados se expresan con texto, color y semántica; nunca solo con opacidad.

### Navigation

En escritorio, cinco pestañas coloreadas de 64px se leen como entradas a mundos; la activa se vuelve blanca con Tinta Azul Profunda y las demás conservan icono más etiqueta. En móvil, el mismo menú se fija abajo, abandona el paisaje y los colores múltiples, y usa una selección compacta en Naranja Colegio. Todas las áreas táctiles alcanzan al menos 56px.

### Friso

Cada trecho agrupa hora, área, nombre de clase, estante, fichas y regla de horas. El color nunca sustituye el texto; la marca “Ahora” y su punto sobre la regla señalan el trecho activo. Al abrir una clase, View Transitions despliega la plancha real durante 420ms con `cubic-bezier(0.16, 1, 0.3, 1)`.

### World Card

Literatura, Robótica y Emprendimiento usan la misma estructura: imagen propia, etiqueta textual, icono, descripción, acción y un badge Twemoji decorativo servido desde archivos locales. Los badges llevan `alt=""` y `aria-hidden="true"`; las imágenes principales sí describen su contenido. En móvil la tarjeta conserva la imagen a la izquierda y la lectura a la derecha.

### Illustrated Portal

La franja escolar de escritorio construye profundidad con gradiente, colinas CSS y pequeños assets locales. Los gráficos Twemoji se usan bajo CC BY 4.0, con atribución durable en la documentación y el repositorio; funcionan como ambientación, nunca como identidad, personaje de marca ni contenido necesario.

La Biblioteca extiende el portal con «El valle de los cuentos»: escena autorada en SVG (colinas, aldea de casas-libro, árbol con farol, páginas volando) más pictogramas Twemoji 15.1.0 servidos localmente con la misma atribución, envuelta en `aria-hidden` y con un scrim de lectura sobre el tercio de texto. No hay raster generado; la escena vive en código.

### Libro en Estante / Portada

El libro es el único objeto del sistema con cuerpo físico: cubierta, canto de páginas y lomo, apoyado sobre un raíl de madera plana. Es un material propio de las superficies de Literatura y no autoriza a las planchas ni a las fichas a simular cartulina: la excepción es el libro, no el estante.

- **Cuerpo:** cubierta 3:4 con esquinas asimétricas (4px en el lomo, 9px en el canto), bloque de páginas crema con rayado vertical fino y un lomo de sombra al 22%. En hover/focus la cubierta gira en `rotateY(-26deg)` (−22deg en la mesa) con `cubic-bezier(.16, 1, .3, 1)` en 380ms; con movimiento reducido no gira y muestra un anillo Pálido Literatura de 3px.
- **Sombras del objeto:** `0 14px 26px -10px rgb(32 51 75 / .45)` en la cubierta, `0 10px 18px -8px rgb(32 51 75 / .35)` en las páginas; ambas son ambientales, sin desplazamiento duro.
- **Raíl:** cada libro lleva su tramo y los tramos se unen sobre el hueco de la rejilla; degradado plano `#e2bb7b → #c2905a → #a9713e` de 11px, sin veta ni textura, con sombra cálida `0 8px 14px -4px rgb(94 58 25 / .3)` y una elipse difusa bajo cada ejemplar.
- **Formato:** ancho (92–100%), proporción (3/3.9–3/4.5) y grosor del canto (4–9px) varían por tipo y posición para que dos vecinos nunca sean iguales.
- **Portada por tipo:** obras leíbles llevan portada real; libros compuestos, ilustración arriba y rótulo tipográfico abajo sobre crema; el resto se autoría en código con título como texto real. Las telas usan la paleta de las casas-libro (azul `#3b6fa0`, rojo `#c9453a`, verde `#4f8a38`, mostaza `#f2b134`, terracotas `#aa461e` `#b84f2a` `#79370f`, azul hondo `#2d5680`) en tres composiciones (centro, alto, bajo); guía = cuaderno crema con anillas y banda Literatura; audiolibro = tela Literatura Profunda con auriculares; catálogo = carpeta con pestaña.
- **Etiquetas:** la pastilla de tipo aparece solo cuando el tipo no es «Libro»; «Solo docente» usa Tinta Robótica. Ambas son datos reales, nunca rótulos inventados.

### Mesa de Lectura y Cinta de Filtros

La mesa es una plancha Literatura de 20px que se posa sobre el borde inferior del hero (−64px; −44px en móvil) con Ambient Card Hover en reposo, y aloja estantes Papel de 15px con el libro a 148px y la acción principal en Naranja Colegio. La cinta de filtros es una banda Papel de 15px con anillo interior Línea Suave y grupos `fieldset`/`legend` en Label; sus chips siguen el chip del sistema con altura compacta de 40px y la selección en Tinta con Status Lift.

### Vista de materia

Pantalla completa de una asignatura del estudiante (`/materias/[asignatura]`, cambio `vistas-de-materia`). Cada materia es su propio pupitre plano: la vista se viste entera con los útiles de esa asignatura y deja las actividades al centro como fichas para tomar. Es un mundo propio dentro del sistema: no hereda el sticker de «Mis materias» ni el paisaje del portal.

**The Flat Boundary Rule.** «Mis materias» conserva su identidad sticker; al entrar a una materia, todo es plano, encabezado incluido. La vista no usa `MarcoJuego` ni `BotonSticker`: lleva un encabezado flat propio. El corte ocurre en la puerta de la materia, nunca dentro de ella.

**The Subject Owns Every Object Rule.** Cada objeto decorativo pertenece a la materia que se está viendo. Ningún id de pieza se repite entre kits; solo el kit `generica` (útiles escolares neutros) puede compartir piezas, y solo lo usan las asignaturas sin coincidencia temática. El catálogo prohíbe árbol, bosque, madera, tronco, pino, montaña, paisaje, colina y nube. Sin banderas de otros países; Sociales lleva la bandera de Colombia por decisión del operador.

**The No Text On Apoyo Rule.** El token `apoyo` es solo para utilería, marco de tarjeta y sueltos; nunca lleva texto encima. La tinta sobre `apoyo` no alcanza 4.5:1 en todas las materias (la auditoría midió 3.65–3.97 en Lectura, Emprendimiento y Sociales).

**The One Screen, Growth Not Overlap Rule.** Desde 900×640 la vista cabe en una pantalla sin scroll; si un contenido raro no cabe, la página crece y hace scroll. Nada se recorta ni se encima.

**The Silent Decoration Rule.** Toda la decoración (marcas de agua, escenografía, sueltos, banda de la tarjeta, utilería, escena del estado vacío) es `aria-hidden`, no recibe puntero y lleva `user-select: none`, para no aparecer al seleccionar ni al buscar con Ctrl+F.

#### Color por materia

Nueve tokens por materia, inyectados como propiedades `--m-*` en la raíz de la vista (`tematica/tokens.ts`). Son la paleta propia del proyecto, no identidad oficial del colegio. Las 11 escenas tienen su juego; cada una tiene un acento distinto.

| Token | Papel |
|---|---|
| `--m-fondo` | Pastel neutro de la página (OKLCH L ≥ 0.94, croma ≤ 0.03). |
| `--m-marca` | Marcas de agua; igual a `suave`, pintadas al 10 % de opacidad (tope 0.12, croma ≤ 0.1). |
| `--m-tarjeta` | Plano de tarjeta, cabecera, encabezado y estado vacío (`#ffffff` en todas). |
| `--m-banda` | Banda de ilustración, chips, aviso de primera visita, estrellas y fichas vacías. |
| `--m-acento` | Botón principal, estrellas llenas, fichas que quedan, conectores de la ilustración; lleva texto blanco. |
| `--m-sobreAcento` | Texto sobre el acento (`#ffffff`). |
| `--m-tinta` | Texto principal y anillo de foco. |
| `--m-suave` | Texto secundario: descripción, intentos, estado vacío, página deshabilitada. |
| `--m-apoyo` | Segundo color de la utilería y del marco temático de la tarjeta. Sin texto. |

| Escena | fondo | banda | acento | tinta | suave | apoyo |
|---|---|---|---|---|---|---|
| matematicas | `#eef3fa` | `#dce8f8` | `#1f5fbf` | `#132f57` | `#3b5578` | `#f2b52a` |
| lectura | `#faf3ed` | `#f8e3d3` | `#b14a1c` | `#46210e` | `#6e4630` | `#3f8fbf` |
| naturales | `#eef6ef` | `#d9eedc` | `#1d7639` | `#123a20` | `#3b5a43` | `#3db7c9` |
| ingles | `#f4f1fa` | `#e6dff6` | `#6438b0` | `#2c1757` | `#53487a` | `#f2a93b` |
| robotica | `#ecf5f6` | `#d5ecee` | `#0a6a77` | `#0b363e` | `#365c62` | `#f2b52a` |
| emprendimiento | `#faf6ea` | `#f4e8c5` | `#865600` | `#3f2c06` | `#64502a` | `#2f9e6a` |
| etica | `#fbf1f3` | `#f7dde3` | `#ae3555` | `#4d1424` | `#734552` | `#f4a8b8` |
| artistica | `#f8f1f7` | `#f0dcef` | `#963888` | `#43163d` | `#6a4564` | `#f2b52a` |
| fisica | `#f1f1fa` | `#e0e0f6` | `#4343b5` | `#1f1f58` | `#4a4a7a` | `#f08a3c` |
| sociales | `#f4f4ea` | `#e7e9cf` | `#566615` | `#2c330b` | `#535a35` | `#2f8ec4` |
| generica | `#f3f3f1` | `#e4e6ea` | `#3b4d66` | `#1d2836` | `#4b5563` | `#f2b52a` |

Pares de texto permitidos, todos ≥ 4.5:1 en las 11 materias y vigilados por `tokens.test.ts`: tinta sobre tarjeta, banda y fondo; suave sobre tarjeta; sobreAcento sobre acento; acento sobre tarjeta y sobre fondo. Cualquier otro par necesita prueba antes de usarse. El arte de cada kit (`arte/<escena>.tsx`) usa los colores reales de cada objeto en hex propios, no los tokens `--m-*`: es deliberado, y un cambio de paleta exige tocar el arte.

#### Tipografía

Baloo 2 (`--fuente-display`, 800) para el nombre de la materia, títulos de tarjeta, botones, wordmark y estado vacío; Atkinson Hyperlegible Next (`--fuente-cuerpo`) para el cuerpo. Nada por debajo de 16px.

- **Nombre de la materia:** `clamp(2rem, 1.1rem + 2.2vw, 3.25rem)`, limitado a 7dvh; interlínea 1.02, `text-wrap: balance`. Es el único `h1`.
- **Título de tarjeta:** `clamp(1.125rem, 0.95rem + 0.45vw, 1.375rem)`, interlínea 1.15, máximo dos líneas con alto reservado para dos, de modo que chip, fichas y botón quedan alineados en toda la fila. El título completo vive en el nombre accesible.
- **Botón:** 1.125rem, interlínea 1.
- **Cuerpo, chip, intentos:** 1rem; chip y datos en 700.
- **Wordmark:** 1.5rem, espaciado 0.02em.

#### Composición y adaptación

Encabezado de una línea (mínimo 64px) → cabecera temática centrada → cuadrícula 3×2 → paginador, en una columna de hasta 1200px sin panel lateral. La altura se reparte con `dvh` y las filas usan `minmax(min-content, 1fr)`. Se pagina de 6 en 6.

- **≥ 900×640:** una pantalla sin scroll (`height: 100dvh` con `min-height: max-content`).
- **Alto ≤ 800px (ancho ≥ 900px):** se compactan cabecera y tarjeta: escenografía a 60px, banda mínima de 14px, cuerpo con relleno 8–10px; con alto ≤ 760px se oculta la descripción de la materia.
- **≥ 1400px:** aparecen los sueltos flotantes en los márgenes, fuera de la columna de texto.
- **≤ 1180px:** se ocultan el grupo y el nombre de la cuenta; queda el avatar de 44px con su nombre accesible.
- **≤ 899px:** dos columnas con scroll normal; banda fija de 120px; sin wordmark.
- **≤ 720px:** la cabecera pasa a una columna y desaparece la escenografía lateral.
- **≤ 600px:** una columna; el aviso de primera visita baja a su propia línea y el paginador pone «Página X de Y» encima.

#### Planos y forma

Sin sombras, relieves, degradados de volumen, `drop-shadow`, `filter` ni `text-stroke`; `box-shadow: none` solo para apagar la sombra heredada del menú de cuenta. Los bordes nunca usan la tinta ni pasan de 2px. La separación la dan los planos de color y el espacio; el texto siempre va sobre un plano sólido. `vista.estilos.test.ts` vigila estas reglas en el CSS de la vista y de la muestra.

Esquinas: tarjeta 24px; plano de la cabecera y estado vacío 28px; aviso de primera visita 22px; botones, chips, fichas, «Volver», grupo y paginador en pastilla completa. Foco: `3px solid var(--m-tinta)` con separación de 3px, visible en cada paso.

La cinta y la chinche sobre el plano de la cabecera, y el clip de la tarjeta, son utilería plana del kit dibujada en SVG: pertenecen al mundo de la vista y no contradicen la prohibición de grapas y pliegues, que aplica a las planchas del friso.

#### Encabezado flat

Plano `tarjeta`: escudo circular de 40px + wordmark MIDUHO, «Volver a Mis materias» (pastilla `fondo` con texto acento, 44px, `banda` al pasar el puntero, flecha que retrocede 3px), y a la derecha grupo y cuenta (`MenuCuenta` sin sombra ni borde, avatar en acento). Primer elemento enfocable: «Saltar a las actividades». El rótulo «Datos de ejemplo» y el selector de la muestra flotan fuera del encabezado, para que este sea idéntico al de la vista real.

**Aviso de primera visita:** vive dentro del encabezado (no tapa tarjetas ni cambia el alto de la vista), en una pastilla `banda` con `role="status"` y botón «¡Listo!» de 46px sobre `tarjeta`. Se recuerda por estudiante y materia en el navegador con una huella FNV-1a de 32 bits de la cuenta, porque las tabletas se comparten y el correo no se guarda. Sin almacenamiento disponible, no aparece.

#### Cabecera temática

Nombre y descripción de la materia sobre un plano `tarjeta` de 28px con dos cintas del kit giradas en las esquinas y la chinche al centro; a cada lado, la mitad de la escenografía del kit (64–112px de alto, las piezas extremas giradas −6° y 5°). Detrás de todo, el fondo pastel con el patrón de marcas de agua del kit.

#### Tarjeta de actividad plana

Toda la tarjeta es un solo enlace con un único foco y nombre accesible completo («título. estado. cierre. desempeño. acción.»); el botón es parte visual del enlace. Sin destino (por abrir o cerrada sin intento) queda como enlace `aria-disabled` fuera del orden de tabulación.

- **Banda:** plano `banda` con el marco temático en `apoyo` arriba y el tipo de actividad dibujado con piezas del kit (ordenar = tres piezas de menor a mayor, emparejar = dos parejas unidas, clasificar = dos cestas…). Cada tarjeta toma piezas distintas para que dos vecinas no se repitan. Conectores en acento, sin trazo de tinta. Nunca pictogramas genéricos.
- **Chip de estado:** pastilla `banda` con tinta («Disponible» sobre `fondo`). El estado siempre se dice con texto.
- **Estrellas planas:** tres, llenas en `acento` y vacías en `banda`, de 22px, decorativas; el desempeño va en el nombre accesible. Sin estrellas, aparece el cierre en texto.
- **Fichas de intentos:** círculos de 14px con contorno de 2px en acento; llenas las que quedan, huecas las usadas, y «Quedan N» o «No quedan» en dos palabras.
- **Botón principal** («Jugar», «Continuar»): relleno `acento`, texto `sobreAcento`, flecha que avanza 4px.
- **Botón secundario** («Repetir», «Ver resultado»): `tarjeta` con contorno de 2px y texto en acento.
- **Bloqueado** («Abre el …», «Cerrada»): plano `banda` con tinta y candado, sin flecha.
- **Utilería:** el clip del kit se prende arriba a la derecha y se balancea al pasar el puntero.

#### Paginador y estados

Paginador «Anteriores · Página X de Y · Siguientes» en pastillas `tarjeta` de 44px con texto acento; la página no disponible es transparente con contorno punteado de 2px en `banda` y texto `suave`. Solo aparece con más de una página.

Estado vacío: plano `tarjeta` de 28px, tres sueltos del kit, título en Baloo 2 y salida principal «Volver a Mis materias» en acento (48px). Dos textos: «Esta materia está en preparación» (sin material) y «Aún no hay actividades». Nunca se inventan actividades para llenar la vista.

#### Movimiento

Solo `transform` y `opacity`, con `cubic-bezier(0.16, 1, 0.3, 1)`. Las tarjetas entran escalonadas (320ms, 60ms entre una y otra); al pasar el puntero suben 4px (260ms), el clip gira −12° y la ilustración crece 5 % con −1.5°. Los sueltos flotan 12px con ±4° en 7s alternados. El aviso de primera visita asoma desde 16px abajo en 420ms tras 300ms. Con movimiento reducido no hay entrada, flotar, balanceo ni desplazamientos.

#### Muestra de revisión

`/muestras/materia?escena=…` renderiza la vista con ocho actividades ficticias por materia, sin nombres de personas, con el rótulo visible «Datos de ejemplo» y un selector de las 11 escenas. Responde 404 en producción y no se indexa. Es la única fuente de actividades visibles mientras no exista la real.

#### Por confirmar

- 🔶 **Educación física no tiene kit propio.** `fisica` es Física (decisión del operador del 2026-10-31), pero `escenas.ts` todavía envía «Educación física», «recreación» y «deporte» a `fisica`; la vista sobrescribe la descripción mientras `DESCRIPCION_ESCENA` sigue describiendo Educación física para «Mis materias».
- 🔶 **El reproductor de actividades no existe.** El destino `/materias/[asignatura]/actividades/[id]` muestra «Esta actividad se abre pronto».
- 🔶 **La fuente de actividades no está conectada.** El puerto `ActividadesDeMateria` devuelve `null` y la vista real muestra el estado vacío hasta que `fundacion-actividades` implemente su adaptador.

### Pantallas de acceso

Ingreso, recuperación y cambio de contraseña comparten «un día en el colegio» (`(auth)/componentes.tsx`, reglas `.acceso` en `shell.css`). El paisaje de cielo, nubes y colinas ocupa toda la pantalla, sin marco (`public/images/acceso/fondo-dia.webp`, 768px en celular). Es el mismo paisaje de la casa del escudo. La composición va centrada:
1. «Te damos la bienvenida a».
2. El escudo real intacto (148px, 112px en celular), en círculo blanco con sombra suave.
3. «Colegio Mi Dulce Hogar» en Baloo 2 800, azul `#092a55` (11.4:1 sobre el cielo).
4. El wordmark MIDUHO en pequeño, junto a «Plataforma educativa virtual» en `#1f4a7a`.
5. El panel blanco al 92 %, con borde celeste `#a9d4f0` y radio 22px. Campos con borde `#4f86b8` (3.9:1), placeholder `#5a6f8c` (5.1:1), errores `#b42318` y botón de ojo para mostrar u ocultar la contraseña (`campo-contrasena.tsx`).
6. La pastilla grande «Ingresar» en el azul del tejado `#0066d6` con texto blanco (5.4:1), aro blanco y bisel de «Mis materias». En el ingreso queda montada sobre el borde inferior del panel y sigue dentro del `<form>`.

Sin planetas, estrellas ni animación de fondo. Las reglas viven bajo `.acceso`; los formularios de Cuenta y Admin conservan su estilo y solo heredan el botón de ojo. 🔶 El paisaje es una ilustración generada que entregó el operador, no material oficial del colegio.

## Do's and Don'ts

### Do:

- **Do** conservar Friso de Aula como tesis del sistema y tratar el portal ilustrado como marco subordinado.
- **Do** servir localmente los assets Twemoji, mantenerlos decorativos y conservar la atribución “Twemoji graphics by Twitter/X, licensed under CC BY 4.0”.
- **Do** nombrar cada área además de codificarla con color y verificar contraste WCAG 2.1 AA.
- **Do** usar texto real, foco visible, etiquetas asociadas y un único menú adaptable.
- **Do** mantener el encabezado móvil sobrio y la navegación principal fija abajo.
- **Do** paginar listados extensos y asegurar que el friso envuelva en todos los anchos.
- **Do** vestir la vista de materia solo con el kit de esa materia y con sus tokens `--m-*`; usar el kit `generica` únicamente cuando no hay coincidencia temática.
- **Do** mantener la vista de materia en una pantalla desde 900×640 y dejarla crecer con scroll cuando el contenido no cabe.

### Don't:

- **Don't** copiar identidad, personajes, imágenes, código o tono visual de la plataforma tomada como referencia funcional.
- **Don't** convertir el paisaje o los emojis en una nueva mascota o identidad oficial de MIDUHO.
- **Don't** mezclar colores de área ni usar color como único portador de significado.
- **Don't** entregar texto pedagógico dentro de imágenes ni usar imágenes decorativas con alternativas redundantes.
- **Don't** añadir texturas fotográficas, grapas, pliegues o rayado diagonal a las planchas.
- **Don't** crear un segundo menú móvil ni permitir scroll horizontal.
- **Don't** llevar el sticker de «Mis materias» (contornos de tinta, sombras, `MarcoJuego`) dentro de una materia, ni poner texto sobre el token `apoyo`.
- **Don't** decorar la vista de materia con bosque, madera, paisajes, banderas de otros países o piezas de otra materia.
