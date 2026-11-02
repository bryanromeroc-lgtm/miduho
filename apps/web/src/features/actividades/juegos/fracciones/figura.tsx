"use client";

import { describirFigura, type Forma } from "./tipo";
import s from "./fracciones.module.css";

/*
  Las tres formas del taller, en SVG propio: círculos y barras partidos en
  partes iguales, y la recta numérica con sus saltos. Las partes se pintan en
  orden (la n-ésima pintada es siempre la siguiente), así el número de arriba
  se lee contando desde el comienzo.

  Con puntero se toca la parte o la rayita; con teclado y lector de pantalla
  se usan los contadores de al lado, que hacen lo mismo. Por eso la figura es
  una imagen con su descripción y sus zonas tocables no reciben foco.
*/

type Props = {
  forma: Forma;
  n: number;
  d: number;
  unidades: number;
  /** Nuevo número de partes pintadas (o saltos); sin él la figura es solo para mirar. */
  onCambiar?: (n: number) => void;
  tamano?: "grande" | "mini";
};

export function Figura(props: Props) {
  const { forma, n, d } = props;
  const etiqueta = describirFigura(forma, n, d);
  if (forma === "recta") return <Recta {...props} etiqueta={etiqueta} />;
  return forma === "circulo" ? <Circulos {...props} etiqueta={etiqueta} /> : <Barras {...props} etiqueta={etiqueta} />;
}

/** Al tocar la parte i: si estaba pintada se despinta desde ahí; si no, se pinta hasta ella. */
const tocar = (i: number, n: number) => (i < n ? i : i + 1);

function Circulos({ n, d, unidades, onCambiar, tamano = "grande", etiqueta }: Props & { etiqueta: string }) {
  const R = 52;
  const sector = (k: number) => {
    const a0 = ((k / d) * 360 - 90) * (Math.PI / 180);
    const a1 = (((k + 1) / d) * 360 - 90) * (Math.PI / 180);
    const p = (a: number) => `${60 + R * Math.cos(a)} ${60 + R * Math.sin(a)}`;
    return `M60 60 L${p(a0)} A${R} ${R} 0 ${1 / d > 0.5 ? 1 : 0} 1 ${p(a1)} Z`;
  };
  return (
    <svg className={s.figura} data-forma="circulo" data-tamano={tamano} viewBox={`0 0 ${unidades * 124} 120`} role="img" aria-label={etiqueta}>
      {Array.from({ length: unidades }, (_, u) => (
        <g key={u} transform={`translate(${u * 124 + 2} 0)`}>
          {Array.from({ length: d }, (_, k) => {
            const i = u * d + k;
            const forma = d === 1 ? <circle cx="60" cy="60" r={R} /> : <path d={sector(k)} />;
            return (
              <g key={k} className={s.parte} data-llena={i < n ? "" : undefined} data-toca={onCambiar ? "" : undefined} onClick={onCambiar && (() => onCambiar(tocar(i, n)))}>
                {forma}
              </g>
            );
          })}
          <circle cx="60" cy="60" r={R} className={s.borde} />
        </g>
      ))}
    </svg>
  );
}

function Barras({ n, d, unidades, onCambiar, tamano = "grande", etiqueta }: Props & { etiqueta: string }) {
  const W = 300;
  const H = 46;
  const ancho = W / d;
  return (
    <svg className={s.figura} data-forma="barra" data-tamano={tamano} viewBox={`0 0 ${W + 6} ${unidades * (H + 14) - 8}`} role="img" aria-label={etiqueta}>
      {Array.from({ length: unidades }, (_, u) => (
        <g key={u} transform={`translate(3 ${u * (H + 14) + 3})`}>
          {Array.from({ length: d }, (_, k) => {
            const i = u * d + k;
            return (
              <rect
                key={k}
                x={k * ancho}
                width={ancho}
                height={H}
                className={s.parte}
                data-llena={i < n ? "" : undefined}
                data-toca={onCambiar ? "" : undefined}
                onClick={onCambiar && (() => onCambiar(tocar(i, n)))}
              />
            );
          })}
          <rect width={W} height={H} rx="6" className={s.borde} />
        </g>
      ))}
    </svg>
  );
}

function Recta({ n, d, unidades, onCambiar, tamano = "grande", etiqueta }: Props & { etiqueta: string }) {
  const paso = 280 / d; // ancho de una unidad: 280
  const X0 = 24;
  const Y = 52;
  const total = unidades * d;
  const x = (k: number) => X0 + k * paso;
  // La recta mini se encoge mucho con más unidades: sus números crecen para seguir legibles.
  const letra = tamano === "mini" ? 34 * (1 + 0.45 * (unidades - 1)) : 24 + 4 * (unidades - 1);
  return (
    <svg className={s.figura} data-forma="recta" data-tamano={tamano} viewBox={`0 0 ${unidades * 280 + 48} ${Y + 26 + letra}`} role="img" aria-label={etiqueta}>
      <line x1={X0 - 12} x2={x(total) + 12} y1={Y} y2={Y} className={s.eje} />
      {n > 0 && <line x1={X0} x2={x(n)} y1={Y} y2={Y} className={s.recorrido} />}
      {Array.from({ length: total + 1 }, (_, k) => {
        const entero = k % d === 0;
        return (
          <g key={k}>
            <line x1={x(k)} x2={x(k)} y1={Y - (entero ? 18 : 11)} y2={Y + (entero ? 18 : 11)} className={s.marca} data-entero={entero ? "" : undefined} />
            {entero && (
              <text x={x(k)} y={Y + 18 + letra} className={s.numero} style={{ fontSize: letra }}>
                {k / d}
              </text>
            )}
          </g>
        );
      })}
      {n <= total && <circle cx={x(n)} cy={Y} r="10" className={s.punto} />}
      {onCambiar &&
        Array.from({ length: total + 1 }, (_, k) => (
          <rect key={k} x={x(k) - paso / 2} y={Y - 30} width={paso} height={60} className={s.zona} onClick={() => onCambiar(k)} />
        ))}
    </svg>
  );
}
