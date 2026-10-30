Necesito que me ayudes a documentar y analizar una plataforma educativa existente mediante navegación automatizada con Playwright.

## Objetivo general

Queremos diseñar y desarrollar una plataforma educativa propia para MIDUHO — Colegio Mi Dulce Hogar, una institución de educación primaria ubicada en Madrid, Cundinamarca, Colombia.

La plataforma existente debe utilizarse únicamente como referencia para comprender:

* Su estructura funcional.
* La experiencia del usuario.
* Los módulos educativos.
* Los tipos de recursos pedagógicos.
* Los flujos de navegación.
* Los roles y permisos.
* Las posibles entidades del sistema.
* Los requerimientos funcionales y no funcionales.
* Las oportunidades de mejora para nuestra propia plataforma.

No queremos clonar literalmente la plataforma, copiar su código fuente, textos completos, imágenes, videos, identidad visual ni materiales protegidos. El resultado debe transformarse en requerimientos, modelos y propuestas originales para MIDUHO.

## Fuentes que se deben analizar

### Plataforma principal

URL:

https://colegiomidulcehogar.educaciontrendi.com

Las credenciales se encuentran en estas variables de entorno:

* `MIDUHO_SCRAPING_USER`
* `MIDUHO_SCRAPING_PASSWORD`

Nunca escribas, muestres, registres ni guardes los valores de estas variables en:

* Archivos Markdown.
* Capturas de pantalla.
* Logs.
* Código fuente.
* Historial de comandos.
* Repositorios Git.
* Documentos de evidencia.

### Módulos de referencia

Emprendimiento y robótica:

https://trendired.educaciontrendi.com/trendiLabs/Home

Literatura:

https://trendired.educaciontrendi.com/contenidos/literatura

Nuestro alcance inicial se limita a:

1. Literatura.
2. Robótica.
3. Emprendimiento.

## Documentación existente

Existe una bóveda de Obsidian en:

`/home/bryan/Documentos/OBSIDIAN/MIDUHO/MIDUHO`

El documento principal es:

`/home/bryan/Documentos/OBSIDIAN/MIDUHO/MIDUHO/MIDUHO.md`


## Reglas de navegación

Utiliza Playwright para acceder y recorrer la plataforma.

La automatización debe:

* Ejecutarse inicialmente con el navegador visible.
* Permitir que yo intervenga si aparece autenticación multifactor, CAPTCHA o una confirmación manual.
* Esperar correctamente cargas, redirecciones y contenido dinámico.
* Utilizar selectores estables basados en roles, etiquetas, nombres accesibles o atributos semánticos.
* Evitar depender exclusivamente de coordenadas o posiciones visuales.
* Mantener una velocidad moderada de navegación.
* No generar carga excesiva sobre el sitio.
* No intentar evadir CAPTCHA, bloqueos, controles de acceso o medidas de seguridad.
* No modificar, publicar, eliminar ni enviar información.
* No completar evaluaciones ni actividades educativas.
* No descargar masivamente el contenido.
* No acceder a secciones fuera de las autorizadas.
* No extraer datos personales de estudiantes, acudientes, profesores u otros usuarios.

Si una acción puede cambiar información del sitio, detente y solicita mi confirmación.

## Primera fase: reconocimiento seguro

Antes de realizar una extracción amplia, haz un recorrido pequeño y controlado.

1. Accede a la plataforma principal.
2. Autentícate usando las variables de entorno.
3. Confirma que el inicio de sesión fue exitoso sin revelar las credenciales.
4. Identifica el menú principal y las secciones visibles.
5. Determina qué roles o perfil parece tener la cuenta.
6. Localiza las áreas relacionadas con Literatura, Robótica y Emprendimiento.
7. Visita inicialmente un máximo de tres páginas por módulo.
8. Identifica paginación, filtros, búsquedas, menús, pestañas, modales y recursos embebidos.
9. Registra errores, contenido inaccesible y dependencias con otros dominios.
10. Resume los hallazgos antes de continuar con el recorrido completo.

