# DBA de primaria (1.° a 5.°)

Dataset de los Derechos Básicos de Aprendizaje (DBA) oficiales del MEN para 1.° a 5.°, con una prioridad propuesta para diseñar juegos de MIDUHO. Este archivo alimenta el cruce con el catálogo de juegos de `docs/investigacion/catalogo-juegos/`.

- **Archivo:** `dba-primaria.json`
- **Fecha de consulta:** 2026-11-06
- **Notas legibles:** bóveda Obsidian, `10-Referentes-actividades/DBA-*.md` y `DBA-prioritarios.md`.

## Contenido

| Área | Documento | DBA 1.°–5.° |
|---|---|---|
| Matemáticas | DBA V.2 (2016) | 55 (10 · 11 · 11 · 11 · 12) |
| Lenguaje | DBA V.2 (2016) | 40 (8 por grado) |
| Ciencias Naturales | DBA V.1 (2016) | 25 (4 · 4 · 6 · 7 · 4) |
| Ciencias Sociales | DBA V.1 (2016) | 40 (8 por grado) |
| Inglés | DBA Transición a 5.° (2016) | 21 (5 · 4 · 4 · 4 · 4) |
| Ética y valores | EBC Competencias Ciudadanas (2004) | 6 referentes por ciclo (1.°–3.°, 4.°–5.°) |
| Robótica | Orientaciones de Tecnología e Informática (2022) | 8 referentes por ciclo |

Las URL de cada PDF están en `fuentes` dentro del JSON.

## Esquema

Cada elemento de `dba[]` tiene esta forma:

```json
{
  "id": "MAT-5-03",
  "area": "matematicas",
  "asignatura_miduho": "Matemáticas",
  "grado": 5,
  "numero": 3,
  "enunciado": "…",
  "evidencias": ["…"],
  "tema": "…",
  "prioridad": "A|B|C",
  "apto_juego": "alto|medio|bajo",
  "palabras_clave": ["…"],
  "pagina_pdf": 0
}
```

`referentes_por_ciclo[]` usa el mismo esquema, con `ciclo`, `grados` y `grupo` en lugar de `grado` y `numero`. Los id siguen el patrón `CIU-1a3-CP` (ciclo y grupo de estándares).

## Nivel de certeza

| Campo | Certeza |
|---|---|
| `enunciado`, `evidencias`, `numero`, `pagina_pdf` | **Observado**: transcrito del PDF oficial |
| `tema`, `prioridad`, `apto_juego`, `palabras_clave` | **Propuesto** 🔶: falta validarlo con las docentes y el plan de área del colegio |

- El documento de **Inglés** no trae evidencias de aprendizaje, solo ejemplos; por eso `evidencias` está vacío en esa área.
- En **Ética** y **Robótica**, `evidencias` es una **selección** de las del documento: las que más se prestan a una actividad digital.

## Rúbrica

Está en el JSON (`rubrica_prioridad` y `rubrica_apto_juego`):

- **A**, estructurante: núcleo de lo que evalúan las pruebas Saber 3.° y 5.° y prerrequisito del grado siguiente.
- **B**, central en el grado.
- **C**, complementario o que se evidencia mejor fuera de pantalla.

## Método de extracción

Los PDF del MEN marcan el número del DBA, el enunciado y las evidencias con tamaños y pesos tipográficos distintos (25,7 pt, 11 pt medio y 10 pt con viñeta). La extracción leyó esos estilos con PyMuPDF y comprobó que la numeración de cada grado fuera continua y que ningún DBA quedara sin enunciado o sin evidencias.

Inglés, Ética y Tecnología tienen otra maquetación, así que se transcribieron revisando cada página renderizada.
