# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuario primario — la docente de primaria.** Una docente titular del Colegio Mi Dulce Hogar (Madrid, Cundinamarca, Colombia) que dicta el plan de estudios completo de su grupo. En la plataforma de referencia tiene **14 cursos del grado 1-01** a su cargo: no es una especialista de asignatura, es una generalista que cambia de área varias veces al día. Su trabajo con la plataforma ocurre en tres momentos: **preparando** la clase (fuera del aula, con tiempo escaso), **dictándola** (frente a 25 niños, sin margen para buscar nada) y **calificando** al cierre de período.

Su trabajo real, el que la referencia no resolvió: llegar al material de la clase de hoy sin tener que saber de antemano en qué catálogo está guardado.

**Usuarios secundarios (confirmados como parte del producto, fuera del alcance de la primera maqueta):**
- **Estudiante de primaria (6–10 años).** Requiere una interfaz propia, no la del docente con menos permisos — decisión de producto ya registrada en la bóveda, aún sin resolver.
- **Acudiente.** Consulta desempeño de su acudido. Su entrada en el MVP está **por decidir** (P2): duplica superficie de permisos y eleva el riesgo de privacidad de datos de menores.
- **Coordinador académico** y **Administrador**. El coordinador no tiene equivalente observado en la referencia; está **por decidir** si es un rol propio o un permiso adicional sobre Docente (P2).

Las capacidades de estudiante, acudiente y administrador son **inferidas**, no observadas: todo el análisis de la referencia se hizo con una sola cuenta de rol Profesor en modo solo lectura.

## Product Purpose

MIDUHO es la plataforma educativa **dedicada** al Colegio Mi Dulce Hogar: un solo colegio, no un SaaS multi-institución. Reúne en un único sistema el contenido pedagógico, la planeación de clase, la actividad evaluable y la comunicación con las familias.

Existe porque el análisis de la plataforma de referencia (Trendi, usada únicamente como referencia funcional) produjo un hallazgo que define el producto entero:

> **El aula está vacía.** Los 14 cursos del LMS contienen únicamente el foro "Avisos" por defecto. El sistema estaba aprovisionado pero **no adoptado**: el contenido solo llegaba al aula si la docente lo movía a mano, recurso por recurso. Nadie lo hizo.

El fracaso de la referencia no fue de funciones sino de **fricción**: separar el portal de contenidos del aula creó un trabajo manual que no se sostuvo. MIDUHO apuesta por lo contrario: **un solo sistema donde el contenido ya está en la clase**.

Éxito significa que una docente entre a su asignatura y encuentre el material ya asociado, sin buscarlo — y que al final del período la plataforma tenga contenido real y uso real, no capacidad instalada sin adoptar.

## Positioning

Tres mecanismos que un producto vecino no podría copiar sin rehacer su arquitectura:

1. **El contenido nace en la clase, no en un catálogo aparte.** La navegación se organiza por *la clase que la docente va a dar* (asignatura · grupo · período), no por tipo de contenido. La biblioteca general existe, pero es el segundo camino, no el primero.
2. **Contenido accesible de verdad.** Todo el material pedagógico de la referencia es **imagen** (flipbooks, paquetes estáticos): una ruta didáctica completa tiene 32 caracteres de texto en el DOM. No es seleccionable, buscable, traducible ni legible por lector de pantalla, y no se adapta a móvil. MIDUHO no hereda esto bajo ninguna circunstancia.
3. **Evaluación colombiana nativa.** La referencia no tiene escala de evaluación colombiana: solo las dos escalas por defecto de Moodle, ni Decreto 1290 ni valoración institucional. Es la mayor oportunidad de diferenciación identificada, y está **bloqueada** hasta que el colegio entregue su SIEE.

Ser dedicado a un colegio es una ventaja deliberada: todo lo que en la referencia existe para servir a muchas instituciones (multi-tenancy, catálogo comercial masivo, contenido genérico) queda fuera del diseño.

## Operating Context

**Institución:** Colegio Mi Dulce Hogar — Madrid, Cundinamarca, Colombia. Educación primaria. Grado piloto sugerido: 1° 🔶 por confirmar.

**Estructura pedagógica heredada del análisis** (el activo conceptual más reutilizable):

```
Área → Nivel → Bloque → Circuito → Ruta didáctica
```

Cada circuito equivale a una **clase**, y cada ruta didáctica sigue una **plantilla fija de 7 secciones**:

1. Objetivo
2. Evidencias de aprendizaje
3. Temas de profundización
4. Inicio
5. Desarrollo
6. Evaluación
7. ¿Qué puedo calificar?

