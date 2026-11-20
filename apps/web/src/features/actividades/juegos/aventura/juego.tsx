"use client";

import type { PropsJuego } from "../../reproductor/comun";
import type { ContenidoAventura } from "./tipo";
import { JuegoAventuraClasica } from "./clasica";
import { JuegoAventuraNarrada } from "./narrada";

export function JuegoAventura(props: PropsJuego<ContenidoAventura>) {
  return props.contenido.carga && !props.contenido.escena && !props.contenido.secuencia
    ? <JuegoAventuraClasica {...props} />
    : <JuegoAventuraNarrada {...props} />;
}
