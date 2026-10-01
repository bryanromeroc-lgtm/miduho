"use client";

import Link from "next/link";
import { useActionState } from "react";
import { pedirRecuperacion, type EstadoFormulario } from "../acciones";
import { Aviso, BotonEnviar, Campo } from "../componentes";

export function FormularioRecuperar() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(pedirRecuperacion, {});
  if (estado.ok) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tipo="ok">
          Si el correo pertenece a una cuenta activa, te enviamos un enlace para crear una nueva contraseña. El
          enlace vence en 24 horas.
        </Aviso>
        <Link href="/login" className="text-sm font-medium text-[#00658B] underline underline-offset-4">
          Volver a ingresar
        </Link>
      </div>
    );
  }
  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-neutral-700">
        Escribe el correo con el que ingresas. Te enviaremos un enlace para crear una nueva contraseña.
      </p>
      <Campo id="correo" etiqueta="Correo" type="email" autoComplete="email" required error={estado.errores?.correo} />
      <BotonEnviar pendiente={pendiente}>Enviar enlace</BotonEnviar>
      <Link href="/login" className="text-sm font-medium text-[#00658B] underline underline-offset-4">
        Volver a ingresar
      </Link>
    </form>
  );
}
