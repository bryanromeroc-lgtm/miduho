"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { enfocarError, primerErrorMaterial } from "./validacion-formulario";

type Grupo = { grupoId: string; identificador: string };
type Opcion = { asignaturaId: string; asignatura: string; gradoId: string; grado: string; grupos: Grupo[] };
type Pregunta = { enunciado: string; opciones: string[]; correcta: number; explicacion: string };

const nuevaPregunta = (): Pregunta => ({ enunciado: "", opciones: ["", ""], correcta: 0, explicacion: "" });
const campo = "w-full min-h-11 rounded-lg border border-[var(--dia-borde)] bg-white px-3 py-2 text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)]";
const boton = "min-h-11 rounded-full border border-[var(--dia-borde)] bg-white px-4 py-2 font-semibold text-tinta hover:bg-[var(--color-lit-pale)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)] disabled:opacity-50";

function fechaColombia(valor: string) { return valor ? new Date(`${valor}-05:00`).toISOString() : undefined; }

export function FormularioMaterial({ claseId, opciones, combinacionInicial, cierrePorDefecto }: {
  claseId: string; opciones: Opcion[]; combinacionInicial: string; cierrePorDefecto: string | null;
}) {
  const router = useRouter();
  const enlaceRef = useRef<HTMLInputElement>(null);
  const [combinacion, setCombinacion] = useState(combinacionInicial);
  const opcion = opciones.find((o) => `${o.asignaturaId}:${o.gradoId}` === combinacion) ?? opciones[0];
  const [grupos, setGrupos] = useState<string[]>(opcion?.grupos.map((g) => g.grupoId) ?? []);
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [instruccion, setInstruccion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [abreEn, setAbreEn] = useState("");
  const [cierraEn, setCierraEn] = useState("");
  const [maxIntentos, setMaxIntentos] = useState(3);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([nuevaPregunta()]);
  const [vistaPrevia, setVistaPrevia] = useState<{ id: string; tituloOriginal: string } | null>(null);
  const [error, setError] = useState("");
  const [errorCampo, setErrorCampo] = useState("");
  const [errorEnlace, setErrorEnlace] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function comprobar() {
    setErrorEnlace("");
    setVistaPrevia(null);
    if (!url.trim()) {
      setErrorEnlace("Pega el enlace del video de YouTube.");
      enlaceRef.current?.focus();
      return;
    }
    setOcupado(true);
    try {
      const respuesta = await fetch("/api/actividades/video/comprobacion", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error?.message ?? "No se pudo comprobar el video.");
      setVistaPrevia(datos);
    } catch (e) {
      setErrorEnlace(e instanceof Error ? e.message : "No se pudo comprobar el video.");
      enlaceRef.current?.focus();
    } finally { setOcupado(false); }
  }

  function actualizarPregunta(indice: number, cambio: Partial<Pregunta>) {
    setPreguntas((actuales) => actuales.map((pregunta, i) => i === indice ? { ...pregunta, ...cambio } : pregunta));
  }

  function mover(indice: number, direccion: -1 | 1) {
    const siguiente = [...preguntas];
    const destino = indice + direccion;
    if (destino < 0 || destino >= siguiente.length) return;
    [siguiente[indice], siguiente[destino]] = [siguiente[destino], siguiente[indice]];
    setPreguntas(siguiente);
  }

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setErrorCampo("");
    const primero = primerErrorMaterial({ url, titulo, grupos, preguntas });
    if (primero) {
      setErrorCampo(primero.campo);
      if (primero.campo === "material-url") setErrorEnlace(primero.mensaje);
      else setError(primero.mensaje);
      enfocarError(primero.campo);
      return;
    }
    if (!opcion) { setError("No hay una asignatura disponible."); return; }
    setOcupado(true);
    try {
      const respuesta = await fetch("/api/actividades/material", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          titulo, instruccion, url, asignaturaId: opcion.asignaturaId, gradoId: opcion.gradoId,
          grupoIds: grupos, inicio: inicio ? Number(inicio) : undefined, fin: fin ? Number(fin) : undefined,
          abreEn: fechaColombia(abreEn), cierraEn: fechaColombia(cierraEn), maxIntentos,
          contenido: { preguntas: preguntas.map((p, i) => ({ id: `p${i + 1}`, enunciado: p.enunciado,
            opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion || undefined })) },
        }) });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error?.message ?? "No se pudo guardar el material.");
      router.push(`/clases/${claseId}/material/${datos.actividad.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo guardar el material."); }
    finally { setOcupado(false); }
  }

  return <form onSubmit={guardar} className="space-y-6" noValidate>
    <p className="rounded-xl border border-[var(--dia-borde)] bg-white p-4 text-tinta">
      No escribas nombres ni datos personales de estudiantes en el título, las indicaciones ni las preguntas.
    </p>
    <div className="sticker-panel grid gap-4 p-5">
      <h2 className="font-heading text-xl font-bold text-tinta">Video e indicaciones</h2>
      <div>
        <label htmlFor="material-url" className="mb-1 block font-semibold text-tinta">Enlace de YouTube</label>
        <div className="flex flex-wrap gap-2">
        <input id="material-url" ref={enlaceRef} className={`${campo} min-w-0 flex-1`} type="url" value={url}
            onChange={(e) => { setUrl(e.target.value); setVistaPrevia(null); setErrorEnlace(""); }}
            aria-invalid={!!errorEnlace} aria-describedby={errorEnlace ? "material-url-error" : undefined} required />
          <button type="button" className={boton} onClick={comprobar} disabled={ocupado}>Comprobar video</button>
        </div>
        {errorEnlace && <p id="material-url-error" role="alert" className="mt-1 text-[#a32218]">{errorEnlace}</p>}
        {vistaPrevia && <div className="mt-3">
          <p className="font-semibold text-tinta">Video encontrado: {vistaPrevia.tituloOriginal}</p>
          <div className="mt-2 aspect-video max-w-xl overflow-hidden rounded-lg">
            <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${vistaPrevia.id}?rel=0&cc_load_policy=1&cc_lang_pref=es&hl=es`}
              title={`Vista previa: ${vistaPrevia.tituloOriginal}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" />
          </div>
        </div>}
      </div>
      <div><label htmlFor="material-titulo" className="mb-1 block font-semibold text-tinta">Título de la actividad</label>
        <input id="material-titulo" className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} minLength={3} maxLength={120}
          aria-invalid={errorCampo === "material-titulo"} aria-describedby={errorCampo === "material-titulo" ? "formulario-error" : undefined} required /></div>
      <div><label htmlFor="material-instruccion" className="mb-1 block font-semibold text-tinta">Indicaciones para estudiantes</label>
        <textarea id="material-instruccion" className={campo} value={instruccion} onChange={(e) => setInstruccion(e.target.value)} rows={3} maxLength={1000} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="material-inicio" className="mb-1 block font-semibold text-tinta">Inicio del video (segundos, opcional)</label>
          <input id="material-inicio" className={campo} type="number" min="0" value={inicio} onChange={(e) => setInicio(e.target.value)} /></div>
        <div><label htmlFor="material-fin" className="mb-1 block font-semibold text-tinta">Fin del video (segundos, opcional)</label>
          <input id="material-fin" className={campo} type="number" min="1" value={fin} onChange={(e) => setFin(e.target.value)} /></div>
      </div>
    </div>
    <section className="sticker-panel p-5" aria-labelledby="preguntas-titulo">
      <h2 id="preguntas-titulo" className="font-heading text-xl font-bold text-tinta">Preguntas de selección múltiple</h2>
      <div className="mt-4 space-y-5">{preguntas.map((pregunta, indice) => <fieldset key={indice} className="rounded-xl border border-linea p-4">
        <legend className="px-1 font-bold text-tinta">Pregunta {indice + 1}</legend>
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={boton} onClick={() => mover(indice, -1)} disabled={indice === 0}>Subir</button>
          <button type="button" className={boton} onClick={() => mover(indice, 1)} disabled={indice === preguntas.length - 1}>Bajar</button>
          <button type="button" className={boton} onClick={() => setPreguntas((actuales) => actuales.filter((_, i) => i !== indice))} disabled={preguntas.length === 1}>Quitar</button>
        </div>
        <label htmlFor={`pregunta-${indice}`} className="mb-1 block font-semibold text-tinta">Enunciado</label>
        <input id={`pregunta-${indice}`} className={campo} value={pregunta.enunciado} onChange={(e) => actualizarPregunta(indice, { enunciado: e.target.value })}
          aria-invalid={errorCampo === `pregunta-${indice}`} aria-describedby={errorCampo === `pregunta-${indice}` ? "formulario-error" : undefined} required />
        <div className="mt-3 space-y-3">{pregunta.opciones.map((opcionTexto, opcionIndice) => <div key={opcionIndice}>
          <label htmlFor={`pregunta-${indice}-opcion-${opcionIndice}`} className="mb-1 block font-semibold text-tinta">Opción {opcionIndice + 1}</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id={`pregunta-${indice}-opcion-${opcionIndice}`} className={`${campo} min-w-0 flex-1`} value={opcionTexto}
              aria-invalid={errorCampo === `pregunta-${indice}-opcion-${opcionIndice}`}
              aria-describedby={errorCampo === `pregunta-${indice}-opcion-${opcionIndice}` ? "formulario-error" : undefined}
              onChange={(e) => actualizarPregunta(indice, { opciones: pregunta.opciones.map((texto, i) => i === opcionIndice ? e.target.value : texto) })} required />
            <label className="flex min-h-11 items-center gap-2 text-tinta"><input type="radio" name={`correcta-${indice}`} checked={pregunta.correcta === opcionIndice}
              onChange={() => actualizarPregunta(indice, { correcta: opcionIndice })} /> Correcta</label>
            <button type="button" className={boton} disabled={pregunta.opciones.length <= 2}
              onClick={() => actualizarPregunta(indice, { opciones: pregunta.opciones.filter((_, i) => i !== opcionIndice), correcta: Math.min(pregunta.correcta, pregunta.opciones.length - 2) })}>Quitar opción</button>
          </div>
        </div>)}</div>
        <button type="button" className={`${boton} mt-3`} disabled={pregunta.opciones.length >= 4}
          onClick={() => actualizarPregunta(indice, { opciones: [...pregunta.opciones, ""] })}>Agregar opción</button>
        <div className="mt-4"><label htmlFor={`pregunta-${indice}-explicacion`} className="mb-1 block font-semibold text-tinta">Explicación (opcional)</label>
          <textarea id={`pregunta-${indice}-explicacion`} className={campo} value={pregunta.explicacion}
            onChange={(e) => actualizarPregunta(indice, { explicacion: e.target.value })} rows={2} /></div>
      </fieldset>)}</div>
      <button type="button" className={`${boton} mt-4`} disabled={preguntas.length >= 10}
        onClick={() => setPreguntas((actuales) => [...actuales, nuevaPregunta()])}>Agregar pregunta</button>
    </section>
    <section className="sticker-panel grid gap-4 p-5" aria-labelledby="asignacion-titulo">
      <h2 id="asignacion-titulo" className="font-heading text-xl font-bold text-tinta">Asignación</h2>
      <div><label htmlFor="material-combinacion" className="mb-1 block font-semibold text-tinta">Asignatura y grado</label>
        <select id="material-combinacion" className={campo} value={combinacion}
          aria-invalid={errorCampo === "material-combinacion"} aria-describedby={errorCampo === "material-combinacion" ? "formulario-error" : undefined}
          onChange={(e) => {
          setCombinacion(e.target.value);
          setGrupos(opciones.find((o) => `${o.asignaturaId}:${o.gradoId}` === e.target.value)?.grupos.map((g) => g.grupoId) ?? []);
        }}>{opciones.map((o) => <option key={`${o.asignaturaId}:${o.gradoId}`} value={`${o.asignaturaId}:${o.gradoId}`}>{o.asignatura} · {o.grado}</option>)}</select></div>
      <fieldset><legend className="font-semibold text-tinta">Grupos que recibirán el material</legend>
        <div className="mt-2 flex flex-wrap gap-4">{opcion?.grupos.map((grupo) => <label key={grupo.grupoId} className="flex min-h-11 items-center gap-2 text-tinta">
          <input type="checkbox" checked={grupos.includes(grupo.grupoId)} onChange={(e) => setGrupos((actuales) => e.target.checked ? [...actuales, grupo.grupoId] : actuales.filter((id) => id !== grupo.grupoId))} /> Grupo {opcion.grado}-{grupo.identificador}
        </label>)}</div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="material-abre" className="mb-1 block font-semibold text-tinta">Apertura (hora de Colombia, opcional)</label>
          <input id="material-abre" className={campo} type="datetime-local" value={abreEn} onChange={(e) => setAbreEn(e.target.value)} />
          <p className="mt-1 text-sm text-tinta">Si lo dejas vacío, abre ahora.</p></div>
        <div><label htmlFor="material-cierra" className="mb-1 block font-semibold text-tinta">Cierre (hora de Colombia, opcional)</label>
          <input id="material-cierra" className={campo} type="datetime-local" value={cierraEn} onChange={(e) => setCierraEn(e.target.value)} />
          <p className="mt-1 text-sm text-tinta">Si lo dejas vacío, cierra al final del período{cierrePorDefecto ? ` (${cierrePorDefecto})` : ""}.</p></div>
      </div>
      <div><label htmlFor="material-intentos" className="mb-1 block font-semibold text-tinta">Intentos permitidos</label>
        <input id="material-intentos" className={`${campo} max-w-32`} type="number" min="1" max="5" value={maxIntentos} onChange={(e) => setMaxIntentos(Number(e.target.value))} required /></div>
      <p className="text-tinta">Esta actividad cuenta como nota. La calificación es el porcentaje de respuestas correctas.</p>
    </section>
    {error && <p id="formulario-error" role="alert" className="rounded-lg border border-[#a32218] bg-white p-3 text-[#a32218]">{error}</p>}
    <button type="submit" className="min-h-12 rounded-full bg-[var(--dia-azul)] px-6 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)] disabled:opacity-50" disabled={ocupado}>
      {ocupado ? "Guardando…" : "Publicar material audiovisual"}
    </button>
  </form>;
}
