# Edición editorial MIDUHO

Usa esta guía al crear un libro para la Biblioteca o al actualizar la presentación de una edición propia o autorizada. La referencia visual aprobada es la edición de «La liebre y la tortuga»: papel claro, jerarquía tipográfica marcada, ilustración amplia y escudo institucional. Toma la organización editorial; escribe y diseña cada libro con recursos propios o autorizados.

## Secuencia de hojas

1. **Portada:** una hoja vertical con aire alrededor del título. Incluye una línea de colección o tipo de libro cuando ayude, título dominante, subtítulo breve, ilustración principal, escudo oficial y «Colegio Mi Dulce Hogar». En una adaptación, identifica al autor de la obra fuente y deja claro que esta es una adaptación. Edad o grado solo si aporta a la elección del lector. Todos los rótulos son HTML, fuera de la ilustración.
2. **«Detrás de este cuento»:** hoja editorial inmediatamente después de la portada. Declara quién creó la obra fuente, quién hizo la adaptación y cómo se realizaron texto, ilustraciones y diseño. Para dominio público, cita la edición concreta consultada y aclara si se escribió texto nuevo; para una licencia, consigna titular, licencia, enlace, atribución y cambios. Incluye fuentes verificables y una nota breve para leer o conversar si procede. Marca con 🔶 cualquier derecho o dato institucional pendiente de confirmar. No inventes ISBN, sello editorial, fecha de publicación, aval pedagógico ni titularidad.
3. **Apertura del relato:** la página enfrentada a los créditos puede iniciar la historia con título de escena, imagen y texto. Cuida que ambas hojas se vean equilibradas en escritorio y que cada una se sostenga sola en móvil.
4. **Cuerpo:** mantén la identidad de la edición mediante tipografía, colores, márgenes, folios discretos y ritmo de imagen/texto. Los pliegos continuos se dividen exactamente por el centro; no pongas detalles esenciales en el lomo. Evita estampar el escudo sobre cada ilustración: la marca se expresa en la portada, la página editorial y el cierre.
5. **Cierre:** una hoja final con una idea o invitación breve para recordar o conversar, ilustración de cierre, escudo oficial y nombre del colegio. Indica «Fin» si encaja con el tono. No presentes una moraleja como hecho universal ni atribuyas una frase inventada al autor clásico.

## Marca, derechos y accesibilidad

- Usa el escudo oficial entregado por el colegio, actualmente optimizado en `apps/web/public/images/biblioteca/escudo-editorial.webp`. No lo regeneres, redibujes ni modifiques internamente. Si falta el archivo, pide el recurso oficial o deja la ubicación reservada y márcala 🔶; no fabriques un sustituto.
- Mantén los créditos fieles al caso: «obra original creada para MIDUHO», «adaptación de una obra de dominio público» y «adaptación autorizada por licencia» requieren atribuciones distintas. El escudo representa la edición del colegio; no cambia los derechos de la obra fuente ni los de sus ilustraciones.
- Títulos, narración, créditos, enlaces, folios e invitaciones son texto HTML seleccionable y buscable. Da `alt` descriptivo a las ilustraciones informativas y `alt=""` a los adornos. Comprueba contraste mínimo 4.5:1, foco visible, navegación por teclado, orden de lectura y que los controles no tapen texto en móvil.
- Comprueba visualmente portada, créditos con apertura, un pliego y cierre en escritorio y móvil. Verifica que la marca tenga aire suficiente, que los enlaces sean utilizables y que el texto completo quepa sin reducirlo a una escala ilegible.

## En la implementación actual

`apps/web/src/features/biblioteca/paginas/don-quijote-y-los-molinos.ts` muestra la secuencia de 14 hojas. `apps/web/src/features/biblioteca/components/flipbook.tsx` ofrece las disposiciones `portada-editorial`, `creditos-editoriales`, `inicio-editorial` y `cierre-editorial`; `apps/web/src/features/biblioteca/libros.ts` declara sus campos. Reutiliza estas disposiciones cuando encajen y ajusta el contenido, la extensión y la ilustración a cada libro. No copies la narración ni atribuyas al libro nuevo los créditos de Don Quijote.
