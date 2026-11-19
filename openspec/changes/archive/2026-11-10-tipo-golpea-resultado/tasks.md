## 1. Lógica del tipo

- [x] 1.1 `juegos/golpea/generador.ts`: rondas deterministas (rango, operaciones, llevadas, sin repetir resultados recientes, distractores por error típico, huecos)
- [x] 1.2 `juegos/golpea/tipo.ts`: esquema Zod del contenido y de la respuesta, `items`, `calificar` 2/1/0, `repaso`
- [x] 1.3 `juegos/golpea/tipo.test.ts`: determinismo, rango, opciones únicas, llevadas, calificación y repaso

## 2. Registro

- [x] 2.1 `tipos/registro.ts`, `reproductor/reproductor.tsx`, `reproductor/reglas.ts`, `materias/vista/ilustracion-tipo.tsx`

## 3. Recursos

- [x] 3.1 Imágenes con Gemini: fondo del taller, topo normal, topo contento, topo mareado, mazo, portada 1200×333
- [x] 3.2 Música con Gemini, normalizada y en bucle
- [x] 3.3 Efectos CC0 (golpe, acierto, error, aparecer) con `LICENCIAS.md`

## 4. Interfaz y escena

- [x] 4.1 `juego.tsx` + `golpea.module.css`: inicio, cuadrícula 3-4-3 de botones, tablero, guirnalda, aviso, controles, teclado 1–0
- [x] 4.2 Escena de acción en 4 tiempos (acierto completo, fallo suave), cámara, poses, sonido al impacto, `prefers-reduced-motion`
- [x] 4.3 Actividad `curriculo/actividades/matematicas/5/el-taller-de-los-topos.json`

## 5. Revisión

- [x] 5.1 `design-game` (tabla) y revisión manual de accesibilidad
- [ ] 5.1b Pasada formal de `/impeccable` (critique/polish) sobre la interfaz
- [x] 5.2 `npm run build`, `npm run lint`, `npm test`
- [x] 5.3 Capturas a 1920×1080, 1440×900, 390×844 y video de acierto y fallo
- [x] 5.4 Registrar recursos en `docs/software-factory/inc-2-golpea-resultado.md`
