"use client";

import { useState } from "react";
import { Confirmar, llamarApi } from "@/app/admin/usuarios/comunes";

type Opcion = { id: string; etiqueta: string };
type GrupoDto = { id: string; etiqueta: string };
type Historial = { id: string; inicioEn: string; finEn: string | null; grupo: GrupoDto };
type Estudiante = { id: string; nombres: string; apellidos: string; correo: string; estado: "ACTIVO" | "INACTIVO"; grupoActual: GrupoDto | null; historial: Historial[] };
type Props = { estudiantes: Estudiante[]; grupos: Opcion[]; anio: { id: string; anio: number; cerrado: boolean } };

const fecha = (s: string) => new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

export function FormularioAsociaciones({ estudiantes, grupos, anio }: Props) {
  const [destino, setDestino] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [traslado, setTraslado] = useState<{ estudiante: Estudiante; grupo: Opcion } | null>(null);

  async function guardar(e: Estudiante, grupoId: string, confirmarTraslado: boolean) {
    setOcupado(true); setError("");
    const r = await llamarApi(`/api/usuarios/${e.id}/grupo`, "PUT", { grupoId, confirmarTraslado });
    setOcupado(false);
    if (!r.ok) { setError(`${e.nombres} ${e.apellidos}: ${r.mensaje}`); setTraslado(null); return; }
    window.location.reload();
  }
  function aplicar(e: Estudiante) {
    const grupoId = destino[e.id];
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) { setError("Elige el grupo de destino."); return; }
    if (e.grupoActual) setTraslado({ estudiante: e, grupo });
    else void guardar(e, grupo.id, false);
  }

  return <div className="admin-columna">
    <section className="admin-seccion" aria-labelledby="listado-estudiantes">
      <div className="admin-seccion-cabecera"><div><h2 id="listado-estudiantes">Estudiantes · año {anio.anio}</h2>
        <p>{anio.cerrado ? "Año cerrado: solo lectura." : estudiantes.length ? `${estudiantes.length} resultado(s) en esta página.` : "No hay estudiantes que coincidan."}</p></div></div>
      {error ? <p role="alert" className="admin-aviso" data-tipo="error">{error}</p> : null}
      {estudiantes.length ? <div className="admin-tabla-contenedor"><table className="admin-tabla"><thead><tr><th>Estudiante</th><th>Grupo actual</th><th>Historial del año</th><th>Asignar o trasladar</th></tr></thead><tbody>{estudiantes.map((e) => {
        const opciones = grupos.filter((g) => g.id !== e.grupoActual?.id);
        const bloqueado = anio.cerrado || e.estado === "INACTIVO";
        return <tr key={e.id}>
          <th scope="row">{e.apellidos} {e.nombres}<br /><span className="admin-nota">{e.correo}{e.estado === "INACTIVO" ? " · Inactivo" : ""}</span></th>
          <td data-etiqueta="Grupo actual">{e.grupoActual ? e.grupoActual.etiqueta : <span className="admin-nota">Sin grupo</span>}</td>
          <td data-etiqueta="Historial del año">{e.historial.length ? <ul className="asociacion-historial">{e.historial.map((h) => <li key={h.id}>{h.grupo.etiqueta}: {fecha(h.inicioEn)} – {h.finEn ? fecha(h.finEn) : "actual"}</li>)}</ul> : <span className="admin-nota">Sin registros</span>}</td>
          <td data-etiqueta="Asignar o trasladar">{bloqueado ? <span className="admin-nota">{anio.cerrado ? "Solo lectura" : "Activa la cuenta para asignar"}</span>
            : <span className="admin-acciones-fila"><label className="sr-only" htmlFor={`destino-${e.id}`}>Grupo de destino para {e.nombres} {e.apellidos}</label>
              <select id={`destino-${e.id}`} value={destino[e.id] ?? ""} onChange={(ev) => setDestino((d) => ({ ...d, [e.id]: ev.target.value }))}><option value="">Elige grupo</option>{opciones.map((g) => <option key={g.id} value={g.id}>{g.etiqueta}</option>)}</select>
              <button type="button" className="admin-enlace-fila" disabled={ocupado || !destino[e.id]} onClick={() => aplicar(e)}>{e.grupoActual ? "Trasladar" : "Asignar"}</button></span>}</td>
        </tr>;
      })}</tbody></table></div> : <div className="admin-vacio"><p>No hay estudiantes registrados para estos filtros.</p></div>}
    </section>
    <Confirmar abierto={!!traslado} titulo="¿Confirmar el traslado?" textoConfirmar="Sí, trasladar" peligro pendiente={ocupado} onCancelar={() => setTraslado(null)} onConfirmar={() => traslado && guardar(traslado.estudiante, traslado.grupo.id, true)}>
      <p>{traslado ? `Se cerrará la asociación de ${traslado.estudiante.nombres} ${traslado.estudiante.apellidos} con ${traslado.estudiante.grupoActual?.etiqueta} y quedará en ${traslado.grupo.etiqueta}. El historial se conserva.` : ""}</p>
    </Confirmar>
  </div>;
}
