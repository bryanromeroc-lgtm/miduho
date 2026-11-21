# Referencia: «Comparar Números» de PhET

**Fecha del estudio:** 2026-11-20. **Actividad MIDUHO:** `comparar-numeros`, Matemáticas, 1.°, MAT-1-03, tarea 3.12. **Herramientas:** REA 6.10.1 (`inspect-web-page` por CDP 9333), observación interactiva con Playwright conectado al mismo Chrome y lectura del HTML local minificado. **Autoría observada:** PhET Interactive Simulations, Universidad de Colorado Boulder; la [ficha](https://phet.colorado.edu/es/simulations/number-compare) y la [simulación HTML5](https://phet.colorado.edu/sims/html/number-compare/latest/number-compare_all.html?locale=es) están en `phet.colorado.edu`.

## Construcción y alcance de la observación

| Aspecto | Evidencia |
|---|---|
| Render | REA encontró un documento con scripts incrustados; la interacción observada se dibuja con PhET Scenery (nodos gráficos y capa de accesibilidad). El texto visible se refleja en el DOM accesible, pero no se presenta como un flujo HTML corriente. |
| Lógica | El HTML local declara `CompareModel`, `LabModel`, `CompareScreenView` y `LabScreenView`. Se usó únicamente para entender reglas y vínculos de audio, sin trasladar código ni recursos. |
| Audio | Hay Web Audio con `SoundClip`/`SoundClipPlayer` para controles y navegación. La comparación hablada procede de síntesis del navegador, mediante `SpeechSynthesisControl`; no es una pista grabada. |
| Estado | Las capturas y el HTML inspeccionado con REA fueron evidencia temporal del estudio. Los 22 audios de `content/referencias/phet-comparar-numeros/` son el inventario previo de Claude. |

## Mecánica observada

1. La portada ofrece dos pantallas: **Compara** y **Laboratorio**. El usuario puede volver a la portada o cambiar de pantalla desde la barra inferior.
2. **Compara** inicia en `0 = 0`. Cada lado tiene un contador con flechas y una zona de objetos. El modelo limita cada suma a **0–20**, con parámetro `compareMax` cuyo máximo válido es 20. Al aumentar un lado, aparecen objetos y cambian inmediatamente el signo `<`, `>` o `=` y una oración en palabras: observé «uno es igual a uno» y «uno es menor que tres». La lógica también construye «x es mayor que y». No hay botón de comprobar: el resultado se revela en el mismo cambio. No hay distractores, aleatoriedad, memoria de preguntas ni secuencia de rondas.
3. Se puede cambiar el objeto (perro, manzana, mariposa, pelota o tarjeta de uno), combinar o desagrupar elementos, mostrar marcos de diez y alternar entre una indicación de bloques y una recta vertical de **0–20**. El control del ojo oculta objetos; la casilla junto a los signos oculta la relación escrita. Las operaciones de juntar y separar se pueden deshacer. 🔶 La función exacta de cada control de agrupación requiere una pasada específica si se decide reproducirla.
4. **Laboratorio** abre un espacio libre. Arriba ofrece tarjetas numéricas **1–20**; a la derecha, `<`, `>`, `=`, `+`, `−`; abajo, marco de diez y objetos. Arrastré `1 < 3` al espacio y quedó allí sin validación ni nota. El modelo contiene zonas de conteo para cada clase de objeto y tarjetas de unidades, con límite de 20 por zona. 🔶 No medí el máximo total que puede construirse combinando zonas.
5. El botón circular de reinicio restaura el estado. No se observan retos, acierto, error, pista, puntuación, estrellas, cronómetro ni final de partida. El signo y la oración son **retroalimentación continua** sobre el estado, no juicio sobre una respuesta del estudiante.

**Tiempos.** La relación visible y la oración cambian durante la interacción, sin espera de comprobación. La lógica de movimiento de objetos declara animación entre **0,2 y 1 s** según distancia, a velocidad configurada de 300 unidades/s; no es un tiempo de respuesta o calificación. 🔶 No se cronometraron fotogramas de una composición completa, así que no se atribuye una duración fija a esa acción.

**Voz sintetizada.** `CompareModel.getComparisonString` forma las tres familias «[número] es menor que [número]», «… es mayor que …» y «… es igual a …», usando números en palabras y el idioma elegido. El botón de altavoz puede leer la comparación actual; la opción de lectura automática (`autoHear`) la pronuncia cuando cambia el dato de comparación y al reiniciar o cambiar idioma, si la voz y el audio están disponibles. La voz de prueba de preferencias es independiente. No hay archivo `data:audio` con estas oraciones.

## Relación con MIDUHO y MAT-1-03

El [registro curricular local](../investigacion/dba/dba-primaria.json) transcribe MAT-1-03 así: «Utiliza las características posicionales del Sistema de Numeración Decimal (SND) para establecer relaciones entre cantidades y comparar números». El tema registrado es decenas y unidades; «números hasta 99» figura como **palabra clave de catalogación**, no como rango literal del enunciado. El DBA tampoco prescribe explícitamente `<`, `>`, `=` ni el vocabulario «igual a». El referente trabaja principalmente 0–20; 🔶 corresponde confirmar con la docente qué tramo de ese rango y qué evidencias de valor posicional pide esta actividad de 1.°.

`docs/investigacion/juegos-primero.md`, la spec y la tarea 3.12 prevén `seleccion-multiple`/«quiz». El tipo existente acepta 2–4 opciones por pregunta, explicación y audio, y califica la opción correcta. **Eso basta para una adaptación de preguntas estáticas de comparación**, pero **no reproduce** los dos contadores, los objetos enlazados, la recta y la exploración libre que caracterizan la referencia. `taller-fracciones` ya demuestra la estructura de laboratorio libre más retos calificados, aunque su representación de fracciones no sirve directamente para enteros. 🔶 Decidir si la actividad debe evaluar solo la relación o incluir manipulación queda para el diseño siguiente.

| Referente observado | Posible incorporación MIDUHO 🔶 |
|---|---|
| Compara y Laboratorio son libres; revelan la relación al instante. | Un laboratorio sin nota podría preceder retos con los mismos controles; solo las respuestas a retos contarían. |
| Objetos, marco de diez, bloques y recta ofrecen varias lecturas de la cantidad. | Usar una o varias representaciones accesibles, con controles equivalentes por teclado y texto HTML seleccionable. |
| No existe consigna evaluable ni tratamiento del error. | Rondas deterministas, primera respuesta calificada, pista que remita a contar o comparar y solución tras un segundo intento. 🔶 Escala según SIEE. |
| Altavoz y voz automática leen el resultado actual. | Armi, guía de Matemáticas (`src/lib/guias.ts`), podría hablar la consigna o la relación; botón para repetir y opción de apagar lectura automática. 🔶 Redacción y voz por confirmar. |

### Tres caminos de diseño para 1.° — propuestas, sin elección

| Diseño 🔶 | Ventaja | Límite |
|---|---|---|
| **A. Quiz de relaciones** con dos cantidades visibles y elección «mayor que / menor que / igual a» en `seleccion-multiple`. | Reutiliza tipo, escena y audio existentes; evaluación simple. | Pierde la manipulación y el cambio simultáneo que enseña causa y efecto en PhET. |
| **B. Simulador de dos colecciones**: laboratorio para variar ambos lados y ver número, objetos y relación; retos con la misma herramienta para construir o interpretar comparaciones. | Conserva el núcleo exploratorio y permite evaluar estrategias. | Pide un tipo nuevo o extensión importante; hay que decidir hasta dónde llega el rango y qué cuenta como respuesta. |
| **C. Secuencia mixta**: laboratorio breve de comparación, seguido de quiz existente con las mismas representaciones visuales. | Reduce la complejidad de calificación y mantiene un momento de descubrimiento. | Dos superficies pueden romper la continuidad; requiere integración cuidada entre el laboratorio y el quiz. |

En los tres caminos faltarían una escena propia con **Armi** (sin copiar gráficos de PhET), efectos por evento con fuente comprobada y voz de consigna/resultado si se decide usarla. Toda acción de arrastre tendría botones y teclado equivalentes, foco visible, contraste WCAG 2.1 AA, lectura no dependiente del color y texto pedagógico HTML. 🔶 Para 1.° se debe acordar: **0–10, 0–20 u otro rango**; introducir símbolos junto con palabras o empezar por «mayor que», «menor que», «igual a»; y si se evita el truco del **«cocodrilo»**, cuyo valor pedagógico es discutido. Usar vocabulario natural de Colombia y verificarlo con la docente. No se decide aquí.

## Inventario sonoro

El inventario previo registra **22 `data:audio`**, duración total aproximada **6,6 s**. Su etiqueta automática «voz» no corresponde con la ruta de uso que muestra el código: son efectos de interfaz, dos efectos de selección de pantalla y una respuesta al impulso usada para reverberación. **Ninguna de las 22 pistas contiene la oración sintetizada de comparación.** 🔶 La identidad auditiva de cada pista sigue por escuchar; la función indicada se infiere del `SoundClip`/`SoundPlayer` y su evento.

| Evento o función en el código | n.º → id | Evidencia de uso |
|---|---|---|
| Respuesta al impulso de reverberación, sin evento reproducible propio | 0 → `1f631ab2` | El búfer se asigna a `convolver.buffer` del audio global. |
| Selección de una opción de radio | 1 → `74ad4e7b` | `multiSelectionSoundPlayerFactory` crea un `SoundClip` de este búfer; el botón de radio lo toca al cambiar la selección. |
| Marcar una casilla | 2 → `4179cc32` | `checkboxCheckedSoundPlayer` reproduce el búfer al marcar. |
| Desmarcar una casilla | 3 → `808c199d` | `checkboxUncheckedSoundPlayer`. |
| Pulsar un botón común | 4 → `0f4ae1fd` | `pushButtonSoundPlayer`. |
| Apagar / encender una alternancia | 5 → `2d839a53`; 6 → `a7a9c2aa` | `toggleOffSoundPlayer` y `toggleOnSoundPlayer`. |
| Entrar a una pantalla desde la portada / cambiar el icono de pantalla seleccionado | 7 → `44c48b49`; 8 → `6bae950b` | `HomeScreenSoundGenerator` toca el primer búfer cuando `screenProperty` pasa al modelo de esa pantalla; el segundo se vincula a `selectedScreenProperty` cuando cambia la selección mientras esa pantalla es la activa. |
| Cerrar / abrir un control o panel común | 9 → `7738c0a0`; 10 → `9df7b84d` | `generalCloseSoundPlayer`, `generalOpenSoundPlayer`. |
| Cambiar interruptor hacia izquierda / derecha | 11 → `e9ab9a1d`; 12 → `b34c6776` | `switchToLeftSoundPlayer`, `switchToRightSoundPlayer`. |
| Llegar al límite de un control de valor | 13 → `76aa18b5` | El mismo búfer alimenta `generalBoundaryBoopSoundPlayer` y variantes con tono más bajo en `ValueChangeSoundPlayer`; se dispara al alcanzar mínimo o máximo. |
| Clic suave de control | 14 → `5d0df87e` | `generalSoftClickSoundPlayer`; también variante de `ValueChangeSoundPlayer`. |
| Cambiar pestaña de preferencias | 15 → `ccb75474` | `PreferencesTabSwitchSoundGenerator` enlaza la propiedad de pestaña y toca su `SoundClip` al cambiar. |
| Seleccionar pantalla desde la navegación | 16 → `5af990e3` | `ScreenSelectionSoundGenerator`. |
| Pausar / reproducir | 17 → `cbe8d374`; 18 → `2c22bf1e` | `pauseSoundPlayer`, `playSoundPlayer`. |
| Restablecer todo con botón circular | 19 → `6ef289d7` | Aunque la declaración está junto a `CompareModel`, se asigna a `resetAllSoundPlayer` y al `soundPlayer` de `ResetAllButton`; no es una voz propia de comparación. |
| Cerrar / abrir caja plegable | 20 → `61ad22c5`; 21 → `12d0db87` | `accordionBoxClosedSoundPlayer`, `accordionBoxOpenedSoundPlayer`. |

**Licencia y atribución** (resuelto por Claude el 2026-11-20):
- La versión actual, 1.0.15, recompilada el 2026-11-18, es **CC BY-NC 4.0**.
- La **versión 1.0.10**, de 2025-09-03, anterior al 2026-03-29, sigue con **CC BY 4.0** y trae las mismas 22 pistas, idénticas byte a byte.
- El audio se adapta y se atribuye desde esa versión. Detalle en `content/referencias/phet-comparar-numeros/LICENCIA.md`.

**Alcance de la adaptación:** se puede tomar la idea general de comparar dos cantidades con representaciones que se actualizan simultáneamente. La escena, dibujos, redacción, código, controles y evaluación de MIDUHO serían propios. No se proponen activos ni interfaces definitivas en este paso.

## Adaptación aprobada

**Aprobada por el usuario el 2026-11-20:** se construye la opción B, como `taller-comparar`: laboratorio libre sin nota y diez retos con la misma herramienta. El rango es 0–20; la relación se escribe en palabra y símbolo, sin mnemotecnia del cocodrilo. Mangos, mariposas, ranas y arepas forman las colecciones; Armi guía la escena. Los marcos de diez muestran decenas y unidades. Se califica solo la primera respuesta de cada reto; cualquier cantidad que cumpla una relación de construcción es válida. Los efectos son los adaptados de PhET 1.0.10 y los de corrección inventariados por Claude. 🔶 La correspondencia curricular fina con la planeación de la docente sigue por confirmar.
