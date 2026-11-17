## ADDED Requirements

### Requirement: Bruno protagoniza la ruta de Comprensión Lectora
«La ruta de las palabras» SHALL usar a Bruno en portada, poses animadas, instrucciones, avisos y ayuda. Armi MUST NOT aparecer como guía en esta actividad. El recorrido por teclado, la alternativa escrita al audio, la pausa, los ritmos, el puntaje y `prefers-reduced-motion` MUST conservar su comportamiento.

#### Scenario: Portada y carrera
- **WHEN** el estudiante abre «La ruta de las palabras» desde Comprensión Lectora
- **THEN** ve y lee a Bruno como guía en la tarjeta y durante el juego, sin referencias a Armi

#### Scenario: Ritmo tranquilo
- **WHEN** se elige el carril correcto en ritmo tranquilo
- **THEN** la ronda conserva el mismo puntaje y la retroalimentación nombra a Bruno cuando menciona a la guía

#### Scenario: Movimiento reducido
- **WHEN** el sistema solicita movimiento reducido
- **THEN** la respuesta y el aviso siguen siendo comprensibles sin las animaciones de Bruno
