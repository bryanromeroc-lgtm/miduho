# Catálogo de juegos de referencia alineados con los DBA

Este catálogo se armó barriendo plataformas públicas de juegos educativos y cruzando cada juego con los DBA prioritarios de `docs/investigacion/dba/`. Su uso es elegir **referentes de mecánica** para los juegos de MIDUHO. De cada referente se toma solo la mecánica: la redacción, los personajes, las ilustraciones y el audio son propios (flujo `/crear-juego-referencia` o `/crear-simulador`).

- **Fecha de consulta:** 2026-11-07
- **Notas legibles:** bóveda Obsidian, `10-Referentes-actividades/Juegos-alineados-DBA.md` y `Plataformas-de-juegos.md`.

## Archivos

| Archivo | Contenido |
|---|---|
| `catalogo-bruto.jsonl` | 8.877 enlaces únicos de 15 plataformas, uno por línea. Solo **metadatos**: plataforma, URL, título, categoría, grado declarado, idioma, área inferida y licencia cuando se conoce. No contiene recursos ni textos de los juegos |
| `juegos-alineados-dba.json` | 143 juegos seleccionados para 68 DBA o referentes, con su puntaje, el tipo de MIDUHO, la adaptación propuesta y la verificación. Incluye `dba_a_sin_juego` (vacíos) |

## Plataformas

| Plataformas | Enlaces |
|---|---|
| Cokitos | 5.001 |
| Digipuzzle | 877 |
| Cristic | 628 |
| Toy Theater | 534 |
| Árbol ABC | 529 |
| Colombia Aprende | 497 |
| Mundo Primaria | 450 |
| GCompris | 136 |
| PhET | 122 |
| Vedoque | 58 |
| MaguaRED, Blockly Games, Code.org, Seterra y Polypad | Unas pocas entradas cada una |

## Método

1. **Recolección** a partir de sitemaps, listados por categoría y la API pública de metadatos de PhET. Se respetó `robots.txt`, se hizo una petición por segundo por dominio, con un User-Agent genérico y sin iniciar sesión. Árbol ABC es una SPA, así que se tomó su sitemap. Se reutilizaron los enlaces que ya estaban en las notas `Temas-*` de la bóveda.
2. **Normalización:** deduplicación por URL canónica, inferencia de área (por categoría, código del recurso o palabras clave) y filtro de entradas que no son juegos.
3. **Prefiltro:** las palabras clave de cada DBA (`palabras_clave` en `dba-primaria.json`) se cruzaron con el título, la ruta y la categoría, con ajuste por grado.
4. **Selección manual**, puntuando de 0 a 8 cada candidato:
   - Alineación con el DBA: 0–3.
   - Evidencia observable al ganar: 0–2.
   - Mecánica reproducible en MIDUHO sin arrastre obligatorio ni reloj que corte: 0–2.
   - Aporta o reutiliza un tipo de juego: 0–1.

   Se queda si suma 5 o más.
5. **Verificación:**
   - Las 138 URL seleccionadas responden HTTP 200.
   - Se abrió una muestra de 20 en Chrome headless (`verificacion.muestra_visual`): las 20 cargan.

## Nivel de certeza

| Campo | Certeza |
|---|---|
| Existencia, título, plataforma, HTTP | Observado |
| Relación juego↔DBA, puntaje, tipo y adaptación | Inferido 🔶, a partir del título, la categoría y el conocimiento del recurso. Antes de construir, estudiar el juego con REA |

## Hallazgos observados

- **Mundo Primaria** pide aceptar cookies publicitarias o pagar (Freechoice) antes de jugar.
- **Cokitos** muestra publicidad intensa y carga el juego al pulsar «Jugar»; su origen incrustado queda por determinar con REA.
- **Digipuzzle** usa cronómetro en varios juegos.
- Ninguno de estos referentes debe enlazarse para que los estudiantes jueguen allí.
- **Vacíos:** no hay juegos para 6 DBA A, todos de cívica e historia de Colombia: `SOC-2-07`, `SOC-3-07`, `SOC-4-06`, `SOC-5-05`, `SOC-5-07` y `CIU-4a5-PR`.

## Sin barrer

- Educaplay, Wordwall, Liveworksheets y Cerebriti: contenido creado por usuarios, sin catálogo curado.
- Proyecto Descartes: no tiene sitemap; conviene revisarlo a mano.
- Genmagic: no respondió.
- Matific, Smile and Learn y TOMi: requieren cuenta.
