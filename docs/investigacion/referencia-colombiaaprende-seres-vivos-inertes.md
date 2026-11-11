# Referencia de contenido: «¿En qué se diferencian los seres vivos de los objetos inertes?» (Colombia Aprende, Grado Primero)

> Lección oficial del MEN usada como **fuente de ítems y contexto** (no es un juego) para `vivo-o-no-vivo` de 1.° (programa `juegos-primero`, NAT-1-03). No se copió texto, imagen ni personaje; lo extraído para leer se borró al terminar. El **audio** se capturó con `tools/captura-audio --zip`, fuera de git, con permiso declarado (decisión del usuario del 2026-11-10).

- **Fecha:** 2026-11-10
- **Herramientas:** `curl` y lectura del paquete sin conexión (el sitio bloquea navegadores sin interfaz con un WAF: «Web Page Blocked!»); `tools/captura-audio` con `--zip`.
- **Página:** https://www.colombiaaprende.edu.co/contenidos-para-aprender/en-que-se-diferencian-los-seres-vivos-de-los-objetos-inertes (lección `S_G01_U03_L02`, Ciencias, Grado Primero, 16/08/2016)
- **Paquete:** `CPA_descargables/G_1/S/S_G01_U03_L02.zip` (versión sin conexión de la lección).

## Autoría

Ministerio de Educación Nacional de Colombia, «Contenidos para aprender». Créditos y derechos en páginas propias de la colección; la licencia exacta queda por confirmar 🔶.

## Cómo está construido (observado en el paquete)

| Aspecto | Qué hay |
|---|---|
| Formato | Lección HTML de 13 pantallas, cada una una animación exportada (Edge/Animate) con jQuery |
| Interacción | Arrastrar a casillas, hacer clic en la opción correcta, hacer clic sobre objetos de una foto, ordenar una secuencia, crucigrama |
| Sonido | Narraciones por pantalla (`…_A01.mp3` …) y dos efectos (`success`, `error`) en MP3 y OGG |

## Estructura y contenido (observado; resumido con palabras propias)

1. **Objetivo de la lección:** establecer diferencias entre un ser vivo y un objeto inerte.
2. **Actividad 1:** relatos de animales (tortugas marinas, pulpos); características de los seres vivos; el ciclo de vida completo de una gallina (ordenar la secuencia: huevo → pollito → gallina).
3. **Actividad 2:** los seres vivos **responden a cambios en el ambiente** — plantas, animales y seres humanos (diez narraciones cortas, `03_04_A01`–`A10`).
4. **Actividad 3:** los **objetos inertes**, y cómo cambian con el tiempo sin estar vivos (un radio que se deteriora; elementos recogidos en un parque).
5. **Actividad 4:** experimento en grupo: comparar el cambio de una planta y una roca.
6. **Resumen:** en tres fotos el niño hace clic sobre **los seres vivos** (una reserva natural), **los objetos inertes naturales** (una granja) y **los objetos inertes artificiales** (una cocina).
7. **Tarea:** un relato sobre una mascota (nace, crece, se alimenta, muere) y preguntas.

## Qué aporta a MIDUHO

- **El criterio** con el que un niño de 1.° decide (lenguaje del MEN y del DBA NAT-1-03): un ser vivo **nace, crece, se alimenta, respira, se reproduce, muere y responde a lo que pasa a su alrededor**; un objeto inerte no.
- **La distinción inerte natural / inerte artificial** (piedra, agua, nube ↔ silla, lápiz, balón). Útil como tercera cesta o como etiqueta en la explicación 🔶 (decisión de diseño).
- **Contexto colombiano:** granja, reserva natural, cocina, parque; animales y plantas cercanos.
- **El patrón «escucha y luego responde»:** cada pantalla tiene su consigna **narrada**, como necesita un niño que todavía no lee.

## Qué le falta para evaluar y cómo lo resuelve MIDUHO

| Original | MIDUHO 🔶 |
|---|---|
| Lección larga (13 pantallas) para trabajar en clase | Actividad corta (10 tarjetas, 3–5 minutos) |
| Sin calificación registrable | Calificación por tarjeta (primera ubicación), recalificable en el servidor |
| Arrastre | Tocar o teclado |
| Narraciones largas | Consigna corta + palabra de cada tarjeta, hablada |

## Inventario sonoro

Captura: `content/referencias/colombiaaprende-seres-vivos-inertes/` (audio fuera de git). 67 audios en el paquete, **20 distintos** tras quitar duplicados por huella.

| Rol | Pistas | Notas |
|---|---|---|
| Narración | 16 | `03_03_A01`–`A04` (características, 2,5–26 s), `03_04_A01`–`A10` (responder al ambiente, 2–12 s), `03_06_A` (19 s), `03_07` (19 s), `05_01_A` (51 s, el relato de la tarea). Rol inferido como «desconocido» o «música» por la duración: son **voces** 🔶 |
| Efecto | 4 | `success` (3,3 s, acierto) y `error` (0,3 s), cada uno en MP3 y OGG |

- **Transcripción:** ninguna (sin whisper); se conoce el tema de cada pantalla, no la frase exacta 🔶.
- **Uso propuesto:** ninguna narración coincide con la consigna corta de MIDUHO, así que **no se usan** para la consigna (prioridad 1 de la decisión 8 no se cumple → síntesis o voz del colegio). Las narraciones `03_04_A0x` (los seres vivos responden al ambiente) podrían servir como «Escuchar más» en el repaso si una persona confirma qué dicen 🔶. El efecto `success` (3,3 s) es largo para cada tarjeta; sirve mejor para el final.
