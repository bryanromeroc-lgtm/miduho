# Correcciones de la auditoría UI de materias y juegos

**Origen:** auditoría del 2026-11-01 en la bóveda (`09-Construccion/Auditoria-de-materias-y-juegos-2026-11-01.md`).
**Estado:** implementado y verificado en automatización; validación manual de accesibilidad y tacto pendiente 🔶. **Autorización:** solicitud de ejecutar `/impeccable harden`, `adapt`, `clarify`, `onboard`, `optimize` y `polish`.
**Alcance:** vistas de materias y actividades, juegos de Rectas, Ángulos, Sopa de letras y Bocadillo, textos compartidos y carga del reproductor. Sin datos reales de menores ni contenido de la plataforma de referencia.

## Decisiones y límites

- **Confirmado:** 5.º es el grado de demostración de juegos. El catálogo actual contiene actividades solo para 5.º.
- **Confirmado:** la práctica libre no guarda resultados ni asigna notas institucionales. El primer intento de cada ronda determina las estrellas de la partida actual.
- **Confirmado:** `fisica` conserva la identidad de «Educación Física» y `ciencias_fisicas` es una escena nueva para «Física», según la decisión del usuario del 2026-11-01.
- **Propuesto:** equivalentes textuales para razonar sobre diagramas, controles táctiles alternativos y explicación de reglas antes de jugar. No se inventan actividades para 1.º.
- **Optimización:** medir antes de cambiar la estrategia de carga. Si no hay coste material, conservar los imports actuales y documentar el resultado.

## Criterios de aceptación

1. Rectas y las dos modalidades de Ángulos pueden resolverse con teclado y lector de pantalla a partir de información no visual equivalente, sin anunciar la categoría correcta directamente.
2. Sopa de letras y Bocadillo ofrecen una interacción alternativa con objetivos de al menos 44 × 44 px en móvil; no hay scroll horizontal a 320, 390 ni 768 px ni a zoom 200 %.
3. La regla del primer intento y la falta de guardado se explican antes de responder; el resultado distingue corregir para aprender de la puntuación de la primera respuesta.
4. La demostración de 5.º tiene un recorrido real y claramente ficticio documentado, sin habilitar acceso público ni cambiar el seed general.
5. «Física» y «Educación Física» no comparten descripción o arte contradictorios, conforme a la decisión del usuario.
6. El catálogo/documentación indican 69 actividades de 5.º y 21 tipos (9 generales, 12 especializados).
7. La medición de carga queda registrada; cualquier división de código mejora la métrica relevante sin romper una partida.
8. Revisión final de foco, contraste, tamaños, estados, navegación y contenido en escritorio y móvil; detector sin hallazgos reales nuevos.

## Archivos previstos

`apps/web/src/features/actividades/juegos/{rectas,angulos,bocadillo}/`, `apps/web/src/features/actividades/reproductor/`, `apps/web/src/features/materias/vista/`, `apps/web/src/lib/escenas.ts`, `apps/web/src/lib/guias.ts`, `apps/web/src/features/materias/tematica/`, `apps/web/scripts/demo-quinto.ts`, `docs/actividades/tipos.md`, pruebas `*.test.ts` junto a la lógica nueva. El conjunto final depende de la medición.

## Verificación requerida

`npm run lint`, `npm run build`, `npm test`; pruebas de contrato de juegos y QA de navegador a 320, 390, 768 y escritorio, teclado y accesibilidad. Registrar resultados y límites aquí antes del cierre.

## Resultado

### Harden

- Rectas describe extremos, orientaciones de las dos líneas y cruce visible en el nombre accesible de cada opción, sin pronunciar la categoría que se pregunta.
- Ángulos describe el cero y las marcas del transportador; los rayos candidatos de bisectriz indican su separación del primer lado.
- Pruebas de las descripciones y navegación de las cuatro partidas en Chromium. 🔶 Falta una sesión manual con NVDA/VoiceOver y una persona usuaria de lector de pantalla; el árbol accesible automatizado no sustituye esa prueba.

### Adapt

