/**
 * Contraste WCAG 2.1 (AA) entre pares de color de la identidad visual.
 * Funciones puras: sirven en cliente, servidor y pruebas.
 */

export type TipoTexto = "normal" | "grande" | "componente";

/** Umbral AA: 4.5:1 texto normal; 3:1 texto grande, controles, iconos y foco. */
export const UMBRAL_AA: Record<TipoTexto, number> = { normal: 4.5, grande: 3, componente: 3 };

function canal(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa de un color #rgb o #rrggbb. */
export function luminancia(hex: string): number {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Color no válido: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => canal(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razonContraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function cumpleAA(texto: string, fondo: string, tipo: TipoTexto = "normal"): boolean {
  return razonContraste(texto, fondo) >= UMBRAL_AA[tipo];
}

export const MATERIAS_CON_FAMILIA = [
  "lectura",
  "matematicas",
  "naturales",
  "ingles",
  "robotica",
  "emprendimiento",
  "etica",
  "artistica",
  "fisica",
  "sociales",
  "generica",
] as const;

export type ParDeclarado = { texto: string; fondo: string; tipo: TipoTexto; uso: string };

/**
 * Pares texto/fondo que la interfaz usa sin contorno (D5). Los nombres son
 * propiedades personalizadas de globals.css. El texto de las placas va en
 * blanco con contorno de tinta de 5 px y no entra aquí.
 */
export const PARES_DECLARADOS: ParDeclarado[] = [
  { texto: "--tinta", fondo: "--papel", tipo: "normal", uso: "información del cromo y del panel" },
  { texto: "--gris", fondo: "--papel", tipo: "normal", uso: "«Sigue con» y texto secundario" },
  { texto: "--color-pizarra-700", fondo: "--papel", tipo: "normal", uso: "descripción de la materia" },
  { texto: "--gris", fondo: "--hueso", tipo: "normal", uso: "rótulo de cifras" },
  { texto: "--color-mar-800", fondo: "--papel", tipo: "normal", uso: "saludo y cifras del panel" },
  { texto: "--tinta", fondo: "--sabana", tipo: "normal", uso: "título «Mis materias» sobre el fondo sereno" },
  { texto: "--tinta", fondo: "--acento", tipo: "normal", uso: "botón de jugar y «Entrar a…»" },
  { texto: "--tinta", fondo: "--color-lima-500", tipo: "normal", uso: "botón de menú Biblioteca" },
  { texto: "--tinta", fondo: "--color-cielo-500", tipo: "normal", uso: "botón de menú Laboratorios y ayuda" },
  { texto: "--color-noche-700", fondo: "--papel", tipo: "normal", uso: "botón de menú activo" },
  { texto: "--tinta", fondo: "--color-naranja-400", tipo: "normal", uso: "botón de menú Mis clases" },
  { texto: "--tinta", fondo: "--color-rosa-400", tipo: "normal", uso: "botón de menú Mi curso" },
  { texto: "--color-naranja-800", fondo: "--papel", tipo: "normal", uso: "mensajes de error" },
  { texto: "--tinta", fondo: "--color-naranja-100", tipo: "normal", uso: "aviso de error" },
  { texto: "--tinta", fondo: "--color-pino-100", tipo: "normal", uso: "aviso de éxito" },
  { texto: "--texto-noche", fondo: "--noche", tipo: "normal", uso: "texto secundario del encabezado" },
  { texto: "--texto-noche", fondo: "--color-noche-950", tipo: "normal", uso: "chips de estrellas y grupo" },
  { texto: "--papel", fondo: "--color-noche-950", tipo: "normal", uso: "cifra de los chips" },
  { texto: "--color-lit-tinta", fondo: "--color-lit-pale", tipo: "normal", uso: "fichas de Literatura del friso docente" },
  { texto: "--color-rob-tinta", fondo: "--color-rob-pale", tipo: "normal", uso: "fichas de Robótica del friso docente" },
  { texto: "--color-emp-tinta", fondo: "--color-emp-pale", tipo: "normal", uso: "fichas de Emprendimiento del friso docente" },
  { texto: "--papel", fondo: "--color-lit", tipo: "normal", uso: "plancha de Literatura" },
  { texto: "--papel", fondo: "--color-rob", tipo: "normal", uso: "plancha de Robótica" },
  { texto: "--papel", fondo: "--color-emp", tipo: "normal", uso: "plancha de Emprendimiento" },
  { texto: "--foco", fondo: "--papel", tipo: "componente", uso: "anillo de foco sobre superficies claras" },
  { texto: "--foco", fondo: "--sabana", tipo: "componente", uso: "anillo de foco sobre el tablero" },
  { texto: "--acento", fondo: "--noche", tipo: "componente", uso: "anillo de foco sobre la noche" },
  ...MATERIAS_CON_FAMILIA.map((m) => ({
    texto: "--tinta",
    fondo: `--${m}-cinta`,
    tipo: "normal" as const,
    uso: `rótulo del panel sobre la cinta de ${m}`,
  })),
];

/**
 * Lee las propiedades personalizadas de una hoja de estilos y resuelve las
 * cadenas var(--x) hasta un color. Ignora lo que cuelga de .cosmos.
 */
export function tokensDeHoja(css: string): Map<string, string> {
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const sinCosmos = sinComentarios.replace(/(^|[}\s])\.cosmos[^{]*\{[^}]*\}/g, "$1");
  const crudos = new Map<string, string>();
  for (const m of sinCosmos.matchAll(/(?:^|[;{\s])(--[a-z0-9-]+)\s*:\s*([^;{}]+);/gi)) {
    if (!crudos.has(m[1])) crudos.set(m[1], m[2].trim());
  }
  const resueltos = new Map<string, string>();
  const resolver = (nombre: string, visitados: string[] = []): string | undefined => {
    if (resueltos.has(nombre)) return resueltos.get(nombre);
    const valor = crudos.get(nombre);
    if (!valor || visitados.includes(nombre)) return undefined;
    const ref = valor.match(/^var\((--[a-z0-9-]+)\)$/i);
    const final = ref ? resolver(ref[1], [...visitados, nombre]) : valor;
    if (final) resueltos.set(nombre, final);
    return final;
  };
  for (const nombre of crudos.keys()) resolver(nombre);
  return resueltos;
}
