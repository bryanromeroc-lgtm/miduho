"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { formatoCierre, TAMANO_MAXIMO_ENTREGA } from "@/lib/entregas";

export function SubirArchivo({ entregaId, cierraEn, tieneVersionATiempo, formatos, tardeInicial }: { entregaId: string; cierraEn: string; tieneVersionATiempo: boolean; formatos: string[]; tardeInicial: boolean }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");
  const [progreso, setProgreso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [tarde, setTarde] = useState(tardeInicial);
  useEffect(() => {
    const restante = new Date(cierraEn).getTime() - Date.now();
    if (restante <= 0) return;
    const timer = window.setTimeout(() => setTarde(true), restante + 1);
    return () => window.clearTimeout(timer);
  }, [cierraEn]);
  function subir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const input = evento.currentTarget.elements.namedItem("archivo") as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) { setMensaje("Elige un archivo para subir"); return; }
    if (archivo.size > TAMANO_MAXIMO_ENTREGA) { setMensaje("El archivo supera 20 MB"); return; }
    setOcupado(true); setMensaje(""); setProgreso("Iniciando subida");
    const cuerpo = new FormData(); cuerpo.append("archivo", archivo);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/entregas/${entregaId}/archivo`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgreso(`Subiendo: ${Math.round(e.loaded / e.total * 100)} %`); };
    xhr.onload = () => {
      setOcupado(false);
      if (xhr.status === 201) {
        const datos = JSON.parse(xhr.responseText) as { subidoEn: string };
        setMensaje(`Entregado el ${formatoCierre(new Date(datos.subidoEn))}`);
        setProgreso("Subida completa"); router.refresh();
      } else {
        try { const datos = JSON.parse(xhr.responseText); setMensaje(datos.error?.message ?? "No se pudo subir el archivo. Intenta más tarde."); }
        catch { setMensaje("No se pudo subir el archivo. Intenta más tarde."); }
        setProgreso("La subida falló");
      }
    };
    xhr.onerror = () => { setOcupado(false); setMensaje("No se pudo subir el archivo. Revisa la conexión e inténtalo de nuevo."); setProgreso("La subida falló"); };
    xhr.send(cuerpo);
  }
  return <section className="cuenta-panel" aria-labelledby="subir-titulo">
    <h2 id="subir-titulo">Subir documento</h2>
    <p>Formatos: {formatos.join(", ")} · Tamaño máximo: 20 MB</p>
    {tarde ? <p role="status">El plazo cerró el {formatoCierre(new Date(cierraEn))}; tu entrega quedará como tardía.{tieneVersionATiempo ? " La nueva versión cambiará el estado a Tardía." : ""}</p> : null}
    <form onSubmit={subir} className="admin-columna"><div className="admin-campo"><label htmlFor="archivo-entrega">Archivo</label><input id="archivo-entrega" name="archivo" type="file" accept={formatos.join(",")} required /></div><button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Subiendo…" : "Subir archivo"}</button></form>
    <p aria-live="polite" role="status">{progreso}</p>{mensaje ? <p role="alert">{mensaje}</p> : null}
  </section>;
}
