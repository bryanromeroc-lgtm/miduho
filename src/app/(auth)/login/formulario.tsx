"use client";

import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesion, type EstadoFormulario } from "../acciones";
import { Aviso, BotonEnviar, Campo } from "../componentes";

export function FormularioLogin({ desde, restablecida }: { desde?: string; restablecida: boolean }) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(iniciarSesion, {});
  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      {restablecida && !estado.error ? (
        <Aviso tipo="ok">Tu contraseña se actualizó. Ya puedes ingresar.</Aviso>
      ) : null}
      {estado.error ? <Aviso tipo="error">{estado.error}</Aviso> : null}
      <input type="hidden" name="desde" value={desde ?? ""} />
      <Campo id="correo" etiqueta="Correo" type="email" autoComplete="email" required error={estado.errores?.correo} />
      <Campo
        id="contrasena"
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        error={estado.errores?.contrasena}
      />
      <BotonEnviar pendiente={pendiente}>Ingresar</BotonEnviar>
      <Link href="/recuperar" className="text-sm font-medium text-[#00658B] underline underline-offset-4">
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  );
}
