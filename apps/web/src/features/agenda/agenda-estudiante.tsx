"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Clock, List, X } from "lucide-react";
import { Migas } from "@/components/friso/marco";
import {
  agrupar,
  diaMes,
  estadoDe,
  fechaConHora,
  marcasPorDia,
  moverMes,
  semanasDelMes,
  tituloDia,
  tituloMes,
  tocaDia,
  type ActividadAgenda,
  type DatosAgenda,
} from "@/lib/agenda";
import { guiaDe } from "@/lib/guias";
import s from "./agenda.module.css";

const SEMANA = [
  ["LUN", "lunes"],
  ["MAR", "martes"],
  ["MIÉ", "miércoles"],
  ["JUE", "jueves"],
  ["VIE", "viernes"],
  ["SÁB", "sábado"],
  ["DOM", "domingo"],
] as const;
const DISPONIBLES_POR_TANDA = 8;

/*
  «MI AGENDA» — la lista de lo que el estudiante tiene que hacer manda; el
  calendario del mes la acompaña y filtra por día. Mismos datos en los dos:
  los autorizados por el servidor (nunca una actividad por abrir).
*/
export function AgendaEstudiante({ datos }: { datos: DatosAgenda }) {
  const [anioHoy, mesHoy] = datos.hoy.split("-").map(Number);
  const [mes, setMes] = useState({ anio: anioHoy, mes: mesHoy });
  const [materia, setMateria] = useState("");
  const [dia, setDia] = useState<string | null>(null);
  const [vista, setVista] = useState<"lista" | "calendario">("lista");
  const [tanda, setTanda] = useState(1);

  const deMateria = useMemo(
    () => datos.actividades.filter((a) => !materia || a.materia.id === materia),
    [datos.actividades, materia],
  );
  const marcas = useMemo(() => marcasPorDia(deMateria), [deMateria]);
  const grupos = useMemo(() => agrupar(dia ? deMateria.filter((a) => tocaDia(a, dia)) : deMateria), [deMateria, dia]);
  const conFechas = datos.actividades.some((a) => a.abre || a.cierra);
  const vacio = grupos.porEntregar.length === 0 && grupos.disponibles.length === 0 && grupos.terminadas.length === 0;
  const visiblesDisponibles = grupos.disponibles.slice(0, tanda * DISPONIBLES_POR_TANDA);

  function elegirDia(d: string) {
    setDia((actual) => (actual === d ? null : d));
    setVista("lista");
  }

  return (
    <div className={`superficie-dia ${s.pagina}`}>
      <Migas pasos={[{ etiqueta: "Inicio", href: "/" }, { etiqueta: "Agenda" }]} />
      <header className={s.cabecera}>
        <h1 className={s.titulo}>Mi agenda</h1>
        <p className={s.bajada}>Organiza tus actividades, paso a paso.</p>
      </header>

      <div className={s.controles}>
        <div className={s.vistas} role="group" aria-label="Qué ver">
          <button type="button" aria-pressed={vista === "lista"} onClick={() => setVista("lista")}>
            <List size={20} strokeWidth={2.4} aria-hidden="true" />
            Próximas actividades
          </button>
          <button type="button" aria-pressed={vista === "calendario"} onClick={() => setVista("calendario")}>
            <CalendarDays size={20} strokeWidth={2.4} aria-hidden="true" />
            Calendario
          </button>
        </div>
        <label className={s.filtro}>
          <span className="sr-only">Materia</span>
          <select
            value={materia}
            onChange={(e) => {
              setMateria(e.target.value);
              setTanda(1);
            }}
          >
            <option value="">Todas las materias</option>
            {datos.materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={s.cuerpo} data-vista={vista}>
        <section className={s.lista} aria-labelledby="lista-titulo">
          <div className={s.listaCabecera}>
            <h2 id="lista-titulo">Próximas actividades</h2>
            {dia && (
              <button type="button" className={s.diaElegido} onClick={() => setDia(null)}>
                {diaMes(dia)}
                <X size={16} strokeWidth={2.6} aria-hidden="true" />
                <span className="sr-only">: quitar el filtro de día</span>
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {dia ? `Actividades del ${diaMes(dia)}.` : ""}
          </p>

          {vacio ? (
            <p className={s.vacio}>
              {dia
                ? "No tienes actividades para ese día."
                : datos.grupo
                  ? "No tienes actividades programadas para este período."
                  : "Aún no tienes un grupo asignado. Pídele ayuda a tu docente."}
            </p>
          ) : (
            <>
              {grupos.porEntregar.map((g) => (
                <div key={g.dia} className={s.grupo}>
                  <h3>{tituloDia(g.dia)}</h3>
                  <ul>
                    {g.actividades.map((a) => (
                      <Fila key={`${a.materia.id}-${a.id}`} actividad={a} />
                    ))}
                  </ul>
                </div>
              ))}

              {grupos.disponibles.length > 0 && (
                <div className={s.grupo}>
                  <h3>Actividades disponibles</h3>
                  <ul>
                    {visiblesDisponibles.map((a) => (
                      <Fila key={`${a.materia.id}-${a.id}`} actividad={a} />
                    ))}
                  </ul>
                  {visiblesDisponibles.length < grupos.disponibles.length && (
                    <button type="button" className={s.mas} onClick={() => setTanda((t) => t + 1)}>
                      Mostrar más ({grupos.disponibles.length - visiblesDisponibles.length})
                    </button>
                  )}
                </div>
              )}

              {grupos.terminadas.length > 0 && (
                <details className={s.terminadas}>
                  <summary>Entregadas y cerradas ({grupos.terminadas.length})</summary>
                  <ul>
                    {grupos.terminadas.map((a) => (
                      <Fila key={`${a.materia.id}-${a.id}`} actividad={a} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </section>

        <aside className={s.lateral} aria-label="Calendario">
          <Calendario
            anio={mes.anio}
            mes={mes.mes}
            hoy={datos.hoy}
            marcas={marcas}
            elegido={dia}
            onMes={(paso) => setMes((m) => moverMes(m.anio, m.mes, paso))}
            onHoy={() => setMes({ anio: anioHoy, mes: mesHoy })}
            onDia={elegirDia}
          />
          {conFechas ? (
            <dl className={s.leyenda}>
              <div>
                <span className={s.leyendaIcono} data-tipo="apertura" aria-hidden="true">
                  <CalendarDays size={22} strokeWidth={2.2} />
                </span>
                <dt>Disponible desde</dt>
                <dd>Día en que la actividad se habilita para que puedas verla y realizarla.</dd>
              </div>
              <div>
                <span className={s.leyendaIcono} data-tipo="entrega" aria-hidden="true">
                  <Clock size={22} strokeWidth={2.2} />
                </span>
                <dt>Fecha de entrega</dt>
                <dd>Día límite para completar y entregar tu actividad.</dd>
              </div>
            </dl>
          ) : (
            <p className={s.nota}>Tus actividades de ahora no tienen fecha: puedes hacerlas cuando quieras.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Fila({ actividad: a }: { actividad: ActividadAgenda }) {
  const guia = guiaDe(a.materia.escena);
  const estado = estadoDe(a);
  return (
    <li className={s.fila}>
      <span className={s.retrato} data-familia={a.materia.escena}>
        {guia ? (
          <Image src={guia.retrato} alt="" width={192} height={192} sizes="80px" />
        ) : (
          <BookOpen size={30} strokeWidth={2} aria-hidden="true" />
        )}
      </span>
      <div className={s.filaTexto}>
        <span className={s.materia} data-familia={a.materia.escena}>
          {a.materia.nombre}
        </span>
        <h4 className={s.filaTitulo}>{a.titulo}</h4>
        <p className={s.fecha}>
          {a.cierra ? (
            <>
              <Clock size={18} strokeWidth={2.2} aria-hidden="true" />
              Entrega: {fechaConHora(a.cierra)}
            </>
          ) : a.abre ? (
            <>
              <CalendarDays size={18} strokeWidth={2.2} aria-hidden="true" />
              Disponible desde el {fechaConHora(a.abre)} · Sin fecha de entrega
            </>
          ) : (
            <>
              <CalendarDays size={18} strokeWidth={2.2} aria-hidden="true" />
              Sin fecha de entrega
            </>
          )}
        </p>
      </div>
      <div className={s.filaAccion}>
        <span className={s.estado} data-tono={estado.tono}>
          {estado.texto}
        </span>
        {estado.accion && (
          <Link href={a.href} className={s.ver} aria-label={`Ver actividad: ${a.titulo}, de ${a.materia.nombre}`}>
            <BookOpen size={18} strokeWidth={2.4} aria-hidden="true" />
            Ver actividad
          </Link>
        )}
      </div>
    </li>
  );
}

function Calendario({
  anio,
  mes,
  hoy,
  marcas,
  elegido,
  onMes,
  onHoy,
  onDia,
}: {
  anio: number;
  mes: number;
  hoy: string;
  marcas: Map<string, { entregas: number; aperturas: number }>;
  elegido: string | null;
  onMes: (paso: number) => void;
  onHoy: () => void;
  onDia: (dia: string) => void;
}) {
  const semanas = semanasDelMes(anio, mes);
  const esMesDeHoy = hoy.startsWith(`${anio}-${String(mes).padStart(2, "0")}`);
  const anterior = moverMes(anio, mes, -1);
  const siguiente = moverMes(anio, mes, 1);
  return (
    <div className={s.calendario}>
      <div className={s.calCabecera}>
        <button type="button" className={s.calFlecha} onClick={() => onMes(-1)} aria-label={`Ver ${tituloMes(anterior.anio, anterior.mes)}`}>
          <ChevronLeft size={22} strokeWidth={2.6} aria-hidden="true" />
        </button>
        <h2 className={s.calTitulo} aria-live="polite">
          {tituloMes(anio, mes).replace(" de ", " ")}
        </h2>
        <button type="button" className={s.calFlecha} onClick={() => onMes(1)} aria-label={`Ver ${tituloMes(siguiente.anio, siguiente.mes)}`}>
          <ChevronRight size={22} strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
      <table className={s.mes}>
        <thead>
          <tr>
            {SEMANA.map(([corto, largo]) => (
              <th key={corto} scope="col" abbr={largo}>
                {corto}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semanas.map((semana, i) => (
            <tr key={i}>
              {semana.map((d, j) => {
                if (!d) return <td key={j} className={s.fuera} />;
                const m = marcas.get(d);
                const numero = Number(d.slice(8));
                const esHoy = d === hoy;
                if (!m)
                  return (
                    <td key={d} data-hoy={esHoy ? "" : undefined}>
                      <span className={s.dia}>
                        {numero}
                        {esHoy && <span className="sr-only"> (hoy)</span>}
                      </span>
                    </td>
                  );
                const partes = [
                  m.entregas ? `${m.entregas} ${m.entregas === 1 ? "entrega" : "entregas"}` : null,
                  m.aperturas ? `${m.aperturas} ${m.aperturas === 1 ? "actividad se habilita" : "actividades se habilitan"}` : null,
                ].filter(Boolean);
                return (
                  <td key={d} data-hoy={esHoy ? "" : undefined}>
                    <button
                      type="button"
                      className={s.dia}
                      aria-pressed={elegido === d}
                      aria-label={`${diaMes(d)}${esHoy ? " (hoy)" : ""}: ${partes.join(" y ")}`}
                      onClick={() => onDia(d)}
                    >
                      {numero}
                      <span className={s.punto} aria-hidden="true" />
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!esMesDeHoy && (
        <button type="button" className={s.calHoy} onClick={onHoy}>
          Volver a hoy
        </button>
      )}
    </div>
  );
}
