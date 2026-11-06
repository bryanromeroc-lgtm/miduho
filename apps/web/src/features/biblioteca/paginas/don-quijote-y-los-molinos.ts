import type { PaginaCompuesta } from "@/features/biblioteca/libros";

/*
  Adaptación original para quinto grado del episodio de los molinos de viento
  de El ingenioso hidalgo don Quijote de la Mancha (primera parte, cap. VIII),
  obra de dominio público de Miguel de Cervantes. Texto de adaptación e
  ilustraciones creados para MIDUHO con asistencia de IA. No se usan texto,
  notas ni arte de ediciones contemporáneas.

  Las páginas 4–13 forman cinco escenas continuas, partidas exactamente
  al centro. Portada, créditos, apertura y cierre tienen diseño editorial
  propio. La narración y los créditos son HTML, nunca raster.
*/

export const CARPETA_QUIJOTE = "/images/biblioteca/don-quijote-y-los-molinos";

const img = (n: number) =>
  `${CARPETA_QUIJOTE}/i${String(n).padStart(2, "0")}.webp`;

const mitad = (n: number, alt: string, parrafos: string[]): PaginaCompuesta => ({
  disposicion: "pliego",
  ilustracion: img(n),
  alt,
  mitad: n % 2 === 0 ? "izquierda" : "derecha",
  parrafos,
});

