> **Regla de ejecución:** todo trabajo de interfaz de este cambio se hace con impeccable. Cada sesión empieza con `impeccable context` (una vez) y cada grupo nombra su comando. Ningún grupo de UI se implementa "a mano" sin pasar por su comando. Los grupos sin UI (datos y servidor) lo dicen explícitamente, y su interfaz la cubre el comando del grupo que la consume.

## 1. Contexto y contrato (`/impeccable init`, `impeccable surface-brief write`)

- [x] 1.1 Crear la rama `feat/rediseno-identidad-juvenil` desde `main` e incluir `apps/web/public/images/escudo-colegio.jpg`
- [x] 1.2 Ejecutar `/impeccable init`: actualizar PRODUCT.md (escudo entregado, estudiante como audiencia principal, avatares provisionales, Laboratorios fuera) y revisar el diff con el operador
- [x] 1.3 Escribir con `impeccable surface-brief write` el contrato de dirección de `src/app/page.tsx` (ESTUDIANTE): THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM (seed `493bfde9` + maqueta aprobada `referencia/maqueta-mis-materias.dc.html`) y FINISH. Crear los briefs del shell, del inicio docente y de la Biblioteca, y verificarlos releyéndolos
- [x] 1.4 Guardar las capturas de referentes y de la maqueta en `.impeccable/review/referentes/` (no versionado)

## 2. Línea base y blindaje de Laboratorios (capturas + `/impeccable audit`)

- [x] 2.1 Script `apps/web/scripts/capturar-linea-base.mjs` (Chrome headless, sesiones demo de estudiante y docente): capturas a 1440, 1024 y 390 px en `.impeccable/review/baseline/`
- [x] 2.2 `npm run regresion:labs`: compara `/laboratorios`, `?mundo=emprendimiento` y una ruta de unidad contra la línea base
- [x] 2.3 Inventariar y congelar dentro de `.cosmos` las referencias a `--color-*` y las del `<nav>` bajo `.cosmos` (D7), con `regresion:labs` en verde
- [x] 2.4 Ejecutar `/impeccable audit` sobre el inicio, la Biblioteca, la Agenda y el ingreso, y guardar el informe de partida

## 3. Color del escudo (`/impeccable colorize`)

- [x] 3.1 Ejecutar `/impeccable colorize`: rampas del escudo, tinta `#1b2440` y familias por materia (`marco`, `cinta`, `cielo`, `rayo`, `suelo`) según la maqueta
- [x] 3.2 Reemplazar los tokens de `@theme` y `:root` en `globals.css`, conservando los nombres semánticos donde sea posible
- [x] 3.3 `src/lib/contraste.ts` + `contraste.test.ts` con los pares texto/fondo declarados (D5)
- [x] 3.4 Eliminar colores literales de las superficies rediseñadas (salvo en las ilustraciones SVG), con `regresion:labs` en verde

## 4. Tipografía (`/impeccable typeset`)

- [x] 4.1 Leer la guía de `next/font` en `apps/web/node_modules/next/dist/docs/`
- [x] 4.2 Ejecutar `/impeccable typeset`: Baloo 2 para títulos, placas y botones; Atkinson Hyperlegible Next para el cuerpo, con mínimo de 16 px; escala; wordmark MIDUHO con contorno y letras en colores del escudo
- [x] 4.3 Reemplazar Nunito en `app/layout.tsx` y en los tokens `--font-*`, y verificar los glifos del español

## 5. Sistema sticker (`/impeccable extract`)

- [x] 5.1 Ejecutar `/impeccable extract`: botón sticker, placa de nombre, chip de estado, barra de avance, botón redondo de jugar, panel y estrellas
- [x] 5.2 Vocabulario de estado cerrado (ahora, programada, lista, hecha, sin material, en preparación, nuevo) con marca y texto, y una prueba de que cada estado tiene ambos

## 6. Datos de materias y avatar (sin UI: Prisma + servidor + Vitest. La UI que los consume se hace con `/impeccable` en los grupos 7 y 8)

- [x] 6.1 Leer la guía de acciones de servidor de Next 16. Agregar a `schema.prisma` el enum `AvatarExplorador` y `Usuario.avatar` opcional, con su migración y seed (sin datos personales nuevos)
- [x] 6.2 `src/server/modules/materias/servicio.ts`: asignaturas activas del grupo del estudiante en el año vigente, ordenadas por `Area.orden` y nombre, devueltas como `ResumenMateria` con los campos de progreso y material en `null` (D3)
- [x] 6.3 Pruebas de integración: otro grupo, asignación inactiva, asignatura con dos asignaciones (sin duplicar), estudiante sin grupo y ausencia de nombres de docentes
- [x] 6.4 Acción de servidor `guardarAvatar`: Zod, solo ESTUDIANTE y solo la propia cuenta. Pruebas con valor inválido, contexto DOCENTE y sesión ausente
- [x] 6.5 Puertos de adaptador vacíos y documentados para `fundacion-actividades` (estrellas, avance, sigue) y para contenido por clase (conMaterial, nuevo)

## 7. Escenas y cromo (`/impeccable` new-work, *code-led*, sobre la maqueta aprobada + `/impeccable extract` para el `<Cromo>`)

