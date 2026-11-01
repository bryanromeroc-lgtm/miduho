"use client";

import { useActionState } from "react";
import { cambiarContrasenaPropia, type EstadoFormulario } from "../../(auth)/acciones";
import { CampoContrasena } from "../../(auth)/campo-contrasena";
import { Aviso, BotonEnviar } from "../../(auth)/componentes";

export function FormularioCambioContrasena() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(cambiarContrasenaPropia, {});
  return (
    <form action={accion} noValidate className="acceso-formulario">
      {estado.error ? <Aviso tipo="error">{estado.error}</Aviso> : null}
      <CampoContrasena
        id="actual"
        etiqueta="Contraseña actual"
        autoComplete="current-password"
        required
        error={estado.errores?.actual}
      />
      <CampoContrasena
        id="contrasena"
        etiqueta="Nueva contraseña"
        autoComplete="new-password"
        required
        ayuda="Mínimo 10 caracteres, con al menos una letra y un número."
        error={estado.errores?.contrasena}
      />
      <CampoContrasena
        id="confirmacion"
        etiqueta="Repite la nueva contraseña"
        autoComplete="new-password"
        required
        error={estado.errores?.confirmacion}
      />
      <BotonEnviar pendiente={pendiente}>Guardar contraseña</BotonEnviar>
    </form>
  );
}
