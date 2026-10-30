import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { RotuloArea } from "@/components/friso/piezas";
import { PROGRAMAS, AREAS } from "@/lib/datos";
import { cn } from "@/lib/utils";

/*
  AGENDA — el ritual de liberación: la docente controla CUÁNDO una unidad
  queda disponible para los estudiantes. Mecanismo observado en la referencia
  que MIDUHO conserva, con vista de calendario.

  El calendario es el friso plegado sobre sí mismo: cada día es una celda y
  cada evento lleva la plancha de color de su área, así que un mes se lee
  por color antes de leerse por texto.
*/

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const EVENTOS: Record<
  number,
  { titulo: string; area: keyof typeof AREAS; tipo: string }[]
> = {
  3: [{ titulo: "Contar lo que tengo", area: "emprendimiento", tipo: "Liberada" }],
  11: [{ titulo: "Ficha de lectura — Caperucita", area: "literatura", tipo: "Vence" }],
  15: [{ titulo: "Sensores que miden", area: "robotica", tipo: "Se libera 07:00" }],
  19: [{ titulo: "Tabla de tres medidas", area: "robotica", tipo: "Vence" }],
  24: [{ titulo: "El precio justo", area: "emprendimiento", tipo: "Sin programar" }],
};

export default function Agenda() {
  const primerDia = 1; /* septiembre de 2026 empieza en martes */
  const diasDelMes = 30;
  const celdas = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ];

  const sinProgramar = PROGRAMAS[0].bloques
    .flatMap((b) => b.unidades)
    .filter((u) => u.estado === "sin-programar");

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Agenda" }]} />

      <Cabecera
        kicker="Septiembre 2026 · Período 3"
        titulo="Agenda"
        nota="La docente decide cuándo cada unidad queda disponible para los estudiantes: de inmediato o programada por fecha y hora. Hasta ese momento, el estudiante no la ve."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-start">
        <section className="rounded-[15px] bg-papel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-[19px] font-bold uppercase tracking-[0.05em] text-tinta">
              Septiembre 2026
            </h2>
            <div className="flex flex-wrap gap-2">
              <RotuloArea area="literatura" />
              <RotuloArea area="robotica" />
              <RotuloArea area="emprendimiento" />
            </div>
          </div>

          <div className="agenda-grid grid grid-cols-7 gap-1.5">
            {DIAS.map((d) => (
              <div
                key={d}
                className="agenda-weekday pb-1.5 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-gris"
              >
                {d}
              </div>
            ))}
            {celdas.map((dia, i) => {
              if (dia === null)
                return <div key={`v${i}`} className="agenda-blank min-h-[84px]" />;
              const eventos = EVENTOS[dia] ?? [];
              const hoy = dia === 9;
              return (
                <div
                  key={dia}
                  data-today={hoy || undefined}
                  data-weekday={DIAS[(primerDia + dia - 1) % 7]}
                  className={cn(
                    "agenda-day min-h-[84px] rounded-[9px] p-1.5",
                    hoy ? "bg-tinta" : eventos.length > 0 ? "bg-hueso" : "bg-hueso/60"
                  )}
                >
                  <span
                    className={cn(
                      "block text-[11.5px] font-bold tabular-nums",
                      hoy ? "text-white" : "text-gris"
                    )}
                  >
                    {dia}
                    {hoy && (
                      <span className="ml-1.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-white">
                        Hoy
                      </span>
                    )}
                  </span>
                  {eventos.map((e, j) => {
                    const a = AREAS[e.area];
                    return (
                      <span
                        key={j}
                        className="agenda-event mt-1 block rounded-[6px] px-1.5 py-1 text-[10px] leading-[1.25]"
                        style={{ background: a.plancha, color: "#fff" }}
                      >
                        <span className="block font-bold">{e.tipo}</span>
                        <span className="block">{e.titulo}</span>
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[15px] bg-papel p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-[15px] font-bold uppercase tracking-[0.1em] text-tinta">
              Sin programar
            </h2>
            <span className="text-[15px] font-bold tabular-nums text-gris">
              {sinProgramar.length}
            </span>
          </div>
          <p className="mb-3.5 text-[13px] leading-[1.55] text-gris">
            Unidades que ningún estudiante puede ver todavía porque no tienen fecha de
            liberación.
          </p>
          <ul className="flex flex-col gap-2">
            {sinProgramar.slice(0, 6).map((u) => {
              const a = AREAS[u.area];
              return (
                <li
                  key={u.id}
                  className="rounded-[9px] px-3.5 py-2.5"
                  style={{ background: a.pale, color: a.tinta }}
                >
                  <span className="block text-[13.5px] font-bold leading-tight">
                    {u.titulo}
                  </span>
                  <span
                    className="mt-0.5 block text-[11.5px]"
                    style={{ color: a.medio }}
                  >
                    Unidad {u.orden} · {a.nombre}
                  </span>
                </li>
              );
            })}
          </ul>
          {sinProgramar.length > 6 && (
            <p className="mt-3 text-[12px] tabular-nums text-gris">
              y {sinProgramar.length - 6} más
            </p>
          )}
        </section>
      </div>
    </Marco>
  );
}
