## Context

MIDUHO tiene hoy dos mundos visuales:
- **«Friso de Aula»** (en `DESIGN.md`): Nunito 850, colores terrosos, paisaje raster con Twemoji y oso 3D en el inicio. Tokens en `src/styles/globals.css`; piezas en `components/friso/*`.
- **«Cosmos»**, solo en Laboratorios: todo cuelga de `.cosmos` (variables `--cos-*`) y de `actividad.module.css`.

`app/page.tsx` es un único inicio para cualquier contexto, con datos de demostración (`@/data/demo`).

El operador aprobó la maqueta interactiva final: el artifact «MIDUHO · Inicio en modo juego», v11. La fuente está en `referencia/maqueta-mis-materias.dc.html`. Fija estos elementos:
- **Encabezado:** wordmark MIDUHO en colores del escudo con contorno, menú de botones sticker, estrellas y grupo.
- **Tablero:**
  - fondo de sabana en tonos lavados;
  - título «Mis materias»;
  - cuadrícula de 5×2 cromos.
- **Cromo:**
  - marco con bisel;
  - ventana con rayos y suelo;
  - personaje que sobresale;
  - placa con el nombre;
  - «Sigue con», barra de avance y estrellas;
  - botón redondo de jugar;
  - estados: elegido, dominada (destello), «¡Nuevo!» y en preparación.
- **Avatar:** salta al cromo elegido.
- **Panel:** «Mi explorador» con 4 avatares y su nombre, la materia elegida y el botón grande «Entrar a…».

La maqueta es la referencia visual y de comportamiento. Sus datos de ejemplo no se trasladan.

El dominio ya ofrece lo necesario para listar asignaturas: `AsociacionEstudianteGrupo` da el grupo activo, `AsignacionDocente` (ACTIVA, por grupo y año) da las asignaturas, y `Asignatura` con `Area` (con `orden`) completa el resto. **No existen todavía**:
- el contenido asociado a la clase, del que dependen «¡Nuevo!» y «en preparación»;
- las actividades e intentos, que vienen de `fundacion-actividades` y de los que dependen las estrellas, el avance y «Sigue con»;
- un lugar donde guardar el avatar.

Restricciones: AGENTS.md (sin datos de menores, sin copiar contenido protegido, WCAG 2.1 AA, español de Colombia) y Next.js 16 (leer `apps/web/node_modules/next/dist/docs/` antes de tocar layouts, `next/font` o acciones de servidor).

## Goals / Non-Goals

**Goals:**
- «Mis materias» como inicio del estudiante, fiel a la maqueta, con sus asignaturas reales.
- Cromo como componente reutilizable, con estados que reflejan datos reales, y omisión limpia cuando faltan.
- Avatar elegible, persistido, que salta al cromo elegido.
- Nueva identidad en todas las superficies salvo Laboratorios, con AA verificado por prueba.
- Cada fase con su comando de impeccable, y cierre con revisión final y `DESIGN.md` reescrito.

**Non-Goals:**
- Tocar Laboratorios o su universo.
- Calcular notas, guardar intentos o definir la escala del SIEE.
- Modelar el contenido por clase: este cambio solo deja el contrato `conMaterial` y `nuevo`.
- Rankings, monedas, tienda o cualquier economía de juego.
- Mascota institucional oficial: los avatares son provisionales.
- Mostrar cifras de ejemplo en producción.

## Decisions

### D1. Fases con comandos de impeccable

