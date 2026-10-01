# Implementación por módulo — MIDUHO

**Propósito:** listar las tareas de desarrollo de los 11 módulos del producto.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

La implementación activa suma ~113 días en 11 módulos. Los 43 días P0 (fundación, acceso, la clase y biblioteca) sostienen el piloto; los 64,5 días P1 completan lo que el colegio necesita para operar con 400 usuarios. Las tareas retiradas de alcance no se cuentan.

## Fundación académica

El colegio queda representado en el sistema en ~9,5 días. Es el criterio de salida del Incremento 1: un docente entra y ve su carga académica real.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-ACA-01 | Año lectivo con un solo año activo (RN-01) y cierre en solo lectura (RN-52) (HU-04) | Un segundo año activo es rechazado; un año cerrado no admite cambios | P0 | 1,5 | ARQ-05, ARQ-07 | Pendiente |
| IMP-ACA-02 | Períodos sin solapes (RN-02) y ponderaciones que suman 100 % (RN-06) | Pruebas de solape y de suma en verde | P0 | 1,5 | IMP-ACA-01 | Pendiente |
| IMP-ACA-03 | Grados, grupos (RN-07), áreas con tipo (RN-13) y asignaturas por grado con intensidad (RN-09) (HU-05) | La estructura del grado piloto se crea desde la interfaz | P0 | 2 | IMP-ACA-01 | Pendiente |
| IMP-ACA-04 | Asignación docente única por asignatura, grupo y año (RN-10 a RN-12), con vista de carga por docente (HU-06) | Un docente ve exactamente sus grupos y nada más | P0 | 1,5 | IMP-ACA-03 | Pendiente |
| IMP-ACA-05 | Gestión de usuarios: crear, editar, desactivar sin borrar (RN-49), varios roles por persona y restablecer acceso | Un usuario desactivado pierde el acceso y su historial se conserva | P0 | 2 | ARQ-06 | Pendiente |
| IMP-ACA-06 | **Retirada de alcance:** matrícula de estudiantes, incluido modelo, flujo e importación CSV | Decisión de producto registrada; no se implementa | — | 0 | — | Retirada |
| IMP-ACA-07 | Vínculo acudiente–estudiante verificado por la institución (RN-48) | Un acudiente sin vínculo verificado no ve nada del estudiante | P1 | 1 | IMP-ACA-05 | Pendiente |
| IMP-ACA-08 | **Retirada de alcance:** exportación de matrícula compatible con SIMAT | Decisión de producto registrada; no se implementa | — | 0 | — | Retirada |

## Acceso y sesiones

Cada rol entra de la forma que su edad y su contexto permiten, en ~10 días. El acceso sin correo para niños de 6 años (IMP-AUT-03) es la tarea que la arquitectura actual no contempla.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-AUT-01 | Login de docentes, coordinación y administración con correo y contraseña, error genérico y bloqueo temporal (HU-01, RNF-SEG-6) | Tras 5 intentos fallidos la cuenta se bloquea 15 min; el mensaje no revela si el correo existe | P0 | 1,5 | ARQ-06 | Pendiente |
| IMP-AUT-02 | Recuperación de contraseña con token hasheado de un solo uso y 24 h de vigencia (HU-02) | Un token usado o vencido es rechazado | P0 | 1 | IMP-AUT-01, ARQ-10 | Pendiente |
| IMP-AUT-03 | Acceso de estudiantes sin correo: código de grupo más tarjeta QR o PIN de imágenes, tarjetas imprimibles por grupo en PDF y restablecimiento por la docente | Un niño de 1.° entra solo en menos de 30 s desde una tableta | P0 | 3 | UX-06, DSC-08 | Pendiente |
| IMP-AUT-04 | Acceso de acudientes con enlace mágico o código de un solo uso por correo (SMS 🔶 por su costo) | Un acudiente entra sin contraseña desde el celular | P1 | 1,5 | IMP-ACA-07 | Pendiente |
| IMP-AUT-05 | Segundo factor (TOTP) obligatorio para administración y coordinación | Esas cuentas no entran sin el segundo factor | P1 | 1 | IMP-AUT-01 | Pendiente |
| IMP-AUT-06 | Sesiones activas visibles y revocables; cierre forzado al desactivar un usuario o cambiarle el rol | Desactivar a una docente la saca de todos sus dispositivos al instante | P0 | 1 | ARQ-06 | Pendiente |
| IMP-AUT-07 | Primer ingreso: aceptación de la política de datos con versión y fecha (RNF-DAT-2) y cambio de la contraseña temporal | Cada aceptación queda registrada con versión, fecha y usuario | P0 | 1 | LEG-05 | Pendiente |

