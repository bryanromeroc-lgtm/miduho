"use client";

import { Delete } from "lucide-react";
import s from "./teclado.module.css";

/*
  Teclado numérico en pantalla para los juegos de escribir la respuesta.
  Es la forma principal en tableta; el teclado físico sigue funcionando en
  las casillas. Los botones no roban el foco de la casilla activa.
*/
export function Teclado({ onDigito, onBorrar, deshabilitado }: { onDigito: (d: string) => void; onBorrar: () => void; deshabilitado?: boolean }) {
  const evitarFoco = (ev: React.MouseEvent) => ev.preventDefault();
  return (
    <div className={s.teclado} role="group" aria-label="Teclado numérico">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} type="button" className={s.tecla} disabled={deshabilitado} onMouseDown={evitarFoco} onClick={() => onDigito(d)}>
          {d}
        </button>
      ))}
      <button type="button" className={s.tecla} data-ancha="" disabled={deshabilitado} onMouseDown={evitarFoco} onClick={() => onDigito("0")}>
        0
      </button>
      <button type="button" className={s.tecla} data-borrar="" disabled={deshabilitado} onMouseDown={evitarFoco} onClick={onBorrar} aria-label="Borrar">
        <Delete size={24} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </div>
  );
}
