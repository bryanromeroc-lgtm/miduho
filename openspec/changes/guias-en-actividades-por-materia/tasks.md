## 1. Cobertura e identidad de las guías

- [ ] 1.1 Revisar las asignaturas activas y el catálogo curricular contra `GUIAS`; registrar los 77 archivos y el material docente local como línea base, sin incluir datos personales.
- [ ] 1.2 Definir editorialmente nombre, especie, escena y recursos originales de Educación Religiosa (decisión provisional 🔶) y agregar su guía, kit, tokens e imágenes al catálogo; verificar las cinco actividades existentes.
- [ ] 1.3 Crear una función compartida que resuelva y exija la guía desde la asignatura/escena, con pruebas para las 11 asignaturas curriculares y para una asignatura sin guía.

## 2. Continuidad en tarjetas y reproductores

- [ ] 2.1 Añadir retrato y nombre de la guía a la tarjeta plana, conservando portada/ilustración, estados y un solo foco; probar tarjetas curriculares y asignadas.
- [ ] 2.2 Ajustar la tarjeta destacada de aventura para conservar a Armi sin figura duplicada y verificar su nombre accesible.
- [ ] 2.3 Transmitir la guía desde ambas rutas de estudiante al reproductor de práctica libre y al de material asignado; mostrarla en encabezado, preguntas/video y resultado sin modificar calificación ni intentos.
- [ ] 2.4 Probar los siete juegos de Matemáticas que no mostraban a Armi, incluidos robots y topos como personajes secundarios, y verificar que los juegos con Armi integrado no dupliquen una figura grande.

## 3. Escenas con guía equivocada

- [ ] 3.1 Crear portada y poses originales de Andi para el mapa; adaptar composición, puntos de anclaje, animaciones y alternativa con movimiento reducido.
- [ ] 3.2 Renombrar el título y slug curricular a «Andi explora Colombia» / `andi-explora-colombia`, actualizar instrucciones/avisos/ayuda y conservar la URL anterior como alias sin duplicar el catálogo.
- [ ] 3.3 Crear portada y poses originales de Bruno para «La ruta de las palabras»; reemplazar referencias visibles a Armi y adaptar la animación sin alterar pausa, teclado, audio ni calificación.
- [ ] 3.4 Ejecutar pruebas de regresión de rondas, pistas, puntajes, teclado y movimiento reducido para mapa y ruta; confirmar que no quedan referencias visibles a Armi en esas dos experiencias.

## 4. Publicación y prevención de regresiones

- [ ] 4.1 Extender la validación del catálogo para fallar con asignatura y archivo si falta guía o si título/instrucción/narración/recursos referencian una guía ajena; registrar explícitamente personajes secundarios permitidos.
- [ ] 4.2 Rechazar con error de validación la publicación de material docente para una asignatura sin guía, sin crear actividad o asignación parcial; añadir prueba de servicio/API.
- [ ] 4.3 Auditar las actividades docentes existentes antes de activar la validación y conservar sus intentos/resultados; documentar cualquier excepción encontrada 🔶.

## 5. Verificación y evidencia

- [ ] 5.1 Probar con navegador real tarjetas, juego y resultado de al menos una actividad por materia, las dos escenas corregidas y el material audiovisual; revisar escritorio, 390 px y 360 px, foco, contraste y ausencia de desbordamiento.
- [ ] 5.2 Ejecutar `npm run lint`, `npm run build` y `npm test`; corregir fallos causados por el cambio y registrar resultados en `docs/software-factory/`.
- [ ] 5.3 Actualizar la documentación de guías, recursos y procedencia; comparar el inventario final con los 78 casos auditados y confirmar cero actividades con guía ausente o ajena antes de cerrar el cambio.
