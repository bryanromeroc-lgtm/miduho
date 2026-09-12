import type { PaginaCompuesta } from "@/lib/libros";

/*
  UNA SONRISA DE MARIPOSA — páginas compuestas.

  El PDF de origen (StoryWeaver, Pratham Books) trae ilustraciones grandes y
  un texto pequeño en A4 apaisado: rasterizado a la medida del lector el
  texto quedaría de 4–6 px de alto. Por eso el libro no se sirve como
  imágenes de página sino como ilustración + texto real, y el lector lo
  compone con tipografía escalada al tamaño de la hoja.

  La disposición de cada página respeta la del libro original: ilustración
  vertical al lado del texto, apaisada encima, o de página completa con el
  texto en el hueco blanco que la propia ilustración deja arriba.

  Texto: traducción de Aboli Chowdhary (CC BY 4.0) con correcciones menores
  de concordancia y puntuación para esta edición, indicadas en los créditos
  como pide la licencia.
*/

const I = "/libros/una-sonrisa-de-mariposa";

export const PAGINAS_SONRISA: PaginaCompuesta[] = [
  {
    disposicion: "portada",
    ilustracion: `${I}/i01.webp`,
    titulo: "Una sonrisa de mariposa",
    parrafos: [
      "Autora: Mathangi Subramanian",
      "Ilustradora: Lavanya Naidu",
      "Traductora: Aboli Chowdhary",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i02.webp`,
    parrafos: [
      "«¡Hagan una fila, niños! Vamos al parque», dice la profesora Laila.",
      "Todos los estudiantes se toman de las manos mientras charlan, pero Kavya está parada sola.",
      "Cuando empiezan a caminar, la profesora Laila pregunta: «¿Alguien sabe en qué se convierte una oruga cuando crece?».",
      "Kavya siente un cosquilleo en el estómago. ¡Ella sabe la respuesta! ¿Debería decir algo?",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i03.webp`,
    parrafos: [
      "Kavya y su familia acaban de mudarse a Bangalore desde su pueblo.",
      "Viven en una obra de construcción donde trabajan sus padres.",
      "Es difícil vivir en una casa a medio terminar. El aire huele a humo, y las bocinas de los coches hacen difícil dormir. Los edificios altísimos, el zumbido de los coches y la gente ocupada la hacen sentir muy, muy pequeña.",
    ],
  },
  {
    disposicion: "arriba",
    ilustracion: `${I}/i04.webp`,
    parrafos: [
      "Kavya ha estado asistiendo a la escuela desde hace una semana. Todavía no ha hablado con nadie.",
      "¿Y si se burlan de su acento? ¿O le toman el pelo porque nunca ha ido a la escuela?",
      "Kavya respira profundamente y levanta la mano. En una ciudad ruidosa como Bangalore, no puede estar callada para siempre.",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i05.webp`,
    parrafos: [
      "«Cuando las orugas crecen, se convierten en mariposas», dice Kavya.",
      "«¡Eso es!», dice la profesora Laila.",
      "«Las orugas son solo orugas durante unas semanas», dice Kavya. «Se pasan todo ese tiempo comiendo hojas».",
      "«Deben crecer mucho», dice María, su compañera de clase.",
      "«¡Crecen muchísimo!».",
      "«Después de comer, comer y comer, las orugas tejen capullos a los lados de las plantas, entran dentro, y allí siguen creciendo y cambian», dice Kavya.",
    ],
  },
  {
    disposicion: "arriba",
    ilustracion: `${I}/i06.webp`,
    parrafos: [
      "«Eso es correcto», dice la profesora. «Se quedan en los capullos durante dos semanas, y cuando salen, son mariposas».",
      "«¡Mira, estamos en el parque!», dice María.",
      "Kavya se queda asombrada. ¡El parque está lleno de mariposas!",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i07.webp`,
    parrafos: [
      "Mariposas azules como los ríos.",
      "Mariposas amarillas como la luz del sol.",
      "Mariposas anaranjadas como las piñas maduras.",
      "Mariposas negras y blancas como el cielo estrellado.",
      "Estos son todos los colores que Kavya extraña de su pueblo.",
      "Ella siente su corazón revolotear.",
    ],
  },
  {
    disposicion: "arriba",
    ilustracion: `${I}/i08.webp`,
    parrafos: [
      "«Cada año, las mariposas viajan miles de kilómetros para llegar a este parque. Vienen aquí en búsqueda de más comida, un clima más agradable y un lugar seguro para poner los huevos», dice la profesora. «Este viaje se llama migración».",
    ],
  },
  {
    disposicion: "fondo",
    ilustracion: `${I}/i09.webp`,
    textoAlineado: "izquierda",
    parrafos: [
      "«¿No se cansan, aleteando las alas durante tanto tiempo?», pregunta un compañero de clase.",
      "«Si el viento es fuerte, no necesitan batir sus alas», dice Kavya. «Extienden sus alas y planean».",
      "«Eso debe ser un viaje con mucha turbulencia», le susurra María a Kavya.",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i10.webp`,
    parrafos: [
      "Kavya piensa en el viaje en autobús a Bangalore: estuvo apretada entre todo el equipaje. Viajó golpeándose y zarandeándose durante horas y horas y horas.",
      "¿Es así como una mariposa se siente en el viento?",
    ],
  },
  {
    disposicion: "lado",
    ilustracion: `${I}/i11.webp`,
    parrafos: [
      "«Cuando las mariposas migran, siguen los ríos y, para mantenerse saludables, se detienen a lo largo de la orilla para absorber los minerales con sus patas. A eso lo llaman “encharcamiento”», dice la profesora Laila.",
      "«¿Encharcamiento?», dice María. «Parece divertido».",
      "María y Kavya se sonríen.",
      "«Lo es», dice Kavya. «Pero ahora los charcos son difíciles de encontrar».",
      "En la aldea de Kavya, hombres en camiones sacan la arena del río. El clima se hace cada vez más caliente. Cada vez hay menos lluvia.",
    ],
  },
  {
    disposicion: "fondo",
    ilustracion: `${I}/i12.webp`,
    textoAlineado: "derecha",
    parrafos: [
      "El año pasado, el río se secó. Las mariposas no tuvieron suficiente agua para “encharcarse”.",
      "La familia de Kavya no tuvo suficiente agua para cultivar.",
      "Por eso se mudaron a Bangalore.",
    ],
  },
  {
    disposicion: "fondo",
    ilustracion: `${I}/i13.webp`,
    textoAlineado: "izquierda",
    parrafos: [
      "«Sabes mucho sobre las mariposas, Kavya», dice la profesora Laila.",
      "«Eso es porque son mis insectos favoritos», dice Kavya.",
      "«¿Por qué te gustan tanto las mariposas, Kavya?», pregunta María.",
      "¿Cómo puede elegir Kavya solo una cosa?",
      "Ella ama cómo sus alas son a veces manchadas y otras veces rayadas. Cómo beben el néctar con sus largas narices. Cómo propagan el polen, que ayuda a crecer más flores.",
    ],
  },
  {
    disposicion: "fondo",
    ilustracion: `${I}/i14.webp`,
  },
  {
    disposicion: "arriba",
    ilustracion: `${I}/i15.webp`,
    parrafos: [
      "«Vuelan muy lejos, pero dondequiera que aterricen, hacen nuevos amigos», dice Kavya, apretando la mano de María. «Son muy pequeñas, pero también son muy valientes».",
      "«Igual que tú», dice la profesora Laila.",
      "Kavya sonríe una sonrisa tan amplia como las alas de una mariposa.",
    ],
  },
  {
    disposicion: "fondo",
    ilustracion: `${I}/i16.webp`,
    textoAlineado: "derecha",
    titulo: "Haz una estación de descanso para mariposas",
    parrafos: [
      "Las mariposas de la India migran dos veces al año. Su viaje es cada vez más difícil porque nuestros bosques y ríos están desapareciendo. Las mariposas no tienen suficientes lugares para descansar. Muchas se cansan en el camino.",
      "Una forma de ayudar a las mariposas es hacer espacios seguros para que se paren y tengan una buena comida.",
    ],
  },
  {
    disposicion: "pasos",
    ilustracion: `${I}/i17.webp`,
    titulo: "Cómo hacer una estación de descanso para mariposas",
    parrafos: [
      "Encuentra un recipiente plano con bordes altos, como un platillo.",
      "A las mariposas les encantan los colores llamativos. Pinta el recipiente de rojo, amarillo o naranja.",
      "Llena el recipiente con comida para mariposas. ¡Es fácil de hacer! Mezcla cuatro tazas de agua con una taza de azúcar.",
    ],
  },
  {
    disposicion: "pasos",
    ilustracion: `${I}/i18.webp`,
    inicio: 4,
    parrafos: [
      "Añade trozos de fruta demasiado madura. Las mariposas aman plátanos, guayabas, mangos, papayas y naranjas.",
      "Mantén el recipiente en tu terraza, ventana, o en cualquier lugar fuera.",
      "Limpia y vuelve a llenar el recipiente cada dos o tres días.",
      "Para atraer aún más mariposas, puedes plantar sus flores favoritas: verbena, geranios, dalias o girasoles. No necesitas mucho espacio: puedes plantarlas en macetas o en la repisa de la ventana.",
    ],
  },
  {
    /* La licencia CC BY 4.0 exige atribuir e indicar cambios: esta página
       sustituye las dos de letra diminuta del PDF por una legible. */
    disposicion: "creditos",
    ilustracion: `${I}/storyweaver.webp`,
    titulo: "Créditos",
    parrafos: [
      "«Una sonrisa de mariposa» es la traducción al español de Aboli Chowdhary (© Aboli Chowdhary, 2020) de la historia original «A Butterfly Smile», de Mathangi Subramanian (© Pratham Books, 2017).",
      "Ilustraciones de Lavanya Naidu, © Pratham Books, 2017.",
      "Publicado bajo licencia Creative Commons Atribución 4.0 (CC BY 4.0) en la plataforma StoryWeaver de Pratham Books: storyweaver.org.in.",
      "Edición MIDUHO: las páginas se recompusieron para la lectura en pantalla y el texto lleva correcciones menores de concordancia y puntuación.",
    ],
  },
  {
    disposicion: "contraportada",
    ilustracion: `${I}/i08.webp`,
    titulo: "Una sonrisa de mariposa",
    parrafos: [
      "La familia de Kavya acaba de mudarse de su aldea a Bangalore. Ella es la niña nueva en la escuela. ¡Da un paseo con Kavya por el parque, donde conecta con las mariposas y a la vez hace su primera amiga en la ciudad!",
      "Nivel 3 · Para niñas y niños que ya leen por su cuenta.",
    ],
  },
];
