/**
 * Banco de palabras de «La ruta de las palabras»: solo las que tienen voz
 * grabada (public/audio/palabras/<clave>.mp3). Las sílabas se declaran a mano.
 * Se dejan fuera las palabras de una sílaba y los artículos sueltos.
 * 🔶 La licencia de las voces está pendiente: ver content/referencias/.../LICENCIA.md.
 */

export type Palabra = {
  /** Nombre del archivo de voz, sin tildes ni eñe. */
  clave: string;
  /** Cómo se escribe en el cartel. */
  texto: string;
  silabas: 2 | 3 | 4;
};

// «clave:texto» cuando difieren; el número es la cantidad de sílabas.
const LISTAS: Record<2 | 3 | 4, string> = {
  2: "ajo ala boca cama capa cara carro casa cero chile cine coco dama dedo dia:día grueso humo leche loco lodo loro luna lupa mama:mamá mapa masa mesa miedo moda mono mora mula nido noche ocho ojo ola papa:papá pela pelo pera perro puma quiosco rama rata sala sapo solo sopa uno guante",
  3: "antena arana:araña arreglar asoma caballo camisa cangrejo caracol cochino cocina ciclista ciruela coyote croqueta estrella excusa flamenco florero frambuesa galleta gaviota harina iglesia libreta maleta manzana mapache mariachi martillo meloso mochila moneda muneca:muñeca naranja nevera octubre palabra paquete payaso pelado pelota pepino peineta pesado pescado platano:plátano pomelo posada recreo sabroso salado saludo semana soldado sombrilla tomate venado zapato",
  4: "actividad berenjena bicicleta calabaza camiseta carretero cocodrilo elefante enfermera ensalada escalera estornudo estudiante estupendo favorito generoso lapicero lavamanos mandarina mantequilla mariposa melocoton:melocotón panadero pantalones pelicula:película profesora saltamontes semaforo:semáforo telarana:telaraña telefono:teléfono televisor xilofono:xilófono zanahoria",
};

export const PALABRAS: Palabra[] = (Object.entries(LISTAS) as [string, string][]).flatMap(([n, lista]) =>
  lista.split(" ").map((par) => {
    const [clave, texto] = par.split(":");
    return { clave, texto: texto ?? clave, silabas: Number(n) as 2 | 3 | 4 };
  }),
);

export function palabraDe(clave: string): Palabra | undefined {
  return PALABRAS.find((p) => p.clave === clave);
}

export function rutaVoz(clave: string): string {
  return `/audio/palabras/${clave}.mp3`;
}
