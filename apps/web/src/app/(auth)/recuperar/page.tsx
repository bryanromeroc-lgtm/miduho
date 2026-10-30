import type { Metadata } from "next";
import { Tarjeta } from "../componentes";
import { FormularioRecuperar } from "./formulario";

export const metadata: Metadata = { title: "Recuperar contraseña · MIDUHO" };

export default function PaginaRecuperar() {
  return (
    <Tarjeta
      titulo="Recuperar contraseña"
      bajada="Escribe el correo con el que ingresas y te enviaremos un enlace para crear una nueva contraseña. Si eres estudiante, pide a tu docente que la restablezca."
    >
      <FormularioRecuperar />
    </Tarjeta>
  );
}
