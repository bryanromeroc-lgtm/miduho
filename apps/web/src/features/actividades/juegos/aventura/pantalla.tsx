"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./pantalla.module.css";

/*
  Marco de pantalla completa del juego. Usa un <dialog> modal: queda sobre
  toda la página, atrapa el foco y se cierra con Esc sin librerías. «Ventana»
  lo pasa a modo compacto en el mismo lugar del árbol (sin perder la
  partida). Al abrirlo con un clic también pide la pantalla completa del
  navegador, útil en tabletas. El juego sigue siendo texto y botones HTML.
*/
export function Pantalla({ escena, fondo, children, barra }: { escena: string; fondo: string; children: ReactNode; barra: ReactNode }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [completa, setCompleta] = useState(true);
  // Dos capas de fondo: la nueva aparece encima de la anterior (fundido suave).
  const [capas, setCapas] = useState<{ actual: string; anterior: string | null }>({ actual: fondo, anterior: null });
  if (capas.actual !== fondo) setCapas({ actual: fondo, anterior: capas.actual });

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (d.open) d.close();
    if (completa) d.showModal();
    else d.show();
  }, [completa]);

  useEffect(() => {
    const d = dialogo.current;
    return () => {
      if (d && document.fullscreenElement === d) void document.exitFullscreen().catch(() => {});
    };
  }, []);

  function alternar() {
    const d = dialogo.current;
    if (completa) {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
      setCompleta(false);
    } else {
      setCompleta(true);
      // Pide la pantalla completa del navegador mientras haya gesto del usuario.
      void d?.requestFullscreen?.().catch(() => {});
    }
  }

  return (
    <dialog
      ref={dialogo}
      className={s.pantalla}
      data-completa={completa ? "" : undefined}
      data-escena={escena}
      aria-label="Juego"
      onCancel={(ev) => {
        ev.preventDefault();
        setCompleta(false);
      }}
    >
      {capas.anterior && <div className={s.mundo} style={{ backgroundImage: capas.anterior }} aria-hidden="true" />}
      <div
        key={capas.actual}
        className={s.mundo}
        data-nuevo={capas.anterior ? "" : undefined}
        style={{ backgroundImage: capas.actual }}
        onAnimationEnd={() => setCapas((c) => (c.anterior ? { ...c, anterior: null } : c))}
        aria-hidden="true"
      />
      <div className={s.cima}>
        {barra}
        <button type="button" className={s.modo} onClick={alternar}>
          {completa ? <Minimize2 size={20} strokeWidth={2.6} aria-hidden="true" /> : <Maximize2 size={20} strokeWidth={2.6} aria-hidden="true" />}
          {completa ? "Ventana" : "Pantalla completa"}
        </button>
      </div>
      {children}
    </dialog>
  );
}
