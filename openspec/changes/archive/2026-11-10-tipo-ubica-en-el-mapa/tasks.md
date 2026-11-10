## 1. Geometría

- [x] 1.1 `tools/mapas/generar-colombia.mjs` + README: Natural Earth → `juegos/mapa/colombia.ts` (33 unidades, regiones, vecinos, centros, recuadro insular)

## 2. Lógica del tipo

- [x] 2.1 `juegos/mapa/generador.ts`: rondas deterministas por regiones, `pistaMapa`, `vecinoEnDireccion`, rumbos
- [x] 2.2 `juegos/mapa/tipo.ts`: esquema Zod del contenido y de la respuesta, `items`, `calificar` 2/1/0, `repaso`
- [x] 2.3 `juegos/mapa/tipo.test.ts`: geometría completa y simétrica, determinismo, regiones, límites, calificación, pistas, flechas, repaso

## 3. Registro

- [x] 3.1 `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`

## 4. Recursos

- [x] 4.1 Imágenes con Gemini: Armi exploradora (guardia), Armi lanzando, chincheta, mesa de exploración, portada 1200×333
- [x] 4.2 Música con Gemini, normalizada y en bucle
- [x] 4.3 Efectos CC0 (lanzar, clavar, acierto, error, aparecer) con `LICENCIAS.md`

## 5. Interfaz y escena

- [x] 5.1 `juego.tsx` + `mapa.module.css`: inicio, cabecera fuera de la cámara, mapa SVG operable, recuadro insular, guirnalda, aviso, controles, teclado
- [x] 5.2 Escena de acción en 4 tiempos (acierto completo, fallo suave), cámara, poses, sonido al impacto, `prefers-reduced-motion`
- [x] 5.3 Actividad `curriculo/actividades/ciencias-sociales/5/armi-explora-colombia.json`

## 6. Revisión

- [x] 6.1 `design-game` (tabla) y revisión de accesibilidad (axe-core WCAG 2.1 AA + teclado; sin lector de pantalla real)
- [ ] 6.2 Pasada formal de `/impeccable` (critique/polish) sobre la interfaz — se usó `impeccable` para dirección y piso de oficio al construir, no la pasada de crítica
- [x] 6.3 `npm run build`, `npm run lint`, `npm test`
- [x] 6.4 Capturas a 1920×1080, 1440×900, 390×844 y video de acierto y fallo
- [x] 6.5 Registrar recursos y decisiones en `docs/software-factory/inc-2-ubica-en-el-mapa.md`