- [x] 7.1 `src/features/materias/escenas/`: sprite SVG con las 10 escenas de la maqueta, las escenas genéricas por área y los avatares, más un README de procedencia
- [x] 7.2 `escenas.ts`: tabla de nombre normalizado a escena con respaldo por área, y su prueba (tildes, mayúsculas, sin coincidencia)
- [x] 7.3 `<Cromo>`: marco con bisel, ventana con rayos y suelo, personaje que sobresale, placa, bloque de información según los campos presentes («Sigue con», barra «h/t», estrellas o «Toca jugar para entrar»), botón de jugar y estados (elegido, dominada con destello, «¡Nuevo!», en preparación)
- [x] 7.4 Pruebas del cromo: qué partes aparecen para cada combinación de campos nulos o presentes, y que en preparación no hay botón de jugar
- [x] 7.5 Fondo sereno del tablero (cielo pálido, sol tenue, cerros y colinas lavados) sin animación

## 8. Tablero, avatar y panel (`/impeccable delight`, `/impeccable animate`)

- [x] 8.1 `<MisMaterias>` (Componente Cliente): cuadrícula de 5×2, `<button>` de elección con `aria-pressed` y `aria-label`, enlace de jugar «Entrar a {asignatura}» hacia la vista de clase, y paginación de 10 en 10 (🔶)
- [x] 8.2 Panel: «Mi explorador» con los 4 avatares (botones con nombre visible) y la materia elegida en una región `aria-live`, con el botón «Entrar a {asignatura}»
- [x] 8.3 Ejecutar `/impeccable delight`: avatar posado sobre el cromo elegido, `lib/posicion-avatar.ts` con pruebas, y persistencia con `guardarAvatar` y actualización optimista
- [x] 8.4 `app/page.tsx` decide por contexto (D2). `navegacion.ts` muestra «Mis materias» y saca «Mis clases» del menú del estudiante (🔶). Actualizar las pruebas
- [x] 8.5 Ejecutar `/impeccable animate`: salto con rebote (≤650 ms), flotar, destello, latido de «¡Nuevo!» y rayos y personaje al pasar el puntero, con la variante reducida verificada
- [x] 8.6 Verificar una pantalla sin scroll a 1440×900, 1280×800 y 1024×768
- [x] 8.7 **Puerta de aprobación:** mostrar «Mis materias» con datos reales de demostración y obtener el visto bueno del operador antes de la fase 9

## 9. Desempeño, solo presentación (`/impeccable delight` para resultado y celebración, `/impeccable clarify` para los textos de intentos y resultado)

- [x] 9.1 `src/lib/estrellas.ts` + pruebas (59.99, 60, 89.99, 90; sin intentos; promedio por materia) con umbrales 🔶
- [x] 9.2 `features/actividades/presentacion/`: tarjeta de actividad con intentos y pantalla de resultado (avatar celebrando y aviso de «tu cromo ahora brilla»), más una vista de muestra rotulada «Ejemplo»
- [x] 9.3 Total «mis estrellas» del encabezado, oculto sin datos

## 10. Resto de superficies con la nueva identidad (`/impeccable` como extensión de una superficie por pantalla, dentro del mundo ya establecido, y `/impeccable polish` al cerrar cada una)

- [x] 10.1 Shell e ingreso (`components/friso/marco.tsx`, `styles/shell.css`, `app/(auth)/*`): wordmark, escudo y menú sticker, con `regresion:labs` en verde
- [x] 10.2 Inicio de la docente: estructura actual (friso) con la nueva identidad, sin oso, paisaje ni Twemoji
- [x] 10.3 Mis clases y la vista de Clase (`app/clases/**`)
- [x] 10.4 Biblioteca (`app/biblioteca/**`, `features/biblioteca/components/*`): mismo mundo, conservando estantes, mesa de lectura y filtros
- [x] 10.5 Agenda, Mi curso, Cuenta y Administración: heredan tokens y componentes
- [x] 10.6 Retirar referencias a `public/images/portal/*`, `dashboard/*` y `aventura-lectora*`, y borrar los archivos solo si `grep` confirma que nada los usa

## 11. Estados y primer uso (`/impeccable harden`, `/impeccable onboard`)

- [x] 11.1 Ejecutar `/impeccable harden`: estudiante sin grupo, grupo sin asignaturas, más de 10 asignaturas, sin datos de progreso, en preparación y nombres largos de asignatura y de «Sigue con»
- [x] 11.2 Ejecutar `/impeccable onboard`: primer ingreso del estudiante con la invitación a elegir avatar

## 12. Responsive (`/impeccable adapt`)

- [x] 12.1 Ejecutar `/impeccable adapt`: una pantalla desde 900×640; por debajo, 2 columnas y luego 1, con hoja inferior (🔶), sin scroll horizontal y con botón de jugar de al menos 48 px
- [x] 12.2 Capturas a 390, 768, 1024, 1280 y 1440 px en `.impeccable/review/`

## 13. Verificación y cierre (`/impeccable audit`, `/impeccable critique`, `/impeccable polish`)

- [x] 13.1 Ejecutar `/impeccable audit` (AA, foco, teclado, lector de pantalla, carga inicial de 2 s o menos sin raster de escena) y corregir lo que encuentre
- [x] 13.2 Ejecutar `/impeccable critique` sobre «Mis materias» frente a la maqueta aprobada y los referentes (fidelidad y anti-copia)
- [x] 13.3 `npm run build`, `npm run lint`, `npm test` y `npm run regresion:labs` en verde
- [x] 13.4 Ejecutar `/impeccable polish` e `impeccable detect --json` sobre los archivos cambiados
- [x] 13.5 Capturas finales y revisión con `impeccable-finish-reviewer`, aplicando su disposición
- [ ] 13.6 `impeccable-documenter`: reescribir `DESIGN.md` y `.impeccable/design.json` desde lo construido (avatares provisionales, Laboratorios como mundo aparte)
- [ ] 13.7 `impeccable embed-prompt --scan` sobre los recursos y actualizar la memoria del proyecto