Si encuentras información personal, no la copies. Registra solamente que existe ese tipo de información y dónde interviene dentro del flujo.

## Segunda fase: inventario funcional

Para cada pantalla relevante documenta:

* Nombre funcional de la pantalla.
* URL o patrón de URL.
* Módulo al que pertenece.
* Propósito.
* Rol que puede acceder.
* Punto de entrada.
* Acciones disponibles.
* Campos, filtros y controles.
* Información mostrada.
* Estados posibles.
* Navegación hacia otras pantallas.
* Validaciones observables.
* Mensajes de error o confirmación.
* Recursos educativos relacionados.
* Dependencias con otros módulos.
* Observaciones de accesibilidad.
* Problemas de usabilidad.
* Ideas de mejora para MIDUHO.

No copies párrafos completos del sitio. Resume y transforma la información.

## Tercera fase: inventario educativo

Para Literatura, Robótica y Emprendimiento identifica:

* Cursos, grados o niveles.
* Unidades.
* Temas.
* Lecciones.
* Objetivos de aprendizaje.
* Competencias trabajadas.
* Tipos de actividades.
* Recursos descargables.
* Videos, audios o presentaciones.
* Lecturas.
* Cuestionarios.
* Evaluaciones.
* Proyectos.
* Evidencias que debe entregar el estudiante.
* Seguimiento del progreso.
* Retroalimentación.
* Elementos de gamificación.
* Recursos dirigidos al docente.
* Recursos dirigidos al estudiante.
* Recursos dirigidos al acudiente.

No descargues o reproduzcas materiales protegidos. Registra únicamente metadatos, estructura, tipo de recurso y una descripción breve.

Analiza además la adecuación general para educación primaria en Colombia y señala qué aspectos deberían adaptarse para MIDUHO. No afirmes que una funcionalidad cumple una norma o lineamiento oficial sin evidencia.

## Cuarta fase: análisis para desarrollo

A partir de los hallazgos, deriva una propuesta original para MIDUHO que incluya:

### Roles iniciales

Considera, valida y ajusta estos posibles roles:

* Administrador.
* Coordinador académico.
* Docente.
* Estudiante.
* Acudiente.

### Requerimientos

Genera:

* Requerimientos funcionales.
* Requerimientos no funcionales.
* Reglas de negocio.
* Criterios de aceptación.
* Restricciones.
* Dependencias.
* Supuestos.
* Preguntas abiertas.
* Casos que necesitan validación humana.

Cada requerimiento debe tener:

* ID.
* Nombre.
* Descripción.
* Actor.
* Prioridad.
* Fuente o evidencia funcional.
* Criterios de aceptación.
* Estado: confirmado, inferido o pendiente de validar.

Diferencia claramente:

* Lo observado directamente.
* Lo inferido.
* Lo recomendado para MIDUHO.
* Lo que todavía debe confirmarse.

### Modelo funcional y técnico

Propón inicialmente:

* Mapa de módulos.
* Mapa de navegación.
* Historias de usuario.
* Flujos principales.
* Entidades de dominio.
* Relaciones entre entidades.
* Matriz de roles y permisos.
* Backlog inicial.
* Propuesta de MVP.
* Riesgos técnicos.
* Riesgos educativos.
* Riesgos de privacidad y seguridad.

No decidas todavía el stack tecnológico definitivo. Puedes presentar alternativas y sus implicaciones.

## Evidencias

Las capturas de pantalla deben utilizarse únicamente cuando ayuden a explicar:

* La estructura de navegación.
* La composición general de una pantalla.
* Un flujo importante.
* Un problema de experiencia de usuario.

Antes de conservar una captura:

* Comprueba que no incluya credenciales.
* Oculta cualquier dato personal.
* Evita capturar información de estudiantes.
* Utiliza nombres descriptivos.
* Registra en qué documento se utiliza.
* No captures ni conserves materiales educativos completos.

No guardes HTML completo, tokens, cookies, localStorage, sessionStorage ni respuestas de red que contengan información sensible.