| Fase | Comando | Produce |
|---|---|---|
| 0. Contexto | `/impeccable init` | PRODUCT.md: escudo, estudiante primero, avatares provisionales, Labs fuera |
| 1. Contrato | `impeccable surface-brief write` | Contrato de dirección de `src/app/page.tsx` (ESTUDIANTE) con la maqueta como referencia aprobada; briefs del shell, del inicio docente y de la Biblioteca |
| 2. Línea base | capturas + `/impeccable audit` | Capturas de partida y regresión de Laboratorios |
| 3. Color | `/impeccable colorize` | Rampas del escudo, tinta de contorno y familias por materia como tokens; prueba de contraste |
| 4. Tipografía | `/impeccable typeset` | Baloo 2 + Atkinson Hyperlegible Next con `next/font`; escala; wordmark |
| 5. Sistema | `/impeccable extract` | Botón sticker, cromo, placa, chip de estado, barra de avance, botón de jugar y panel |
| 6. Escenas | build code-led sobre la maqueta | `features/materias/escenas/`: sprite SVG con las 10 escenas, escenas genéricas por área, rayos y fondo sereno |
| 7. Tablero y avatar | build + `/impeccable delight` | `<MisMaterias>`, cromos con datos, avatar que salta, panel |
| 8. Movimiento | `/impeccable animate` | Salto, flotar, destello, latido de «¡Nuevo!», giro de rayos y personaje al pasar el puntero; variante reducida |
| 9. Resto de superficies | build por superficie | Shell e ingreso → inicio docente → Clase → Biblioteca → Agenda → Mi curso/Cuenta/Admin |
| 10. Estados | `/impeccable harden` + `/impeccable onboard` | Sin grupo, sin asignaturas, más de 10 (paginación), sin datos, en preparación, nombres largos, primer ingreso |
| 11. Responsive | `/impeccable adapt` | Una pantalla desde 900×640; 2 columnas y luego 1 en móvil con hoja inferior |
| 12. Verificación | `/impeccable audit` + `/impeccable critique` | AA, teclado, lector, rendimiento y revisión anti-copia frente a referentes y maqueta |
| 13. Cierre | `/impeccable polish` → finish reviewer → documenter | Veredicto, `DESIGN.md` y `.impeccable/design.json` reescritos |

### D2. El inicio decide por contexto
`app/page.tsx` sigue delgada: lee el contexto del shell y renderiza `<MisMaterias>` (ESTUDIANTE) o `<InicioDocente>` (DOCENTE, el inicio actual reestilizado). No se crea una ruta nueva. **Alternativa descartada:** `/materias`, porque duplicaría el inicio y obligaría a redirigir.

### D3. `ResumenMateria`: contrato con campos opcionales
`src/server/modules/materias/servicio.ts` (`import "server-only"`) devuelve, por asignatura:

```
{ id, nombre, area: { nombre, orden }, escena, claseHref,
  estrellas: 0|1|2|3|null, avance: { hechas, total } | null,
  sigue: string | null, nuevo: boolean | null, conMaterial: boolean | null }
```

- Hoy solo existen las asignaturas, así que los campos de progreso y material salen `null`.
- Un adaptador para `fundacion-actividades` (estrellas, avance, sigue) y otro para contenido por clase (`conMaterial`, `nuevo`) se conectan cuando existan sus fuentes, sin tocar la UI.
- El cromo decide qué mostrar según qué campos tienen valor.

Esto cumple la regla de no inventar cifras y deja la interfaz terminada.

### D4. Escenas por asignatura
`escenas.ts` mapea un nombre normalizado (sin tildes, en minúsculas) a un id de escena del sprite. Si no hay coincidencia, usa la escena genérica del área. Las 10 escenas de la maqueta (lectura, matemáticas, naturales, inglés, robótica, emprendimiento, ética, artística, física, sociales) se migran del SVG de referencia a componentes del sprite, con README de procedencia. **Alternativa descartada:** que la docente o la administración suban imágenes por asignatura. Abre la puerta a raster pesado y a contenido protegido; puede revisarse más adelante.

### D5. Familias de color por materia
Cada materia tiene `marco`, `cinta`, `cielo`, `rayo` y `suelo`, como tokens derivados de las rampas del escudo; la tabla está en la maqueta. El texto de la placa es blanco con contorno de tinta de 5 px. La prueba de contraste verifica los pares de texto que no tienen contorno: el texto oscuro sobre el blanco de la información y el texto oscuro sobre cada `cinta` del panel.

