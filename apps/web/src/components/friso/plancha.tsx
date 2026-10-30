import Link from "next/link";
import { AREAS, type Area } from "@/lib/datos";
import { cn } from "@/lib/utils";

/*
  LA PLANCHA — la primitiva del sistema Friso de Aula.

  Un bloque de color de área que POSEE la región entera y contiene un
  estante blanco. El color no es un canto ni un acento: es la superficie.
  Un trecho sin área (una clase sin material) va en apagado y su rótulo
  toma la tinta de aviso, nunca un color de área que no le corresponde.
*/

export function Plancha({
  area,
  hora,
  rotulo,
  titulo,
  children,
  className,
  pie,
  /* el nombre que hace de esta plancha el elemento que persiste entre la
     banda y la vista desplegada — la motion nativa del friso */
  transicion,
}: {
  area?: Area;
  hora: string;
  /* el nombre del área, en texto: el color nunca es el único portador */
  rotulo: string;
  titulo: string;
  children: React.ReactNode;
  className?: string;
  pie?: React.ReactNode;
  transicion?: string;
}) {
  const paleta = area ? AREAS[area] : null;


  return (
    <article
      className={cn("plancha trecho-entra h-full", className)}
      style={{
        background: paleta ? paleta.plancha : "var(--color-hueso)",
        color: paleta ? "#fff" : "var(--color-tinta)",
        viewTransitionName: transicion,
      }}
    >
      <header className="px-[22px] pb-4 pt-5">
        <p className="font-heading text-[22px] font-bold leading-none">{hora}</p>
        <p
          className="mt-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em]"
          style={{
            /* blanco pleno: al 82% no alcanza 4.5:1 sobre la plancha naranja */
            color: paleta ? "#fff" : "var(--color-gris)",
          }}
        >
          {rotulo}
        </p>
        <h2 className="mt-1 font-heading text-[21px] font-bold leading-[1.2]">
          {titulo}
        </h2>
      </header>

      <div className="plancha-estante">{children}</div>

      {pie}
    </article>
  );
}

/*
  LA FICHA — fondo pálido del área, sin borde. El tipo va en versales
  arriba y el título en negrita: se lee de un vistazo desde lejos.
*/
export function Ficha({
  area,
  tipo,
  titulo,
  meta,
}: {
  area: Area;
  tipo: string;
  titulo: string;
  meta?: string;
}) {
  const paleta = AREAS[area];
  return (
    <div
      className="rounded-[9px] px-[13px] py-[11px]"
      style={{ background: paleta.pale, color: paleta.tinta }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.07em]"
        style={{ color: paleta.medio }}
      >
        {tipo}
      </p>
      <p className="mt-[3px] text-[13px] font-semibold leading-[1.3]">{titulo}</p>
      {meta && (
        <p className="mt-1.5 text-[11.5px] font-medium" style={{ color: paleta.medio }}>
          {meta}
        </p>
      )}
    </div>
  );
}

/*
  LA RANURA LIBRE — un control, no un relleno. Invita en vez de rayar:
  el rayado diagonal de la propuesta anterior se leía como error.
*/
export function RanuraLibre({
  etiqueta = "Añadir material",
  onClick,
}: {
  etiqueta?: string;
  onClick?: () => void;
}) {
  if (!onClick) return <Link href="/biblioteca" className="ranura-libre">+ {etiqueta}</Link>;
  return (
    <button type="button" className="ranura-libre" onClick={onClick}>
      + {etiqueta}
    </button>
  );
}