## La clase y sus contenidos

Aquí se cumple la tesis del producto: el material llega a la clase sin que la docente lo busque (HU-08, HU-12). Son ~19 días, y es donde se decide si el piloto repite el aula vacía.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-CLA-01 | Horario semanal por grupo (entidad nueva de bloque horario), cargable por CSV o desde un editor | El horario del grado piloto está cargado y sin cruces | P0 | 1,5 | IMP-ACA-04 | Pendiente |
| IMP-CLA-02 | Inicio docente con el friso del día a partir del horario y las asignaciones; cada clase a 1 clic | La docente llega al material en ≤ 3 clics (RNF-USA-2) | P0 | 2 | IMP-CLA-01, UX-07 | Pendiente |
| IMP-CLA-03 | Pantalla de clase con pestañas reales (Contenidos, Actividades, Asistencia, Notas, Estudiantes) según permisos y módulos activos | Solo aparecen pestañas que funcionan para ese rol | P0 | 2 | IMP-CLA-02 | Pendiente |
| IMP-CLA-04 | Modelo `Recurso` (tipo, idioma, rango de edad, archivo o texto, versión, solo docente) y su asociación a asignatura, grado y período | Un recurso solo docente nunca llega a un estudiante (prueba) | P0 | 2 | ARQ-03 | Pendiente |
| IMP-CLA-05 | La docente sube material propio (PDF, imagen, enlace o texto enriquecido) y lo asocia a su clase, con límites de tipo y tamaño (HU-12) | Subir y asociar un PDF toma menos de 1 min | P0 | 2,5 | IMP-CLA-04, ARQ-08 | Pendiente |
| IMP-CLA-06 | Asociación automática: el material del currículo del grado y el período aparece en la clase sin acción manual | Una clase nueva nace con el material de su período (HU-08) | P0 | 2 | IMP-CLA-04 | Pendiente |
| IMP-CLA-07 | Liberación inmediata o programada por fecha y hora, con vista de calendario | Antes de la hora el estudiante no ve la unidad; después, sí | P0 | 2 | IMP-CLA-04, ARQ-09 | Pendiente |
| IMP-CLA-08 | Vista del estudiante: clases de hoy y material liberado, sin guías docentes | Un estudiante no abre una guía docente ni escribiendo la URL | P0 | 2 | IMP-CLA-07, UX-08 | Pendiente |
| IMP-CLA-09 | Agenda por grupo con entregas, liberaciones y eventos, por mes y por semana (HU-28) | Docente, estudiante y acudiente ven su agenda filtrada por permisos | P1 | 2 | IMP-CLA-07 | Pendiente |
| IMP-CLA-10 | Análisis antivirus de los archivos subidos (ClamAV en el worker) | El archivo de prueba EICAR es bloqueado | P1 | 1 | IMP-CLA-05, ARQ-09 | Pendiente |

## Biblioteca y lector

