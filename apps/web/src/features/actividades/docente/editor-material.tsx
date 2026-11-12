"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Pregunta = { id: string; enunciado: string; opciones: string[]; correcta: number; explicacion?: string };
type Asignacion = { id: string; abreEn: string; cierraEn: string; maxIntentos: number; estado: string };
const campo = "min-h-11 w-full rounded-lg border border-[var(--dia-borde)] bg-white px-3 py-2 text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)]";
const boton = "min-h-11 rounded-full border border-[var(--dia-borde)] bg-white px-4 py-2 font-semibold text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)] disabled:opacity-50";
const local = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "America/Bogota" }).replace(" ", "T").slice(0, 16);
const utc = (localFecha: string) => new Date(`${localFecha}-05:00`).toISOString();

async function solicitar(ruta: string, metodo: string, cuerpo?: unknown) {
  const respuesta = await fetch(ruta, { method: metodo, headers: { "Content-Type": "application/json" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error?.message ?? "No se pudo guardar el cambio.");
  return datos;
}

export function EditorMaterial({ claseId, actividadId, tituloInicial, instruccionInicial, video, preguntasIniciales,
  contenidoBloqueado, asignaciones }: {
  claseId: string; actividadId: string; tituloInicial: string; instruccionInicial: string | null;
  video: { id: string; inicio?: number; fin?: number; tituloOriginal: string };
  preguntasIniciales: Pregunta[]; contenidoBloqueado: boolean; asignaciones: Asignacion[];
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(tituloInicial);
  const [instruccion, setInstruccion] = useState(instruccionInicial ?? "");
  const [url, setUrl] = useState(`https://www.youtube.com/watch?v=${video.id}`);
  const [inicio, setInicio] = useState(video.inicio?.toString() ?? "");
  const [fin, setFin] = useState(video.fin?.toString() ?? "");
  const [preguntas, setPreguntas] = useState(preguntasIniciales);
  const [asignacionesEditadas, setAsignacionesEditadas] = useState(asignaciones.map((a) => ({ ...a,
    abreEn: local(a.abreEn), cierraEn: local(a.cierraEn) })));
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function ejecutar(accion: () => Promise<unknown>) {
    setError(""); setAviso(""); setOcupado(true);
    try { await accion(); setAviso("Cambios guardados."); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el cambio."); }
    finally { setOcupado(false); }
  }

  function cambiarPregunta(indice: number, cambio: Partial<Pregunta>) {
    setPreguntas((actuales) => actuales.map((p, i) => i === indice ? { ...p, ...cambio } : p));
  }

  return <div className="space-y-6">
    <section className="sticker-panel space-y-4 p-5" aria-labelledby="editar-datos">
      <h2 id="editar-datos" className="font-heading text-xl font-bold text-tinta">Título e indicaciones</h2>
      <div><label htmlFor="editar-titulo" className="mb-1 block font-semibold text-tinta">Título</label>
        <input id="editar-titulo" className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} minLength={3} maxLength={120} /></div>
      <div><label htmlFor="editar-instruccion" className="mb-1 block font-semibold text-tinta">Indicaciones</label>
        <textarea id="editar-instruccion" className={campo} rows={3} value={instruccion} onChange={(e) => setInstruccion(e.target.value)} /></div>
      <button type="button" className={boton} disabled={ocupado} onClick={() => ejecutar(() => solicitar(`/api/actividades/material/${actividadId}`, "PATCH", { titulo, instruccion }))}>Guardar título e indicaciones</button>
    </section>
    <section className="sticker-panel space-y-4 p-5" aria-labelledby="editar-contenido">
      <h2 id="editar-contenido" className="font-heading text-xl font-bold text-tinta">Video y preguntas</h2>
      {contenidoBloqueado ? <p className="rounded-lg border border-[var(--dia-borde)] bg-white p-3 text-tinta">
        Ya hay respuestas. Para cambiar el video o las preguntas, anula esta actividad y crea otra.
      </p> : <>
        <p className="text-tinta">Al cambiar el contenido, los intentos que siguen en curso se abandonan para que nadie responda una versión anterior.</p>
        <div><label htmlFor="editar-url" className="mb-1 block font-semibold text-tinta">Enlace de YouTube</label>
          <input id="editar-url" className={campo} type="url" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="editar-inicio" className="mb-1 block font-semibold text-tinta">Inicio (segundos)</label>
            <input id="editar-inicio" className={campo} type="number" min="0" value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
          <div><label htmlFor="editar-fin" className="mb-1 block font-semibold text-tinta">Fin (segundos)</label>
            <input id="editar-fin" className={campo} type="number" min="1" value={fin} onChange={(e) => setFin(e.target.value)} /></div>
        </div>
        <div className="space-y-4">{preguntas.map((pregunta, indice) => <fieldset key={pregunta.id} className="rounded-lg border border-linea p-4">
          <legend className="px-1 font-bold text-tinta">Pregunta {indice + 1}</legend>
          <label htmlFor={`editar-pregunta-${indice}`} className="mb-1 block font-semibold text-tinta">Enunciado</label>
          <input id={`editar-pregunta-${indice}`} className={campo} value={pregunta.enunciado} onChange={(e) => cambiarPregunta(indice, { enunciado: e.target.value })} />
          {pregunta.opciones.map((opcion, j) => <div key={j} className="mt-2">
            <label htmlFor={`editar-pregunta-${indice}-opcion-${j}`} className="mb-1 block font-semibold text-tinta">Opción {j + 1}</label>
            <div className="flex flex-wrap items-center gap-2"><input id={`editar-pregunta-${indice}-opcion-${j}`} className={`${campo} min-w-0 flex-1`} value={opcion}
              onChange={(e) => cambiarPregunta(indice, { opciones: pregunta.opciones.map((texto, k) => k === j ? e.target.value : texto) })} />
              <label className="flex min-h-11 items-center gap-2 text-tinta"><input type="radio" name={`editar-correcta-${indice}`} checked={pregunta.correcta === j}
                onChange={() => cambiarPregunta(indice, { correcta: j })} /> Correcta</label></div>
          </div>)}
          <label htmlFor={`editar-explicacion-${indice}`} className="mb-1 mt-3 block font-semibold text-tinta">Explicación</label>
          <textarea id={`editar-explicacion-${indice}`} className={campo} value={pregunta.explicacion ?? ""} onChange={(e) => cambiarPregunta(indice, { explicacion: e.target.value })} />
          <button type="button" className={`${boton} mt-3`} disabled={preguntas.length === 1} onClick={() => setPreguntas((actuales) => actuales.filter((_, i) => i !== indice))}>Quitar pregunta</button>
        </fieldset>)}</div>
        <button type="button" className={boton} disabled={preguntas.length >= 10} onClick={() => setPreguntas((actuales) => [...actuales, { id: `p${Date.now()}`, enunciado: "", opciones: ["", ""], correcta: 0 }] )}>Agregar pregunta</button>
        <div><button type="button" className={boton} disabled={ocupado} onClick={() => ejecutar(() => solicitar(`/api/actividades/material/${actividadId}`, "PATCH", {
          url, inicio: inicio ? Number(inicio) : 0, fin: fin ? Number(fin) : null,
          contenido: { preguntas: preguntas.map((p, i) => ({ id: `p${i + 1}`, enunciado: p.enunciado, opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion || undefined })) },
        }))}>Guardar video y preguntas</button></div>
      </>}
    </section>
    <section className="sticker-panel space-y-4 p-5" aria-labelledby="editar-asignaciones">
      <h2 id="editar-asignaciones" className="font-heading text-xl font-bold text-tinta">Asignaciones</h2>
      {asignacionesEditadas.map((asignacion, indice) => <fieldset key={asignacion.id} className="rounded-lg border border-linea p-4">
        <legend className="px-1 font-bold text-tinta">Asignación {indice + 1} · {asignacion.estado === "ANULADA" ? "Anulada" : "Publicada"}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div><label htmlFor={`asignacion-${indice}-abre`} className="mb-1 block font-semibold text-tinta">Apertura (Colombia)</label>
            <input id={`asignacion-${indice}-abre`} className={campo} type="datetime-local" value={asignacion.abreEn} onChange={(e) => setAsignacionesEditadas((actuales) => actuales.map((a, i) => i === indice ? { ...a, abreEn: e.target.value } : a))} /></div>
          <div><label htmlFor={`asignacion-${indice}-cierra`} className="mb-1 block font-semibold text-tinta">Cierre (Colombia)</label>
            <input id={`asignacion-${indice}-cierra`} className={campo} type="datetime-local" value={asignacion.cierraEn} onChange={(e) => setAsignacionesEditadas((actuales) => actuales.map((a, i) => i === indice ? { ...a, cierraEn: e.target.value } : a))} /></div>
          <div><label htmlFor={`asignacion-${indice}-intentos`} className="mb-1 block font-semibold text-tinta">Intentos</label>
            <input id={`asignacion-${indice}-intentos`} className={campo} type="number" min="1" max="5" value={asignacion.maxIntentos} onChange={(e) => setAsignacionesEditadas((actuales) => actuales.map((a, i) => i === indice ? { ...a, maxIntentos: Number(e.target.value) } : a))} /></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={boton} disabled={ocupado} onClick={() => ejecutar(() => solicitar(`/api/actividades/asignaciones/${asignacion.id}`, "PATCH", {
            abreEn: utc(asignacion.abreEn), cierraEn: utc(asignacion.cierraEn), maxIntentos: asignacion.maxIntentos,
          }))}>Guardar asignación</button>
          {asignacion.estado === "PUBLICADA" && <button type="button" className={boton} disabled={ocupado} onClick={() => {
            if (!window.confirm("¿Anular esta asignación? Los intentos y resultados se conservarán.")) return;
            ejecutar(() => solicitar(`/api/actividades/asignaciones/${asignacion.id}`, "DELETE"));
          }}>Anular asignación</button>}
        </div>
      </fieldset>)}
      {asignacionesEditadas.some((a) => a.estado === "PUBLICADA") && <button type="button" className={boton} disabled={ocupado} onClick={() => {
        if (!window.confirm("¿Anular todas las asignaciones de este material? Los resultados se conservarán.")) return;
        ejecutar(async () => { await solicitar(`/api/actividades/asignaciones/${asignacionesEditadas[0].id}?todas=true`, "DELETE"); router.push(`/clases/${claseId}`); });
      }}>Anular todas las asignaciones</button>}
    </section>
    {error && <p role="alert" className="rounded-lg border border-[#a32218] bg-white p-3 text-[#a32218]">{error}</p>}
    {aviso && <p role="status" className="rounded-lg border border-[var(--dia-borde)] bg-white p-3 text-tinta">{aviso}</p>}
  </div>;
}
