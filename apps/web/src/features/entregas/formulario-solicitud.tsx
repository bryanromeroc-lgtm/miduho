"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ETIQUETAS_TIPO_DOCUMENTO, FORMATOS_ENTREGA } from "@/lib/entregas";
import { SelectorCarpetaDrive } from "./selector-carpeta-drive";

type Docente = { id: string; nombres: string; apellidos: string };
type Periodo = { id: string; nombre: string };
type Inicial = {
  id: string; titulo: string; descripcion: string | null; tipoDocumento: keyof typeof ETIQUETAS_TIPO_DOCUMENTO;
  formatos: string[]; cierreLocal: string; periodoId: string | null; carpetaDriveId: string; carpetaDriveNombre: string; docenteIds: string[];
};
export function FormularioSolicitud({ docentes, periodos, inicial }: { docentes: Docente[]; periodos: Periodo[]; inicial?: Inicial }) {
  const router = useRouter();
  const [carpeta, setCarpeta] = useState({ id: inicial?.carpetaDriveId ?? "", nombre: inicial?.carpetaDriveNombre ?? "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setOcupado(true); setError(""); setFieldErrors({});
    const datos = new FormData(evento.currentTarget);
    const cuerpo = {
      titulo: String(datos.get("titulo") ?? ""), descripcion: String(datos.get("descripcion") ?? ""),
      tipoDocumento: String(datos.get("tipoDocumento") ?? ""), formatos: datos.getAll("formatos").map(String),
      cierreLocal: String(datos.get("cierreLocal") ?? ""), periodoId: String(datos.get("periodoId") ?? "") || null,
      todasDocentes: datos.has("todasDocentes"), docenteIds: datos.getAll("docenteIds").map(String),
      carpetaDriveId: carpeta.id, carpetaDriveNombre: carpeta.nombre,
    };
    try {
      const respuesta = await fetch(inicial ? `/api/solicitudes-entrega/${inicial.id}` : "/api/solicitudes-entrega", {
        method: inicial ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        if (resultado.fieldErrors) setFieldErrors(resultado.fieldErrors);
        else setError(resultado.error?.message ?? "No se pudo guardar la solicitud");
        return;
      }
      router.push(`/admin/entregas/${inicial?.id ?? resultado.id}`);
      router.refresh();
    } catch { setError("No se pudo guardar la solicitud. Revisa la conexión e inténtalo de nuevo."); }
    finally { setOcupado(false); }
  }
  const campoError = (nombre: string) => fieldErrors[nombre]?.length ? <span role="alert">{fieldErrors[nombre].join(" ")}</span> : null;
  return <form onSubmit={guardar} className="admin-columna">
    <div className="admin-campo"><label htmlFor="entrega-titulo">Título</label><input id="entrega-titulo" name="titulo" required minLength={3} maxLength={120} defaultValue={inicial?.titulo} aria-invalid={Boolean(fieldErrors.titulo)} />{campoError("titulo")}</div>
    <div className="admin-campo"><label htmlFor="entrega-descripcion">Descripción</label><textarea id="entrega-descripcion" name="descripcion" maxLength={2000} defaultValue={inicial?.descripcion ?? ""} />{campoError("descripcion")}</div>
    <div className="admin-campo"><label htmlFor="entrega-tipo">Tipo de documento</label><select id="entrega-tipo" name="tipoDocumento" defaultValue={inicial?.tipoDocumento ?? "PLANILLA_NOTAS"}>{Object.entries(ETIQUETAS_TIPO_DOCUMENTO).map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}</select>{campoError("tipoDocumento")}</div>
    <fieldset className="cuenta-panel"><legend>Formatos permitidos</legend>{FORMATOS_ENTREGA.map((ext) => <label key={ext} className="entregas-opcion"><input type="checkbox" name="formatos" value={ext} defaultChecked={(inicial?.formatos ?? [".xlsx", ".xls"]).includes(ext)} /> {ext}</label>)}{campoError("formatos")}</fieldset>
    <div className="admin-campo"><label htmlFor="entrega-cierre">Fecha y hora de cierre (Colombia)</label><input id="entrega-cierre" type="datetime-local" name="cierreLocal" required defaultValue={inicial?.cierreLocal} />{campoError("cierreLocal")}</div>
    <div className="admin-campo"><label htmlFor="entrega-periodo">Período (opcional)</label><select id="entrega-periodo" name="periodoId" defaultValue={inicial?.periodoId ?? ""}><option value="">Sin período</option>{periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>{campoError("periodoId")}</div>
    <fieldset className="cuenta-panel"><legend>Destinatarias</legend><label><input type="checkbox" name="todasDocentes" /> Todas las docentes activas</label><p>O selecciona docentes:</p>{docentes.map((d) => <label key={d.id} className="entregas-opcion"><input type="checkbox" name="docenteIds" value={d.id} defaultChecked={inicial?.docenteIds.includes(d.id)} /> {d.apellidos} {d.nombres}</label>)}{campoError("docenteIds")}</fieldset>
    <SelectorCarpetaDrive id={carpeta.id} nombre={carpeta.nombre} onChange={(id, nombre) => setCarpeta({ id, nombre })} />{campoError("carpetaDriveId")}
    {error ? <p role="alert">{error}</p> : null}
    <button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar solicitud"}</button>
  </form>;
}
