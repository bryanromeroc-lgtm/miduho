import { AREAS, type Area } from "@/lib/datos";

/*
  EL FRISO — la banda de trechos y su regla de horas.

  LA REGLA QUE SALVA LA COMPOSICIÓN: el friso ENVUELVE. Cuando se acaba el
  ancho, la banda continúa en la línea siguiente, como un friso que da la
  vuelta a la pared. Nunca hay scroll horizontal — es requisito de
  PRODUCT.md, y es la corrección al comp aprobado, que cortaba el cuarto
  trecho a 1440px. Con las 14 asignaturas reales del colegio el friso ocupa
  varias líneas; jamás una barra de desplazamiento lateral.

  La regla de horas va debajo de cada trecho, dentro de su misma celda de
  rejilla, para que envuelva junto con él y siga marcando su propia hora.
*/

export function Friso({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(266px,1fr))] items-stretch gap-2.5">
      {children}
    </div>
  );
}

/* Una celda del friso: el trecho más su marca en la regla de horas. */
export function TrechoConRegla({
  hora,
  area,
  activa,
  children,
}: {
  hora: string;
  area?: Area;
  activa?: boolean;
  children: React.ReactNode;
}) {
  const color = activa
    ? area
      ? AREAS[area].plancha
      : "var(--color-tinta)"
    : "var(--color-linea)";

  return (
    <div className="friso-trecho flex h-full flex-col" data-active={activa || undefined}>
      <div className="friso-plancha-wrap flex flex-1 flex-col">
        {activa && (
          <span className="marca-ahora" aria-hidden="true">
            Ahora
          </span>
        )}
        {children}
      </div>
      {/* La regla de horas — el canto del friso */}
      <div
        className="regla-hora mt-3 border-t-[3px] pt-2.5 font-heading text-[13px] font-bold uppercase tracking-[0.1em]"
        style={{
          borderColor: color,
          color: activa
            ? area
              ? AREAS[area].plancha
              : "var(--color-tinta)"
            : "var(--color-gris)",
        }}
      >
        {hora}
        {activa && " · ahora"}
      </div>
    </div>
  );
}
