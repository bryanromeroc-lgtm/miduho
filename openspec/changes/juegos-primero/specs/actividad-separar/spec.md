## ADDED Requirements

### Requirement: Separar una palabra tocando sus límites silábicos
El tipo `separar` SHALL mostrar una palabra completa y su ilustración informativa por ronda. Cada límite permitido SHALL ser un botón de al menos 44 px con `aria-pressed`, foco visible, Tab, flechas izquierda/derecha y activación con Enter o Espacio. Los dígrafos ch, ll y rr SHALL permanecer indivisibles. El texto pedagógico SHALL ser HTML seleccionable.

#### Scenario: Cortes exactos
- **WHEN** el estudiante marca exactamente todos los límites de `silabas` y pulsa «Comprobar»
- **THEN** el ítem recibe 1 punto, se muestra la separación y aparece «Siguiente»

#### Scenario: Corte sobrante
- **WHEN** la respuesta incluye un límite adicional
- **THEN** recibe 0 puntos y el límite sobrante se distingue con símbolo y texto

#### Scenario: Corte faltante
- **WHEN** falta un límite correcto
- **THEN** recibe 0 puntos y el límite faltante se distingue con símbolo y texto

#### Scenario: Dígrafos
- **WHEN** la palabra contiene ch, ll o rr
- **THEN** no existe un botón dentro del dígrafo y el esquema rechaza una separación que lo parta

#### Scenario: Teclado
- **WHEN** la persona recorre los límites con Tab o flechas y activa Enter o Espacio
- **THEN** puede completar la ronda y llegar al resumen sin ratón

#### Scenario: Revelado
- **WHEN** se comprueba cualquier respuesta
- **THEN** se revelan los límites correctos, la explicación se anuncia en `role="status"`, y no se permite un segundo intento
