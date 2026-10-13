import type { PaginaCompuesta } from "@/lib/libros";

/*
  TULA Y EL MURAL DEL BOSQUE — páginas compuestas.

  El PDF de origen es una maqueta de libro: cada página es una imagen con la
  ilustración a la izquierda y el texto horneado a la derecha, sin una sola
  letra seleccionable. Aquí la ilustración se recorta del pliego y el texto
  se transcribe tal cual, para que sea legible, buscable y lo lea un lector
  de pantalla.
*/

const I = "/libros/tula-y-el-mural-del-bosque";

const lado = (n: number, parrafos: string[]): PaginaCompuesta => ({
  disposicion: "lado",
  ilustracion: `${I}/i${String(n).padStart(2, "0")}.webp`,
  parrafos,
});

export const PAGINAS_TULA: PaginaCompuesta[] = [
  {
    disposicion: "portada",
    ilustracion: `${I}/i01.webp`,
    titulo: "Tula y el mural del bosque",
    parrafos: ["De Bryan Romero"],
  },
  lado(2, [
    "Tula llegó al claro del bosque con su caja de seis pinturas. El sol brillaba entre las hojas de los árboles y la hierba estaba fresca y suave. «Hoy pintaré el cuadro más bonito del mundo», dijo muy convencida mientras abría su pequeña caja de madera.",
  ]),
  lado(3, [
    "Tula se puso manos a la obra. Pintó una flor roja muy alta y una mariposa azul que parecía volar sobre el papel. En ese momento, Leo el conejo se acercó saltando. Miró los colores con curiosidad y preguntó: «¡Qué bonito, Tula! ¿Me prestas el amarillo para dibujar un sol?».",
  ]),
  lado(4, [
    "Tula sintió un poquito de miedo de que sus pinturas se gastaran o se ensuciaran. Rápidamente, abrazó su caja contra su caparazón verde oliva. «Prefiero usar mis pinturas yo sola», respondió en voz baja. Leo se sintió un poco triste, pero asintió con la cabeza y aceptó esperar.",
  ]),
  lado(5, [
    "Mientras Tula seguía con su dibujo, Leo buscó una rama caída y comenzó a dibujar formas en la tierra. Entonces, llegó Pía volando. Traía en su pico un papel enorme, ¡el más grande que habían visto nunca! «¡Traigo papel para hacer un mural entre todos!», anunció Pía emocionada.",
  ]),
  lado(6, [
    "De repente, un viento travieso sopló con fuerza entre los arbustos. ¡Zas! El papel enorme salió volando por los aires. Tula y Leo se olvidaron de todo y corrieron tras él. «¡Sujétalo por ese lado, Leo!», gritó Tula mientras estiraba sus patitas para alcanzar una esquina del papel que ondeaba.",
  ]),
  lado(7, [
    "Tula y Leo lograron atrapar el papel contra el suelo. Pía aterrizó sobre ellos para ayudar a que no se moviera más. Tula se dio cuenta de que, sin sus amigos, el papel se habría perdido. «Gracias por la ayuda», dijo Tula con una sonrisa. «Vamos a pintar el mural. Podemos turnarnos y cuidar mucho las pinturas entre todos».",
  ]),
  lado(8, [
    "Se pusieron a trabajar con mucha alegría. Leo usó el color amarillo para dibujar un sol radiante en la esquina superior. Pía, con mucho cuidado de no derramar nada, empezó a pintar unas nubes de color azul muy clarito. Tula observaba cómo el papel blanco se llenaba de vida gracias al esfuerzo compartido.",
  ]),
  lado(9, [
    "Tula quería pintar un camino que cruzara todo el mural, pero Pía estaba usando el pincel del color azul para las últimas nubes. En lugar de enfadarse, Tula se sentó tranquila. «Esperaré mi turno, Pía», dijo Tula. Pía le agradeció su paciencia y, en cuanto terminó, limpió el pincel y se lo pasó con cuidado.",
  ]),
  lado(10, [
    "Pasaron la tarde trabajando en equipo. Cuando alguien terminaba de usar un color, ponía la tapa al bote para que no se secara. Al final, Leo y Tula fueron al arroyo cercano para limpiar los pinceles, dejándolos suaves y listos para la próxima vez. Entre todos, habían creado un bosque colorido y vibrante en el papel.",
  ]),
  lado(11, [
    "El mural estaba terminado y colgado de dos robles viejos. Tula se sentía muy feliz; se dio cuenta de que seguía teniendo sus seis pinturas y que, además, ahora tenía una tarde hermosa para recordar con sus amigos. «Cuando compartimos y cuidamos juntos, la alegría alcanza para más», concluyó Tula.",
  ]),
  {
    disposicion: "contraportada",
    ilustracion: `${I}/i12.webp`,
    titulo: "Tula y el mural del bosque",
    parrafos: [
      "Tula ama sus pinturas, pero hoy aprenderá que los colores brillan más cuando se usan en compañía. Una historia sobre la generosidad, la paciencia y el valor de cuidar lo que tenemos para poder disfrutarlo con los demás.",
      "De Bryan Romero.",
    ],
  },
];