export const PAGINAS_QUIJOTE: PaginaCompuesta[] = [
  {
    disposicion: "portada-editorial",
    ilustracion: img(1),
    alt: "Don Quijote, sobre su caballo flaco, y Sancho Panza, junto a su asno, miran unos molinos lejanos en la llanura de La Mancha.",
    epigrafe: "Clásicos para mirar dos veces",
    titulo: "Don Quijote y los molinos",
    subtitulo: "Una aventura sobre lo que vemos y lo que imaginamos",
    parrafos: [
      "Miguel de Cervantes · Adaptación de MIDUHO",
      "Quinto grado · Lectores de 9 a 11 años",
    ],
  },
  {
    disposicion: "creditos-editoriales",
    titulo: "Detrás de este cuento",
    subtitulo: "Don Quijote y los molinos · Quinto grado",
    secciones: [
      {
        titulo: "Origen y adaptación",
        parrafos: [
          "Esta versión adapta la aventura de los molinos (primera parte, capítulo VIII) de Miguel de Cervantes. Conserva los hechos centrales; el relato y los diálogos son nuevos.",
        ],
      },
      {
        titulo: "Realización de esta edición",
        parrafos: [
          "Texto e ilustraciones creados para MIDUHO con asistencia de IA. Escudo oficial del colegio, reproducido completo sin redibujarlo.",
        ],
      },
      {
        titulo: "Fuente y dominio público",
        parrafos: [
          "Se consultó el original español de Cervantes, de dominio público. No se reprodujo material de ediciones modernas.",
        ],
        enlaces: [
          { texto: "Leer el capítulo VIII original", url: "https://www.gutenberg.org/files/2000/2000-h/2000-h.htm" },
          { texto: "Consultar la Ley 23 de 1982", url: "https://normativa.colpensiones.gov.co/colpens/docs/ley_0023_1982.htm" },
        ],
      },
    ],
    pie: "Para conversar: ¿qué pistas ve Sancho?",
  },
  {
    disposicion: "inicio-editorial",
    ilustracion: img(3),
    alt: "Don Quijote contempla la llanura por la ventana mientras descansa una mano sobre un libro abierto; a su lado están su casco y su lanza.",
    epigrafe: "Don Quijote y los molinos",
    titulo: "Un lector que quiso salir",
    parrafos: [
      "En La Mancha, un hombre leía tantas historias de caballeros que empezó a buscar aventuras en los caminos de su propio mundo. Tomó una lanza y se dio un nuevo nombre: don Quijote.",
    ],
  },
  mitad(
    4,
    "Sancho Panza, con sombrero y capa, viaja en su asno por un camino que atraviesa la llanura seca de La Mancha.",
    [
      "A su caballo lo llamó Rocinante. Quería defender a quienes necesitaran ayuda, como los caballeros de sus libros. Pero no deseaba recorrer solo aquellos caminos polvorientos.",
    ]
  ),
  mitad(
    5,
    "Don Quijote, delgado y con casco y lanza, conversa con Sancho mientras avanza sobre Rocinante; al fondo se ven molinos pequeños.",
    [
      "Invitó a su vecino Sancho Panza a acompañarlo. Le habló de hazañas y hasta de una isla que algún día podría gobernar. Sancho preparó sus alforjas y salió en su asno.",
    ]
  ),
  mitad(
    6,
    "Don Quijote señala hacia el horizonte desde su caballo. Sancho, sobre el asno, levanta una mano para advertirle algo.",
    [
      "Una mañana, varias torres aparecieron a lo lejos. Tenían aspas de madera que giraban con el viento. Sancho reconoció los molinos: sus mecanismos servían para moler el grano.",
    ]
  ),
  mitad(
    7,
    "Tres molinos de piedra se alzan entre colinas doradas; sus aspas tienen forma de grandes cruces de madera.",
    [
      "Don Quijote vio otra cosa. Para él, aquellas aspas eran brazos enormes.",
      "—¡Gigantes! —exclamó—. Voy a enfrentarlos.",
    ]
  ),
  mitad(
    8,
    "Sancho, montado en su asno, alza el brazo y llama a don Quijote, que ya se aleja por el camino.",
    [
      "—¡Son molinos de viento! —le advirtió Sancho.",
      "Volvió a gritarlo, más fuerte. Desde donde estaba podía distinguir la piedra de las torres y las tablas de las aspas. Temía que su amigo se hiciera daño.",
    ]
  ),
  mitad(
    9,
    "Don Quijote galopa sobre Rocinante con la lanza hacia un molino cuyas aspas giran con el viento.",
    [
      "Don Quijote no se detuvo. Apretó la lanza, animó a Rocinante y avanzó hacia la primera torre. El viento levantó polvo del camino y puso a girar las grandes aspas frente a él.",
    ]
  ),
  mitad(
    10,
    "Un molino sigue girando junto a Rocinante, que permanece de pie. Una lanza de madera yace rota en el suelo.",
    [
      "Una de las aspas golpeó la lanza y la partió. Don Quijote y Rocinante cayeron sobre la tierra seca. El molino siguió girando, igual que antes de su llegada.",
    ]
  ),
  mitad(
    11,
    "Sancho se arrodilla junto a don Quijote caído y le ofrece ayuda para levantarse, en medio de la llanura.",
    [
      "Sancho corrió a ayudarlo.",
      "—Se lo dije: eran molinos —insistió.",
      "Don Quijote aceptó su mano, pero explicó la caída de otro modo: un encantador había convertido a los gigantes en molinos.",
    ]
  ),
  mitad(
    12,
    "Sancho camina junto a su asno por la llanura al atardecer; detrás quedan dos molinos pequeños.",
    [
      "Sancho miró la lanza rota, la torre de piedra y las huellas en el suelo. Para él, todas aquellas pistas contaban la misma historia. Se quedó al lado de su amigo mientras retomaban el camino.",
    ]
  ),
  mitad(
    13,
    "Don Quijote se aleja a caballo por un camino iluminado por el sol bajo, con una rama corta a la espalda.",
    [
      "Don Quijote se acomodó en la silla de Rocinante. Aún estaba convencido de haber encontrado gigantes y esperaba una nueva aventura. Detrás de ambos, el viento seguía moviendo las aspas.",
    ]
  ),
  {
    disposicion: "cierre-editorial",
    ilustracion: img(14),
    alt: "Don Quijote y Sancho se alejan por un camino al atardecer; cuatro molinos quedan en las colinas de La Mancha.",
    titulo: "Dos miradas, un mismo camino",
    parrafos: [
      "Sancho vio molinos. Don Quijote vio gigantes. Miraron el mismo paisaje, pero contaron historias distintas.",
      "¿Qué pistas del relato apoyan a Sancho? ¿Por qué crees que don Quijote mantuvo su explicación?",
    ],
    pie: "Leemos, imaginamos y conversamos.",
  },
];
