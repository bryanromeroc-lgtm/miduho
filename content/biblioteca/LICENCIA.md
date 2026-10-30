# Permiso de uso — libros de Maguaré

Los libros de `maguare/` vienen de <https://maguare.gov.co/leer/>, la
Estrategia Digital de Cultura y Primera Infancia del **Ministerio de Culturas**
de Colombia. Son obra de sus autores e ilustradores, no del sitio: Maguaré los
divulga con licencia de ellos.

Los términos del sitio (<https://maguare.gov.co/terminos-condiciones/>,
sección H) prohíben por defecto reproducir, transformar y divulgar los
contenidos. Publicarlos en MIDUHO exige por tanto autorización expresa.

## Autorización de este proyecto

> **PENDIENTE DE ADJUNTAR.**
>
> Bryan declaró tener el permiso para descargar y republicar estos títulos en
> MIDUHO. Falta dejar aquí el soporte escrito:
>
> - [ ] oficio o correo de respuesta del Ministerio / Biblioteca Nacional
> - [ ] fecha y número de radicado
> - [ ] alcance: ¿todos los títulos o una lista concreta?
> - [ ] condiciones de atribución que exija el permiso
> - [ ] vigencia
>
> Si el permiso cubre solo algunos títulos, limitar el lote con
> `node src/lote.js descargar --solo slug,slug`.

## Atribución

Cada `libro.json` guarda lo necesario para dar crédito, tal como lo publica
la ficha de origen:

```json
"origen": { "url": "https://maguare.gov.co/<slug>/", "pdf": "…" },
"autor": "…",
"editorial": "…",
"creditos": "Idea original e ilustraciones: … · Diseño: … · Diagramación: …"
```

`creditos` es la línea íntegra de la ficha y no debe recortarse: muchos de
estos libros son de varias autoras, con ilustración, diseño y diagramación
acreditados por separado.

## Qué NO se descargó

- 7 fichas sin PDF propio: son páginas de sección («Leer es mi cuento»,
  «Cuentos Derechos», «Top 5»), no libros.
- `las-travesuras-de-naricita`: publica dos ediciones distintas y se dejó a
  mano para decidir cuál corresponde.
