import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { nombreCelda, textoCelda, type AreaContenido, type CeldaContenido, type GradoContenido, type IndiceContenido } from "@/lib/contenido";
import s from "./matriz.module.css";

/*
  CONTENIDO PEDAGÓGICO — mapa de cobertura de la coordinadora
  (vista-admin-contenido, D7). Una tabla de datos por área: fila por
  asignatura, columna por cada grado del colegio. Tres estados que se leen
  por la palabra, no solo por el color: «N actividades» y «Sin contenido»
  llevan a la vista previa; «No se dicta» es texto y no se puede activar.
  En pantallas angostas la tabla se desplaza dentro de su propia región.
*/
export function IndiceContenidoPedagogico({ indice }: { indice: IndiceContenido }) {
  const { grados, areas } = indice;
  return (
    <div className={s.indice}>
      <Leyenda />
      {areas.map((area) => (
        <MatrizArea key={area.id} area={area} grados={grados} />
      ))}
    </div>
  );
}

function Leyenda() {
  return (
    <section className={s.leyenda} aria-labelledby="leyenda-contenido">
      <h2 id="leyenda-contenido" className={s.leyendaTitulo}>
        Cómo leer cada celda
      </h2>
      <ul className={s.leyendaLista}>
        <li>
          <span className={s.celda} data-estado="con-contenido">
            8 actividades
          </span>
          <span>Se dicta y tiene actividades del currículo. Abre la vista previa.</span>
        </li>
        <li>
          <span className={s.celda} data-estado="sin-contenido">
            Sin contenido
          </span>
          <span>Se dicta en ese grado, pero aún no tiene actividades.</span>
        </li>
        <li>
          <span className={s.celda} data-estado="no-se-dicta">
            No se dicta
          </span>
          <span>La asignatura no está asociada a ese grado.</span>
        </li>
      </ul>
    </section>
  );
}

function MatrizArea({ area, grados }: { area: AreaContenido; grados: GradoContenido[] }) {
  const titulo = `area-${area.id}`;
  return (
    <section className={s.area} aria-labelledby={titulo}>
      <h2 id={titulo} className={s.areaNombre}>
        {area.nombre}
      </h2>
      {area.asignaturas.length === 0 ? (
        <p className={s.areaVacia}>Esta área todavía no tiene asignaturas.</p>
      ) : (
        <div className={s.desplazable} role="region" aria-label={`Matriz de ${area.nombre}, desplazable`} tabIndex={0}>
          <table className={s.tabla}>
            <caption className="sr-only">{area.nombre}: actividades por asignatura y grado</caption>
            <thead>
              <tr>
                <th scope="col" className={s.esquina}>
                  Asignatura
                </th>
                {grados.map((g) => (
                  <th key={g.id} scope="col" className={s.grado}>
                    {g.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {area.asignaturas.map((fila) => (
                <tr key={fila.id}>
                  <th scope="row" className={s.asignatura}>
                    {fila.nombre}
                  </th>
                  {fila.celdas.map((c, i) => (
                    <td key={grados[i].id}>
                      <Celda celda={c} asignatura={fila.nombre} grado={grados[i].nombre} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Celda({ celda, asignatura, grado }: { celda: CeldaContenido; asignatura: string; grado: string }) {
  if (celda.estado === "no-se-dicta") {
    return (
      <span className={s.celda} data-estado="no-se-dicta">
        {textoCelda(celda)}
      </span>
    );
  }
  return (
    <Link href={celda.href} className={s.celda} data-estado={celda.estado} aria-label={nombreCelda(asignatura, grado, celda)}>
      {textoCelda(celda)}
      {celda.estado === "con-contenido" && <ArrowRight size={16} strokeWidth={2.8} aria-hidden="true" className={s.flecha} />}
    </Link>
  );
}
