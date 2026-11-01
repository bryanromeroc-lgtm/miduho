"use client";

import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesion, type EstadoFormulario } from "../acciones";
import { CampoContrasena } from "../campo-contrasena";
import { Aviso, BotonEnviar, Campo } from "../componentes";

export function FormularioLogin({ desde, restablecida }: { desde?: string; restablecida: boolean }) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(iniciarSesion, {});
  return (
    <form action={accion} noValidate className="acceso-formulario">
      {restablecida && !estado.error ? (
        <Aviso tipo="ok">Tu contraseña se actualizó. Ya puedes ingresar.</Aviso>
      ) : null}
      {estado.error ? <Aviso tipo="error">{estado.error}</Aviso> : null}
      <input type="hidden" name="desde" value={desde ?? ""} />
      <Campo
        id="correo"
        etiqueta="Correo"
        type="email"
        autoComplete="email"
        placeholder="Escribe tu correo"
        required
        error={estado.errores?.correo}
      />
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña"
        autoComplete="current-password"
        required
        error={estado.errores?.contrasena}
      />
      <Link href="/recuperar" className="acceso-enlace acceso-enlace-olvido">
        ¿Olvidaste tu contraseña?
      </Link>
      <BotonEnviar pendiente={pendiente} textoPendiente="Ingresando…">
        Ingresar
      </BotonEnviar>
    </form>
  );
}
