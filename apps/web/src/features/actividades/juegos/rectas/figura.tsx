import type { Tarjeta } from "./tipo";
import s from "./rectas.module.css";

/*
  Tarjetas de rectas (SVG propio). Las rectas llevan flecha en los dos
  extremos; la semirrecta, punto y flecha; el segmento, dos puntos.
  `revelar` prolonga las rectas con trazo punteado y marca el ángulo recto.
*/

const W = 160;
const H = 110;
const C = { x: W / 2, y: H / 2 };
const COLORES = ["#1f5fbf", "#c2410c"];

const rad = (g: number) => (g * Math.PI) / 180;

function punta(x: number, y: number, ang: number, color: string) {
  const a = rad(ang);
  const l = 9;
  const p1 = `${x - l * Math.cos(a - 0.45)},${y - l * Math.sin(a - 0.45)}`;
  const p2 = `${x - l * Math.cos(a + 0.45)},${y - l * Math.sin(a + 0.45)}`;
  return <polygon points={`${x},${y} ${p1} ${p2}`} fill={color} />;
}

function linea({ cx, cy, giro, largo, color, inicio, fin }: { cx: number; cy: number; giro: number; largo: number; color: string; inicio: "flecha" | "punto"; fin: "flecha" | "punto" }) {
  const a = rad(giro);
  const dx = (Math.cos(a) * largo) / 2;
  const dy = (Math.sin(a) * largo) / 2;
  const [x1, y1, x2, y2] = [cx - dx, cy - dy, cx + dx, cy + dy];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="4" strokeLinecap="round" />
      {inicio === "flecha" ? punta(x1, y1, giro + 180, color) : <circle cx={x1} cy={y1} r="5" fill={color} />}
      {fin === "flecha" ? punta(x2, y2, giro, color) : <circle cx={x2} cy={y2} r="5" fill={color} />}
    </g>
  );
}

export function FiguraRectas({ tarjeta: t, revelar }: { tarjeta: Tarjeta; revelar: boolean }) {
  if (t.figura === "linea") {
    const forma = { recta: ["flecha", "flecha"], semirrecta: ["punto", "flecha"], segmento: ["punto", "punto"] }[t.tipo] as ["flecha" | "punto", "flecha" | "punto"];
    return (
      <svg className={s.figura} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {linea({ cx: C.x, cy: C.y, giro: -t.giro, largo: 120, color: COLORES[0], inicio: forma[0], fin: forma[1] })}
      </svg>
    );
  }
  const g1 = -t.giro;
  const separacion = 30;
  const n = rad(g1 + 90);
  let segunda: { cx: number; cy: number; giro: number };
  if (t.relacion === "paralelas") segunda = { cx: C.x + Math.cos(n) * separacion, cy: C.y + Math.sin(n) * separacion, giro: g1 };
  else if (t.relacion === "perpendiculares") segunda = { cx: C.x + Math.cos(rad(g1)) * 14, cy: C.y + Math.sin(rad(g1)) * 14, giro: g1 + 90 };
  else segunda = t.cruceVisible ? { cx: C.x + 10, cy: C.y, giro: g1 + 38 } : { cx: C.x + Math.cos(n) * 30, cy: C.y + Math.sin(n) * 30, giro: g1 + 12 };
  const primera = t.relacion === "paralelas" || (t.relacion === "secantes" && !t.cruceVisible) ? { cx: C.x - Math.cos(n) * 12, cy: C.y - Math.sin(n) * 12 } : { cx: C.x, cy: C.y };
  const extra = (cx: number, cy: number, giro: number, color: string) => {
    const a = rad(giro);
    return <line x1={cx - Math.cos(a) * 400} y1={cy - Math.sin(a) * 400} x2={cx + Math.cos(a) * 400} y2={cy + Math.sin(a) * 400} stroke={color} strokeWidth="2" strokeDasharray="5 6" opacity="0.7" />;
  };
  const cruce = t.relacion === "perpendiculares" ? interseccion(primera.cx, primera.cy, g1, segunda.cx, segunda.cy, segunda.giro) : null;
  return (
    <svg className={s.figura} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {revelar && extra(primera.cx, primera.cy, g1, COLORES[0])}
      {revelar && extra(segunda.cx, segunda.cy, segunda.giro, COLORES[1])}
      {linea({ cx: primera.cx, cy: primera.cy, giro: g1, largo: 104, color: COLORES[0], inicio: "flecha", fin: "flecha" })}
      {linea({ ...segunda, largo: 104, color: COLORES[1], inicio: "flecha", fin: "flecha" })}
      {revelar && cruce && <rect x={cruce.x} y={cruce.y} width="11" height="11" fill="none" stroke="#1b2440" strokeWidth="2" transform={`rotate(${g1} ${cruce.x} ${cruce.y})`} />}
    </svg>
  );
}

function interseccion(x1: number, y1: number, g1: number, x2: number, y2: number, g2: number) {
  const [a1, a2] = [rad(g1), rad(g2)];
  const [d1x, d1y, d2x, d2y] = [Math.cos(a1), Math.sin(a1), Math.cos(a2), Math.sin(a2)];
  const den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((x2 - x1) * d2y - (y2 - y1) * d2x) / den;
  return { x: x1 + d1x * t, y: y1 + d1y * t };
}