### D6. Avatar: datos, persistencia y salto
- **Datos:** enum `AvatarExplorador { CASITA PINO GOTA SOL }` y `Usuario.avatar AvatarExplorador?`, con su migración. El nulo equivale a CASITA.
- **Persistencia:** acción de servidor `guardarAvatar(valor)`, con validación Zod, contexto ESTUDIANTE obligatorio y actualización solo de la propia cuenta.
- **Posición:** el avatar se coloca en la cuadrícula a partir del índice del cromo elegido (columna y fila), con una transición CSS con rebote de 650 ms y un flotar suave. Con movimiento reducido no hay transición. La posición la calcula una función pura (`lib/posicion-avatar.ts`) con pruebas.
- **Alternativa descartada:** el recorrido por caminos de la versión de mapa, que ya no aplica.

### D7. Aislamiento de Laboratorios
Antes de tocar tokens globales, se inventarían y congelan las referencias a `--color-*` dentro de `.cosmos` y del `<nav>` bajo `.cosmos`. La regresión visual `npm run regresion:labs`, con Chrome headless (el Chrome de Playwright MCP falla en esta máquina), es la puerta de cada fase que toca `globals.css` o el shell.

### D8. Una pantalla y paginación
La cuadrícula es de 5×2 con `minmax(0, 1fr)` en filas y columnas; la ventana de escena es flexible y el bloque de información tiene alto natural. El personaje sobresale con un `row-gap` que lo acomoda. Con más de 10 asignaturas se pagina de 10 en 10 (🔶): el avatar acompaña a la página del cromo elegido.

## Risks / Trade-offs

- **[Labs hereda cambios por tokens o shell compartidos]** → Valores congelados en `.cosmos` y `regresion:labs` como puerta.
- **[Cromos «vacíos» mientras no hay datos de progreso]** → El estado sin datos se diseña como estado propio («Toca jugar para entrar»), con la escena como protagonista. El tablero sigue siendo útil para entrar.
- **[Alturas bajas recortan el personaje o la información]** → Mínimo de 640 px de alto. Por debajo, o por debajo de 900 px de ancho, se pasa al modo móvil con scroll (🔶).
- **[Rendimiento de 10 escenas SVG animadas]** → Un sprite dibujado una vez con `<use>`. Animaciones solo con `transform`, `opacity` y `background-position`; los bucles se detienen con movimiento reducido. La carga se mide en la fase 12.
- **[Copia involuntaria de referencias]** → Revisión anti-copia en `critique`. Ni personajes, ni logos, ni banderas o íconos de otros países como cliché (Inglés usa un loro y globos de diálogo).
- **[Avatares percibidos como oficiales]** → Rotulados como provisionales en la documentación. El escudo sigue siendo la marca institucional.

## Migration Plan

1. Rama `feat/rediseno-identidad-juvenil` desde `main`.
2. Migración Prisma retrocompatible (enum y columna opcional).
3. Fases 0–5 sin cambio de estructura. Cada fase deja build, lint, pruebas y `regresion:labs` en verde.
4. Fases 6–8: «Mis materias» detrás del contexto ESTUDIANTE. **Puerta de aprobación** del operador con datos reales de demostración antes de seguir.
5. Fases 9–13 y despliegue normal (`deploy/deploy.sh` aplica la migración).
6. **Rollback:** revertir el merge. La columna `avatar` puede quedar sin efecto o eliminarse con una migración de reversa.

## Open Questions

- 🔶 Paginación con más de 10 asignaturas, o mostrar todas en una cuadrícula más densa.
- 🔶 Estructura definitiva del inicio de la docente: hoy queda el friso con la nueva identidad.
- 🔶 Variante móvil: 2 columnas y luego 1, con hoja inferior.
- 🔶 Umbrales de estrellas y su relación con el SIEE.
- 🔶 Definición de «¡Nuevo!» cuando exista el contenido por clase (por ejemplo, liberado hace 7 días o menos y no abierto).
- 🔶 Aprobación de los avatares por el colegio.
- 🔶 Si «Mis clases» sale definitivamente del menú del estudiante.
- 🔶 Si Laboratorios se lleva a la nueva identidad en el futuro (hoy queda fuera).
