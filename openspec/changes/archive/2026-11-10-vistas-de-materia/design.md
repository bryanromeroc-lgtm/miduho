## Context

«Mis materias» (cambio `rediseno-identidad-juvenil`, ya implementado en el repo) lista una `ResumenMateria` por asignatura del grupo, con `escena` (`src/lib/escenas.ts`), `claseHref` provisional y campos opcionales de progreso. Existen `MarcoJuego` (shell con encabezado), `BotonSticker`, estrellas (`lib/estrellas.ts`), textos de desempeño (`lib/desempeno.ts`) y la tarjeta `features/actividades/presentacion/tarjeta-actividad.tsx`, hecha para el estilo sticker.

`fundacion-actividades` aún no está implementado (0 de 29 tareas; no hay `AsignacionActividad` en el esquema). No hay fuente real de actividades.

El operador pide una vista por materia a pantalla completa, 2D flat, sin sidebar, con decoración 100 % de la materia y fondo pastel con marcas de agua. La imagen de referencia solo aporta el esquema (cabecera + cuadrícula de tarjetas con botón). Restricciones: AGENTS.md (sin datos de menores, sin copiar, WCAG 2.1 AA, español de Colombia), Next.js 16 (leer `node_modules/next/dist/docs/` antes de crear rutas dinámicas: `params` es asíncrono) y Laboratorios intocable.

## Goals / Non-Goals

**Goals:**
- Una ruta única `/materias/[asignatura]` que sirve a todas las materias, con un kit temático intercambiable por materia.
- Estilo flat verificable: sin sombras, sin degradados con volumen, sin contornos oscuros; el contraste lo da el color de relleno.
- Decoración estrictamente temática, definida por tabla y probada por pruebas (cada kit tiene los elementos mínimos; ninguno usa elementos de otro).
- Una pantalla sin scroll en escritorio y tableta; usable en móvil.
- Datos honestos: sin actividades inventadas; estados vacíos diseñados.

**Non-Goals:**
- El reproductor de actividades y los tipos de juego (cambio posterior).
- Calcular notas o intentos (los entrega `fundacion-actividades`).
- Modificar Laboratorios, Biblioteca o el inicio docente.
- Que la docente suba o elija decoración por materia.
- Mascota con personaje por materia (se usa el avatar del estudiante ya existente, opcional).

## Decisions

### D1. Fases con comandos de impeccable
Regla del operador: todo trabajo de UI pasa por impeccable. Cada grupo de tareas nombra su comando.

| Fase | Comando | Produce |
|---|---|---|
| 0. Contexto | `impeccable context` | Lectura de PRODUCT.md/DESIGN.md y de la regla «flat dentro de la materia» |
| 1. Contrato | `impeccable surface-brief write` | Contrato de dirección de `app/materias/[asignatura]/page.tsx` (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) con la tabla de kits (D4) |
| 2. Color | `/impeccable colorize` | Por materia: `fondo` pastel, `marca` de agua, `tarjeta`, `acento`, `tinta`; prueba de contraste |
| 3. Tipografía | `/impeccable typeset` | Escala de la cabecera y de la tarjeta con Baloo 2 + Atkinson, mínimo 16 px |
| 4. Sistema | `/impeccable extract` | Tarjeta de actividad, cabecera temática, paginador, chip de estado, botón «Jugar» flat |
| 5. Ilustración | build code-led | Kits SVG por materia (D4) |
| 6. Movimiento | `/impeccable animate` | Entrada escalonada, flotar suave de los elementos sueltos, tarjeta al pasar el puntero; variante reducida |
| 7. Estados | `/impeccable harden` + `/impeccable onboard` | Vacío, en preparación, nombres largos, muchas actividades, sin intentos |
| 8. Responsive | `/impeccable adapt` | 3×2 → 2 columnas → 1 columna |
| 9. Verificación | `/impeccable audit` + `/impeccable critique` | AA, teclado, lector, anti-copia, anti-genérico |
| 10. Cierre | `/impeccable polish` → finish reviewer → documenter | Veredicto y `DESIGN.md` actualizado con la sección «Vista de materia» |