Esta plantilla define exactamente qué campos necesita una unidad didáctica en MIDUHO. La terminología de marca ("Circuito", "Curious", "Kids") debe traducirse a lenguaje curricular colombiano (Unidad / Sesión).

**La planeación se ancla a Estándares y DBA del MEN** — el patrón más valioso observado en la referencia y que MIDUHO conserva.

**Ritual de liberación de contenido:** la docente controla *cuándo* una unidad queda disponible para los estudiantes (inmediato o programado por fecha y hora). Mecanismo observado y que MIDUHO conserva, con vista de calendario.

**Los tres módulos del alcance inicial no se comportan igual** — y esta diferencia es el corazón de la primera maqueta:

- **Literatura** es una **biblioteca digital**: catálogo filtrable y explorable, sin progresión. Filtra por *tipo* (Libro · Guía · Catálogo · Audiolibro) y *rango de edad* (0-5 · 6-8 · 9-11 · 12-13 · +14). Corpus por encima de 300 títulos, mayoritariamente dominio público (Grimm, Perrault, Sherlock Holmes, Alicia, El Mago de Oz), en español, inglés y francés. En el plan de estudios la asignatura equivalente es **Comprensión Lectora**; existe también "Plan Lector". Patrón clave: **obra + guía docente** son recursos hermanos, hoy relacionados solo por coincidencia de título.
- **Robótica** y **Emprendimiento** son **currículos secuenciados** dentro de laboratorios: bloques, circuitos ordenados y ruta didáctica por clase. Comparten pantallas y mecánica, y se diferencian por el filtro de área.
- **Robótica y Emprendimiento son interdisciplinarios.** El programa Kids 2 **intercala** circuitos de ambas áreas en los mismos bloques (12 de Emprendimiento + 4 de Robótica = 16). El área es atributo del **circuito**, no del programa. Robótica Curious 2 aporta 19 circuitos propios. La secuencia no separa las áreas: Robótica aporta la dimensión técnica a proyectos de emprendimiento. Es un enfoque valioso que MIDUHO conserva.

**Volumen de la referencia:** ~2.235 recursos interactivos, 35 circuitos de laboratorio, catálogos de literatura, talleres y textos escolares.

## Capabilities and Constraints

**Capacidades confirmadas del rol docente** (observadas en la referencia y previstas para MIDUHO): explorar y filtrar catálogos; ver un recurso; ver los laboratorios de su curso; leer rutas didácticas; programar la activación de una unidad; crear, listar, duplicar y exportar planeaciones (PDF); vincular Estándares y DBA; agenda de actividades por curso; mensajería y comunicados; ver progreso agregado del curso y de sus estudiantes; calificar y retroalimentar.

**Regla de navegación:** una docente llega al contenido de su clase en **≤3 clics** desde el inicio (Inicio → Mis clases → Asignatura·Grupo → contenido a la vista).

**Restricciones de producto:**
- Un solo sistema. No se replica la arquitectura de tres piezas de la referencia (portal + LMS Moodle + SSO SAML), cuya separación causó el fracaso de adopción.
- Denegar por defecto. Una docente solo ve estudiantes de sus propios cursos; un acudiente solo a su acudido, con vínculo verificado por la institución.
- Todo acceso a datos de menores queda auditado. Minimización de datos.
- Listados paginados en servidor: nunca cientos de tarjetas de una vez (la referencia carga 2.235 recursos en una página).
- Interfaz en español. El idioma del contenido es un atributo del recurso, no un módulo aparte.
- Sin contenido protegido de la referencia: no se copia código, texto, imágenes ni identidad visual. Solo estructura, metadatos y descripciones propias.

**Terminología:** Área · Nivel · Bloque · Unidad (antes "Circuito") · Sesión · Ruta didáctica · Grupo · Período · Asignatura · Acudiente · Estándares · DBA · SIEE.

**Explícitamente por decidir:**
- **Alcance de contenido (P12):** el colegio opera 14 asignaturas en 1°, no 3. El modelo de datos ya lo soporta. **Para la primera maqueta el alcance es Literatura, Robótica y Emprendimiento** (decisión del usuario); el plan de estudios completo queda abierto.
- **SIEE del colegio:** bloquea todo el módulo de evaluación.
- **Grado piloto** del MVP.
- **Stack y hospedaje.** No decidido deliberadamente.
- **Qué contenido se migra** y cuál se produce desde cero.
- **Revisión jurídica** del tratamiento de datos de menores.
- Entrada del **acudiente** y existencia del **coordinador académico** como rol propio.

## Brand Commitments

