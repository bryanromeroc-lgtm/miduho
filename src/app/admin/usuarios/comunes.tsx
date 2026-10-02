"use client";

/**
 * Piezas cliente compartidas por la administración de usuarios (INC1R-05):
 * llamada a la API con el envelope de error, confirmación modal accesible y
 * entrega única de credenciales.
 */

import { useEffect, useId, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { csvUnaCredencial } from "@/lib/usuarios";

export type Resultado<T> = { ok: true; datos: T } | { ok: false; codigo: string; mensaje: string };

/** Llama a una ruta propia y traduce `{ error: { code, message } }` a un resultado. */
export async function llamarApi<T = unknown>(url: string, metodo: string, cuerpo?: unknown): Promise<Resultado<T>> {
  try {
    const r = await fetch(url, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      cache: "no-store",
    });
    if (r.status === 204) return { ok: true, datos: undefined as T };
    const json = await r.json().catch(() => null);
    if (!r.ok) {
      return {
        ok: false,
        codigo: json?.error?.code ?? `HTTP_${r.status}`,
        mensaje: json?.error?.message ?? "No se pudo completar la operación. Intenta de nuevo.",
      };
    }
    return { ok: true, datos: json as T };
  } catch {
    return { ok: false, codigo: "RED", mensaje: "No hay conexión con el servidor. Revisa la red e intenta de nuevo." };
  }
}

/**
 * Confirmación para operaciones sensibles sobre <dialog> nativo: atrapa el
 * foco, Escape cancela y el foco vuelve al disparador al cerrar.
 */
export function Confirmar({
  abierto,
  titulo,
  children,
  textoConfirmar,
  peligro = false,
  pendiente = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  children: React.ReactNode;
  textoConfirmar: string;
  peligro?: boolean;
  pendiente?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="admin-dialogo"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-texto`}
      onClose={() => abierto && onCancelar()}
    >
      <h2 id={`${id}-titulo`}>{titulo}</h2>
      <div id={`${id}-texto`} className="admin-dialogo-texto">
        {children}
      </div>
      <div className="admin-dialogo-acciones">
        <button type="button" className="boton-pastilla" data-variante="secundario" onClick={onCancelar} disabled={pendiente}>
          Cancelar
        </button>
        <button
          type="button"
          className="boton-pastilla"
          data-variante={peligro ? "peligro" : "primario"}
          onClick={onConfirmar}
          disabled={pendiente}
          aria-disabled={pendiente}
        >
          {pendiente ? "Un momento…" : textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}

/**
 * Muestra una sola vez la contraseña recién generada. No se guarda en ningún
 * almacenamiento del navegador; al cerrar el panel desaparece y el sistema no
 * permite volver a consultarla.
 */
export function CredencialUnica({
  correo,
  contrasena,
  temporal,
  onCerrar,
}: {
  correo: string;
  contrasena: string;
  temporal: boolean;
  onCerrar: () => void;
}) {
  const [copiada, setCopiada] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), []);

  function descargar() {
    const blob = new Blob([csvUnaCredencial(correo, contrasena)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credencial-${correo.split("@")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(contrasena);
      setCopiada(true);
    } catch {
      setCopiada(false);
    }
  }

  return (
    <section ref={ref} tabIndex={-1} className="admin-credencial" aria-labelledby="credencial-titulo" role="region">
      <h2 id="credencial-titulo">Credencial inicial · se muestra una sola vez</h2>
      <p>
        {temporal
          ? "Entrega esta contraseña temporal al docente. Deberá cambiarla en su primer ingreso."
          : "Entrega esta contraseña al estudiante. Si se pierde, restablécela; no se puede volver a consultar."}
      </p>
      <dl className="cuenta-datos">
        <dt>Correo</dt>
        <dd>{correo}</dd>
        <dt>Contraseña</dt>
        <dd>
          <code className="admin-clave">{contrasena}</code>
        </dd>
      </dl>
      <div className="cuenta-acciones">
        <button type="button" className="boton-pastilla" data-variante="primario" onClick={descargar}>
          <Download size={18} aria-hidden="true" /> Descargar CSV
        </button>
        <button type="button" className="boton-pastilla" data-variante="secundario" onClick={copiar}>
          <Copy size={18} aria-hidden="true" /> Copiar contraseña
        </button>
        <button type="button" className="boton-pastilla" data-variante="secundario" onClick={onCerrar}>
          Ya la entregué, ocultar
        </button>
      </div>
      <p role="status" className="admin-nota">
        {copiada ? "Contraseña copiada al portapapeles." : ""}
      </p>
    </section>
  );
}
