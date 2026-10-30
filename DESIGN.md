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

## Do's and Don'ts

### Do:

- **Do** conservar Friso de Aula como tesis del sistema y tratar el portal ilustrado como marco subordinado.
- **Do** servir localmente los assets Twemoji, mantenerlos decorativos y conservar la atribución “Twemoji graphics by Twitter/X, licensed under CC BY 4.0”.
- **Do** nombrar cada área además de codificarla con color y verificar contraste WCAG 2.1 AA.
- **Do** usar texto real, foco visible, etiquetas asociadas y un único menú adaptable.
- **Do** mantener el encabezado móvil sobrio y la navegación principal fija abajo.
- **Do** paginar listados extensos y asegurar que el friso envuelva en todos los anchos.

### Don't:

- **Don't** copiar identidad, personajes, imágenes, código o tono visual de la plataforma tomada como referencia funcional.
- **Don't** convertir el paisaje o los emojis en una nueva mascota o identidad oficial de MIDUHO.
- **Don't** mezclar colores de área ni usar color como único portador de significado.
- **Don't** entregar texto pedagógico dentro de imágenes ni usar imágenes decorativas con alternativas redundantes.
- **Don't** añadir texturas fotográficas, grapas, pliegues o rayado diagonal a las planchas.
- **Don't** crear un segundo menú móvil ni permitir scroll horizontal.