La biblioteca pasa de maqueta a catálogo con licencias verificables y un lector accesible de verdad en ~16 días. IMP-BIB-06 cierra la contradicción del lector actual: texto entregado como imagen (V8).

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-BIB-01 | Modelo del catálogo: obra, archivo, licencia con evidencia, vigencia y créditos; sin licencia no se publica | Publicar una obra sin licencia es rechazado | P0 | 1,5 | ARQ-03, LEG-11 | Pendiente |
| IMP-BIB-02 | Migrar las obras con licencia verificada de `public/libros` al almacenamiento de objetos y sembrar el catálogo | Las obras salen del CDN y ninguna sin licencia queda publicada | P0 | 1 | IMP-BIB-01, ARQ-08, F0-03 | Pendiente |
| IMP-BIB-03 | Catálogo paginado en el servidor, búsqueda de texto completo y filtros en la URL (HU-10, RNF-PER-2, V17) | Los filtros se comparten por enlace; respuesta en ≤ 1 s | P0 | 2 | ARQ-17 | Pendiente |
| IMP-BIB-04 | Obra y guía docente como recursos hermanos; la guía solo la ven docentes (HU-11) | Desde la obra se abre su guía con un clic, solo con rol docente | P1 | 1 | IMP-BIB-01 | Pendiente |
| IMP-BIB-05 | Conversión de libros en el worker: subir el PDF, partir pliegos con flipbook-forge, extraer el texto por página con `pdftotext`, miniaturas, revisión y publicación | Un PDF subido desde la interfaz queda publicado sin usar la consola | P0 | 3 | ARQ-09, IMP-BIB-01 | Pendiente |
| IMP-BIB-06 | Lector con capa de texto real por página: seleccionable, anunciada por el lector de pantalla y con búsqueda dentro del libro (HU-09, RNF-ACC-2, V8) | NVDA lee el texto de cada página; buscar una palabra la encuentra | P0 | 2,5 | IMP-BIB-05 | Pendiente |
| IMP-BIB-07 | Ajustes de lectura (tamaño, espaciado, fuente para dislexia, alto contraste) y lectura en voz alta en español de Colombia 🔶 calidad de la voz | Un niño escucha la página actual con un botón | P1 | 2 | IMP-BIB-06 | Pendiente |
| IMP-BIB-08 | Imágenes responsivas (500 y 1000 px) y carga por ventana de ±2 hojas en todos los modos | Abrir un libro descarga ≤ 300 KB | P0 | 1 | F0-13 | Pendiente |
| IMP-BIB-09 | Asignar una lectura a un grupo desde la biblioteca y registrar el avance por estudiante (última página leída) | La lectura aparece en la clase y la docente ve el avance | P1 | 2 | IMP-CLA-04, IMP-BIB-03 | Pendiente |

## Actividades y entregas

El ciclo asignar → entregar → calificar (HU-17 a HU-19) toma ~8 días y es P1: el piloto puede arrancar sin él, pero el colegio no firma sin él.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-ACT-01 | Crear una actividad con instrucciones, adjuntos, fecha límite y liberación, para una asignatura y un grupo (HU-17) | La actividad aparece en la clase y en la agenda del grupo | P1 | 2 | IMP-CLA-07 | Pendiente |
| IMP-ACT-02 | Entrega del estudiante: texto, foto desde la cámara o archivo; reentrega hasta la fecha límite; interfaz apta para niños (HU-18) | Un niño de 1.° entrega una foto desde la tableta sin ayuda | P1 | 2,5 | IMP-ACT-01, ARQ-08 | Pendiente |
| IMP-ACT-03 | Revisión por estudiante con estado (pendiente, entregada, tarde), retroalimentación escrita o en audio y calificación con la escala del SIEE (HU-19) | La docente revisa 25 entregas sin salir de la pantalla | P1 | 2,5 | IMP-ACT-02, IMP-EVA-01 | Pendiente |
| IMP-ACT-04 | Resumen semanal a acudientes con las actividades próximas a vencer | El acudiente recibe cada lunes las fechas de la semana | P2 | 1 | IMP-MSG-03 | Pendiente |

## Asistencia

