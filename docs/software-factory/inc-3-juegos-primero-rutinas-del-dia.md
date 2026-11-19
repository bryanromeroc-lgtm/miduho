# Juegos de 1.° · «Las rutinas del día» (tarea 3.2 de `juegos-primero`)

- **Fecha:** 2026-11-10
- **Cambio OpenSpec:** `openspec/changes/juegos-primero/` (tarea 3.2; sin cambio propio: es contenido sobre un tipo existente ampliado)
- **Referencia funcional:** `docs/investigacion/referencia-cokitos-rutinas-diarias.md` (Cokitos → Wordwall; mecánica estudiada con REA; nada copiado)
- **Captura sonora:** `content/referencias/cokitos-rutinas-diarias/` (`inventario.json`, `LICENCIA.md`, `RESUMEN.md`; audio fuera de git)

## Qué es

Tipo existente `emparejar` con la presentación nueva **`cinta`**: una tarjeta con ilustración cuelga de una cuerda y se toca la ficha de texto que coincide. 18 tarjetas, fichas de colores sobre corcho; la ficha acertada sale del tablero (queda un hueco) y la tarjeta se desliza fuera para dar paso a la siguiente.

Diferencias con el plan original: la tarea decía `ordenar` («mi-dia-en-orden»), pero la referencia **no ordena**: relaciona imagen con acción. El usuario aprobó el 2026-11-10 usar `emparejar` y renombrar la actividad a `rutinas-del-dia`.

## Lo que se añadió para evaluar

| Original | MIDUHO |
|---|---|
| Canvas sin teclado ni lector | Botones HTML, foco visible (4 px), imagen con `alt`, aviso `role="status"` |
| 3 corazones, reloj y ránking | Sin reloj ni ránking; 2 intentos por tarjeta |
| Sin pista | Pista por tarjeta tras el primer fallo; respuesta revelada tras el segundo |
| — | Nota = primera ficha tocada en cada tarjeta (1/0, el contrato de `emparejar`); la respuesta guardada es `{tarjeta: ficha}` |

## Archivos

| Ruta | Qué |
|---|---|
| `apps/web/src/features/actividades/tipos/relaciones.ts` | `presentacion?: "columnas" \| "cinta"`; `imagen?` y `pista?` por par; hasta 18 pares en cinta (8 en columnas); cinta exige imagen en todos. Contenido antiguo sigue válido |
| `…/juegos/cinta/logica.ts` + `logica.test.ts` | Estado puro (acierto, pista, revelar, avanzar); 6 pruebas |
| `…/juegos/cinta/tablero.tsx` + `cinta.module.css` | Interfaz; tarjeta pegajosa en teléfono; `prefers-reduced-motion` |
| `…/reproductor/juegos-relaciones.tsx` | `Emparejar` despacha a `TableroCinta` si `presentacion === "cinta"` |
| `…/tipos/tipos.test.ts` | Prueba del esquema de la cinta |
| `apps/web/curriculo/actividades/ciencias-sociales/1/rutinas-del-dia.json` | La actividad (SOC-1-03) |

## Recursos

| Ruta | Origen |
|---|---|
| `public/images/juegos/rutinas-del-dia/*.webp` (18, 480 px) | Gemini chat (imagen), 2026-11-10. Primero un niño base ficticio; las 18 escenas con él como `--ref`. Sin texto. «Bañarse» y «vestirse» se rehicieron para que el niño no quedara en ropa interior |
| `public/audio/juegos/cinta/*.mp3` (11) | Efectos de la referencia con `captura-audio adaptar`: acierto ×3, fallo ×3, entrar, centrar, salir, inicio, fin. Trazados en `LICENCIAS.md` (permiso declarado 2026-11-10; soporte escrito por adjuntar 🔶) |

## Verificación (2026-11-10)

- `npm run lint` sin errores · `npm test` 860/860 (con PostgreSQL de desarrollo) · `npm run build` compila.
- Recorrido con Playwright en 1920×1080, 1440×900 y 390×844: acierto, fallo con pista, segundo fallo con respuesta revelada, 16 aciertos más, cierre y resultado («Acertaste 17 de 18» al fallar una a propósito). Sin errores de consola. Video a 1920×1080 revisado en hoja de cuadros.
- `axe-core` (WCAG 2.0/2.1 A y AA) en el inicio, durante el juego y tras tocar una ficha: 0 violaciones. Tab llega a las fichas con contorno visible.
- No se hizo una pasada con la skill `/impeccable` ni con la tabla de `design-game` 🔶 (no hay personajes de acción: es una mecánica de tocar).

## Pendiente 🔶

- **Escuchar** `public/audio/juegos/cinta/*.mp3`: Claude no oye; el nombre de cada evento sale del nombre del archivo original.
- Soporte escrito del permiso de audio (Wordwall / Cokitos).
- Las ilustraciones no se probaron con una docente ni con estudiantes de 1.°.
- La actividad no tiene vista de docente que cambie las tarjetas (se edita el JSON).
- Con «Leer en voz alta» en 1.° el reproductor lee la consigna con síntesis; las tarjetas y fichas no tienen voz (decisión del usuario).
