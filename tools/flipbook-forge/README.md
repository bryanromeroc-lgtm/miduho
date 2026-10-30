# flipbook-forge

Convierte el PDF de un libro ilustrado en las hojas que lee la biblioteca de
MIDUHO. Un PDF entra, una carpeta sale.

Vive fuera de `apps/web/` a propósito. Rasterizar un libro son decenas de segundos
de CPU y varios cientos de megas de pico: eso no cabe en una petición web y no
tiene por qué estar desplegado. Se ejecuta cuando hay un libro nuevo y lo que
se publica es el resultado.

## Requisitos

- Node 18+
- `pdftoppm` y `pdfinfo` (Poppler). En Debian/Ubuntu: `apt install poppler-utils`

```bash
npm install
```

## Uso

```bash
node src/cli.js ../../content/biblioteca/mi-libro.pdf --slug mi-libro \
  --titulo "Mi libro" --autor "Autora" --editorial "Editorial" --edad "6-8"
```

| Opción | Por defecto | Para qué |
|---|---|---|
| `--slug` | el nombre del PDF | carpeta y slug del libro |
| `--salida` | `./salida` | dónde escribir |
| `--dpi` | `300` | resolución de rasterizado |
| `--calidad` | `82` | calidad WebP de las hojas |
| `--simples` | — | páginas del PDF que **no** deben partirse |
| `--omitir` | — | páginas del PDF que no van al libro |

Los metadatos (`--titulo`, `--autor`, `--editorial`, `--edad`, `--resumen`)
son opcionales: van al `libro.json` y se pueden completar a mano después.

## Qué produce

```
salida/mi-libro/
  p01.webp … pNN.webp    hojas de 1000 px
  t01.webp … tNN.webp    miniaturas de 200 px
  libro.json             lo que el catálogo necesita declarar
```

## Cómo decide qué partir

La señal es la geometría, no el contenido. Un libro maquetado en InDesign
exporta las páginas interiores como pliegos —dos páginas del libro en una del
PDF— y deja portada, guardas y contraportada sueltas. El ancho lo delata: el
pliego mide exactamente el doble que la hoja.

El conversor busca el ancho modal del documento, que es la hoja, y parte toda
página que mida ~2× ese ancho. No hace falta visión por computador.

En `lemc_68_palabra-ultima-maguare-web.pdf`, por ejemplo:

| Páginas del PDF | Medida | Qué son |
|---|---|---|
| 1–2 | 467.7 × 666.1 pt | portada y guarda |
| 3–25 | 935.4 × 666.1 pt | pliegos, se parten |
| 26–27 | 467.7 × 666.1 pt | créditos y contraportada |

Cuando la heurística se equivoca —un desplegable, un mapa pensado de verdad a
doble plana— se corrige con `--simples 14,15`.

El conversor **no descarta nada por su cuenta**. Si detecta hojas casi de un
solo color (guardas, páginas de cortesía) las lista al terminar para que quien
publica decida; una guarda de color plano puede ser basura de exportación o
puede ser parte del libro.

## La paridad: por qué a veces hay que omitir una página

Partir bien los pliegos no basta para que la ilustración cruce entera. El
lector muestra la portada sola y empareja el resto 2-3, 4-5, 6-7…, así que un
pliego solo se recompone **si su primera mitad cae en número par**.

Cuando el PDF trae dos hojas sueltas antes del primer pliego —portada y
guarda, que es lo corriente— las mitades empiezan en impar y el libro entero
queda desfasado: cada pliego se parte entre dos pantallas y el lector
emparejaría cada mitad con la del pliego vecino.

El conversor lo detecta y avisa **antes** de rasterizar, que son varios
minutos. El remedio casi siempre es quitar la guarda:

```bash
node src/cli.js libro.pdf --slug mi-libro --omitir 2
```

Si todas las páginas hacen falta, el libro se convierte igual: simplemente no
habrá pliegos recompuestos, y `libro.json` traerá `pliegos: []`. El manifiesto
solo declara los pares que el lector va a mostrar juntos de verdad.

En «Palabra última» la página 2 es una guarda editorial con un epígrafe. Se
omitió: 50 hojas pasaron a 49 y los 23 pliegos se recomponen.

## Libros enteros a doble plana

Algunos PDFs no traen ni una página del ancho de una hoja: todo son pliegos,
también la portada. Pasa en «Al ritmo del corazón» y «Resfrío» (14 páginas
de 1224 × 791 pt). La geometría sola no puede saberlo —todas miden igual—,
así que se declara:

```bash
node src/cli.js libro.pdf --slug mi-libro --doble-plana
node src/lote.js convertir --solo ritmo-corazon --doble-plana ritmo-corazon
```

Se parte todo, y la primera página se trata como la portada envolvente de un
libro impreso: su mitad derecha es la tapa y abre el libro sola; la izquierda
es la contraportada y lo cierra. El resto de pliegos cae en 2-3, 4-5…

## Cómo se publica

```bash
cp -r salida/mi-libro ../../content/libros/
```

Y se declara el libro en `apps/web/src/features/biblioteca/libros.ts` con lo que trae el
`libro.json` — en particular `razon`, `paginas` y `pliegos`:

```ts
{
  slug: "mi-libro",
  tituloId: "lit-103",
  titulo: "Mi libro",
  autor: "Autora",
  editorial: "Editorial",
  paginas: 48,
  razon: 0.7021,
  pliegos: [[3, 4], [5, 6], …],
  edad: "6-8",
  resumen: "…",
}
```

