> **Regla de ejecución:** todo trabajo de interfaz se hace con impeccable. Cada sesión empieza con `impeccable context`, y cada grupo nombra su comando. Los grupos sin UI lo dicen. Antes de crear rutas dinámicas leer `apps/web/node_modules/next/dist/docs/` (Next.js 16: `params` es asíncrono).

## 1. Contexto y contrato (`impeccable context`, `impeccable surface-brief write`)

- [x] 1.1 Crear la rama `feat/vistas-de-materia` y ejecutar `impeccable context`
- [x] 1.2 Confirmar con el operador las preguntas abiertas 🔶 de `design.md` (corte shell sticker / contenido flat, paginación, bandera en Sociales, «fisica» = educación física)
- [x] 1.3 Escribir con `impeccable surface-brief write` el contrato de `app/materias/[asignatura]/page.tsx` con la tabla de kits (D4) y las reglas flat (D5); releerlo para verificarlo

## 2. Datos y servidor (sin UI; su interfaz la cubre el grupo 5)

- [x] 2.1 Agregar `ActividadResumen` y `VistaMateria` a `src/lib/materias.ts`, con función de orden de actividades y pruebas
- [x] 2.2 Puerto `ActividadesDeMateria` en `server/modules/materias/puertos.ts` (devuelve `null` hoy)
- [x] 2.3 `vistaMateria(sesión, asignaturaId)` en el servicio: valida asignatura activa del grupo, 404 si no, sin docentes ni otros estudiantes; pruebas de integración (propia, ajena, inactiva, docente)
- [x] 2.4 Cambiar `claseHref` a `/materias/[id]` y conservar `?materia=` al volver; actualizar pruebas de «Mis materias»

## 3. Color y tipografía (`/impeccable colorize`, `/impeccable typeset`)

- [x] 3.1 `/impeccable colorize`: tokens por materia (`fondo`, `marca`, `tarjeta`, `acento`, `tinta`) en `features/materias/tematica/`, sin tocar `.cosmos`
- [x] 3.2 `/impeccable typeset`: escala de cabecera y tarjeta con las fuentes existentes, mínimo 16 px
- [x] 3.3 Prueba de contraste (≥ 4.5:1) de todos los pares texto/fondo de los 11 kits

## 4. Sistema flat (`/impeccable extract`)

- [x] 4.1 `/impeccable extract`: cabecera temática, tarjeta plana, chip de estado, botón de acción, paginador, estado vacío
- [x] 4.2 Prueba estática de estilos: falla ante `box-shadow`, `drop-shadow` o bordes de tinta oscura en el CSS de la vista
- [x] 4.3 Leer D7 y crear la variante plana de la tarjeta sin modificar `tarjeta-actividad.tsx` (sticker)

## 5. Kits temáticos (build code-led con `/impeccable craft`)

- [x] 5.1 Estructura `features/materias/tematica/` con tipo `Kit`, `kits.ts` (catálogo, D4) y piezas parametrizables (clip, cinta, chinche, marco, patrón de marcas)
- [x] 5.2 Kit de Matemáticas (referencia de calidad); revisión con el operador antes de seguir
- [x] 5.3 Kits de Ciencias naturales y Lectura
- [x] 5.4 Kits de Inglés, Robótica, Emprendimiento y Ética
- [x] 5.5 Kits de Artística, Educación física, Sociales y Genérica
- [x] 5.6 `kits.test.ts`: mínimos por kit, sin ids repetidos, croma del fondo ≤ 0.03, opacidad de marcas ≤ 0.12, sin elementos prohibidos
- [x] 5.7 README de procedencia de las ilustraciones (autoría propia, sin copia de la referencia)

## 6. Vista y rutas (build con `/impeccable craft`)

- [x] 6.1 `app/materias/[asignatura]/page.tsx` delgada: contexto ESTUDIANTE, `notFound()`, kit por `escenaDe`
- [x] 6.2 `features/materias/vista/`: vista, cuadrícula centrada de 3×2, paginador y «Volver a Mis materias»
- [x] 6.3 Fondo pastel con patrón de marcas de agua y sueltos fuera de la zona de texto
- [x] 6.4 Ruta `/materias/[asignatura]/actividades/[id]` con «Esta actividad se abre pronto» y volver
- [x] 6.5 `app/muestras/materia/page.tsx` con 8 actividades ficticias sin nombres de personas, rótulo «Datos de ejemplo» y selector de materia (solo fuera de producción)

## 7. Movimiento (`/impeccable animate`)

- [x] 7.1 Entrada escalonada de tarjetas, flotar suave de sueltos y respuesta de la tarjeta al puntero, solo con `transform`/`opacity`
- [x] 7.2 Variante reducida con `prefers-reduced-motion`

## 8. Estados y responsive (`/impeccable harden`, `/impeccable onboard`, `/impeccable adapt`)

- [x] 8.1 `/impeccable harden`: vacío, en preparación, nombres largos, más de 6 actividades, sin intentos, intentos agotados, por abrir, cerrada
- [x] 8.2 `/impeccable onboard`: primera visita a una materia con mensaje breve
- [x] 8.3 `/impeccable adapt`: una pantalla sin scroll desde 900×640; 2 columnas y luego 1; sin scroll horizontal a 390 px

## 9. Verificación (`/impeccable audit`, `/impeccable critique`)

- [x] 9.1 `/impeccable audit`: AA, teclado, lector de pantalla, rendimiento, en las 11 materias
- [x] 9.2 `/impeccable critique`: temática estricta («¿cada elemento pertenece a esta materia?»), flat, anti-genérico y anti-copia frente a la referencia
- [x] 9.3 Capturas de las 11 materias a 1440, 1024 y 390 px en `.impeccable/review/vistas-materia/`
- [x] 9.4 `npm run regresion:labs` en verde (Laboratorios intacto)
- [x] 9.5 `npm run build`, `npm run lint`, `npm test` en verde

## 10. Cierre (`/impeccable polish`)

- [x] 10.1 `/impeccable polish` y corrección de los hallazgos del finish reviewer
- [x] 10.2 Documenter: sección «Vista de materia» en `DESIGN.md` y `.impeccable/design.json`; actualizar PRODUCT.md si cambia la audiencia o el tono
- [x] 10.3 Anotar en `fundacion-actividades` el adaptador pendiente del puerto `ActividadesDeMateria`
