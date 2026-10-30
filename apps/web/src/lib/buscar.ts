/*
  BUSCADOR DE LA BIBLIOTECA — escribir mal no debería vaciar el estante.

  El catálogo está en español de Colombia: tildes, eñes, signos de apertura
  y comillas angulares. Una docente que busca «muneca negra» o «prestame tus
  ojos» desde el teclado, de afán entre dos clases, escribe sin tildes — y el
  título existe. El buscador anterior comparaba el texto tal cual, así que esa
  consulta devolvía el estante vacío: la biblioteca parecía no tener el libro.

  Tres capas, de la más exacta a la más tolerante. Una consulta se resuelve en
  la primera que dé resultados: si «rana» encuentra títulos de verdad, no hace
  falta adivinar que quizá quiso decir «rama».

  1. Normalizar: quitar tildes y signos para que «Préstame» y «prestame» sean
     la misma palabra.
  2. Por palabras sueltas, en cualquier orden: «tortuga liebre» encuentra
     «La liebre y la tortuga».
  3. Tolerar un error de dedo: solo si no hubo ninguna coincidencia, se admite
     una distancia de edición pequeña («mariposda» → «mariposa»).
*/

/* Sin tildes, sin ¡¿«»—·, en minúsculas y con los espacios colapsados.
   NFD separa la letra de su tilde; el rango ̀-ͯ son esas marcas.

   La ñ se aparta antes de descomponer: en NFD es «n» + virgulilla, así que
   el mismo paso que quita la tilde de «á» convertiría «muñeca» en «muneca».
   Aquí es letra propia —«cuña» y «cuna» son palabras distintas— y quien
   escribe sin ñ se atiende después, en `llana`. */
const MARCA_ENIE = "\u0000";

export function normalizar(texto: string): string {
  return texto
    .replace(/ñ/g, MARCA_ENIE)
    .replace(/Ñ/g, MARCA_ENIE)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0000]/g, " ")
    .replaceAll(MARCA_ENIE, "ñ")
    .replace(/\s+/g, " ")
    .trim();
}

/* La ñ es letra, no n con tilde: se conserva aparte para no confundir
   «cuña» con «cuna». Pero quien escribe «muneca» sin ñ también debe
   encontrar «muñeca», así que la comparación tiene una forma más llana
   todavía donde la ñ pasa a n. */
function llana(texto: string): string {
  return normalizar(texto).replace(/ñ/g, "n");
}

/* Distancia de Levenshtein con corte: si ya se pasó del límite, no vale la
   pena terminar de calcularla. Las palabras de un título son cortas, así que
   la matriz por filas basta y sobra. */
function distancia(a: string, b: string, limite: number): number {
  if (Math.abs(a.length - b.length) > limite) return limite + 1;

  let previa = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const actual = [i];
    let minimaDeLaFila = i;

    for (let j = 1; j <= b.length; j += 1) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      const valor = Math.min(
        actual[j - 1] + 1,
        previa[j] + 1,
        previa[j - 1] + costo,
      );
      actual.push(valor);
      if (valor < minimaDeLaFila) minimaDeLaFila = valor;
    }

    /* toda la fila se pasó del límite: ninguna continuación va a bajar */
    if (minimaDeLaFila > limite) return limite + 1;
    previa = actual;
  }

  return previa[b.length];
}

/* Cuántos errores se le perdonan a una palabra según su largo. Palabras
   cortas no perdonan nada: con «mar» y un error de margen entrarían «mal»,
   «par» y «mas», que son otras palabras y no un dedo torcido. */
function margen(palabra: string): number {
  if (palabra.length <= 4) return 0;
  if (palabra.length <= 7) return 1;
  return 2;
}

/* Una palabra de la consulta contra el texto de una ficha. `aproximado`
   decide si se admite el error de dedo: la primera pasada va exacta. */
function coincidePalabra(
  palabra: string,
  palabrasDelTexto: string[],
  aproximado: boolean,
): boolean {
  /* prefijo: quien escribe «mari» ya debe ver «mariposa» sin terminar */
  if (palabrasDelTexto.some((p) => p.startsWith(palabra))) return true;
  /* dentro de la palabra: «ñeca» encuentra «muñeca» */
  if (palabra.length >= 4 && palabrasDelTexto.some((p) => p.includes(palabra))) {
    return true;
  }
  if (!aproximado) return false;

  const tolerancia = margen(palabra);
  if (tolerancia === 0) return false;
  return palabrasDelTexto.some((p) => distancia(palabra, p, tolerancia) <= tolerancia);
}

