import s from "./fraccion.module.css";

/** Fracción escrita en vertical (numerador sobre denominador); el lector oye «2/3». */
export function Frac({ n, d, className }: { n: number | string; d: number | string; className?: string }) {
  return (
    <span className={`${s.frac} ${className ?? ""}`}>
      <span aria-hidden="true" className={s.n}>
        {n}
      </span>
      <span aria-hidden="true" className={s.d}>
        {d}
      </span>
      <span className={s.solo}>
        {n}/{d}
      </span>
    </span>
  );
}