### D2. Una ruta, kits por materia
`/materias/[asignatura]` recibe el `id` de la asignatura. El servicio resuelve `escenaDe(nombre, área)` (ya existente) y la vista elige `KITS[escena]`. **Alternativa descartada:** una ruta o página por materia; duplicaría la lógica y haría que cada materia nueva exija código nuevo. Una materia sin coincidencia usa el kit `generica` (útiles escolares neutros: lápiz, cuaderno, regla, estrella), que es el único caso donde la decoración es «escolar» en general, porque no hay tema que honrar.

### D3. Contrato de datos honesto
En `src/lib/materias.ts`:

```
ActividadResumen = { id, titulo, tipo, estado: "porAbrir"|"disponible"|"enCurso"|"hecha"|"cerrada",
                     estrellas: 0|1|2|3|null, intentosUsados: number, intentosMax: number,
                     abre: string|null, cierra: string|null, href: string }
VistaMateria     = { materia: ResumenMateria, grupo, actividades: ActividadResumen[] | null }
```

- `actividades: null` = fuente aún no conectada → estado «Aún no hay actividades» con la escena de la materia.
- `[]` = conectada pero sin asignaciones → mismo estado, texto «Tu docente aún no ha asignado actividades».
- `servicio.vistaMateria(sesión, asignaturaId)` verifica que la asignatura pertenezca a las asignaciones ACTIVAS del grupo del estudiante; si no, `notFound()`. Sin nombres de docentes ni datos de otros estudiantes.
- Un puerto `ActividadesDeMateria` (como `puertos.ts` del módulo) devuelve `null` hoy; `fundacion-actividades` lo implementa. El orden: abiertas con cierre más próximo → en curso → por abrir → hechas → cerradas.
- **Alternativa descartada:** sembrar actividades de ejemplo en la base. Viola «nada de cifras inventadas». Las muestras viven en `app/muestras/materia`, rotuladas «Datos de ejemplo».

### D4. Kit temático por materia (estricta)
Cada kit define: `fondo` (pastel neutro claro, croma ≤ 0.03 en OKLCH), `marcas` (símbolos de agua), `cabecera` (escenografía del título), `utileria` (clip, cinta, chinche reinterpretados), `marco` (borde de tarjeta) y `sueltos` (elementos flotantes). Todo es SVG plano, sin trazo oscuro.

| Materia | Cabecera y sueltos | Utilería (clip / cinta / chinche) | Marco de tarjeta | Marcas de agua |
|---|---|---|---|---|
| Matemáticas | regla, escuadra, compás, lápiz, números 1 2 3 | clip de papel; cinta de papel cuadriculado; chinche con forma de ficha numérica | línea de regla con marcas de cm | + − × ÷ π √ y números |
| Lectura | libro abierto, plumas, marcalibros, letras | clip en forma de marcapáginas; cinta con renglones; chinche como punto final «.» | esquina de hoja con renglones | A B ñ ¿ ? « » |
| Naturales | tubos de ensayo, lupa, hojas, microscopio | clip de pinza de laboratorio; cinta con hojas; chinche como gota | borde de hojas y gotas | átomo, hoja, ADN, gota |
| Inglés | globos de diálogo («Hello»), abecedario, loro, auriculares | clip de globo de diálogo; cinta con «ABC»; chinche como signo «!» | borde de globo de diálogo | Aa, ?, !, hi |
| Robótica | engranajes, tornillos, placa de circuito, brazo mecánico | clip de tornillo; cinta de cable plano; chinche como LED | borde de circuito impreso | 0 1, engranaje, circuito |
| Emprendimiento | monedas, alcancía, bombillo, toldo de tienda | clip de etiqueta de precio; cinta con monedas; chinche como moneda | borde de toldo a rayas | $, barras de gráfico, bombillo |
| Ética y valores | corazones, manos unidas, balanza, rama de paz | clip en forma de corazón; cinta con manitas; chinche como estrella | borde de guirnalda de corazones | corazón, mano, balanza |
| Artística | pinceles, paleta, acuarelas, notas musicales | clip de pincel; cinta de pinceladas; chinche como gota de pintura | borde de pinceladas | nota, gota, pincelada, clave de sol |
| Física | péndulo, imán de herradura, polea, prisma con rayo de luz, ondas | clip de imán; cinta de onda senoidal; chinche como esfera de péndulo | borde de regla de onda (senoide) | F = m·a, v = d/t, onda, vector |
| Sociales | mapa, brújula, globo terráqueo, pergamino, bandera de Colombia | clip de brújula; cinta de mapa doblado; chinche de ubicación (pin de mapa) | borde de mapa con meridianos | rosa de los vientos, meridianos, pin |
| Genérica | lápiz, cuaderno, regla, estrella | clip, cinta lisa, chinche | marco liso con esquinas | estrellas, líneas |

