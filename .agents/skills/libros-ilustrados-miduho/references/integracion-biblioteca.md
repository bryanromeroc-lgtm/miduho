# Integración de un libro en Biblioteca

Consulta estos archivos en su estado actual; los nombres y tipos pueden cambiar. Este mapa corresponde al libro «La orquesta de la lluvia» creado en noviembre de 2026.

- `apps/web/src/features/biblioteca/libros.ts`: `PaginaCompuesta`, `Libro`, `LIBROS`, `paginasDe`. Un libro compuesto declara `contenido`, `paginas`, `razon`, `pliegos` y `carpeta`. La primera hoja es portada; el lector empareja 2–3, 4–5, etc.
- `apps/web/src/features/biblioteca/paginas/la-orquesta-de-la-lluvia.ts`: ejemplo de `disposicion: "pliego"` y `mitad: "izquierda" | "derecha"`, con párrafos HTML y `alt` por hoja. Úsalo para entender la API, no para repetir su relato o sus escenas.
- `apps/web/src/features/biblioteca/components/flipbook.tsx` y `flipbook.module.css`: representación, escala, texto superpuesto, navegación y comportamiento móvil. Cambia el componente común solo si el libro revela un problema general.
- `apps/web/src/data/demo.ts`: ficha visible en el catálogo, categoría, edad, portada y resumen. Mantén el vínculo `tituloId` con `LIBROS`.
- `apps/web/public/images/biblioteca/<slug>/`: imágenes optimizadas de obras propias que deben viajar con la aplicación. La convención actual es `iNN.webp` para cada ilustración y `tNN.webp` para cada miniatura. Comprueba dimensiones y peso apropiados para el lector; no supongas una medida fija para todos los libros.
- `docs/software-factory/inc-2-libro-orquesta-lluvia.md`: ejemplo de tarjeta con criterios, procedencia, licencias, evidencia y pendientes.

Al preparar pliegos, divide la escena final en mitades sin reescalarlas de forma independiente, conserva el mismo alto y revisa que el par se una en el lomo. Valida el orden de las hojas y la existencia de cada imagen y miniatura. Añade pruebas de la lógica nueva o de los vínculos que puedan romperse; evita pruebas que solo repliquen los datos escritos.

Antes de editar código Next.js 16, lee la documentación pertinente en `apps/web/node_modules/next/dist/docs/` como exige `AGENTS.md`.
