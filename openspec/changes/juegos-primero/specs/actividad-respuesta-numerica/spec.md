## ADDED Requirements

### Requirement: Problemas con escritura del resultado
El tipo `respuesta-numerica` SHALL presentar problemas cortos de juntar, quitar y completar. Cada uno tiene enunciado en texto (con `audio` opcional), una ilustración opcional con `alt` y un campo numérico. Este se llena con un teclado en pantalla de 0 a 9 (borrar y listo) o con el teclado físico. El contenido SHALL declarar los problemas, no generarlos, porque son de redacción propia.

#### Scenario: Escribir con el teclado en pantalla
- **WHEN** el estudiante toca 1 y luego 2, y después «Listo»
- **THEN** se comprueba 12 como respuesta

#### Scenario: Teclado físico
- **WHEN** el estudiante escribe 12 y pulsa Enter
- **THEN** se comprueba igual que con el teclado en pantalla

### Requirement: Calificación 2/1/0 y pista por error
Cada problema SHALL valer 2 al primer intento, 1 al segundo y 0 en otro caso. Tras el segundo fallo SHALL revelarse el resultado con la operación. Un problema SHALL poder declarar `errores` típicos con su pista; por ejemplo, haber sumado cuando había que quitar. Una respuesta que coincida con un error declarado SHALL mostrar esa pista.

#### Scenario: Operación equivocada
- **WHEN** el problema es «Había 9 lápices y se regalaron 4» y el estudiante escribe 13
- **THEN** se muestra la pista declarada para 13: «¿Se juntaron o se quitaron lápices?»

### Requirement: Sin reloj y accesible
No SHALL haber límite de tiempo. El campo SHALL tener etiqueta visible y anunciar el resultado de cada intento en `status`. Los números con unidad monetaria SHALL ser en pesos colombianos.

#### Scenario: Problema de tienda
- **WHEN** un problema habla de precios
- **THEN** usa pesos colombianos ($) y monedas o billetes vigentes en Colombia
