"use client";

/**
 * Importación CSV (INC1R-06): elegir tipo → vista previa por fila → importar.
 * El CSV de credenciales se descarga en el mismo clic de importar y no queda
 * guardado en el navegador ni en el servidor: no hay forma de volver a pedirlo.
 */

import { useRef, useState } from "react";
import { Download, FileCheck2, Upload } from "lucide-react";
import { llamarApi, Confirmar } from "../comunes";

type Tipo = "estudiantes" | "docentes";
type Fila = { linea: number; nombres: string; apellidos: string; correo: string; grupo?: string; estado: "NUEVA" | "DUPLICADA" | "ERROR"; errores: string[] };
type Revision = {
  tipo: Tipo;
  filas: Fila[];
  resumen: { total: number; nuevas: number; duplicadas: number; conError: number };
  errorArchivo: string | null;
};

const ETIQUETA_ESTADO = { NUEVA: "Se creará", DUPLICADA: "Ya existe · se omite", ERROR: "Con error" } as const;

function descargarTexto(texto: string, nombre: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function FormularioImportacion() {
  const [tipo, setTipo] = useState<Tipo>("estudiantes");
  const [contenido, setContenido] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [revision, setRevision] = useState<Revision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const archivoRef = useRef<HTMLInputElement>(null);

  function reiniciar() {
    setRevision(null);
    setError(null);
    setExito(null);
  }

  async function alElegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    reiniciar();
    const f = e.target.files?.[0];
    if (!f) return setContenido(null);
    setNombreArchivo(f.name);
    setContenido(await f.text());
  }

  async function revisar(e: React.FormEvent) {
    e.preventDefault();
    reiniciar();
    if (!contenido) return setError("Adjunta un archivo CSV.");
    setPendiente(true);
    const r = await llamarApi<Revision>("/api/usuarios/importar/vista-previa", "POST", { tipo, contenido });
    setPendiente(false);
    if (!r.ok) return setError(r.mensaje);
    setRevision(r.datos);
  }

  async function importar() {
    if (!contenido) return;
    setPendiente(true);
    setError(null);
    try {
      const r = await fetch("/api/usuarios/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, contenido }),
        cache: "no-store",
      });
      if (r.ok) {
        const creadas = r.headers.get("X-Total-Creadas") ?? "0";
        const omitidas = r.headers.get("X-Total-Omitidas") ?? "0";
        const nombre = /filename="([^"]+)"/.exec(r.headers.get("Content-Disposition") ?? "")?.[1] ?? `credenciales-${tipo}.csv`;
        descargarTexto(await r.text(), nombre);
        setExito(
          `Se crearon ${creadas} cuenta(s) y se omitieron ${omitidas} correo(s) ya existentes. ` +
            `El archivo ${nombre} con las contraseñas iniciales se descargó ahora y no se puede volver a descargar; ` +
            `si se pierde, restablece las contraseñas.`,
        );
        setRevision(null);
        setContenido(null);
        setNombreArchivo("");
        if (archivoRef.current) archivoRef.current.value = "";
      } else {
        const json = await r.json().catch(() => null);
        setError(json?.error?.message ?? "No se pudo importar. Intenta de nuevo.");
        if (json?.revision) setRevision(json.revision);
      }
    } catch {
      setError("No hay conexión con el servidor. Revisa la red e intenta de nuevo.");
    } finally {
      setPendiente(false);
      setConfirmar(false);
    }
  }

  const puedeImportar = !!revision && !revision.errorArchivo && revision.resumen.conError === 0 && revision.resumen.nuevas > 0;

  return (
    <div className="admin-columna">
      <form onSubmit={revisar} className="admin-formulario cuenta-panel" aria-labelledby="imp-titulo">
        <h2 id="imp-titulo" className="admin-subtitulo">1. Archivo</h2>
        <fieldset className="admin-opciones">
          <legend>¿Qué cuentas vas a importar?</legend>
          {(["estudiantes", "docentes"] as const).map((t) => (
            <label key={t} className="admin-opcion">
              <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => (setTipo(t), reiniciar())} />
              <span>
                <strong>{t === "estudiantes" ? "Estudiantes" : "Docentes"}</strong>
                <small>
                  {t === "estudiantes"
                    ? "Columnas: nombres, apellidos, correo, año, grado, grupo. Ej.: año 2026, grado 2°, grupo 01."
                    : "Columnas: nombres, apellidos, correo. Deberán cambiar la contraseña temporal al ingresar."}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="admin-nota">El CSV nunca crea cuentas de administración.</p>
        <div className="cuenta-acciones">
          <a className="boton-pastilla" data-variante="secundario" href={`/api/usuarios/importar/plantilla?tipo=${tipo}`} download>
            <Download size={18} aria-hidden="true" /> Descargar plantilla de {tipo}
          </a>
        </div>
        <div className="admin-campo">
          <label htmlFor="imp-archivo">Archivo CSV</label>
          <input ref={archivoRef} id="imp-archivo" type="file" accept=".csv,text/csv" onChange={alElegirArchivo} aria-describedby="imp-archivo-ayuda" />
          <small id="imp-archivo-ayuda" className="admin-nota">
            {nombreArchivo ? `Seleccionado: ${nombreArchivo}` : "Usa la plantilla con los encabezados exactos. Máximo 500 filas."}
          </small>
        </div>
        <div className="cuenta-acciones">
          <button type="submit" className="boton-pastilla" data-variante="primario" disabled={pendiente || !contenido}>
            <FileCheck2 size={18} aria-hidden="true" /> {pendiente && !confirmar ? "Revisando…" : "Revisar archivo"}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {error ? (
          <p role="alert" className="admin-aviso" data-tipo="error">
            {error}
          </p>
        ) : null}
        {exito ? (
          <p role="status" className="admin-aviso" data-tipo="ok">
            {exito}
          </p>
        ) : null}
      </div>

      {revision && !revision.errorArchivo ? (
        <section aria-labelledby="imp-previa" className="admin-resultados">
          <div className="section-heading">
            <h2 id="imp-previa">2. Vista previa</h2>
          </div>
          <dl className="admin-resumen">
            <div><dt>Filas</dt><dd>{revision.resumen.total}</dd></div>
            <div><dt>Se crearán</dt><dd>{revision.resumen.nuevas}</dd></div>
            <div><dt>Ya existen (se omiten)</dt><dd>{revision.resumen.duplicadas}</dd></div>
            <div><dt>Con error</dt><dd>{revision.resumen.conError}</dd></div>
          </dl>
          {revision.resumen.conError > 0 ? (
            <p className="admin-aviso" data-tipo="error">
              Corrige las filas con error y vuelve a revisar el archivo. Mientras haya errores no se crea ninguna cuenta.
            </p>
          ) : null}
          <div className="admin-tabla-marco">
            <table className="admin-tabla">
              <caption className="sr-only">Revisión fila por fila del archivo</caption>
              <thead>
                <tr>
                  <th scope="col">Línea</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  {revision.tipo === "estudiantes" ? <th scope="col">Grupo</th> : null}
                  <th scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {revision.filas.map((f) => (
                  <tr key={f.linea}>
                    <td>{f.linea}</td>
                    <th scope="row">{`${f.nombres} ${f.apellidos}`.trim() || "—"}</th>
                    <td className="admin-correo">{f.correo || "—"}</td>
                    {revision.tipo === "estudiantes" ? <td>{f.grupo ?? "—"}</td> : null}
                    <td>
                      <span className="admin-estado" data-estado={f.estado === "NUEVA" ? "ACTIVO" : f.estado === "DUPLICADA" ? "INACTIVO" : "ERROR"}>
                        {ETIQUETA_ESTADO[f.estado]}
                      </span>
                      {f.errores.length > 0 ? (
                        <ul className="admin-errores-fila">
                          {f.errores.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cuenta-acciones">
            <button type="button" className="boton-pastilla" data-variante="primario" disabled={!puedeImportar || pendiente} onClick={() => setConfirmar(true)}>
              <Upload size={18} aria-hidden="true" /> Importar {revision.resumen.nuevas} cuenta(s)
            </button>
          </div>
        </section>
      ) : null}

      <Confirmar
        abierto={confirmar}
        titulo="Confirmar importación"
        textoConfirmar="Importar y descargar contraseñas"
        pendiente={pendiente}
        onConfirmar={importar}
        onCancelar={() => setConfirmar(false)}
      >
        <p>
          Se crearán {revision?.resumen.nuevas ?? 0} cuenta(s) de {tipo}. El archivo con correo y contraseña inicial se descarga una
          sola vez: guárdalo en un lugar seguro y entrégalo a cada persona.
        </p>
      </Confirmar>
    </div>
  );
}
