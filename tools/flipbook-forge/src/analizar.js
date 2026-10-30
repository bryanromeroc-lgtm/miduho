/*
  ANÁLISIS DEL PDF — decidir, antes de rasterizar nada, qué es cada página.

  La señal es la geometría, no el contenido. Un PDF de libro maquetado en
  InDesign exporta las páginas interiores como pliegos (dos páginas del libro
  en una del PDF) y deja portada, guardas y contraportada sueltas. El ancho lo
  delata: el pliego mide exactamente el doble que la hoja.

  Por eso no hace falta visión por computador para el caso normal. Se busca el
  ancho modal del documento —la hoja— y se marca como pliego toda página que
  mida ~2× ese ancho a la misma altura. El resto son hojas sueltas.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);

/* Tolerancia al comparar medidas en puntos. Los exportadores redondean y un
   pliego de 935.43 pt rara vez es dos veces 467.717 al último decimal. */
const TOLERANCIA = 0.02;

const proporcional = (a, b) => Math.abs(a - b) / b <= TOLERANCIA;

/* Medidas de cada página, leídas de pdfinfo. Se pide el rango completo
   porque el tamaño puede cambiar de una página a otra: ese cambio es
   justamente lo que se busca. */
export async function medirPaginas(rutaPdf) {
  const { stdout } = await ejecutar("pdfinfo", [
    "-f", "1",
    "-l", "999999",
    rutaPdf,
  ]);

  const paginas = [];
  /* «Page    3 size:  935.43 x 666.14 pts» */
  const patron = /^Page\s+(\d+)\s+size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/gm;
  for (const m of stdout.matchAll(patron)) {
    paginas.push({
      numero: Number(m[1]),
      ancho: Number(m[2]),
      alto: Number(m[3]),
    });
  }

  if (paginas.length === 0) {
    /* Un PDF de una sola página no lista «Page N size»; trae «Page size». */
    const suelta = stdout.match(/^Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/m);
    if (suelta) {
      paginas.push({
        numero: 1,
        ancho: Number(suelta[1]),
        alto: Number(suelta[2]),
      });
    }
  }

  if (paginas.length === 0) {
    throw new Error(`No se pudieron leer las medidas de ${rutaPdf}`);
  }

  return paginas;
}

/* La hoja del libro: el ancho que más se repite entre las páginas más
   estrechas. Se toma la moda y no el mínimo porque una sola página rara
   —un desplegable, una errata de exportación— no debe definir el libro. */
function anchoHoja(paginas, todoDoblePlana = false) {
  const cuenta = new Map();
  for (const p of paginas) {
    /* se agrupa al entero: 467.717 y 467.72 son la misma hoja */
    const clave = Math.round(p.ancho);
    cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
  }

  const anchos = [...cuenta.entries()].sort(
    /* más frecuente primero; a igual frecuencia, el más estrecho, que es el
       candidato a hoja y no a pliego */
    (a, b) => b[1] - a[1] || a[0] - b[0]
  );

  const [modal] = anchos[0];

  /* Un libro exportado entero a doble plana —también la portada— no tiene
     ninguna página que mida una hoja: solo quien publica lo sabe. */
  if (todoDoblePlana) return modal / 2;

  /* Si la moda es el pliego —un libro exportado entero a doble página, con
     solo portada y contraportada sueltas— la hoja es su mitad. Se comprueba
     mirando si existe un ancho que sea justo la mitad del modal. */
  const mitad = anchos.find(([a]) => proporcional(a * 2, modal));
  return mitad ? mitad[0] : modal;
}