- **Nombre:** MIDUHO (Colegio Mi Dulce Hogar).
- **Idioma de la interfaz:** español de Colombia.
- **Identidad visual:** el colegio aún no ha entregado logo, paleta ni manual de marca. No debe inventarse ni presentarse como oficial.
- **Anti-referencia explícita:** la plataforma Trendi es referencia **funcional** únicamente. Su identidad visual, su tono y su solución de contenido-como-imagen son evidencia de qué **no** hacer.
- **Tono:** institucional y cálido, dirigido a docentes de primaria y familias, no a un comprador corporativo. Se evita el lenguaje de marca comercial ("Circuito", "Curious", "Kids", "Labs") en favor del vocabulario curricular colombiano.

## Evidence on Hand

- **Bóveda de análisis completa en Obsidian:** `/home/bryan/Documentos/OBSIDIAN/MIDUHO/MIDUHO/` — 26 documentos, fases 1 a 4 completadas (2026-09-09). Índice ejecutivo en `MIDUHO.md`.
- Documentos con mayor densidad de verdad de producto: `02-Modulos/Inventario-educativo.md` (estructura pedagógica), `03-Experiencia-usuario/Mapa-de-navegacion.md` (navegación propuesta por rol), `04-Requerimientos/` (RF, RNF, 54 reglas de negocio, matriz de roles), `05-Arquitectura/Modelo-preliminar-entidades.md`, `06-Backlog/Backlog-MVP.md` (7 incrementos priorizados), `08-Decisiones/Decision-plataforma-dedicada.md`.
- **Brief original del análisis:** [`docs/investigacion/brief-inicial.md`](docs/investigacion/brief-inicial.md).
- **30 historias de usuario en 8 épicas**, con criterios de aceptación.
- **13 riesgos** documentados con mitigación.

**Ausencias que el diseño no debe fabricar:**
- No hay logo, paleta ni manual de marca del colegio.
- No hay SIEE ni escala de evaluación institucional.
- No hay datos reales de estudiantes, docentes ni acudientes — y **no deben inventarse datos personales de menores**. Todo dato en la maqueta es ficticio y debe leerse como tal.
- No hay contenido pedagógico propio producido: los títulos de literatura de dominio público son referencias legítimas; el material de Robótica y Emprendimiento de la referencia lleva derechos reservados y **solo puede reutilizarse su esquema estructural**, nunca su contenido.
- No hay testimonios, métricas de uso ni casos de éxito. No existen.
- Las capacidades de estudiante, acudiente y administrador son inferidas; no deben presentarse como verificadas.

## Product Principles

1. **El contenido ya está en la clase.** Si la docente tiene que buscar el material de su propia asignatura, el diseño falló. Este principio nace del hallazgo del aula vacía y gobierna toda decisión de navegación.
2. **Cada módulo se comporta según su naturaleza pedagógica.** Literatura se explora; Robótica y Emprendimiento se recorren en secuencia. Forzar una sola metáfora sobre ambos empobrece los dos.
3. **Accesible o no existe.** Texto real, seleccionable, buscable y responsive. WCAG 2.1 AA. Ningún texto pedagógico entregado como imagen — es un problema pedagógico, no solo técnico: un niño con baja visión o dislexia no puede leer un flipbook.
4. **Un solo modelo de navegación.** No coexisten dos taxonomías. La referencia obligaba a saber en cuál de siete catálogos buscar; MIDUHO tiene un solo eje.
5. **Distinguir siempre observado / inferido / propuesto / por confirmar.** Regla permanente del proyecto, heredada del análisis. Nada se presenta con más certeza de la que tiene.
6. **Proteger al menor por defecto.** Denegar por defecto, minimizar datos, auditar accesos. El estudiante nunca ve guías docentes ni versiones para profesor.

## Accessibility & Inclusion

**WCAG 2.1 nivel AA** es requisito, no aspiración — es el mayor defecto de la referencia y el que no se hereda bajo ninguna circunstancia.

- Ningún texto pedagógico entregado como imagen: se selecciona, copia y busca.
- Toda imagen informativa con texto alternativo; las decorativas con `alt=""`.
- Navegación completa por teclado, con foco visible.
- Compatible con lector de pantalla: menús, formularios y visores anunciados correctamente.
- Contraste mínimo 4.5:1 en texto normal, verificado en toda la paleta.
- Un solo menú en el DOM, adaptado por CSS — sin menús duplicados.
- Formularios con `<label>` asociado a cada campo.
- Todo contenido embebido con título descriptivo.
- Diseño responsive real: móvil, tablet y escritorio, sin scroll horizontal.
- Lectura con ajuste tipográfico y alternativa en audio explícita.

**Contexto de la audiencia:** estudiantes de 6 a 10 años, con lectores emergentes, posible dislexia o baja visión, y familias con alfabetización digital variable. La conexión típica del colegio no es rápida: carga inicial ≤2 s.
