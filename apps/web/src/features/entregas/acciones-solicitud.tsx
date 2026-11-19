"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function AccionesSolicitud({ id, tieneArchivos, archivada }: { id: string; tieneArchivos: boolean; archivada: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function ejecutar(metodo: "POST" | "DELETE") {
    const mensaje = metodo === "POST" ? "¿Archivar esta solicitud? Las docentes dejarán de verla y no podrán subir archivos." : "¿Eliminar esta solicitud?";
    if (!window.confirm(mensaje)) return;
    const respuesta = await fetch(`/api/solicitudes-entrega/${id}`, { method: metodo });
    if (!respuesta.ok) { setError("No se pudo completar la acción. Intenta de nuevo."); return; }
    router.push("/admin/entregas"); router.refresh();
  }
  return <div className="admin-barra">
    {!archivada ? <button className="boton-pastilla" data-variante="secundario" onClick={() => ejecutar("POST")}>Archivar solicitud</button> : null}
    {!tieneArchivos ? <button className="boton-pastilla" data-variante="peligro" onClick={() => ejecutar("DELETE")}>Eliminar solicitud</button> : null}
    {error ? <p role="alert">{error}</p> : null}
  </div>;
}
