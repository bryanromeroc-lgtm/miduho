"use client";
import { useState } from "react";

export function AccionesGoogle({ conectado }: { conectado: boolean }) {
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  if (!conectado) return <a className="boton-pastilla" data-variante="primario" href="/api/integraciones/google/iniciar">Conectar Google Drive</a>;
  return <div>
    <button type="button" className="boton-pastilla" data-variante="peligro" disabled={ocupado} onClick={async () => {
      if (!window.confirm("¿Desconectar Google Drive? Las solicitudes se conservarán, pero las docentes no podrán subir archivos hasta que vuelvas a conectar.")) return;
      setOcupado(true); setError("");
      try {
        const respuesta = await fetch("/api/integraciones/google/desconectar", { method: "POST" });
        if (!respuesta.ok) throw new Error();
        window.location.reload();
      } catch { setError("No se pudo desconectar Google Drive. Intenta de nuevo."); setOcupado(false); }
    }}>Desconectar Google Drive</button>
    {error ? <p role="alert">{error}</p> : null}
  </div>;
}