/*
  Plan de conversión: para cada página del PDF, qué hojas del libro produce.

  Devuelve una lista de hojas en orden de lectura, cada una apuntando a su
  página de origen y, si viene de un pliego, a la mitad que le toca. Ese es
  el único sitio donde se decide el orden: lo demás solo ejecuta.
*/
export function planificar(paginas, opciones = {}) {
  const {
    forzarSimples = [],
    omitir = [],
    hojaEnBlancoTrasPortada = false,
    doblePlana = false,
  } = opciones;
  const hoja = anchoHoja(paginas, doblePlana);
  const simples = new Set(forzarSimples);
  const fuera = new Set(omitir);

  const hojas = [];
  const origen = [];

  /* Alinear sin tocar el contenido: una hoja en blanco justo después de la
     portada corre el resto de la numeración una posición y mete las mitades
     en par. Es el reverso de la tapa de un libro impreso.

     Es la alternativa a --omitir cuando la página que estorba no sobra. Se
     vio en este catálogo que la segunda página no siempre es una guarda:
     en «Saltarines» es el texto del poema y en «La muñeca negra» un
     epígrafe, así que quitarla mutilaría el libro.

     Va detrás de la portada y no delante: la hoja 1 es la que el lector
     muestra sola como tapa y la que la biblioteca usa de portada, y una
     tapa en blanco es peor que un reverso en blanco. */
  let faltaHojaEnBlanco = hojaEnBlancoTrasPortada;

  /* Libro entero a doble plana («Al ritmo del corazón», «Resfrío»): la
     primera página es una portada envolvente, como la de un libro impreso
     abierto boca abajo — tapa a la derecha, contraportada a la izquierda.
     Partida como un pliego más, el libro abriría por la contraportada. Así
     que la tapa va primero y sola, y la contraportada cierra el libro. */
  const primera = paginas.find((p) => !fuera.has(p.numero));
  const envolvente = doblePlana && primera ? primera.numero : null;

  for (const p of paginas) {
    if (fuera.has(p.numero)) continue;
    if (p.numero === envolvente) {
      hojas.push({ pagina: p.numero, mitad: "derecha", pliego: null });
      origen.push(p.numero);
      continue;
    }
    if (faltaHojaEnBlanco && hojas.length === 1) {
      hojas.push({ pagina: null, mitad: null, pliego: null, enBlanco: true });
      faltaHojaEnBlanco = false;
    }
    const esPliego =
      !simples.has(p.numero) && proporcional(p.ancho, hoja * 2);

    if (esPliego) {
      /* Un pliego son dos hojas contiguas del libro, izquierda y derecha.
         Se marcan como pareja: el lector las recompone sin sombra de lomo
         para que la ilustración cruce limpia. */
      const pliego = origen.length;
      hojas.push({ pagina: p.numero, mitad: "izquierda", pliego });
      hojas.push({ pagina: p.numero, mitad: "derecha", pliego });
    } else {
      hojas.push({ pagina: p.numero, mitad: null, pliego: null });
    }

    origen.push(p.numero);
  }

  if (envolvente !== null) {
    hojas.push({ pagina: envolvente, mitad: "izquierda", pliego: null });
  }

  /* Numeración final, ya en orden de lectura del libro. */
  hojas.forEach((h, i) => {
    h.numero = i + 1;
  });

  /*
    ¿Van a verse enteros los pliegos?

    El lector muestra la portada sola y empareja el resto 2-3, 4-5, 6-7…, así
    que un pliego solo se recompone si su primera mitad cae en número par.
    Cuando el PDF trae dos hojas sueltas antes del primer pliego —portada y
    guarda, que es lo corriente— las mitades empiezan en impar y todo el libro
    queda desfasado: cada pliego se parte entre dos pantallas.

    No se corrige por las bravas insertando o quitando una hoja, porque eso
    cambia el libro. Se informa, y quien publica decide: casi siempre la
    guarda sobra y al quitarla del PDF encaja todo.
  */
  const primeraMitad = hojas.find((h) => h.mitad === "izquierda");
  const alineado = primeraMitad ? primeraMitad.numero % 2 === 0 : true;

  /* Hay pliegos que recomponer, luego el desfase importa. Sin pliegos, la
     paridad da igual y no hay nada que avisar. */
  const hayPliegos = hojas.some((h) => h.mitad !== null);

  /* El alto se toma de una página que mida lo que la hoja (o un pliego), no
     de la primera: la portada a menudo trae otra medida —con sangrado, o
     envolvente y más grande— y torcería la proporción de todo el libro. */
  const tipica =
    paginas.find((p) => proporcional(p.ancho, hoja) || proporcional(p.ancho, hoja * 2)) ??
    paginas[0];

  return {
    alineado,
    hayPliegos,
    /* razón de aspecto de la hoja del libro, la que necesita el lector */
    razon: hoja / tipica.alto,
    anchoHoja: hoja,
    altoHoja: tipica.alto,
    totalPaginasPdf: paginas.length,
    hojas,
  };
}