Reglas del kit, verificadas por prueba (`tematica/kits.test.ts`): cada kit declara al menos 3 sueltos, 3 marcas y los 3 tipos de utilería; ningún id de elemento se repite entre kits (nada genérico compartido salvo `generica`); `fondo` cumple el croma máximo; marcas con opacidad ≤ 0.12 y sin saturación alta. Ningún elemento de «bosque/madera» existe en el catálogo.

**Sin banderas ni íconos de otros países** como cliché (Inglés usa un loro y globos). Sociales sí incluye la bandera de Colombia (decisión del operador).

### D5. Flat de verdad
- Sin `box-shadow`, sin `filter: drop-shadow`, sin `border` oscuro de más de 1 px, sin degradados que simulen volumen, sin texturas.
- Separación por **planos de color** (tarjeta más clara o más oscura que el fondo) y por espacio.
- Foco visible con anillo de 3 px de color de alto contraste (requisito AA, no cuenta como «contorno decorativo»).
- Una prueba estática (`vista.estilos.test.ts`) recorre el CSS del módulo y falla si encuentra `box-shadow`, `drop-shadow` o `border` con color de tinta oscura. Evita que el estilo derive.

### D6. Composición sin sidebar, una pantalla
Encabezado del shell (`MarcoJuego`, sin menú lateral) → cabecera temática (título de la materia, sub-título, «Volver a Mis materias») → cuadrícula centrada de 3×2 tarjetas (`minmax(0,1fr)`), ancho máximo de 1200 px → paginador. Con >6 actividades se pagina de 6 en 6 (🔶, como en «Mis materias»). La altura se reparte con `dvh`; mínimo 640 px de alto y 900 px de ancho para el modo de una pantalla; por debajo pasa a una o dos columnas con scroll normal.

### D7. Tarjeta de actividad
Estructura: banda superior con **ilustración de la actividad en el kit de la materia** (pieza SVG según `tipo`, no el cromo), título (máx. 2 líneas), chip de estado, estrellas e intentos («2 de 3 estrellas · 1 intento disponible», con `resumenActividad`) y botón de acción (`Jugar`, `Continuar`, `Repetir`, `Ver resultado`, `Abre el …`). Toda la tarjeta es un enlace con nombre accesible completo; el botón es parte visual del mismo enlace (un solo destino de foco). Las fechas se escriben en español de Colombia.

Estados y su acción: `disponible` → «Jugar»; `enCurso` → «Continuar»; `hecha` con intentos → «Repetir para mejorar»; `hecha` sin intentos → «Ver resultado»; `porAbrir` → deshabilitada, «Abre el …»; `cerrada` → «Ver resultado» si hubo intento, o «Cerrada». Se reutilizan `estrellas.ts` y `desempeno.ts`; se retira la dependencia del estilo sticker de `tarjeta-actividad.tsx` creando una variante `plana` en `features/materias/vista/` (no se modifica la existente).

### D8. Fondo
Capa de fondo = color pastel de la materia + una capa SVG de marcas repetidas en mosaico con rotaciones y tamaños variados, `opacity ≤ 0.12`, `aria-hidden`, `pointer-events: none`, generada una vez (`<pattern>`), sin imágenes raster. Las animaciones son solo `transform`/`opacity` y se detienen con `prefers-reduced-motion`.

### D9. Entrada y salida
«Entrar a {materia}» en «Mis materias» apunta a `/materias/[id]`. El botón «Volver» regresa a `/` con la materia elegida preservada (`?materia=`), para que el avatar siga donde estaba. La ruta exige contexto ESTUDIANTE; la docente recibe 404 (su flujo de clase es otro).

