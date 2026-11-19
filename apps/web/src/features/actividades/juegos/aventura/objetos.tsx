import type { Objeto as LlaveObjeto } from "./tipo";
import s from "./aventura.module.css";

/*
  Objetos de las situaciones, dibujados en SVG propio (plano, un solo trazo
  de tinta). Son decorativos: la cantidad siempre está escrita en el texto.
*/
const TINTA = "#1b2440";

const DIBUJOS: Record<LlaveObjeto, React.ReactNode> = {
  huevos: (
    <>
      <ellipse cx="16" cy="17" rx="10" ry="13" fill="#f0b46c" stroke={TINTA} strokeWidth="2.2" />
      <path d="M10.5 13 Q11.5 8.5 15 7.5" fill="none" stroke="#fff6e0" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  naranjas: (
    <>
      <circle cx="16" cy="18" r="11" fill="#f59a23" stroke={TINTA} strokeWidth="2.2" />
      <path d="M16 7 Q21 2 26 6 Q21 11 16 7 Z" fill="#4c9a3f" stroke={TINTA} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  panes: (
    <>
      <ellipse cx="16" cy="18" rx="14" ry="9" fill="#e3a35a" stroke={TINTA} strokeWidth="2.2" />
      <path d="M9 14 L12 21 M16 12 L19 20 M23 14 L25 20" stroke={TINTA} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  galletas: (
    <>
      <circle cx="16" cy="17" r="12" fill="#e2b06a" stroke={TINTA} strokeWidth="2.2" />
      <circle cx="12" cy="13" r="1.8" fill="#6a3d1e" />
      <circle cx="20" cy="15" r="1.8" fill="#6a3d1e" />
      <circle cx="14" cy="21" r="1.8" fill="#6a3d1e" />
      <circle cx="21" cy="22" r="1.5" fill="#6a3d1e" />
    </>
  ),
  plantas: (
    <>
      <path d="M9 20 H23 L21 30 H11 Z" fill="#c8603c" stroke={TINTA} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 20 Q8 17 8 8 Q16 9 16 20 Z M16 20 Q24 16 24 6 Q16 8 16 20 Z" fill="#4c9a3f" stroke={TINTA} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  balones: (
    <>
      <circle cx="16" cy="16" r="12" fill="#fff" stroke={TINTA} strokeWidth="2.2" />
      <path d="M16 10 L21 14 L19 20 H13 L11 14 Z" fill={TINTA} />
      <path d="M16 10 V4 M21 14 L27 12 M19 20 L23 26 M13 20 L9 26 M11 14 L5 12" stroke={TINTA} strokeWidth="1.6" />
    </>
  ),
};

export function Objeto({ tipo }: { tipo: LlaveObjeto }) {
  return (
    <svg className={s.objeto} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {DIBUJOS[tipo]}
    </svg>
  );
}
