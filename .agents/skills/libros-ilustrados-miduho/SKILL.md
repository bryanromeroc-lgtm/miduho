---
name: libros-ilustrados-miduho
description: Crear cuentos ilustrados originales para MIDUHO e integrarlos en su Biblioteca, especialmente con escenas continuas a doble página y texto accesible. Usar al encargar un libro nuevo o al convertir un cuento autorizado en libro; no para una consulta aislada sobre licencias o para catalogar un título existente.
---

# Libros ilustrados MIDUHO

Produce un libro infantil que pueda leerse en la plataforma y cuya historia, imágenes, procedencia y experiencia de lectura sean verificables. Aplica `AGENTS.md` y la skill `miduho-sdlc` del repositorio. El libro «La orquesta de la lluvia» sirve como ejemplo técnico del lector de pliegos, no como plantilla narrativa obligatoria.

## Antes de crear

1. Revisa el catálogo, el lector y la tarjeta del libro existente. Define edad lectora, propósito pedagógico, extensión aproximada, tono, personajes y arco narrativo. Si el usuario menciona una obra ajena, separa los temas generales y las funciones del formato de sus elementos expresivos. Investiga la adecuación a la edad en fuentes fiables y guarda las fuentes y las decisiones en la tarjeta de producto. Señala con 🔶 lo que quede por confirmar.
2. Comprueba la base de derechos **por elemento**: texto, traducción o edición utilizada, ilustraciones, tipografía y otros recursos. Una obra ajena solo puede adaptarse si su dominio público está verificado o si su licencia o autorización cubre la adaptación y la publicación prevista. Registra fuente, autoría, licencia, atribución, cambios y evidencia. Una descarga pública o una mención de «uso educativo» no prueba permiso. Si faltan derechos, crea una obra original a partir del objetivo pedagógico general; no reproduzcas personajes, escenas, prosa, composición distintiva ni ilustraciones de la referencia.
3. Escribe una sinopsis y un guion hoja por hoja. Cada escena debe avanzar la historia, ofrecer espacio para leer y aportar algo visible que el texto no repita sin necesidad. Ajusta vocabulario, longitud y participación del lector a la edad solicitada; evita moralejas explicadas de más. No inventes datos personales de menores.

## Dirección visual y producción

- Si el usuario pide muestras antes del libro, entrega dos imágenes de orientación (por ejemplo, portada y pliego interior) y espera su elección o ajustes antes de producir el resto. Si ya autorizó el libro completo y no pidió esa pausa, continúa hasta integrarlo.
- Para ilustraciones raster nuevas usa la skill `imagegen`. Crea una guía breve de personajes, paleta, escenario y técnica; usa solo activos propios o autorizados como referencias de continuidad. Inspecciona cada resultado y corrige personajes que cambien, manos o elementos deformes, texto accidental y discontinuidades.
- Para una doble página, compón **una escena continua** y luego divide el archivo final exactamente por el centro. Deja fuera del lomo rostros, acciones y detalles esenciales. Reserva áreas tranquilas para texto en ambas mitades. Portada y contraportada pueden ser imágenes independientes. No incrustes narración ni créditos en las ilustraciones.
- El texto pedagógico vive en HTML: seleccionable, buscable, responsive y legible con lector de pantalla. Cada ilustración informativa necesita un `alt` que describa su mitad incluso si se lee sola en móvil; las puramente decorativas llevan `alt=""`. Revisa contraste WCAG 2.1 AA, foco visible, teclado y orden de lectura.

## Integración y cierre

Lee [references/integracion-biblioteca.md](references/integracion-biblioteca.md) cuando el encargo incluya publicar el libro en la app. Reutiliza la estructura real del lector antes de cambiar componentes compartidos. Documenta procedencia y créditos, integra portada, hojas, miniaturas, ficha y ruta de lectura. Comprueba que el pliego se une en escritorio y que cada hoja y su texto se leen en móvil.

Ejecuta las verificaciones aplicables (`npm run lint`, `npm run build`, pruebas específicas y `npm test` si el entorno de PostgreSQL está disponible). Registra resultados y límites de la inspección visual en la tarjeta de `docs/software-factory/`. No declares que se verificó la ruta autenticada si solo se revisó una vista temporal o recursos estáticos.