### D10. Muestras de revisión
`/muestras/materia?escena=matematicas` renderiza la vista con 8 actividades **ficticias, sin nombres de personas**, un rótulo visible «Datos de ejemplo» y un selector por materia. Solo disponible fuera de producción (como `muestras/desempeno`). Sirve para auditar los 11 kits sin base de datos.

## Risks / Trade-offs

- **[El flat choca con la identidad sticker de «Mis materias»]** → El corte se hace en la frontera del shell; se documenta en `DESIGN.md` y se confirma con el operador (🔶). Si no se confirma, el kit sigue siendo intercambiable porque solo cambia CSS y SVG.
- **[Sin API de actividades, la vista real queda vacía]** → El estado vacío es parte del diseño y las muestras permiten aprobar el resto. La conexión es un solo adaptador.
- **[11 kits ilustrados a mano son mucho arte]** → Un kit = 1 archivo con piezas SVG pequeñas reutilizables (clip, cinta, chinche y marco se parametrizan por color/forma); orden de producción: matemáticas (referencia), naturales, lectura, luego el resto. Cada kit se revisa antes de seguir. No hay generación de imágenes disponible.
- **[Decoración recarga y estorba la lectura]** → Marcas ≤ 0.12 de opacidad; sueltos fuera de la zona de texto; los textos siempre sobre un plano de tarjeta sólido; contraste verificado por prueba.
- **[Temática «estricta» difícil de verificar]** → Tabla D4 como fuente de verdad + prueba de catálogo + revisión en `critique` con la lista «¿cada elemento pertenece a esta materia?».
- **[Copia de la imagen de referencia]** → No se reutilizan mascota, escenas ni textos de la imagen; revisión anti-copia en `critique`.
- **[Muchas actividades o nombres largos]** → Paginación, recorte a 2 líneas con el nombre completo en el título accesible, y estados probados en `harden`.

## Migration Plan

1. Rama `feat/vistas-de-materia` desde `main` (con `rediseno-identidad-juvenil` ya integrado, o apilada sobre su rama si aún no).
2. No hay migración de base de datos. Se agrega la ruta y se cambia `claseHref`; revertir es restaurar `claseHref`.
3. La ruta funciona sin `fundacion-actividades` (estado vacío). Al implementarlo, se registra el adaptador del puerto `ActividadesDeMateria` sin tocar la UI.
4. Puerta antes de integrar: `npm run build`, `npm run lint`, `npm test`, `npm run regresion:labs` en verde.

## Decisiones del operador (2026-10-31, tarea 1.2)

- **Todo flat.** La vista de materia **no** usa `MarcoJuego` (sticker): lleva un **encabezado flat propio** (escudo + wordmark, «Volver a Mis materias», cuenta/salir) en los colores de la materia. «Mis materias» conserva su identidad sticker. Sustituye la propuesta de corte «shell sticker / contenido flat» de D6.
- **Paginación de 6 en 6** confirmada (D6).
- **Sociales lleva la bandera de Colombia** como elemento suelto (sustituye la exclusión de D4). Sigue sin banderas de otros países: Inglés usa loro y globos.
- **`fisica` = Física (ciencia, cercana a la física matemática)**, no Educación física. El kit `fisica` usa péndulo, imán, polea, prisma con rayo de luz y ondas; marcas `F = m·a`, `v = d/t`, onda, vector. Sustituye la fila «Educación física» de D4.

## Open Questions

- 🔶 **Educación física queda sin kit propio.** Hoy `escenas.ts` envía «Educación física», «recreación» y «deporte» a la escena `fisica`, y su cromo en «Mis materias» es un arco de fútbol. Con la decisión anterior, esas asignaturas abrirían una vista con temática de Física. Por confirmar: ¿crear una escena `educacionFisica` (kit deportivo + cromo) o enviarlas a `generica`? Mientras tanto no se toca `escenas.ts`.
- 🔶 ¿Dónde vive el reproductor de actividades? Este cambio solo enlaza a `/materias/[asignatura]/actividades/[id]`, que hoy muestra «Esta actividad se abre pronto».
