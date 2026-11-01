---
target: vista de materia del estudiante
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/home/bryan/Documentos/DEVS/miduho/apps/web/src/app/materias/[asignatura]/page.tsx"
target_fingerprint: "sha256:2e971d95317da1f2bff1f2b2c6983b8e979a1ea66c1a3276dc4bdbd6cf3e1e06"
target_path: /home/bryan/Documentos/DEVS/miduho/apps/web/src/app/materias/[asignatura]/page.tsx
timestamp: 2026-10-31T19-20-12Z
slug: apps-web-src-app-materias-asignatura-page-tsx
---
Method: dual-agent (A: revisión de diseño · B: detector y navegador)

## Puntaje Nielsen: 25/40 (Aceptable)
1 Visibilidad 2 · 2 Mundo real 3 · 3 Control 3 · 4 Consistencia 3 · 5 Prevención 3 · 6 Reconocer 2 · 7 Flexibilidad 2 · 8 Estética 3 · 9 Recuperación 2 · 10 Ayuda 2

## Especificidad
Hecha para el producto (regla de cm, guirnalda, toldo, bandera, «Mi familia, mi barrio, Madrid y Colombia»). Debilidad: el tema vive en los bordes; la cuadrícula 3×2 de tarjetas blancas es genérica y la franja de ilustración (pictogramas de tipo) es igual en las 11 materias. Detector: 0 hallazgos en código; navegador: axe 0 violaciones, sin sombras; text-occlusion = falsos positivos (selector de la muestra en <details> cerrado); tight-leading real (corregido).

## Problemas prioritarios
- [P1] Encime de tarjetas sobre el paginador (900×640, 1024×768 largo, zoom 200 %): CORREGIDO (filas minmax(min-content,1fr) + compacto en pantallas bajas).
- [P1] Tarjeta para lectores: línea de datos de 6-7 palabras, 5 botones sólidos iguales, «En curso» + «Sin intentos todavía», fecha de cierre ausente. → clarify, distill
- [P1] Estado vacío sin salida (lo ve hoy todo estudiante). → onboard
- [P2] Deslices temáticos: F=ma y v=d/t (Física), átomo y ADN (Naturales), π y √ (Matemáticas), loro ambiguo (Inglés), cintas de Sociales y Matemáticas parecidas, franja de ilustración no temática. → polish
- [P2] Aviso de primera visita: masa más oscura; se recuerda por navegador (tableta compartida). → quieter

## Personas
- Niña de 7 años en tableta 1024×768: cinco botones iguales, línea de datos ilegible, aviso cerrado por otro niño.
- Baja visión al 200 %: encime corregido; estrellas vacías vs llenas ~1,3:1 en Ética; cuenta del shell a 13/11 px.
- Docente revisando la muestra: títulos de Matemáticas en todas las materias.

## Menores
Corregidos: cuenta 44 px, «¡Listo!» 46 px, interlineado 1,3, herramientas de la muestra flotantes. Pendientes: entrada 420 ms vs 320 ms del contrato; «Anteriores» deshabilitado casi igual a activo; descripción de relleno en Genérica.

## Preguntas
1. ¿La franja de ilustración debería mostrar la escena de la materia?
2. ¿La línea de datos es para el niño o para el modelo de datos?
3. ¿Seis opciones iguales o «Hoy toca esta»?
