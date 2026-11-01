import s from "./angulos.module.css";

/*
  Ángulo con transportador (SVG propio). El vértice está abajo al centro;
  el primer lado sale a la derecha o a la izquierda. El transportador tiene
  dos escalas, como el de la cartuchera: la de afuera empieza en 0 a la
  derecha y la de adentro empieza en 0 a la izquierda.
*/

const CX = 200;
const CY = 210;
const R = 170;
const rad = (g: number) => (g * Math.PI) / 180;
const punto = (g: number, r: number) => ({ x: CX + Math.cos(rad(g)) * r, y: CY - Math.sin(rad(g)) * r });

export function Transportador({ angulo, desde, resaltar }: { angulo: number; desde: "derecha" | "izquierda"; resaltar: "afuera" | "adentro" | null }) {
  // Ángulos medidos en sentido antihorario desde la derecha.
  const lado1 = desde === "derecha" ? 0 : 180;
  const lado2 = desde === "derecha" ? angulo : 180 - angulo;
  const marcas = [];
  for (let g = 0; g <= 180; g += 5) {
    const largo = g % 10 === 0 ? 16 : 9;
    const a = punto(g, R);
    const b = punto(g, R - largo);
    marcas.push(<line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1b2440" strokeWidth={g % 10 === 0 ? 1.8 : 1.1} />);
  }
  const etiquetas = [];
  for (let g = 0; g <= 180; g += 10) {
    // El 0 y el 180 se suben un poco para no tocar la base.
    const ga = g === 0 ? 4 : g === 180 ? 176 : g;
    const fuera = punto(ga, R - 28);
    const dentro = punto(g === 0 ? 6 : g === 180 ? 174 : g, R - 48);
    etiquetas.push(
      <text key={`f${g}`} x={fuera.x} y={fuera.y} className={s.escala} data-resaltar={resaltar === "afuera" ? "" : undefined} textAnchor="middle" dominantBaseline="middle">
        {g}
      </text>,
      <text key={`d${g}`} x={dentro.x} y={dentro.y} className={s.escalaDentro} data-resaltar={resaltar === "adentro" ? "" : undefined} textAnchor="middle" dominantBaseline="middle">
        {180 - g}
      </text>,
    );
  }
  const p1 = punto(lado1, R + 26);
  const p2 = punto(lado2, R + 26);
  const arcoR = 46;
  const a1 = punto(Math.min(lado1, lado2), arcoR);
  const a2 = punto(Math.max(lado1, lado2), arcoR);
  return (
    <svg className={s.figura} viewBox="0 0 400 240" role="img" aria-label={`Ángulo con el transportador encima; el primer lado sale hacia la ${desde}`}>
      <path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY} Z`} fill="rgb(214 234 252 / 0.72)" stroke="#1b2440" strokeWidth="2" />
      <path d={`M${CX - R + 56} ${CY} A${R - 56} ${R - 56} 0 0 1 ${CX + R - 56} ${CY}`} fill="none" stroke="#7a8db0" strokeWidth="1" />
      {marcas}
      {etiquetas}
      <path d={`M${a2.x} ${a2.y} A${arcoR} ${arcoR} 0 0 1 ${a1.x} ${a1.y}`} fill="none" stroke="#e0475b" strokeWidth="4" />
      <line x1={CX} y1={CY} x2={p1.x} y2={p1.y} stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={p2.x} y2={p2.y} stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="6" fill="#1b2440" />
    </svg>
  );
}

/** Ángulo con tres rayos punteados candidatos a bisectriz; cada uno lleva una letra. */
export function Bisectriz({
  angulo,
  rayos,
  elegir,
  estados,
  deshabilitado,
}: {
  angulo: number;
  rayos: { grados: number; letra: string }[];
  elegir: (grados: number) => void;
  estados: Record<number, "ok" | "no" | undefined>;
  deshabilitado: (grados: number) => boolean;
}) {
  const base = 90 - angulo / 2;
  const p1 = punto(base, R + 10);
  const p2 = punto(base + angulo, R + 10);
  return (
    <svg className={s.figura} viewBox="0 -28 400 268" aria-label={`Ángulo de ${angulo} grados con tres rayos punteados`} role="group">
      <line x1={CX} y1={CY} x2={p1.x} y2={p1.y} stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
      <line x1={CX} y1={CY} x2={p2.x} y2={p2.y} stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
      {rayos.map(({ grados, letra }) => {
        const p = punto(base + grados, R - 6);
        const q = punto(base + grados, R + 22);
        const estado = estados[grados];
        return (
          <g key={grados}>
            <line x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={estado === "ok" ? "#2f9a57" : estado === "no" ? "#d2574b" : "#1f5fbf"} strokeWidth="4" strokeDasharray="10 7" />
            <foreignObject x={q.x - 24} y={q.y - 24} width="48" height="48">
              <button
                type="button"
                className={s.rayo}
                data-estado={estado}
                disabled={deshabilitado(grados)}
                aria-label={`Rayo ${letra}${estado === "ok" ? ", es la bisectriz" : estado === "no" ? ", no es la bisectriz" : ""}`}
                onClick={() => elegir(grados)}
              >
                {letra}
              </button>
            </foreignObject>
          </g>
        );
      })}
      <circle cx={CX} cy={CY} r="6" fill="#1b2440" />
    </svg>
  );
}
