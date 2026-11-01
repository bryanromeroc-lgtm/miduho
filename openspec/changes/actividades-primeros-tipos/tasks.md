## 1. Tipos

- [x] 1.1 Contrato práctico (`contrato.ts`): `definirTipo`, `calificarIntento`, `barajar` determinista
- [x] 1.2 Tipos de pregunta: `seleccion-multiple`, `concurso`, `completar`
- [x] 1.3 Tipos de relacionar: `emparejar`, `ordenar`, `clasificar`, `memoria`
- [x] 1.4 Juegos de palabras: `sopa-letras` (generación determinista) y `palabra-secreta`
- [x] 1.5 Registro con detección de duplicados y `leerActividad` (validación general + tipo)
- [x] 1.6 Pruebas de calificación de cada tipo

## 2. Currículo

- [x] 2.1 Catálogo en disco (`server/modules/curriculo`) con validación de grado, slug y duplicados
- [x] 2.2 55 actividades de 5.°, cinco por asignatura, al menos tres tipos por asignatura, sin nombres de personas
- [x] 2.3 Prueba del currículo: cero errores y cinco por asignatura
- [x] 2.4 `outputFileTracingIncludes` para la salida standalone

## 3. Vista de materia

- [x] 3.1 Adaptador `actividadesDeCatalogo` (práctica libre) conectado en `materias/index.ts`
- [x] 3.2 `intentosMax: null` en la tarjeta: «{Tipo} · Práctica libre»
- [x] 3.3 Ilustraciones de banda para `sopa-letras` y `palabra-secreta`

## 4. Reproductor

- [x] 4.1 Página `/materias/[asignatura]/actividades/[id]` con el encabezado flat («Volver a {materia}») y 404 si no corresponde
- [x] 4.2 Un componente por tipo, sin arrastrar, con retroalimentación en texto e ícono
- [x] 4.3 Resultado con estrellas, cifra y repaso; «Jugar otra vez» baraja de nuevo
- [x] 4.4 Colores de acierto y error con contraste probado; guardia flat sobre su CSS

## 5. Verificación

- [x] 5.1 `npm test`, `npm run lint`, `npm run build`
- [x] 5.2 Recorrido completo de los nueve tipos en el navegador con la cuenta de 5.°; axe sin violaciones; sin scroll horizontal a 390 px
- [x] 5.3 `docs/actividades/tipos.md` con el catálogo y la investigación
- [ ] 5.4 🔶 Revisión del contenido por una docente de 5.°
