"use client";

import { useActionState } from "react";
import { cambiarContrasenaPropia, type EstadoFormulario } from "../../(auth)/acciones";
import { Aviso, BotonEnviar, Campo } from "../../(auth)/componentes";

export function FormularioCambioContrasena() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(cambiarContrasenaPropia, {});
  return (
    <form action={accion} noValidate className="flex flex-col gap-4">
      {estado.error ? <Aviso tipo="error">{estado.error}</Aviso> : null}
      <Campo
        id="actual"
        etiqueta="Contraseña actual"
        type="password"
        autoComplete="current-password"
        required
        error={estado.errores?.actual}
      />
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
        etiqueta="Repite la nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        error={estado.errores?.confirmacion}
      />
      <BotonEnviar pendiente={pendiente}>Guardar contraseña</BotonEnviar>
    </form>
  );
}
