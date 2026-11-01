import "server-only";
import { crearCatalogo, RAIZ_CURRICULO } from "./catalogo";

export const catalogoActividades = crearCatalogo(RAIZ_CURRICULO);
export { carpetaAsignatura, type ActividadDeCatalogo, type Catalogo } from "./catalogo";
