import type { Escena } from "@/lib/escenas";
import { arteArtistica } from "./arte/artistica";
import { arteEmprendimiento } from "./arte/emprendimiento";
import { arteEtica } from "./arte/etica";
import { arteFisica } from "./arte/fisica";
import { arteGenerica } from "./arte/generica";
import { arteIngles } from "./arte/ingles";
import { arteLectura } from "./arte/lectura";
import { arteMatematicas } from "./arte/matematicas";
import { arteNaturales } from "./arte/naturales";
import { arteRobotica } from "./arte/robotica";
import { arteSociales } from "./arte/sociales";
import { DECLARACIONES } from "./kits";
import type { ArteKit, Kit } from "./tipos";

export { TOKENS, variablesDe, type TokensMateria } from "./tokens";
export type { Kit } from "./tipos";

export const ARTE: Record<Escena, ArteKit> = {
  lectura: arteLectura,
  matematicas: arteMatematicas,
  naturales: arteNaturales,
  ingles: arteIngles,
  robotica: arteRobotica,
  emprendimiento: arteEmprendimiento,
  etica: arteEtica,
  artistica: arteArtistica,
  fisica: arteFisica,
  sociales: arteSociales,
  generica: arteGenerica,
};

/** Kit temático de la escena (D2): cada materia tiene el suyo; sin coincidencia, `generica`. */
export function kitDe(escena: Escena): Kit {
  return { ...DECLARACIONES[escena], arte: ARTE[escena] };
}
