/*
  CATÁLOGO MAGUARÉ — lee el índice de /leer/ y las fichas de cada libro para
  averiguar qué hay y de dónde se descarga. No baja nada: solo mira.

  Se separó del descargador porque son dos preguntas distintas y fallan de
  formas distintas. Aquí el riesgo es que el sitio cambie el maquetado; allí,
  que se caiga la red a medio libro. Mezclarlas obligaría a re-rastrear el
  catálogo entero cada vez que falla una descarga.

  El sitio corre WordPress con el plugin Real3D Flipbook: cada ficha declara
  sus PDFs en el atributo data-flipbook-options, escapados como JSON dentro
  del HTML. De ahí salen las URLs.
*/

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/* El sitio responde 406 a user-agents que no parecen navegador (ModSecurity),
   así que el UA no es cosmético: sin él no hay catálogo. */
export async function pedirHtml(url, { reintentos = 3 } = {}) {
  let ultimoError;

  for (let intento = 1; intento <= reintentos; intento += 1) {
    try {
      const respuesta = await fetch(url, {
        headers: { "User-Agent": UA, "Accept-Language": "es-CO,es;q=0.9" },
      });
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status} en ${url}`);
      }
      return await respuesta.text();
    } catch (error) {
      ultimoError = error;
      if (intento < reintentos) {
        await new Promise((r) => setTimeout(r, 1000 * intento));
      }
    }
  }

  throw ultimoError;
}

function desescaparHtml(texto) {
  return texto
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function slugDesdeUrl(url) {
  const limpia = url.replace(/\/+$/, "");
  return limpia.slice(limpia.lastIndexOf("/") + 1);
}

/*
  El índice de /leer/ mezcla libros con videos, audios e interactivos. Cada
  tarjeta trae un icono que dice de qué es —icon-m-libro, icon-m-video…— y esa
  es la señal más fiable que publica el sitio: el maquetado de la tarjeta es
  idéntico para todos los formatos.
*/
export function extraerFichas(html) {
  const fichas = [];
  const tarjetas = html.match(/<article class="note[^"]*"[\s\S]*?<\/article>/g) ?? [];

  for (const tarjeta of tarjetas) {
    const tipo = tarjeta.match(/icon-m-([a-z0-9-]+)/)?.[1] ?? null;
    if (tipo !== "libro") continue;

    const url = tarjeta.match(/href="(https:\/\/maguare\.gov\.co\/[^"]+)"/)?.[1];
    const bruto = tarjeta.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
    if (!url || !bruto) continue;

    const titulo = desescaparHtml(bruto.replace(/<[^>]+>/g, "")).trim();
    const portada = tarjeta.match(/background-image:\s*url\('([^']+)'\)/)?.[1] ?? null;

    fichas.push({ slug: slugDesdeUrl(url), titulo, url, portada });
  }

  /* El índice repite tarjetas entre secciones destacadas y el listado. */
  const vistos = new Set();
  return fichas.filter((f) => {
    if (vistos.has(f.slug)) return false;
    vistos.add(f.slug);
    return true;
  });
}

/* El PDF de ejemplo que trae el plugin. Aparece en toda ficha y no es el libro. */
const DEMO_DEL_PLUGIN = /\/plugins\/real3d-flipbook\//;

export function extraerPdfs(html) {
  const encontrados = new Set();
  const patron = /https:(?:\\\/\\\/|\/\/)maguare\.gov\.co(?:\\\/|\/)wp-content[^"'\s&\\]*(?:\\\/[^"'\s&\\]*)*\.pdf/g;

  for (const bruto of html.match(patron) ?? []) {
    const url = bruto.replace(/\\\//g, "/");
    if (DEMO_DEL_PLUGIN.test(url)) continue;
    encontrados.add(url);
  }

  return [...encontrados];
}

/*
  Muchas fichas publican el mismo libro dos veces: el PDF original y un «-v2»
  recomprimido para que el visor cargue rápido. Se comprobó en «La muñeca
  negra» que ambos traen 27 páginas de 467×666 pt —la misma obra, no una
  edición distinta— y que el original pesa 11.6 MB frente a 3.2 MB.

  Por defecto gana el pesado: el conversor rasteriza a 300 dpi y lo que no
  trae el PDF no lo inventa ninguna interpolación. El ligero está a un flag
  de distancia para quien prefiera bajar 85 libros en menos tiempo.
*/
/*
  Una misma obra se publica en varias maquetaciones. Al recorrer el catálogo
  entero aparecieron tres ejes, combinables entre sí:

    maquetación  doble | unido      pliegos a doble plana
                 sencilla | page | suelto   páginas sueltas
    color        Color | BN        BN es la versión para imprimir
    versión      -v2, -v3          recompresiones

  Ejemplos reales: «elogro-doble-v2.pdf» / «elogro-page-v2.pdf»,
  «Tormenta-Color-unido.pdf» / «Tormenta-BN-unido.pdf» / «Tormenta-Color-suelto.pdf».
*/
const EJES = {
  dobles: /(?:^|[-_])(doble|unido)(?:s)?(?:[-_.]|$)/i,
  sueltas: /(?:^|[-_])(sencilla|page|suelto|sueltas?)(?:[-_.]|$)/i,
  blancoYNegro: /(?:^|[-_])(bn|byn)(?:[-_.]|$)/i,
  color: /(?:^|[-_])color(?:[-_.]|$)/i,
};

function ejesDe(url) {
  const nombre = url.slice(url.lastIndexOf("/") + 1);
  return {
    nombre,
    dobles: EJES.dobles.test(nombre),
    sueltas: EJES.sueltas.test(nombre),
    blancoYNegro: EJES.blancoYNegro.test(nombre),
    ligero: /-v\d+\.pdf$/i.test(nombre),
  };
}

/* El nombre sin ninguno de los ejes: lo que queda identifica la obra. */
function raizDe(url) {
  const nombre = url.slice(url.lastIndexOf("/") + 1).toLowerCase();
  return nombre
    .replace(/\.pdf$/, "")
    .replace(/[-_](doble|unido|sencilla|page|suelto|sueltas|bn|byn|color)(?=[-_]|$)/g, "")
    .replace(/[-_]v\d+$/, "")
    .replace(/[-_]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function clasificarPdfs(urls, { preferirLigero = false } = {}) {
  if (urls.length === 0) return { estado: "sin-pdf", elegido: null, todos: [], nota: null };

  const familias = new Map();
  for (const url of urls) {
    const raiz = raizDe(url);
    if (!familias.has(raiz)) familias.set(raiz, []);
    familias.get(raiz).push(url);
  }

  /* Varias obras distintas en una ficha: es una página índice de sección
     («Cuentos Derechos»), no un libro. Quien llama decide qué hacer. */
  if (familias.size > 1) {
    return { estado: "coleccion", elegido: null, todos: urls, nota: `${familias.size} obras` };
  }

  const variantes = [...new Set([...familias.values()][0])].map((url) => ({ url, ...ejesDe(url) }));

  /* El blanco y negro es la versión para imprimir y colorear. Nunca es la
     que quiere un lector en pantalla, así que solo se usa si no hay otra. */
  const aColor = variantes.filter((v) => !v.blancoYNegro);
  const candidatas = aColor.length > 0 ? aColor : variantes;

  /* Entre maquetaciones gana la suelta. No es cuestión de calidad: el
     conversor parte los pliegos por geometría sin problema, pero la
     recomposición exige que cada mitad caiga en la pantalla correcta y eso
     descarrila con una guarda de más (ver la paridad, en el README). La
     versión suelta ya viene partida por el editor y no tiene ese riesgo. */
  const sueltas = candidatas.filter((v) => v.sueltas);
  const dobles = candidatas.filter((v) => v.dobles);
  const preferidas = sueltas.length > 0 ? sueltas : dobles.length > 0 ? dobles : candidatas;

  /* Entre original y recomprimido decide el peso real, no el nombre; aquí
     solo se ordena la preferencia. El conversor rasteriza a 300 dpi y lo que
     no trae el PDF no lo inventa ninguna interpolación, así que gana el
     original salvo que se pida lo contrario. */
  const ligeras = preferidas.filter((v) => v.ligero);
  const originales = preferidas.filter((v) => !v.ligero);
  const elegida = preferirLigero
    ? (ligeras[0] ?? originales[0] ?? preferidas[0])
    : (originales[0] ?? ligeras[0] ?? preferidas[0]);

  const nota = [
    sueltas.length > 0 ? "suelta" : dobles.length > 0 ? "pliegos" : null,
    aColor.length === 0 ? "solo BN" : null,
  ].filter(Boolean).join(" · ") || null;

  return { estado: "ok", elegido: elegida.url, todos: urls, nota };
}

/*
  METADATOS DE LA FICHA — resumen y créditos.

  El conversor deduce del PDF la geometría y poco más: quién escribió el
  libro y de qué trata solo están en la página. Maguaré los publica en dos
  sitios estables: el resumen en la meta og:description, que es lo que se ve
  al compartir el enlace, y los créditos en un bloque al pie de la ficha.

  Los créditos importan más que el resumen. Estos libros tienen autoras e
  ilustradores con nombre, y la línea que publica Maguaré —«Idea original e
  ilustraciones: … · Diseño: … · Diagramación: …»— es la atribución que
  corresponde arrastrar hasta la plataforma. Se guarda entera, sin recortar.
*/
export function extraerMetadatos(html) {
  const resumen =
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/)?.[1] ??
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/)?.[1] ??
    "";

  /* El bloque de créditos va justo después del resumen en la ficha. Se busca
     por su contenido —nombres seguidos de los roles del libro— y no por una
     clase CSS, que es lo que cambia cuando rediseñan el sitio. */
  const sinScripts = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "");
  const parrafos = [...sinScripts.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => desescaparHtml(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter(Boolean);

  /* Un rol vale como señal solo si viene declarado —«Ilustraciones:»—, no
     por aparecer la palabra suelta. Sin esto el resumen gana: «se nutren de
     los relatos ancestrales» y «Escritas con un enfoque psicosocial» son
     prosa del libro, y acabarían en el campo de autoría. */
  const ROL_DECLARADO =
    /(?:^|[.·—–\-]\s*|\s)(?:idea original|ilustraci[oó]n(?:es)?|dise[nñ]o|diagramaci[oó]n|escritura|textos?|autor(?:a|es|as)?|adaptaci[oó]n|traducci[oó]n|edici[oó]n)\s*:/i;

  let textoResumen = desescaparHtml(resumen).trim();
  const candidatos = parrafos.filter(
    (p) => p.length < 600 && p !== textoResumen && !p.startsWith("* Si eres adulto")
  );

  /* Primero el que declara un rol; si ninguno lo hace, el párrafo corto que
     sigue al resumen, que es donde Maguaré pone la autoría a secas. */
  const creditos =
    candidatos.find((p) => ROL_DECLARADO.test(p)) ??
    candidatos.find((p) => p.length < 200 && /[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ]/.test(p)) ??
    "";

  /*
    La autoría sale de la línea de créditos, que llega en dos formas:

      «Nicolás Buenaventura - Ilustraciones: Valentina Toro»   nombre primero
      «Museo Casa de la Memoria. Escritura: María Clara …»     entidad primero

    Se parte por el primer rol declarado. Lo de delante es la autoría si es
    un nombre, y la editorial si es una institución —un museo o un ministerio
    no «escribió» el libro, lo editó—, en cuyo caso la autoría es lo que
    sigue al rol.
  */
  const ENTIDAD =
    /(museo|ministerio|biblioteca|fundaci[oó]n|instituto|alcald[ií]a|secretar[ií]a|universidad|editorial|colecci[oó]n|magua|maguared|icbf|sena)/i;
  /* Coletillas que Maguaré añade tras los nombres y no son autoría. */
  const COLETILLA = /^(ganador|ganadora|premio|obra |proyecto |con el apoyo|beca)/i;

  const limpiar = (v) =>
    String(v ?? "")
      .replace(/^\s*(?:Autor(?:a|es|as)?|Escrit(?:o|a)s? por)\s*[:.\-]?\s*/i, "")
      .replace(/\s*[.,;:·—–\-]\s*$/, "")
      .trim();

  let autor = "";
  let editorial = "";

  if (creditos) {
    const m = creditos.match(ROL_DECLARADO);
    const antes = limpiar(m ? creditos.slice(0, m.index) : creditos);
    /* Tras el rol viene un nombre y, a veces, otro rol detrás: se corta en
       el primer separador fuerte para quedarse solo con las personas. */
    const despues = limpiar((m ? creditos.slice(m.index + m[0].length) : "").split(/\s*[.·—–]\s|\s\-\s/)[0]);

    /* Sin rol declarado, la ficha encadena con guiones y mezcla entidades
       con personas: «Ministerio de Cultura - Maguaré - Irene Vasco, …».
       Hay que partir primero y clasificar después; al revés, la cadena
       entera parece una entidad porque empieza por una. */
    const tramos = (antes || "")
      .split(/\s+-\s+|\s*·\s*/)
      .map((t) => t.trim())
      .filter(Boolean);
    const personas = tramos.filter((t) => !ENTIDAD.test(t));
    const entidades = tramos.filter((t) => ENTIDAD.test(t));

    if (personas.length > 0) {
      /* la autoría es el último tramo que no es una institución */
      autor = personas[personas.length - 1];
      if (entidades.length > 0) editorial = entidades[0];
      /* «Museo X. Escritura: Fulana» — el rol manda sobre el orden */
      if (m && despues && entidades.length > 0 && ENTIDAD.test(antes)) autor = despues;
    } else if (entidades.length > 0) {
      editorial = entidades[0];
      /* solo entidades delante: la autoría, si la hay, va tras el rol */
      autor = despues;
    } else {
      autor = antes || despues;
    }

    /* «Fulano. Ganador de la convocatoria…» → «Fulano» */
    autor = autor
      .split(/\s*[.·—–]\s+/)
      .filter((trozo) => trozo && !COLETILLA.test(trozo.trim()))[0] ?? autor;
    autor = limpiar(autor);
  }

  /* Alguna ficha no rellena og:description. El resumen es entonces el
     párrafo largo que no es la línea de créditos. */
  if (!textoResumen) {
    textoResumen =
      parrafos.find(
        (p) => p.length > 80 && p !== creditos && !p.startsWith("* Si eres adulto")
      ) ?? "";
  }

  /* El nombre de la serie no es una autoría: «Cuentos Derechos» es la
     colección, y esas fichas no publican autores. Mejor vacío que falso. */
  if (autor && /^(cuentos?|colecci[oó]n|serie)\b/i.test(autor)) autor = "";

  return {
    resumen: textoResumen,
    /* la línea entera, que es la atribución que publica Maguaré */
    creditos,
    autor: autor.length > 2 && autor.length < 200 ? autor : "",
    editorial,
  };
}
