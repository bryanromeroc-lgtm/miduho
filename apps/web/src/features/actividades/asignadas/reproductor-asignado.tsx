"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ResultadoIntento } from "../tipos/contrato";
import { Quiz } from "../reproductor/juegos-preguntas";
import { VideoYouTube } from "./video-youtube";

type Pregunta = { id: string; enunciado: string; opciones: string[]; correcta: number; explicacion?: string };
type Asignacion = { id: string; titulo: string; instruccion: string | null;
  contenido: { video: { id: string; tituloOriginal: string; inicio?: number; fin?: number }; preguntas: Pregunta[] };
  cierraEn: Date; maxIntentos: number; intentosUsados: number;
  enCurso: { id: string; numero: number; vioVideoEn: Date | null } | null;
  ultimoResultado: ResultadoIntento | null; ultimoEnviado: { id: string; numero: number } | null;
  mejorPorcentaje: number | null };

const accion = "min-h-12 rounded-full bg-[var(--m-tinta)] px-6 py-2 font-bold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-tinta)] disabled:opacity-50";

export function ReproductorAsignado({ asignacion, volverHref }: { asignacion: Asignacion; volverHref: string }) {
  const [intentoId, setIntentoId] = useState(asignacion.enCurso?.id ?? null);
  const [visto, setVisto] = useState(Boolean(asignacion.enCurso?.vioVideoEn));
  const [resultado, setResultado] = useState<ResultadoIntento | null>(asignacion.enCurso ? null : asignacion.ultimoResultado);
  const [usados, setUsados] = useState(asignacion.intentosUsados);
  const [mejor, setMejor] = useState(asignacion.mejorPorcentaje);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [pendiente, setPendiente] = useState(false);
  const enviados = useRef(new Set<string>());
  const clave = `miduho-envio-${asignacion.id}`;
  const abierta = new Date(asignacion.cierraEn) > new Date();
  const quedan = usados < asignacion.maxIntentos;

  const enviarGuardado = useCallback(async (id: string, respuestas: Record<string, unknown>) => {
    const respuesta = await fetch(`/api/actividades/intentos/${id}/envio`, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ respuestas }) });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error?.message ?? "No pudimos enviar las respuestas.");
    sessionStorage.removeItem(clave);
    setPendiente(false);
    setResultado(datos.resultado);
    setMejor((anterior) => Math.max(anterior ?? 0, datos.resultado.porcentaje));
    setAviso("Respuestas enviadas. Ya puedes revisar tu resultado.");
    if (!enviados.current.has(id) && asignacion.ultimoEnviado?.id !== id) {
      enviados.current.add(id); setUsados((n) => n + 1);
    }
  }, [clave, asignacion.ultimoEnviado?.id]);

  useEffect(() => {
    async function reintentar() {
      const guardado = sessionStorage.getItem(clave);
      if (!guardado) return;
      try {
        const { intentoId: id, respuestas } = JSON.parse(guardado) as { intentoId: string; respuestas: Record<string, unknown> };
        setPendiente(true);
        await enviarGuardado(id, respuestas);
        setError("");
      } catch { setPendiente(true); setError("Las respuestas siguen guardadas en esta pestaña. Reintenta el envío cuando haya conexión."); }
    }
    void reintentar();
    window.addEventListener("online", reintentar);
    return () => window.removeEventListener("online", reintentar);
  }, [clave, enviarGuardado]);

  async function yaLoVi() {
    setError(""); setOcupado(true);
    try {
      let id = intentoId;
      if (!id) {
        const respuesta = await fetch(`/api/actividades/asignaciones/${asignacion.id}/intentos`, { method: "POST" });
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.error?.message ?? "No pudimos iniciar el intento.");
        id = datos.intento.id;
        setIntentoId(id);
      }
      const respuesta = await fetch(`/api/actividades/intentos/${id}/visto`, { method: "POST" });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error?.message ?? "No pudimos registrar que viste el video.");
      setVisto(true);
      setAviso("Ya puedes responder.");
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos iniciar el intento."); }
    finally { setOcupado(false); }
  }

  async function terminar(respuestas: Record<string, unknown>) {
    if (!intentoId) return;
    sessionStorage.setItem(clave, JSON.stringify({ intentoId, respuestas }));
    setPendiente(true); setOcupado(true); setError("");
    try { await enviarGuardado(intentoId, respuestas); }
    catch { setError("Las respuestas siguen guardadas en esta pestaña. Reintenta el envío cuando haya conexión."); }
    finally { setOcupado(false); }
  }

  function intentarOtraVez() {
    setResultado(null); setIntentoId(null); setVisto(false); setAviso("Puedes volver a ver el video antes del siguiente intento.");
  }

  return <main id="actividad-asignada" tabIndex={-1} className="relative mx-auto max-w-4xl px-4 pb-16 pt-8 text-[var(--m-tinta)] sm:px-6">
    <Link href={volverHref} className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">Volver a la materia</Link>
    <h1 className="mt-5 font-heading text-3xl font-extrabold">{asignacion.titulo}</h1>
    {asignacion.instruccion && <p className="mt-3 max-w-[65ch] text-lg leading-relaxed">{asignacion.instruccion}</p>}
    <div className="mt-6"><VideoYouTube video={asignacion.contenido.video} /></div>
    <p aria-live="polite" className="mt-4 font-semibold">{aviso}</p>
    {error && <p role="alert" className="mt-3 rounded-lg border border-[#a32218] bg-white p-3 text-[#a32218]">{error}</p>}
    {pendiente && <button type="button" className={`${accion} mt-3`} disabled={ocupado} onClick={() => {
      const guardado = sessionStorage.getItem(clave);
      if (guardado) { const datos = JSON.parse(guardado); void enviarGuardado(datos.intentoId, datos.respuestas).catch(() => setError("No pudimos enviar las respuestas. Intenta de nuevo.")); }
    }}>Reintentar envío</button>}
    {resultado ? <section className="mt-8 rounded-xl bg-white p-5" aria-labelledby="resultado-titulo">
      <h2 id="resultado-titulo" className="font-heading text-2xl font-bold">Resultado: {resultado.porcentaje} %</h2>
      <p className="mt-1">{resultado.porcentaje >= 90 ? 3 : resultado.porcentaje >= 60 ? 2 : 1} de 3 estrellas · Intento {usados} de {asignacion.maxIntentos}</p>
      {mejor !== null && <p className="mt-1">Mejor nota registrada: {mejor} %</p>}
      <h3 className="mt-5 font-heading text-lg font-bold">Repaso</h3>
      <ol className="mt-2 space-y-3">{resultado.items.map((item) => <li key={item.itemId} className="border-t border-[var(--m-tinta)]/20 pt-3">
        <p className="font-semibold">{item.pregunta}</p><p>{item.correcta ? "Respuesta correcta." : "Respuesta incorrecta."} La respuesta es: {item.solucion}.</p>
        {asignacion.contenido.preguntas.find((p) => p.id === item.itemId)?.explicacion &&
          <p>{asignacion.contenido.preguntas.find((p) => p.id === item.itemId)?.explicacion}</p>}
      </li>)}</ol>
      {abierta && quedan && <button type="button" className={`${accion} mt-6`} onClick={intentarOtraVez}>Intentar de nuevo</button>}
    </section> : visto && abierta ? <section className="mt-8" aria-label="Preguntas">
      <Quiz contenido={{ preguntas: asignacion.contenido.preguntas }} semilla={`${asignacion.id}:${intentoId}`} focoInicial alTerminar={terminar} />
    </section> : abierta && quedan ? <button type="button" className={`${accion} mt-6`} disabled={ocupado}
      onClick={yaLoVi}>Ya lo vi</button> : <p className="mt-6 font-semibold">La actividad está cerrada o ya no quedan intentos.</p>}
  </main>;
}