## Estructura documental propuesta

Adapta esta organización a la estructura ya existente en Obsidian. No la impongas si ya hay una equivalente:

* `MIDUHO.md`: índice ejecutivo del proyecto.
* `00-Contexto/`: objetivo, alcance, restricciones y glosario.
* `01-Plataforma-referencia/`: mapa y análisis general.
* `02-Modulos/Literatura/`
* `02-Modulos/Robotica/`
* `02-Modulos/Emprendimiento/`
* `03-Experiencia-usuario/`: navegación, pantallas y oportunidades.
* `04-Requerimientos/`: RF, RNF, reglas y trazabilidad.
* `05-Arquitectura/`: dominio, entidades e integraciones.
* `06-Backlog/`: épicas, historias y criterios de aceptación.
* `07-Evidencias/`: únicamente evidencias permitidas y anonimizadas.
* `08-Decisiones/`: decisiones, supuestos y preguntas abiertas.

Cada documento debe incluir:

* Propósito.
* Fecha de análisis.
* Fuente consultada.
* Hallazgos.
* Evidencias o referencias.
* Nivel de certeza.
* Implicaciones para MIDUHO.
* Preguntas pendientes.
* Enlaces a documentos relacionados.

## Grafo de Obsidian

Actualiza `MIDUHO.md` como punto central del grafo.

Crea relaciones útiles entre:

* Módulos.
* Pantallas.
* Roles.
* Requerimientos.
* Entidades.
* Historias de usuario.
* Evidencias.
* Decisiones.

Evita crear un documento separado para cada detalle pequeño. El grafo debe ser navegable y comprensible, no una acumulación de notas aisladas.

## Entregables esperados

Al terminar el análisis, quiero encontrar en Obsidian:

1. Resumen ejecutivo.
2. Alcance y límites del análisis.
3. Mapa general de la plataforma de referencia.
4. Inventario de pantallas y funcionalidades.
5. Documentación de Literatura.
6. Documentación de Robótica.
7. Documentación de Emprendimiento.
8. Inventario de recursos pedagógicos.
9. Matriz de roles y permisos.
10. Requerimientos funcionales y no funcionales.
11. Historias de usuario con criterios de aceptación.
12. Modelo preliminar de entidades.
13. Backlog priorizado para el MVP.
14. Comparación entre lo observado y lo propuesto para MIDUHO.
15. Riesgos, supuestos y preguntas pendientes.
16. Índice actualizado en `MIDUHO.md`.

## Reglas de ejecución

* No hagas `git commit`.
* No hagas `git push`.
* No publiques ni despliegues nada.
* No instales herramientas globales sin consultarme.
* No borres contenido existente.
* No sobrescribas documentos sin leerlos primero.
* No almacenes credenciales o sesiones dentro de la bóveda.
* No realices acciones destructivas sobre el sitio.
* No copies contenido protegido más allá de pequeñas referencias necesarias para documentar la funcionalidad.
* Si necesitas crear scripts auxiliares, colócalos fuera de la bóveda o en una carpeta técnica claramente separada.
* Guarda resultados parciales para que el proceso pueda reanudarse.
* Mantén una bitácora de páginas revisadas y páginas pendientes.

## Forma de trabajo

Trabaja por etapas:

2. Reconocimiento seguro del sitio.
3. Propuesta del plan documental.
4. Análisis piloto de los tres módulos.
5. Presentación de resultados preliminares.
6. Recorrido completo autorizado.
7. Consolidación de requerimientos.
8. Propuesta del MVP.

Comienza inspeccionando la bóveda y verificando que Playwright esté disponible.

Antes de iniciar el recorrido completo, preséntame:

* Un resumen de lo que encontraste en la bóveda.
* Las secciones principales detectadas en la plataforma.
* El plan de navegación.
* Los archivos que planeas crear o actualizar.
* Los riesgos o bloqueos detectados.

Espera mi aprobación antes de realizar el recorrido completo.
