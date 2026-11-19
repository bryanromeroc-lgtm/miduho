## ADDED Requirements

### Requirement: Andi protagoniza el mapa de Ciencias Sociales
La actividad de mapa de Ciencias Sociales SHALL presentarse como «Andi explora Colombia» y SHALL usar a Andi en portada, poses animadas, instrucciones, avisos y ayuda. Armi MUST NOT aparecer como guía en esta actividad. El slug curricular SHALL ser `andi-explora-colombia`; el enlace anterior `armi-explora-colombia` SHALL resolver a la misma actividad para conservar marcadores sin crear una segunda actividad. La generación de rondas, el mapa, la entrada por teclado, las pistas, el puntaje y el movimiento reducido MUST conservar su comportamiento.

#### Scenario: Portada y juego
- **WHEN** el estudiante abre la tarjeta y el juego de mapa desde Ciencias Sociales
- **THEN** ve y lee a Andi como guía en ambos lugares y no se presenta a Armi

#### Scenario: Enlace anterior
- **WHEN** se abre la URL antigua de `armi-explora-colombia` dentro de Ciencias Sociales
- **THEN** se llega a «Andi explora Colombia» sin duplicar la actividad

#### Scenario: Misma respuesta
- **WHEN** el estudiante toca el departamento correcto en una ronda existente
- **THEN** obtiene el mismo puntaje y pista que antes del cambio de personaje