/* Los campos de una ficha donde se busca, ya normalizados y partidos en
   palabras. Se calcula una vez por ficha y se reutiliza en las dos pasadas. */
export interface FichaIndexada {
  palabras: string[];
  /* el texto entero, para puntuar la frase completa */
  texto: string;
  /* el título solo, para que un acierto ahí pese más que uno en el autor */
  titulo: string;
}

export function indexar(titulo: string, autor: string): FichaIndexada {
  const texto = llana(`${titulo} ${autor}`);
  return {
    palabras: texto.split(" ").filter(Boolean),
    texto,
    titulo: llana(titulo),
  };
}

/* Puntúa para ordenar: más alto es mejor, 0 es que no coincide.
   El orden que la gente espera cuando escribe «liebre»: primero el libro
   que se llama así, después aquel donde la palabra aparece más adentro. */
function puntuar(consulta: string, palabras: string[], ficha: FichaIndexada): number {
  let punto = 0;

  if (ficha.titulo === consulta) punto += 1000;
  else if (ficha.titulo.startsWith(consulta)) punto += 500;
  else if (ficha.titulo.includes(consulta)) punto += 250;
  else if (ficha.texto.includes(consulta)) punto += 100;

  /* cada palabra que cae en el título pesa más que una que cae en el autor */
  for (const palabra of palabras) {
    if (ficha.titulo.split(" ").some((p) => p.startsWith(palabra))) punto += 20;
    else if (ficha.palabras.some((p) => p.startsWith(palabra))) punto += 10;
  }

  /* a igualdad de aciertos, el título más corto es el más relevante:
     «Fábulas» antes que «Fábulas de la abuela y otros cuentos largos» */
  return punto - Math.min(ficha.titulo.length / 100, 9);
}

export interface ResultadoBusqueda<T> {
  ficha: T;
  punto: number;
  /* true si entró por el error de dedo y no por coincidencia exacta:
     la interfaz lo usa para avisar «mostrando resultados para…» */
  aproximado: boolean;
}

/*
  Busca `consulta` en `fichas`, ordenadas por relevancia.

  `indice` saca de cada ficha su texto indexado; quien llama decide qué campos
  entran. Devuelve las coincidencias exactas si las hay, y solo si no hay
  ninguna reintenta tolerando errores de dedo.
*/
export function buscar<T>(
  consulta: string,
  fichas: readonly T[],
  indice: (ficha: T) => FichaIndexada,
): ResultadoBusqueda<T>[] {
  const limpia = llana(consulta);
  if (!limpia) return fichas.map((ficha) => ({ ficha, punto: 0, aproximado: false }));

  const palabras = limpia.split(" ").filter(Boolean);

  const pasada = (aproximado: boolean) => {
    const encontradas: ResultadoBusqueda<T>[] = [];
    for (const ficha of fichas) {
      const indexada = indice(ficha);
      const todas = palabras.every((palabra) =>
        coincidePalabra(palabra, indexada.palabras, aproximado),
      );
      if (!todas) continue;
      encontradas.push({
        ficha,
        punto: puntuar(limpia, palabras, indexada),
        aproximado,
      });
    }
    return encontradas.sort((a, b) => b.punto - a.punto);
  };

  const exactas = pasada(false);
  return exactas.length > 0 ? exactas : pasada(true);
}

/*
  Sugerencias para el desplegable mientras se escribe. Son títulos del
  catálogo, no consultas inventadas: cada sugerencia es algo que existe y se
  puede abrir, así que elegirla nunca lleva a un estante vacío.
*/
export function sugerir<T>(
  consulta: string,
  fichas: readonly T[],
  indice: (ficha: T) => FichaIndexada,
  cuantas = 6,
): T[] {
  if (!llana(consulta)) return [];
  return buscar(consulta, fichas, indice)
    .slice(0, cuantas)
    .map((r) => r.ficha);
}
