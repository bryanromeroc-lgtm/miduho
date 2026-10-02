"use client";

import { useActionState } from "react";
import { guardarNuevaContrasena, type EstadoFormulario } from "../../acciones";
import { Aviso, BotonEnviar, Campo } from "../../componentes";

export function FormularioNuevaContrasena({ token }: { token: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(guardarNuevaContrasena, {});
  const errorToken = estado.error ?? estado.errores?.token;
  return (
    <form action={accion} noValidate className="acceso-formulario">
      {errorToken ? (
        <Aviso tipo="error">
          {errorToken}{" "}
          <a href="/recuperar" className="acceso-enlace-aviso">
            Pedir otro enlace
          </a>
        </Aviso>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <Campo
        id="contrasena"
        etiqueta="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        ayuda="Mínimo 10 caracteres, con al menos una letra y un número."
        error={estado.errores?.contrasena}
      />
      <Campo
        id="confirmacion"
        etiqueta="Repite la contraseña"
        type="password"
        autoComplete="new-password"
        required
        error={estado.errores?.confirmacion}
      />
      <BotonEnviar pendiente={pendiente}>Guardar contraseña</BotonEnviar>
    </form>
  );
}
