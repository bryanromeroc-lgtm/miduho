"use client";

import { useEffect, useRef, useState } from "react";
import { Download, KeyRound } from "lucide-react";
import { Confirmar } from "@/app/admin/usuarios/comunes";
import { ETIQUETA_ESTADO } from "@/lib/usuarios";
import type { EstudianteGrupo } from "@/server/modules/mi-curso/servicio";

type Aviso = { tipo: "ok" | "error"; texto: string } | null;
type Pendiente = { csv: string; total: number; nombreArchivo: string } | null;

const NOMBRE_POR_DEFECTO = "credenciales-estudiantes.csv";

/** Nombre sugerido por el servidor en Content-Disposition, saneado. */
function nombreArchivo(cabecera: string | null) {
  const m = cabecera?.match(/filename="([\w.-]+)"/);
  return m ? m[1] : NOMBRE_POR_DEFECTO;
}

/**
 * Estudiantes del grupo con selección para restablecer contraseñas (§2.2,
 * §4.3). Solo lectura de nombre, correo y estado; sin edición. Las nuevas
 * credenciales viven en memoria hasta su única descarga y luego se descartan.
 */
export function EstudiantesGrupo({ grupo, estudiantes }: { grupo: string; estudiantes: EstudianteGrupo[] }) {
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [pendiente, setPendiente] = useState<Pendiente>(null);
  const panel = useRef<HTMLElement>(null);
  const todos = useRef<HTMLInputElement>(null);

  const elegibles = estudiantes.filter((e) => e.estado === "ACTIVO");
  const elegidos = estudiantes.filter((e) => seleccion.has(e.id));
  const todosMarcados = elegibles.length > 0 && elegibles.every((e) => seleccion.has(e.id));
  const algunoMarcado = elegibles.some((e) => seleccion.has(e.id));

  useEffect(() => {
    if (todos.current) todos.current.indeterminate = algunoMarcado && !todosMarcados;
  }, [algunoMarcado, todosMarcados]);

  // Mientras haya credenciales sin descargar, avisar antes de salir de la página.
  useEffect(() => {
    if (!pendiente) return;
    panel.current?.focus();
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", alSalir);
    return () => window.removeEventListener("beforeunload", alSalir);
  }, [pendiente]);

  function alternar(id: string, marcado: boolean) {
    setSeleccion((s) => {
      const n = new Set(s);
      if (marcado) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function alternarTodos(marcado: boolean) {
    setSeleccion(marcado ? new Set(elegibles.map((e) => e.id)) : new Set());
  }

  async function restablecer() {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await fetch("/api/usuarios/estudiantes/restablecer-contrasenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudianteIds: elegidos.map((e) => e.id) }),
        cache: "no-store",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        setAviso({ tipo: "error", texto: j?.error?.message ?? "No se pudieron restablecer las contraseñas." });
        return;
      }
      const csv = await r.text();
      const total = Number(r.headers.get("X-Total-Restablecidos")) || elegidos.length;
      setPendiente({ csv, total, nombreArchivo: nombreArchivo(r.headers.get("Content-Disposition")) });
      setSeleccion(new Set());
    } catch {
      setAviso({ tipo: "error", texto: "No hay conexión con el servidor. Intenta de nuevo." });
    } finally {
      setOcupado(false);
      setConfirmar(false);
    }
  }

  function descargar() {
    if (!pendiente) return;
    const url = URL.createObjectURL(new Blob([pendiente.csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = pendiente.nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
    const total = pendiente.total;
    setPendiente(null); // una sola descarga: el contenido se descarta de inmediato
    setAviso({
      tipo: "ok",
      texto: `Descargaste ${total === 1 ? "1 credencial" : `${total} credenciales`}. Este archivo no se puede volver a descargar; si se pierde, restablece de nuevo.`,
    });
  }

  return (
    <section className="cuenta-panel" aria-labelledby="micurso-estudiantes">
      <div className="micurso-estudiantes-cabecera">
        <div>
          <h2 id="micurso-estudiantes">Estudiantes</h2>
          <p className="admin-ayuda">
            {estudiantes.length === 0
              ? "Este grupo aún no tiene estudiantes asociados."
              : `${estudiantes.length} en el grupo ${grupo}. Selecciona uno o varios para restablecer su contraseña.`}
          </p>
        </div>
        {estudiantes.length > 0 ? (
          <button
            type="button"
            className="boton-pastilla"
            data-variante="primario"
            disabled={elegidos.length === 0 || ocupado || !!pendiente}
            onClick={() => setConfirmar(true)}
          >
            <KeyRound size={18} aria-hidden="true" />
            Restablecer contraseña{elegidos.length > 1 ? "s" : ""}
            {elegidos.length ? ` (${elegidos.length})` : ""}
          </button>
        ) : null}
      </div>

      {aviso ? (
        <p role={aviso.tipo === "error" ? "alert" : "status"} className="admin-aviso" data-tipo={aviso.tipo}>
          {aviso.texto}
        </p>
      ) : null}

      {pendiente ? (
        <section ref={panel} tabIndex={-1} className="admin-credencial" aria-labelledby="micurso-credenciales">
          <h3 id="micurso-credenciales">Nuevas credenciales · una sola descarga</h3>
          <p>
            Se restablecieron {pendiente.total === 1 ? "1 contraseña" : `${pendiente.total} contraseñas`}. Las
            anteriores ya no funcionan y sus sesiones se cerraron. Descarga el archivo ahora: al hacerlo se descarta
            y no se podrá volver a obtener.
          </p>
          <div className="cuenta-acciones">
            <button type="button" className="boton-pastilla" data-variante="primario" onClick={descargar}>
              <Download size={18} aria-hidden="true" /> Descargar CSV de credenciales
            </button>
          </div>
        </section>
      ) : null}

      {estudiantes.length > 0 ? (
        <div className="admin-tabla-marco">
          <table className="admin-tabla micurso-tabla">
            <caption className="sr-only">Estudiantes del grupo {grupo}</caption>
            <thead>
              <tr>
                <th scope="col" className="micurso-marca">
                  <label className="micurso-todos">
                    <input
                      ref={todos}
                      type="checkbox"
                      checked={todosMarcados}
                      disabled={elegibles.length === 0 || !!pendiente}
                      onChange={(e) => alternarTodos(e.target.checked)}
                    />
                    <span className="micurso-todos-texto">Seleccionar todos los estudiantes activos</span>
                  </label>
                </th>
                <th scope="col">Estudiante</th>
                <th scope="col">Correo</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((e) => {
                const nombre = `${e.nombres} ${e.apellidos}`;
                const activo = e.estado === "ACTIVO";
                return (
                  <tr key={e.id}>
                    <td className="micurso-marca">
                      <input
                        type="checkbox"
                        aria-label={activo ? `Seleccionar a ${nombre}` : `${nombre}: cuenta no activa, no se puede restablecer`}
                        checked={seleccion.has(e.id)}
                        disabled={!activo || !!pendiente}
                        onChange={(ev) => alternar(e.id, ev.target.checked)}
                      />
                    </td>
                    <th scope="row">
                      {e.apellidos} {e.nombres}
                    </th>
                    <td data-etiqueta="Correo" className="admin-correo">
                      {e.correo}
                    </td>
                    <td data-etiqueta="Estado">
                      <span className="admin-estado" data-estado={e.estado}>
                        {ETIQUETA_ESTADO[e.estado]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <Confirmar
        abierto={confirmar}
        titulo={elegidos.length > 1 ? `¿Restablecer ${elegidos.length} contraseñas?` : "¿Restablecer la contraseña?"}
        textoConfirmar="Sí, restablecer"
        peligro
        pendiente={ocupado}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={restablecer}
      >
        <p>
          Se generará una contraseña nueva para{" "}
          {elegidos.length === 1 ? `${elegidos[0].nombres} ${elegidos[0].apellidos}` : `${elegidos.length} estudiantes`}
          . La anterior dejará de funcionar de inmediato y sus sesiones se cerrarán.
        </p>
        <p>Las nuevas credenciales se descargan una sola vez en un archivo CSV.</p>
      </Confirmar>
    </section>
  );
}
