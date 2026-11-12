"use client";
/* El SDK externo de Picker no distribuye tipos. Su acceso queda limitado a este componente. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

declare global { interface Window { gapi?: any; google?: any } }

function cargarPicker(): Promise<void> {
  return new Promise((resolve, reject) => {
    const listo = () => window.gapi?.load("picker", { callback: resolve, onerror: reject });
    if (window.gapi) return listo();
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = listo;
    script.onerror = reject;
    document.head.append(script);
  });
}

export function SelectorCarpetaDrive({ id, nombre, onChange }: { id: string; nombre: string; onChange: (id: string, nombre: string) => void }) {
  const [error, setError] = useState("");
  const [abriendo, setAbriendo] = useState(false);
  async function abrir() {
    setAbriendo(true); setError("");
    try {
      const respuesta = await fetch("/api/integraciones/google/token-picker", { cache: "no-store" });
      if (!respuesta.ok) throw new Error();
      const { accessToken, apiKey, appId } = await respuesta.json() as { accessToken: string; apiKey: string; appId: string };
      await cargarPicker();
      const g = window.google.picker;
      const vista = new g.DocsView(g.ViewId.FOLDERS).setSelectFolderEnabled(true).setMimeTypes("application/vnd.google-apps.folder");
      const picker = new g.PickerBuilder().addView(vista).setOAuthToken(accessToken).setDeveloperKey(apiKey).setAppId(appId)
        .setCallback((datos: any) => {
          if (datos.action === g.Action.PICKED && datos.docs?.[0]) onChange(datos.docs[0].id, datos.docs[0].name);
        }).build();
      picker.setVisible(true);
    } catch { setError("No se pudo abrir el selector de Google Drive. Revisa la conexión o los bloqueadores e inténtalo de nuevo"); }
    finally { setAbriendo(false); }
  }
  return <div className="admin-campo">
    <span>Carpeta de Google Drive</span>
    {id ? <p role="status">Carpeta: {nombre}</p> : <p>Elige dónde se guardarán los archivos.</p>}
    <button type="button" className="boton-pastilla" data-variante="secundario" disabled={abriendo} onClick={abrir}>{id ? "Cambiar carpeta" : "Elegir carpeta"}</button>
    {error ? <p role="alert">{error}</p> : null}
  </div>;
}
