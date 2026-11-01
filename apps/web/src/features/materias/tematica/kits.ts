/**
 * Catálogo de kits temáticos (fuente de verdad: D4 de
 * openspec/changes/vistas-de-materia/design.md). Temática estricta: cada id
 * nombra un objeto de esa materia y no se repite en otra; solo `generica`
 * puede compartir ids, porque no tiene un tema propio que honrar.
 */
import type { Escena } from "@/lib/escenas";
import type { DeclaracionKit } from "./tipos";

export const DECLARACIONES: Record<Escena, DeclaracionKit> = {
  matematicas: {
    escena: "matematicas",
    cabecera: ["regla", "compas", "escuadra", "numeros"],
    sueltos: ["lapiz-mate", "transportador", "ficha-siete", "igual"],
    marcas: ["mas", "menos", "por", "entre", "menor", "mayor", "igual-marca", "dos", "tres"],
    utileria: {
      clip: "clip-papel",
      cinta: "cinta-cuadriculada",
      chinche: "chinche-ficha",
    },
    marco: "marco-regla",
  },
  lectura: {
    escena: "lectura",
    cabecera: ["libro-abierto", "pluma", "letras-abc", "marcalibros"],
    sueltos: ["libro-cerrado", "tintero", "letra-ene", "comillas"],
    marcas: ["letra-a", "letra-b", "letra-enie", "pregunta-abre", "pregunta-cierra", "comilla-abre", "comilla-cierra"],
    utileria: { clip: "clip-marcapaginas", cinta: "cinta-renglones", chinche: "chinche-punto" },
    marco: "marco-renglones",
  },
  naturales: {
    escena: "naturales",
    cabecera: ["tubos-ensayo", "lupa", "microscopio", "hoja-grande"],
    sueltos: ["hoja-suelta", "gota-agua", "brote", "mariposa"],
    marcas: ["semilla", "hoja-marca", "huella", "gota-marca"],
    utileria: { clip: "clip-pinza", cinta: "cinta-hojas", chinche: "chinche-gota" },
    marco: "marco-hojas",
  },
  ingles: {
    escena: "ingles",
    cabecera: ["globo-hello", "globo-yes", "audifonos", "abecedario"],
    sueltos: ["globo-hi", "cubo-abc", "microfono"],
    marcas: ["hi-marca", "abc-marca", "yes-marca", "globo-marca"],
    utileria: { clip: "clip-globo", cinta: "cinta-abc", chinche: "chinche-exclamacion" },
    marco: "marco-globo",
  },
  robotica: {
    escena: "robotica",
    cabecera: ["engranajes", "brazo-mecanico", "placa-circuito", "tornillo-tuerca"],
    sueltos: ["engranaje-solo", "tuerca", "bateria"],
    marcas: ["cero", "uno", "engranaje-marca", "pista-circuito"],
    utileria: { clip: "clip-tornillo", cinta: "cinta-cable-plano", chinche: "chinche-led" },
    marco: "marco-circuito",
  },
  emprendimiento: {
    escena: "emprendimiento",
    cabecera: ["alcancia", "toldo-tienda", "bombillo-idea", "pila-monedas"],
    sueltos: ["moneda-suelta", "grafico-crece", "billete"],
    marcas: ["pesos", "barras", "bombillo-marca"],
    utileria: { clip: "clip-etiqueta", cinta: "cinta-monedas", chinche: "chinche-moneda" },
    marco: "marco-toldo",
  },
  etica: {
    escena: "etica",
    cabecera: ["manos-unidas", "corazon-grande", "balanza", "paloma-paz"],
    sueltos: ["corazon-suelto", "rama-paz", "mano-saludo"],
    marcas: ["corazon-marca", "mano-marca", "balanza-marca"],
    utileria: { clip: "clip-corazon", cinta: "cinta-manitas", chinche: "chinche-estrella" },
    marco: "marco-guirnalda",
  },
  artistica: {
    escena: "artistica",
    cabecera: ["paleta", "pincel", "acuarelas", "notas-musicales"],
    sueltos: ["tubo-pintura", "nota-corchea", "crayon"],
    marcas: ["nota-marca", "gota-pintura-marca", "pincelada-marca", "clave-sol"],
    utileria: { clip: "clip-pincel", cinta: "cinta-pinceladas", chinche: "chinche-gota-pintura" },
    marco: "marco-pinceladas",
  },
  fisica: {
    escena: "fisica",
    cabecera: ["pendulo", "iman-herradura", "polea", "prisma-luz"],
    sueltos: ["resorte", "onda-suelta", "rampa"],
    marcas: ["flecha-fuerza", "iman-marca", "rayo-luz", "onda-marca"],
    utileria: { clip: "clip-iman", cinta: "cinta-onda", chinche: "chinche-esfera" },
    marco: "marco-onda",
  },
  sociales: {
    escena: "sociales",
    cabecera: ["globo-terraqueo", "mapa-doblado", "brujula", "pergamino"],
    sueltos: ["bandera-colombia", "catalejo", "reloj-arena"],
    marcas: ["rosa-vientos", "meridiano", "pin-marca"],
    utileria: { clip: "clip-brujula", cinta: "cinta-mapa", chinche: "chinche-pin" },
    marco: "marco-meridianos",
  },
  generica: {
    escena: "generica",
    cabecera: ["cuaderno", "lapiz", "regla", "estrella"],
    sueltos: ["lapiz", "estrella", "borrador"],
    marcas: ["estrella", "linea", "punto"],
    utileria: { clip: "clip", cinta: "cinta-lisa", chinche: "chinche" },
    marco: "marco-liso",
  },
};

/** Elementos que no pertenecen a ninguna materia y quedan prohibidos en el catálogo. */
export const PROHIBIDOS = ["arbol", "bosque", "madera", "tronco", "pino", "montana", "paisaje", "colina", "nube"];

/** Ids de todos los elementos de una declaración. */
export function idsDe(k: DeclaracionKit): string[] {
  return [...k.cabecera, ...k.sueltos, ...k.marcas, k.utileria.clip, k.utileria.cinta, k.utileria.chinche, k.marco];
}