La asistencia no estaba en el backlog y se usa todos los días. Se resuelve en ~3,5 días, con el umbral de inasistencias que fije el SIEE.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-ASI-01 | Toma de asistencia por clase o por día (presente, ausente, tarde, excusa) desde el celular | Tomar asistencia a 25 estudiantes toma ≤ 30 s | P1 | 2 | UX-12, IMP-CLA-03 | Pendiente |
| IMP-ASI-02 | Reportes de inasistencia por estudiante y período, alerta al superar el umbral del SIEE y vista para el acudiente | Coordinación ve quién supera el umbral; el acudiente ve las fallas de su acudido | P1 | 1,5 | IMP-ASI-01, DSC-02 | Pendiente |

## Comunicación con acudientes

La comunicación con las familias es lo que más ven rectoría y acudientes. Son ~8,5 días, con una regla de protección infantil: no hay mensajería privada entre adultos y estudiantes.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-MSG-01 | Comunicados institucionales y por grupo, con confirmación de lectura (HU-27) | Coordinación ve qué acudientes leyeron cada comunicado | P1 | 2 | IMP-ACA-07 | Pendiente |
| IMP-MSG-02 | Mensajería docente–acudiente con horario configurable y registro auditable; sin mensajes privados entre adultos y estudiantes (HU-26, LEG-13) | Un estudiante no puede recibir mensajes privados de un adulto | P1 | 2,5 | IMP-MSG-01 | Pendiente |
| IMP-MSG-03 | Notificaciones por correo y push de la PWA, con preferencias y resumen diario | Cada acudiente elige canal y frecuencia | P1 | 2 | ARQ-09, ARQ-10 | Pendiente |
| IMP-MSG-04 | Integración con WhatsApp Business 🔶 por su costo por mensaje | Los comunicados urgentes llegan por WhatsApp | P2 | 2 | IMP-MSG-03, DSC-07 | Pendiente |

## Evaluación y boletines

La evaluación son ~13 días que solo arrancan con el SIEE en la mano (DSC-02). Si el colegio conserva su sistema de notas (DSC-04), IMP-EVA-06 reemplaza a IMP-EVA-02 hasta IMP-EVA-05 y ahorra ~8 días.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-EVA-01 | Escala de valoración configurable según el SIEE, con su equivalencia a los desempeños Superior, Alto, Básico y Bajo del Decreto 1290 (HU-21) | La escala del colegio se configura sin tocar código | P1 | 2 | DSC-02 | Pendiente |
| IMP-EVA-02 | Planilla de notas por período: criterios y porcentajes por asignatura, cálculo de la definitiva con pruebas exhaustivas y cierre del período (HU-22) | Las definitivas coinciden al 100 % con un cálculo manual de control | P1 | 4 | IMP-EVA-01, IMP-ACA-02 | Pendiente |
| IMP-EVA-03 | Auditoría de cambios de nota con motivo obligatorio después del cierre (HU-25, RN-41) | Todo cambio posterior al cierre queda con autor, motivo y valor anterior | P1 | 1 | IMP-EVA-02 | Pendiente |
| IMP-EVA-04 | Boletín del período en PDF con la plantilla del colegio, generado en la cola de trabajos (HU-24) | Los boletines de 400 estudiantes se generan en menos de 10 min | P1 | 3 | IMP-EVA-02, DSC-09 | Pendiente |
| IMP-EVA-05 | Consulta del acudiente: desempeño por asignatura, observaciones y asistencia (HU-23) | El acudiente ve y descarga el boletín de su acudido | P1 | 1,5 | IMP-EVA-04, IMP-AUT-04 | Pendiente |
| IMP-EVA-06 | Alternativa si el colegio conserva su sistema: exportar las notas de actividades y la asistencia en el formato de ese sistema | El colegio importa el archivo sin transcribir nada | P1 | 1,5 | DSC-04 | Pendiente |

## Planeación

