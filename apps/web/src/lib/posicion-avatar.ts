/**
 * Dónde se posa el avatar (D6): sobre la esquina superior del cromo elegido.
 * Función pura: de un índice en la lista de materias saca la página, la
 * columna y la fila dentro de la cuadrícula. El CSS convierte columna y fila
 * en un desplazamiento, así el salto se anima con transform y no con top/left.
 */

export const POR_PAGINA = 10;

export type PosicionAvatar = { pagina: number; columna: number; fila: number };

export function posicionAvatar(indice: number, columnas = 5, porPagina = POR_PAGINA): PosicionAvatar {
  const i = Math.max(0, Math.floor(indice));
  const c = Math.max(1, Math.floor(columnas));
  const enPagina = i % porPagina;
  return { pagina: Math.floor(i / porPagina), columna: enPagina % c, fila: Math.floor(enPagina / c) };
}

export function totalPaginas(cantidad: number, porPagina = POR_PAGINA): number {
  return Math.max(1, Math.ceil(cantidad / porPagina));
}
