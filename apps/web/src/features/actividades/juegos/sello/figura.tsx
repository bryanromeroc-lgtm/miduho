import type { Figura as TipoFigura } from "./tipo";
import s from "./sello.module.css";

/*
  Figuras para contar junto a la afirmación: un patio de baldosas (cuadrado)
  y una caja hecha de cajitas en perspectiva isométrica (cubo). Informan, así
  que llevan nombre accesible.
*/
export function Figura({ figura }: { figura: TipoFigura }) {
  if (figura.tipo === "cuadrado") return <Cuadrado lado={figura.lado} />;
  if (figura.tipo === "cubo") return <Cubo lado={figura.lado} />;
  return <Fraccion numerador={figura.numerador} denominador={figura.denominador} forma={figura.forma} />;
}

/** Tortas (círculo) o chocolatinas (barra) partidas en partes iguales; las pintadas son el numerador. */
function Fraccion({ numerador: n, denominador: d, forma }: { numerador: number; denominador: number; forma: "circulo" | "barra" }) {
  const unidades = Math.max(1, Math.ceil(n / d));
  const nombre = forma === "circulo" ? (unidades === 1 ? "torta" : "tortas") : unidades === 1 ? "chocolatina" : "chocolatinas";
  const etiqueta = `${unidades} ${nombre} partida${unidades === 1 ? "" : "s"} en ${d} partes iguales, con ${n} parte${n === 1 ? "" : "s"} pintada${n === 1 ? "" : "s"}`;
  const llena = forma === "circulo" ? "#e0795e" : "#7b4a2a";
  const vacia = forma === "circulo" ? "#fdf0d5" : "#f3e3cf";
  const alto = forma === "circulo" ? 100 : 46;
  return (
    <svg className={s.figura} data-forma={forma} viewBox={`-4 -4 ${unidades * 110 - 2} ${alto + 8}`} role="img" aria-label={etiqueta}>
      {Array.from({ length: unidades }, (_, u) => {
        const pintadas = Math.min(d, Math.max(0, n - u * d));
        const x0 = u * 110;
        if (forma === "barra") {
          const w = 100 / d;
          return (
            <g key={u}>
              {Array.from({ length: d }, (_, k) => (
                <rect key={k} x={x0 + k * w} y={0} width={w} height={alto} fill={k < pintadas ? llena : vacia} stroke="#1b2440" strokeWidth="2" />
              ))}
            </g>
          );
        }
        const cx = x0 + 50;
        const r = 48;
        if (d === 1) return <circle key={u} cx={cx} cy={50} r={r} fill={pintadas ? llena : vacia} stroke="#1b2440" strokeWidth="2.5" />;
        return (
          <g key={u}>
            {Array.from({ length: d }, (_, k) => {
              const a0 = (k / d) * 2 * Math.PI - Math.PI / 2;
              const a1 = ((k + 1) / d) * 2 * Math.PI - Math.PI / 2;
              const grande = a1 - a0 > Math.PI ? 1 : 0;
              const p = `M${cx},50 L${(cx + r * Math.cos(a0)).toFixed(2)},${(50 + r * Math.sin(a0)).toFixed(2)} A${r},${r} 0 ${grande} 1 ${(cx + r * Math.cos(a1)).toFixed(2)},${(50 + r * Math.sin(a1)).toFixed(2)} Z`;
              return <path key={k} d={p} fill={k < pintadas ? llena : vacia} stroke="#1b2440" strokeWidth="2" strokeLinejoin="round" />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Cuadrado({ lado }: { lado: number }) {
  const t = 100 / lado;
  return (
    <svg className={s.figura} viewBox="-4 -4 108 108" role="img" aria-label={`Patio cuadrado de ${lado} por ${lado} baldosas`}>
      {Array.from({ length: lado * lado }, (_, k) => {
        const f = Math.floor(k / lado);
        const c = k % lado;
        return <rect key={k} x={c * t} y={f * t} width={t} height={t} fill={(f + c) % 2 ? "#e39a6b" : "#f0b98d"} stroke="#9a5b34" strokeWidth={Math.max(0.6, 2.2 - lado * 0.12)} />;
      })}
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#1b2440" strokeWidth="3" rx="1" />
    </svg>
  );
}

const C = Math.cos(Math.PI / 6);

function Cubo({ lado: n }: { lado: number }) {
  const u = 100 / n;
  const P = (x: number, y: number, z: number) => `${((x - y) * C * u).toFixed(2)},${((x + y) * 0.5 * u - z * u).toFixed(2)}`;
  const cara = (pts: [number, number, number][]) => pts.map((p) => P(...p)).join(" ");
  const lineas: string[] = [];
  for (let k = 1; k < n; k++) {
    lineas.push(`M${P(k, 0, n)} L${P(k, n, n)}`, `M${P(0, k, n)} L${P(n, k, n)}`); // arriba
    lineas.push(`M${P(k, n, 0)} L${P(k, n, n)}`, `M${P(0, n, k)} L${P(n, n, k)}`); // izquierda
    lineas.push(`M${P(n, k, 0)} L${P(n, k, n)}`, `M${P(n, 0, k)} L${P(n, n, k)}`); // derecha
  }
  return (
    <svg className={s.figura} viewBox="-92 -106 184 212" role="img" aria-label={`Caja en forma de cubo con ${n} cajitas por arista`}>
      <polygon points={cara([[0, 0, n], [n, 0, n], [n, n, n], [0, n, n]])} fill="#efcd94" />
      <polygon points={cara([[0, n, 0], [n, n, 0], [n, n, n], [0, n, n]])} fill="#d3a466" />
      <polygon points={cara([[n, 0, 0], [n, n, 0], [n, n, n], [n, 0, n]])} fill="#bb8a4f" />
      <path d={lineas.join(" ")} stroke="#7a5530" strokeWidth={Math.max(0.8, 2.4 - n * 0.25)} fill="none" />
      <polygon
        points={cara([[0, 0, n], [n, 0, n], [n, 0, 0], [n, n, 0], [0, n, 0], [0, n, n]])}
        fill="none"
        stroke="#1b2440"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
