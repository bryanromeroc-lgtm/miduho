# Juegos de 1.° · «¿Cómo se siente?» (tarea 3.5 de `juegos-primero`)

- **Fecha:** 2026-11-17
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.5; delta nuevo `specs/actividad-clasificar-tablero-temas/`)
- **Referencia funcional:** `docs/investigacion/referencia-cokitos-como-se-siente.md` (Cokitos → Wordwall «Agrupar», `templateId=2`, tema corcho `themeId=43`; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/cokitos-como-se-siente/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git)
- **Personaje:** Ciro, el chigüiro, guía de Ética y valores

## Reparto Claude / Codex (tercer juego)

| Quién | Qué hizo |
|---|---|
| Claude | Captura sonora (23 efectos `cork*`; descartó `test1.mp3` y `data-0.mp3`, que no son del juego), licencia, adaptación de 15 efectos, imágenes con Gemini (3 poses de Ciro, 12 emociones, portada), revisión del diff y de capturas, reversión de un cambio al seed, partida en navegador, pruebas completas, cierre |
| Codex (CLI) | Estudio con REA (un encargo: Wordwall carga sin interfaz), informe, construcción (tema, escena y `lectura` opcionales en el tablero, contenido, delta de spec); una ronda de correcciones |
| Usuario | Reutilizar el tablero con tema corcho y Ciro; «agradables / desagradables»; 12 emociones claras con la cara de Ciro (lista aprobada) |

Lecciones:

- **Mirar primero la plantilla de Wordwall.** El `templateId` de la URL incrustada dice si ya hay presentación: `2` («Agrupar») ya existía (`vivo-o-no-vivo`), así que el trabajo fue un tema y una escena, no un tablero nuevo.
- **Codex volvió a atar el comportamiento a un caso concreto** (`tema === "corcho"` decidía guía, lectura, ritmo y avisos). Corregido: el tema solo cambia aspecto y sonidos; todo lo de la guía depende de `escena.personaje`. Revisar siempre que lo nuevo dependa de datos genéricos.
- **Codex tocó el seed** para que Ética apareciera en 1.°: creaba una segunda «Ética y Valores» en un área «(demo)» distinta. Revertido. Lo correcto era añadir Ética a la lista fija de `scripts/demo-primero.ts` (que no lee `prisma/asignaturas-curriculo.ts`; eso lo hace `demo-quinto`), hecho por Claude. Cada asignatura nueva de 1.° debe sumarse a esa lista. En los encargos: «no toques el seed».
- **Contenido del referente a revisar:** de 20 tarjetas, varias no son emociones (amable, querido/a, solo/a, cansado/a) o son ambiguas sin contexto (nervioso/a, emocionado/a). El usuario aprobó 12 claras.

## Qué es

Tipo `clasificar` con la presentación existente `tablero` y tres campos opcionales nuevos:

- `tema: "girasol" | "corcho"` (por omisión `girasol`): aspecto y carpeta de sonidos (`/audio/juegos/agrupar/` o `/audio/juegos/agrupar-corcho/`, mismos nombres de archivo).
- `escena.personaje` (forma de `juegos/comun/escena.ts`): guía visible a un lado; al revelar, `senala` en cada acierto y `duda` en cada fallo (4 tiempos, paso de 720 ms), aviso con la explicación de cada tarjeta y lectura automática de la consigna. En pantallas de hasta 600 px el guía se oculta para no tapar controles ni notas 🔶 (decisión de Codex; revisable).
- `lectura` por elemento: lo que lee «Escuchar» («tranquilo o tranquila» para «Tranquilo/a»).

Sin escena ni tema, el tablero se comporta exactamente como antes (`vivo-o-no-vivo` comprobado en captura).

## Contenido

«Emociones agradables»: Feliz · Tranquilo/a · Orgulloso/a · Agradecido/a · Seguro/a · Entusiasmado/a. «Emociones desagradables»: Triste · Enojado/a · Asustado/a · Preocupado/a · Avergonzado/a · Celoso/a. Cada una con una frase de contexto en primera persona («Me siento orgulloso cuando termino algo difícil.»). Calificación existente de `clasificar` sobre 12. Validación docente de las emociones, de su grupo y de las frases (hoy en masculino) 🔶.

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/tipos/relaciones.ts` (+ `tipos.test.ts`) | `tema`, `escena` y `lectura` opcionales en `clasificar` |
| `…/juegos/agrupar/{tablero.tsx, agrupar.module.css, logica.ts, logica.test.ts}` | Tema corcho, guía con poses (función pura de pose), sonidos por tema, caras de 120 px, palabras sin partir |
| `…/juegos/comun/escuchar.tsx`, `…/reproductor/juegos-relaciones.tsx`, `…/juegos/parejas/tablero.tsx` | Consigna en el contexto de la actividad; `lectura` en «Escuchar» |
| `apps/web/curriculo/actividades/etica-y-valores/1/como-se-siente.json` | La actividad (primera de Ética en 1.°) |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/como-se-siente/ciro-{reposo,senala,duda}.webp` (1537×1516, transparentes) | Gemini chat, ref. `images/guias/etica.webp`: https://gemini.google.com/app/e49b56fc43795ad8 (reposo), https://gemini.google.com/app/d053300fe691a5ac (señala), https://gemini.google.com/app/9c7233d65ddae884 (duda); `recortar-pose.py --como ciro-reposo` |
| `…/<emocion>.webp` ×12 (320×320, 11–13 KB) | Gemini, 6 generaciones de dos con `ciro-reposo` como referencia, cortadas: https://gemini.google.com/app/e8c96c36de16c0f5 · https://gemini.google.com/app/9ed228c39dbe87f7 · https://gemini.google.com/app/390a8649709b3eb3 · https://gemini.google.com/app/857ca2552f3d61f7 · https://gemini.google.com/app/9581f40b4f81ec54 · https://gemini.google.com/app/87ddeb8ca65f47fd |
| `…/portada.webp` (1280×714, 64 KB) | Gemini: https://gemini.google.com/app/0ed2da095fa4fab2 (decorativa) |
| `public/audio/juegos/agrupar-corcho/*.mp3` ×15 | Efectos del tema corcho de Wordwall con `captura-audio adaptar`; trazados en `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |

## Verificación (2026-11-17)

- `npm test`: 91 archivos, 931 pruebas en verde (con el PostgreSQL de desarrollo). `npm run lint`: 0 errores (1 advertencia previa ajena). `npm run build`: compila (página temporal borrada antes).
- Partida en navegador (página temporal, borrada) tocando tarjeta y grupo, con dos fallos a propósito: 10 de 12, poses `reposo`/`senala`/`duda` vistas en el revelado, todas las imágenes cargadas, sin errores de consola. Codex jugó 12/12 solo con teclado a 1440×900 y 390×844 y comprobó `vivo-o-no-vivo` sin cambios.
- La cabecera del reproductor se superpone al contenido al desplazarse en la página temporal (fondo transparente sin `--m-tarjeta`); pasa igual con `vivo-o-no-vivo`: propio de la página de prueba, no del tablero 🔶 (comprobar en la ruta real).

## Pendiente 🔶

- Escuchar los 15 efectos de corcho.
- Recorrido con la cuenta `demo-primero` (Ética ya aparece en 1.° tras añadirla a `scripts/demo-primero.ts`; comprobado el 2026-11-17).
- Validación docente: las 12 emociones, «agradables / desagradables» y las frases de contexto.
- Voz grabada (hoy, síntesis del navegador). Soporte escrito del permiso de Wordwall.