- Sopa de letras: selector de fila y botones grandes para elegir primera y última letra, compartiendo estado y calificación con la cuadrícula.
- Bocadillo: selectores grandes de partes pintadas para cada barra, compartiendo estado con los segmentos visuales.
- Chromium de 5.º: alternativa de sopa con botones de 44 × 48 px a 320 px; Bocadillo permitió escoger 6 partes, pintar 3 y 4 mediante selectores y comprobar la ronda. Sin desbordamiento horizontal a 320, 390 y 768 px en esos juegos. 🔶 Falta prueba táctil en dispositivo físico, zoom de navegador al 200 % y lector de pantalla real.

### Clarify y onboard

- La regla del primer intento y la falta de guardado se anuncian antes de jugar. El resultado recuerda que las estrellas corresponden a las primeras respuestas cuando hubo correcciones.
- `fisica` identifica Educación Física; `ciencias_fisicas` identifica Física, con arte, colores, descripciones y muestra propios. La muestra no enseña el aviso personal de primera visita.
- El catálogo vigente indica 69 actividades de 5.º y 21 tipos. El recorrido de demostración de 5.º usó una base desechable y una cuenta ficticia; se verificó inicio → Matemáticas → juegos. `demo-quinto.ts` ahora admite la docente genérica del seed de capturas. La credencial temporal se guardó fuera del repositorio y no forma parte de este documento.
- El mensaje de primera visita indica elegir una actividad y que se puede volver a la materia. No se inventó contenido para 1.º.
- Para repetir la demostración en la **base desechable de capturas**: desde `apps/web`, cargar `scripts/capturas/capturas.env` y ejecutar `./node_modules/.bin/tsx scripts/demo-quinto.ts`. El comando regenera la contraseña de `estudiante.quinto@miduho.test`; manejar la salida como credencial temporal, fuera de Git y de la bóveda. El recorrido comprobado fue ingresar → Mis materias → Matemáticas → una actividad para jugar.

### Optimize

Medición del manifiesto de cliente de la ruta `/materias/[asignatura]/actividades/[id]` en compilación de producción, sumando los chunks JS iniciales declarados para la ruta (gzip local; no representa transferencia HTTP ni Web Vitals):

| Estado | JS inicial sin comprimir | JS inicial gzip | Diferencia gzip |
|---|---:|---:|---:|
| Antes, 21 imports directos | 584.122 B | 145.261 B | — |
| Después, carga diferida por tipo | 503.863 B | 122.826 B | −22.435 B (−15,4 %) |

La partida carga el módulo elegido al abrirlo. Se comprobó en navegador que Rectas, Ángulos, Bocadillo y Sopa de letras abren sin error.

El hook de cierre señaló dos animaciones de `width` en las barras decorativas de progreso y reloj. Se cambiaron a `transform: scaleX` con origen izquierdo; los valores visibles y el texto accesible siguen siendo los mismos. El detector focalizado devuelve `[]`. No se agregaron excepciones al detector.

Como comprobación HTTP adicional, Chromium abrió **Rectas** desde el build servido en `localhost`: 10 recursos JS, **120.428 B transferidos** según Resource Timing, 959.483 B decodificados, DOMContentLoaded a 510 ms y evento `load` a 517 ms. Es una sola navegación local de prueba, no una comparación antes/después ni una medición representativa de la red escolar. 🔶 Siguen pendientes Web Vitals y transferencia en la red y dispositivos reales del colegio.

### Polish y QA

- Revisión visual a 390 px de Matemáticas, Educación Física y Física; a 320 px de las alternativas de Sopa y Bocadillo. Las vistas de materia a 320, 390, 768 y 1440 px no presentaron desbordamiento horizontal. Se quitó el aviso personal de las muestras y se colocó su selector dentro del encabezado móvil para evitar que tape el título. A 320 px los cuadros del selector y el título no se solapan.
- Pruebas de contraste automatizadas del proyecto, foco y estados compartidos se cubren con `npm test` y las comprobaciones de navegador indicadas. 🔶 No se afirma certificación WCAG 2.1 AA sin la prueba manual de lector de pantalla y dispositivo físico.
- Gates finales: `npm run lint` ✅; `npm run build` ✅ (Next.js 16.3.4); `npm test` ✅ (710 pruebas en 58 archivos); `impeccable detect --json` → `[]`. El build emite una advertencia previa de raíz de Turbopack; Vitest y `pg` emiten advertencias previas sin fallar.
