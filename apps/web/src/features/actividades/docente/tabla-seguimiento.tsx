type Estudiante = { estudianteId: string; nombres: string; apellidos: string; estado: string;
  intentosUsados: number; nota: number | null; ultimoEnvio: Date | null };
type Grupo = { asignacionId: string; grupo: string; resumen: { respondieron: number; total: number; promedio: number | null };
  estudiantes: Estudiante[] };

const ESTADOS: Record<string, string> = { RESPONDIO: "Respondió", VIO_VIDEO: "Vio el video",
  EN_CURSO: "En curso", SIN_ENTREGAR: "Sin entregar", SIN_EMPEZAR: "Sin empezar" };

export function TablaSeguimiento({ grupo }: { grupo: Grupo }) {
  return <div className="mt-6">
    <h3 className="font-heading text-lg font-bold text-tinta">Grupo {grupo.grupo}</h3>
    <p className="mt-1 text-tinta">{grupo.resumen.respondieron} de {grupo.resumen.total} respondieron · Promedio: {grupo.resumen.promedio === null ? "sin notas" : `${grupo.resumen.promedio} %`}</p>
    <div className="mt-3 max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dia-azul)]"
      tabIndex={0} role="region" aria-label={`Tabla de seguimiento del grupo ${grupo.grupo}`}>
      <table className="w-full min-w-[620px] border-collapse text-left text-sm text-tinta">
        <caption className="sr-only">Seguimiento del grupo {grupo.grupo}</caption>
        <thead><tr className="border-b border-linea">
          <th scope="col" className="p-2">Estudiante</th><th scope="col" className="p-2">Estado</th>
          <th scope="col" className="p-2">Intentos usados</th><th scope="col" className="p-2">Mejor nota</th>
          <th scope="col" className="p-2">Último envío</th>
        </tr></thead>
        <tbody>{grupo.estudiantes.map((estudiante) => <tr key={estudiante.estudianteId} className="border-b border-linea">
          <th scope="row" className="p-2 font-semibold">{estudiante.apellidos} {estudiante.nombres}</th>
          <td className="p-2">{ESTADOS[estudiante.estado] ?? estudiante.estado}</td>
          <td className="p-2 tabular-nums">{estudiante.intentosUsados}</td>
          <td className="p-2 tabular-nums">{estudiante.nota === null ? "—" : `${estudiante.nota} %`}</td>
          <td className="p-2">{estudiante.ultimoEnvio ? estudiante.ultimoEnvio.toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}
