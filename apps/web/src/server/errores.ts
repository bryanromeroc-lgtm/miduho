/** Error de dominio con código estable y mensaje en español apto para la UI. */
export class ErrorDominio extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ErrorDominio";
  }
}

export const noEncontrado = (que: string) => new ErrorDominio("NO_ENCONTRADO", `${que} no existe.`, 404);
export const conflicto = (code: string, message: string) => new ErrorDominio(code, message, 409);
