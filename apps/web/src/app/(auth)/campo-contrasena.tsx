"use client";

import { useState, type ComponentProps } from "react";
import { Campo } from "./componentes";

/**
 * Campo de contraseña con el botón de ojo: alterna entre ocultar y mostrar
 * sin perder lo escrito. El botón anuncia la acción que hará.
 */
export function CampoContrasena(props: Omit<ComponentProps<typeof Campo>, "type" | "accesorio">) {
  const [visible, setVisible] = useState(false);
  return (
    <Campo
      {...props}
      type={visible ? "text" : "password"}
      accesorio={
        <button
          type="button"
          className="acceso-ojo"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-controls={props.id}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
            <path
              d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
            {visible ? (
              <path d="M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : null}
          </svg>
        </button>
      }
    />
  );
}
