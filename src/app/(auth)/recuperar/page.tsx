import type { Metadata } from "next";
import { Tarjeta } from "../componentes";
import { FormularioRecuperar } from "./formulario";

export const metadata: Metadata = { title: "Recuperar contraseña · MIDUHO" };

export default function PaginaRecuperar() {
  return (
    <Tarjeta titulo="Recuperar contraseña">
      <FormularioRecuperar />
    </Tarjeta>
  );
}
