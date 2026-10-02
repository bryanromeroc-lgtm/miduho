"use client";

import Link from "next/link";
import { useActionState } from "react";
import { pedirRecuperacion, type EstadoFormulario } from "../acciones";
import { Aviso, BotonEnviar, Campo } from "../componentes";

export function FormularioRecuperar() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(pedirRecuperacion, {});
  if (estado.ok) {
    return (
      <div className="acceso-formulario">
        <Aviso tipo="ok">
          Si el correo pertenece a una cuenta activa, te enviamos un enlace para crear una nueva contraseña. El
          enlace vence en 24 horas.
        </Aviso>
        <Link href="/login" className="acceso-enlace">
          Volver a ingresar
        </Link>
      </div>
    );
  }
  return (
    <form action={accion} noValidate className="acceso-formulario">
      <Campo id="correo" etiqueta="Correo" type="email" autoComplete="email" required error={estado.errores?.correo} />
      <BotonEnviar pendiente={pendiente}>Enviar enlace</BotonEnviar>
      <Link href="/login" className="acceso-enlace">
        Volver a ingresar
      </Link>
    </form>
  );
}
