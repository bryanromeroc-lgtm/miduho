import type { PaginaCompuesta } from "@/features/biblioteca/libros";

/*
  LA ORQUESTA DE LA LLUVIA — páginas compuestas.

  Obra original de MIDUHO: texto propio e ilustraciones generadas para este
  proyecto con asistencia de IA. No deriva de ninguna obra de terceros.

  Las cinco escenas narrativas son ilustraciones continuas a doble página,
  partidas en dos mitades (i02–i03, i04–i05 … i10–i11). Ninguna imagen trae
  letras: el texto vive aquí y el lector lo maqueta como HTML sobre la zona
  superior clara de cada mitad, así se selecciona, se busca y lo lee un
  lector de pantalla. Cada mitad tiene su propia descripción alternativa,
  porque a hoja suelta (móvil) se ve sin su pareja.

  Las imágenes viven en /public (y no en el volumen /libros) para que el
  despliegue standalone no dependa del volumen de libros de terceros.
*/

export const CARPETA_ORQUESTA = "/images/biblioteca/la-orquesta-de-la-lluvia";

const I = CARPETA_ORQUESTA;
const img = (n: number) => `${I}/i${String(n).padStart(2, "0")}.webp`;

/* Mitad de un pliego. Las pares van a la izquierda del lomo y las impares a
   la derecha: así las empareja el lector (2-3, 4-5…). */
const mitad = (n: number, alt: string, parrafos: string[]): PaginaCompuesta => ({
  disposicion: "pliego",
  ilustracion: img(n),
  alt,
  mitad: n % 2 === 0 ? "izquierda" : "derecha",
  parrafos,
});

export const PAGINAS_ORQUESTA: PaginaCompuesta[] = [
  {
    disposicion: "portada",
    ilustracion: img(1),
    alt: "Un copetón de cresta rojiza y una rana verde miran felices la lluvia en un patio de baldosas de barro, junto a un charco, una matera grande y una casa de tejas con columnas azules.",
    titulo: "La orquesta de la lluvia",
    parrafos: ["Una historia original de MIDUHO"],
  },
  mitad(
    2,
    "Bajo un árbol de hojas grandes, un copetón levanta el pico hacia las gotas que caen de las hojas. Detrás hay un corredor con tejas y columnas azules, y en el piso mojado se forma un charco.",
    [
      "Una tarde de lluvia, un copetón oyó un sonido nuevo en el patio: plin… plin… plin. Venía de las hojas junto al salón.",
    ]
  ),
  mitad(
    3,
    "Una rana sonriente descansa junto a un charco en el patio mojado. A su lado, una gota salpica dentro de una matera de barro; al fondo se ven montañas verdes y la torre de una iglesia.",
    [
      "La rana, que se refugiaba cerca de una matera, señaló otro sonido: pom… pom. Las gotas golpeaban el borde de barro.",
    ]
  ),
  mitad(
    4,
    "El copetón, inclinado y con prisa, golpea el charco con una ramita y levanta salpicaduras por todas partes, frente al corredor de columnas azules.",
    [
      "El copetón quiso tocarlos todos con una ramita. ¡Tac, tac, tac! Se apresuró tanto que ya no distinguía la lluvia.",
    ]
  ),
  mitad(
    5,
    "La rana levanta una mano, como pidiendo una pausa, mientras la lluvia cae sobre el patio, los charcos y la matera de barro.",
    [
      "—Probemos de otra manera —propuso la rana—. Primero, escuchemos.",
      "Los dos guardaron silencio un momento.",
    ]
  ),
  mitad(
    6,
    "Una gota cuelga de la punta de una hoja grande. Debajo, el copetón y la rana esperan quietos sobre las baldosas mojadas, atentos a lo que va a caer.",
    [
      "Una gota cayó en la hoja: plin. Otra, en la matera: pom. Una más saltó en el charco: plas.",
    ]
  ),
  mitad(
    7,
    "Cae una gota dentro de la matera de barro y otra rebota en un charco del patio, entre flores rosadas y el corredor de la escuela.",
    [
      "—Plin, pom, plas —repitió despacio el copetón.",
      "La rana sonrió: los tres sonidos volvían a empezar en el mismo orden.",
    ]
  ),
  mitad(
    8,
    "El copetón toca el agua con suavidad usando la punta de su ramita, y se forman círculos pequeños en el charco.",
    [
      "El copetón marcó «plin» con un toque suave. La rana respondió «pom» con una palmada en el agua. La lluvia puso el «plas».",
    ]
  ),
  mitad(
    9,
    "La rana da una palmada en el charco y salpica, mientras una gota cae en la matera de barro bajo la lluvia.",
    [
      "Al principio se cruzaron. Entonces esperaron su turno. Plin, pom, plas. Plin, pom, plas.",
      "¡Ahora podían seguirse sin dejar de escucharse!",
    ]
  ),
  mitad(
    10,
    "Ya no llueve. El copetón y la rana, con los ojos cerrados y una sonrisa tranquila, recuerdan su ritmo en el patio mojado.",
    [
      "Cuando escampó, el patio quedó en calma. La rana hizo «pom» y el copetón, «plin»; luego dejaron un espacio para recordar el «plas».",
    ]
  ),
  mitad(
    11,
    "El sol sale detrás de las montañas e ilumina el patio. Dos mariposas amarillas vuelan sobre el tejado, donde descansan dos pajaritos, y el charco refleja la luz.",
    [
      "—Nuestra canción empezó cuando escuchamos juntos —dijo la rana.",
      "¿Puedes repetir el ritmo con palmas? Suave, suave, fuerte. ¡Ahora crea uno propio!",
    ]
  ),
  {
    disposicion: "contraportada",
    ilustracion: img(12),
    alt: "La lluvia cesó en el patio: unas gotas cuelgan de una hoja sobre una matera de barro, mientras el copetón y la rana se alejan juntos por el camino iluminado.",
    titulo: "La orquesta de la lluvia",
    parrafos: [
      "Una tarde de lluvia, un copetón y una rana descubren los sonidos del patio. Cuando dejan de apresurarse, escuchan y toman turnos, construyen juntos un ritmo para compartir.",
      "Para lectores de 6 a 8 años.",
      "Texto original para MIDUHO. Ilustraciones generadas para este proyecto con asistencia de IA.",
    ],
  },
];