`pliegos` son los pares de hojas que en el original eran un solo dibujo. Lo que
hace que la ilustración cruce entera no es ese dato sino la **alineación**: que
las dos mitades caigan en la misma pantalla del lector. De eso se encarga la
numeración, y por eso importa tanto la paridad (ver arriba).

Se declaran igualmente porque son la estructura real del libro: dicen dónde el
dibujo continúa, permiten comprobar de un vistazo que la alineación sigue
siendo la buena, y un par cuyos números no sean consecutivos delata un desfase.

Sobre el doblez entre las dos mitades: el lector dibuja en cada juntura un
sombreado suave, y ahí se queda también en los pliegos. Se probó quitarlo para
que el dibujo cruzara sin marca alguna, pero el resultado es peor — sin sombra,
las dos mitades se juntan en una línea clara que separa más que la curvatura.
El sombreado se lee como el doblez del papel y el ojo lo salta.


---

# El catálogo de Maguaré en lote

Lo de arriba convierte un PDF. Esto trae los 76 libros de
[maguare.gov.co/leer](https://maguare.gov.co/leer/) y los deja listos para
declarar.

> Los libros de Maguaré son del Ministerio de Culturas y de sus autores.
> Republicarlos exige autorización: el permiso de este proyecto vive en
> `biblioteca/LICENCIA.md`. Cada `libro.json` guarda la URL de origen y la
> línea de créditos tal como la publica Maguaré, para que la atribución
> llegue hasta la plataforma.

## Las tres etapas

```bash
node src/lote.js catalogo     # qué hay y de dónde se baja  → catalogo.json
node src/lote.js descargar    # trae los PDFs               → ../../content/biblioteca/maguare/
node src/lote.js convertir    # rasteriza                   → salida/
node src/lote.js declarar     # (aparte) el código a pegar
```

Van separadas porque fallan distinto y cuestan distinto: rastrear son
segundos, descargar medio giga, y rasterizar varias horas de CPU. Cuando algo
se tuerce en la tercera no hay por qué repetir la primera. `todo` las encadena.

Las dos primeras son reanudables: un PDF que ya está entero no se vuelve a
pedir, y una conversión con `libro.json` no se rehace (`--forzar` la obliga).

| Opción | Para qué |
|---|---|
| `--solo a,b` | limitar a unos títulos |
| `--desde slug` | retomar a partir de uno |
| `--limite n` | parar después de n (para probar) |
| `--ligero` | bajar el PDF recomprimido, más rápido |
| `--dpi n` | resolución (300) |
| `--pausa ms` | espera entre descargas (1500) |

## Qué encuentra en el sitio

Maguaré corre WordPress con el plugin Real3D Flipbook: cada ficha declara sus
PDFs en `data-flipbook-options`. De las 84 fichas del índice con icono de
libro salen **76 convertibles**, 7 páginas de sección sin PDF propio y 1 que
publica dos ediciones distintas y se deja a mano.

El sitio responde **406 a quien no parece un navegador**, así que el
User-Agent no es cosmético: sin él no hay catálogo.

### La misma obra, varias maquetaciones

Casi todas las fichas publican el libro más de una vez, combinando tres ejes:

| Eje | Valores | Cuál se elige |
|---|---|---|
| maquetación | `doble`/`unido` · `sencilla`/`page`/`suelto` | **la suelta** |
| color | `Color` · `BN` | **color** (BN es para imprimir) |
| versión | original · `-v2`, `-v3` | **el original**, salvo `--ligero` |

La suelta gana por una razón concreta: viene ya partida por el editor, así que
no hay pliegos que recomponer y **no puede haber desfase de paridad** (ver
arriba). Cuando solo existe la versión con dobles planas, el conversor las
parte como siempre y avisa si alguna no cruza entera.

Se comprobó que el `-v2` es la misma obra recomprimida, no otra edición: en
«La muñeca negra» ambos traen 27 páginas de 467×666 pt, con 11.6 MB frente a
3.2 MB. Por eso gana el pesado — lo que no trae el PDF no lo inventa ninguna
interpolación a 300 dpi.

## Los metadatos

El PDF trae la geometría; quién escribió el libro y de qué trata están en la
ficha. Se leen de la misma página que ya se descargó: el resumen de la meta
`og:description` y los créditos del bloque al pie.

Las fichas no siguen una plantilla única —unas abren con «Autora: Fulana»,
otras con la entidad y luego «Escritura: …», otras encadenan con guiones—, así
que la extracción parte por el primer rol declarado, separa personas de
instituciones y deja vacío lo que no sabe. **La edad nunca viene**: no está en
la ficha y la pone quien revisa.

## El peso

Cada libro convertido ocupa entre 0.6 y 5 MB en hojas WebP —la media ronda
los 4— así que el catálogo entero son **unos 300 MB** en
`content/libros/`. Los PDFs de origen, que no se publican, son otros
530 MB en `biblioteca/maguare/`.

Conviene decidirlo antes de copiarlos al repo de la app: 300 MB de estáticos
es mucho para un repositorio y para el despliegue. Las salidas están pensadas
para copiarse tal cual, pero nada impide servirlas desde un bucket y dejar en
el repo solo el `libro.json` de cada una.

## Declarar los libros

```bash
node src/declarar.js > /tmp/bloques.ts
```

Imprime los dos bloques que hay que pegar —`TITULOS` en `lib/datos.ts` y
`LIBROS` en `lib/libros.ts`— con los créditos de cada obra en el comentario y
la numeración `lit-NNN` corrida (`--desde-id` la mueve). No escribe sobre el
código a propósito: lo que sale con `TODO` necesita una persona.