La planeación anclada a Estándares y DBA es uno de los diferenciadores del producto (P9). Son ~10,5 días, 8 de ellos P1.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-PLA-01 | Importar el catálogo de Estándares y DBA del MEN de las asignaturas del piloto, con la fuente citada | Cada estándar y DBA tiene código, texto y enlace a la fuente oficial | P1 | 2 | DSC-10 | Pendiente |
| IMP-PLA-02 | Editor de planeación con la plantilla de 7 secciones, guardado automático y texto real (HU-13) | Una docente planea una semana sin perder cambios al cerrar la pestaña | P1 | 3 | UX-07, IMP-CLA-04 | Pendiente |
| IMP-PLA-03 | Vincular estándares y DBA a cada planeación, con búsqueda (HU-14) | Una planeación muestra sus referentes con enlace a la fuente | P1 | 1,5 | IMP-PLA-01, IMP-PLA-02 | Pendiente |
| IMP-PLA-04 | Duplicar una planeación a otro grupo o al año siguiente (HU-15) | La copia queda editable y enlazada a su origen | P2 | 1 | IMP-PLA-02 | Pendiente |
| IMP-PLA-05 | Exportar la planeación a PDF con el formato que pide coordinación (HU-16) | Coordinación recibe el PDF sin reformatear nada | P1 | 1,5 | IMP-PLA-02, ARQ-09 | Pendiente |
| IMP-PLA-06 | Revisión de coordinación: enviar, comentar y aprobar planeaciones | Cada planeación muestra su estado y los comentarios de coordinación | P2 | 1,5 | IMP-PLA-02 | Pendiente |

## Laboratorios

Robótica y Emprendimiento eran parte del alcance inicial, pero el contenido de la referencia tiene derechos reservados. El trabajo de desarrollo es la estructura (~7 días); el contenido lo produce el colegio.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-LAB-01 | Editor de rutas didácticas para coordinación sobre el modelo Nivel → Bloque → Unidad → Sesión de 7 secciones, con el área en la unidad (RN-21 a RN-24) | Coordinación crea una unidad completa sin tocar código | P1 | 3 | ARQ-03, UX-10 | Pendiente |
| IMP-LAB-02 | Laboratorios generados desde los datos: mundos y misiones a partir del currículo, con progreso real por grupo (HU-29, HU-30) | Agregar una unidad la hace aparecer en su mundo | P1 | 2 | IMP-LAB-01 | Pendiente |
| IMP-LAB-03 | Acompañar la carga de las rutas propias del piloto, redactadas por el colegio y nunca copiadas de la referencia 🔶 autoría a cargo del colegio | Las unidades del primer período están publicadas | P1 | 2 | IMP-LAB-01, DSC-11 | Pendiente |

## Administración, datos personales y reportes

Estos ~8 días responden lo que un colegio pregunta antes de firmar: quién vio qué, cómo se borran los datos de un estudiante y cómo se sale del servicio.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| IMP-ADM-01 | Visor de auditoría con filtros por persona, entidad y fecha, incluidos los accesos a datos de menores (RN-50) | Coordinación responde «quién vio este boletín» en menos de 1 min | P1 | 1,5 | ARQ-05 | Pendiente |
| IMP-ADM-02 | Derechos del titular: consulta, rectificación y supresión o anonimización de los datos de un estudiante (RNF-DAT-5) | Una solicitud se atiende desde la interfaz y queda registrada | P1 | 2 | LEG-08 | Pendiente |
| IMP-ADM-03 | Exportación completa de los datos del colegio (CSV, JSON y archivos) para el plan de salida | Un volcado completo se genera y se verifica en otra base | P1 | 1,5 | ARQ-09 | Pendiente |
| IMP-ADM-04 | Panel de uso para coordinación: clases con material, docentes activos, entregas y asistencia | Muestra las métricas del piloto (DSC-13) sin consultas manuales | P1 | 2 | IMP-CLA-06 | Pendiente |
| IMP-ADM-05 | Configuración institucional: nombre, logo, colores, calendario y textos legales (V16); sube a P0 si F0-16 decide varios colegios | Un colegio nuevo se configura sin desplegar código | P1 | 1 | UX-03 | Pendiente |

---

[← Anterior](05-arquitectura-plataforma.md) · [Índice](README.md) · [Siguiente →](07-calidad-pruebas.md)
