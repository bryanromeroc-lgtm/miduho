"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import s from "./vista.module.css";

const CLAVE = "miduho:materia-vista:";

/*
  Huella corta y no reversible de la cuenta (FNV-1a de 32 bits): separa a los
  estudiantes que comparten una tableta sin guardar su correo en el navegador.
*/
export function huellaCuenta(cuenta: string): string {
  let h = 0x811c9dc5;
  for (const c of cuenta) {
    h ^= c.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/*
  Primera visita a una materia (onboard): un aviso breve en la barra del
  encabezado —no tapa tarjetas ni cambia el alto de la vista— hasta que se
  cierra con «¡Listo!». Se recuerda por estudiante y materia en este
  navegador (las tabletas del colegio se comparten); sin almacenamiento, no
  aparece.
*/
function yaVista(clave: string): boolean {
  try {
    return localStorage.getItem(clave) !== null;
  } catch {
    // Sin almacenamiento no hay forma de recordarlo: mejor no insistir.
    return true;
  }
}

const sinSuscripcion = () => () => {};

export function BienvenidaMateria({ materiaId, cuenta, conActividades }: { materiaId: string; cuenta: string; conActividades: boolean }) {
  const clave = `${CLAVE}${huellaCuenta(cuenta)}:${materiaId}`;
  // En el servidor cuenta como vista: el aviso solo aparece al hidratar, si corresponde.
  const vista = useSyncExternalStore(
    sinSuscripcion,
    () => yaVista(clave),
    () => true,
  );
  const [cerrada, setCerrada] = useState(false);
  const visible = !vista && !cerrada;

  function cerrar() {
    setCerrada(true);
    try {
      localStorage.setItem(clave, "1");
    } catch {
      // Igual se cierra.
    }
  }

  if (!visible) return null;
  return (
    <div className={s.bienvenida} role="status">
      <p className={s.bienvenidaTexto}>
        <strong>¡Te damos la bienvenida!</strong>{" "}
        {conActividades ? "Toca una tarjeta para jugar." : "Esta es tu materia: aquí verás lo que tu docente te asigne."}
      </p>
      <button type="button" className={s.bienvenidaBoton} onClick={cerrar}>
        ¡Listo!
        <X size={18} strokeWidth={2.8} aria-hidden="true" />
      </button>
    </div>
  );
}
