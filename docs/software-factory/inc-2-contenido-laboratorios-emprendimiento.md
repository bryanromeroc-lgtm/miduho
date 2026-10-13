# Inc. 2 · Contenido de Laboratorios y Emprendimiento

Estado: implementado y verificado  
Rama: `feat/contenido-laboratorios-emprendimiento`

## Decisión y alcance

Reemplazar el contenido ficticio del universo de Laboratorios por una primera selección utilizable de diez unidades para primaria:

- cinco rutas didácticas de Robótica sobre energía, transformaciones, circuitos, conductores y diseño de un molino;
- cinco ejercicios de Emprendimiento sobre oportunidades, encuestas, procesos, nombre de proyecto y preparación de una feria;
- una ruta completa de siete secciones para cada unidad;
- acceso a las diez rutas desde `/laboratorios` y acceso filtrado a Emprendimiento desde `/emprendimiento`.

Fuera del alcance: publicación de calificaciones, progreso real, integración con Agenda, archivos imprimibles, aprobación curricular institucional y asignación definitiva de Estándares o DBA.

## Origen y límites de contenido

- **Observado:** una plataforma educativa de referencia organiza los contenidos por bloques, unidades y recursos; aparecen temas generales de energía y preparación de proyectos.
- **Propuesto e implementado:** selección temática, títulos, objetivos, actividades, evidencias, evaluación y criterios redactados desde cero para MIDUHO.
- **🔶 Por confirmar:** la alineación con el plan de área, Estándares y DBA del colegio. La interfaz la presenta expresamente como propuesta, sin códigos oficiales inventados.
- No se copiaron textos, imágenes, código, nombres de producto ni identidad visual de la referencia.
- No se incorporaron datos personales de estudiantes, docentes o acudientes.

## Criterios de aceptación

- [x] Existen exactamente cinco estaciones de Robótica y cinco de Emprendimiento.
- [x] Cada estación abre una URL propia y tiene una ruta didáctica completa.
- [x] Cada ruta contiene objetivo, evidencias, profundización, inicio, desarrollo, evaluación y criterios para calificar.
- [x] Las diez unidades están disponibles; la interfaz no muestra progreso, estrellas, XP ni bloqueos ficticios.
- [x] El contenido pedagógico es texto real, seleccionable y apto para lector de pantalla.
- [x] No aparece terminología comercial de la plataforma observada.
- [x] `npm test`, `npm run lint` y `npm run build` pasan.
- [x] Verificación funcional en navegador de ambos mundos y una ruta de cada área.

### Continuidad visual de las actividades

- [x] La ruta didáctica conserva la cabina, el cielo y el acento visual del mundo de origen.
- [x] La actividad reutiliza la ilustración de la estación elegida y muestra área, unidad, bloque y sesiones sin perder contexto.
- [x] Existe un regreso visible al mismo mundo (`robotica` o `emprendimiento`), no a una vista genérica.
- [x] Las siete secciones mantienen una medida de lectura de hasta 70 caracteres y contraste WCAG AA.
- [x] La composición funciona en escritorio y móvil, con navegación por teclado y movimiento reducido.

## Archivos esperados

- `src/lib/laboratorios.ts`
- `src/lib/datos.ts`
- `src/lib/contenido-laboratorios.test.ts`
- `src/app/laboratorios/page.tsx`
- `src/app/laboratorios/[unidad]/page.tsx`
- `src/app/laboratorios/[unidad]/actividad.module.css`
- `src/components/laboratorios/despegue.tsx`
- `src/app/globals.css`
- `docs/software-factory/README.md`
- `docs/software-factory/inc-2-contenido-laboratorios-emprendimiento.md`

## Verificación prevista

```bash
npm test -- src/lib/contenido-laboratorios.test.ts
npm run lint
npm run build
```

## QA

- `npm test -- src/lib/contenido-laboratorios.test.ts`: 1 archivo, 5 pruebas aprobadas.
- `npm test`: 17 archivos, 175 pruebas aprobadas.
- `npm run lint`: aprobado sin errores ni advertencias del proyecto.
- `npm run build`: aprobado; TypeScript y generación de 131 páginas completados.
- Playwright, escritorio 1280 × 720:
  - `/laboratorios`: se observaron cinco estaciones accesibles de Robótica, 12 sesiones planeadas y apertura de la ficha.
  - `/laboratorios/rob-energia-movimiento`: se observaron las siete secciones, disponibilidad y alineación marcada como propuesta.
  - `/emprendimiento`: redirigió al mundo correcto y mostró cinco ejercicios accesibles.
  - `/laboratorios/emp-preguntar-crear`: se observaron las siete secciones y el recordatorio explícito de no recopilar datos personales.
- Única incidencia de consola observada: reconexión momentánea de HMR del servidor de desarrollo; no se reprodujo como error funcional y el build de producción pasó.
- Revisión Impeccable: se reemplazó la transición de `width` de la barra de carga por `transform: scaleX()` para evitar recálculos de layout. Detector posterior: cero hallazgos.
- Continuidad visual verificada con Playwright:
  - Robótica en escritorio (1280 × 720) y móvil (390 × 844), incluidos salto a la sección 7 y panel del mundo.
  - Emprendimiento en escritorio (1280 × 720), con acento verde, ilustración y regreso al mundo correcto.
  - La cabina y la navegación permanecen montadas; el contenido se desplaza dentro del universo y respeta la navegación inferior móvil.
- Detector Impeccable sobre la nueva página y su módulo CSS: cero hallazgos.

## Revisión

- Privacidad: sin datos personales ni datos reales de menores.
- Contenido protegido: adaptación temática con redacción original y sin activos de terceros.
- Accesibilidad: textos en DOM, botones con nombre accesible, foco visible y rutas navegables por teclado.
- Arquitectura: datos curriculares centralizados; los segmentos dinámicos se generan desde `RUTAS`.

## Cierre

Los criterios de aceptación están cubiertos. La tarjeta queda lista para revisión de contenido por parte del colegio, especialmente la alineación curricular marcada con 🔶.
