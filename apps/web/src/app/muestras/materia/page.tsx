import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ESCENAS, type Escena } from "@/lib/escenas";
import type { ActividadResumen, VistaMateria as Datos } from "@/lib/materias";
import { VistaMateria } from "@/features/materias/vista/vista-materia";
import s from "./muestra.module.css";

export const metadata: Metadata = {
  title: "Ejemplo · Vista de materia · MIDUHO",
  robots: { index: false },
};

const NOMBRES: Record<Escena, string> = {
  lectura: "Comprensión lectora",
  matematicas: "Matemáticas",
  naturales: "Ciencias naturales",
  ingles: "Inglés",
  robotica: "Robótica",
  emprendimiento: "Emprendimiento",
  etica: "Ética y valores",
  artistica: "Educación artística",
  fisica: "Física",
  sociales: "Ciencias sociales",
  generica: "Educación religiosa",
};

/*
  Ocho actividades ficticias por materia, sin nombres de personas: cubren
  todos los estados (D10). Los títulos son de la materia para poder juzgar la
  tarjeta con contenido creíble.
*/
const TITULOS: Record<Escena, string[]> = {
  matematicas: [
    "Retos de sumas hasta 20",
    "Ordena los números del más pequeño al más grande",
    "Parejas de figuras",
    "Clasifica pares e impares",
    "Completa la serie",
    "Une cada número con su nombre",
    "Concurso de restas rápidas",
    "Medidas con la regla",
  ],
  lectura: [
    "¿Qué pasó primero en el cuento?",
    "Ordena las partes de la historia",
    "Parejas de rimas",
    "Sustantivos y verbos",
    "Completa la oración",
    "Une la palabra con su dibujo",
    "Concurso de sílabas",
    "Busca la idea principal",
  ],
  naturales: [
    "Las partes de la planta",
    "Ordena el ciclo del agua",
    "Parejas de animales y crías",
    "Seres vivos y objetos",
    "Completa el ciclo de la mariposa",
    "Une cada animal con su hogar",
    "Concurso de los sentidos",
    "¿Qué necesita una semilla?",
  ],
  ingles: [
    "Colors and shapes",
    "Order the days of the week",
    "Animal pairs",
    "Fruits or vegetables?",
    "Complete the greeting",
    "Match the word and the picture",
    "Numbers quiz",
    "My family words",
  ],
  robotica: [
    "¿Qué hace un sensor?",
    "Ordena los pasos del robot",
    "Parejas de piezas",
    "Máquinas simples",
    "Completa el circuito",
    "Une la pieza con su función",
    "Concurso de engranajes",
    "Instrucciones para avanzar",
  ],
  emprendimiento: [
    "¿Qué necesita mi tienda?",
    "Ordena los pasos de una idea",
    "Parejas de monedas",
    "Necesidades y deseos",
    "Completa el presupuesto",
    "Une el oficio con su herramienta",
    "Concurso de ahorro",
    "Mi primer producto",
  ],
  etica: [
    "¿Cómo me siento hoy?",
    "Ordena los pasos para resolver un conflicto",
    "Parejas de emociones",
    "Acciones que cuidan y que no",
    "Completa el acuerdo del salón",
    "Une la situación con la solución",
    "Concurso de buenos tratos",
    "Compartir es cuidar",
  ],
  artistica: [
    "Colores primarios",
    "Ordena los sonidos de suave a fuerte",
    "Parejas de instrumentos",
    "Colores cálidos y fríos",
    "Completa el ritmo",
    "Une el instrumento con su sonido",
    "Concurso de figuras",
    "Mezclas de colores",
  ],
  fisica: [
    "¿Qué atrae un imán?",
    "Ordena del más liviano al más pesado",
    "Parejas de fuerzas",
    "Empujar o halar",
    "Completa el camino de la luz",
    "Une el objeto con su sombra",
    "Concurso de movimientos",
    "El péndulo que oscila",
  ],
  sociales: [
    "Los símbolos patrios",
    "Ordena mi día de la mañana a la noche",
    "Parejas de oficios",
    "Campo y ciudad",
    "Completa mi dirección",
    "Une cada lugar de Madrid con su uso",
    "Concurso de puntos cardinales",
    "Mi barrio en un mapa",
  ],
  generica: [
    "Repaso de la semana",
    "Ordena los pasos",
    "Parejas para recordar",
    "Clasifica lo aprendido",
    "Completa la frase",
    "Une las ideas",
    "Concurso rápido",
    "Pregunta del día",
  ],
};

function actividades(escena: Escena): ActividadResumen[] {
  const t = TITULOS[escena];
  const base = { estrellas: null, intentosUsados: 0, intentosMax: 3, abre: null, cierra: null, href: "#" };
  return [
    { ...base, id: "m1", titulo: t[0], tipo: "seleccion-multiple", estado: "disponible", cierra: "2026-11-06T22:00:00Z" },
    { ...base, id: "m2", titulo: t[1], tipo: "ordenar", estado: "enCurso", intentosUsados: 1 },
    { ...base, id: "m3", titulo: t[2], tipo: "memoria", estado: "hecha", estrellas: 2, intentosUsados: 1 },
    { ...base, id: "m4", titulo: t[3], tipo: "clasificar", estado: "hecha", estrellas: 3, intentosUsados: 3 },
    { ...base, id: "m5", titulo: t[4], tipo: "completar", estado: "porAbrir", abre: "2026-11-12T13:00:00Z" },
    { ...base, id: "m6", titulo: t[5], tipo: "emparejar", estado: "disponible", cierra: "2026-11-14T22:00:00Z" },
    { ...base, id: "m7", titulo: t[6], tipo: "concurso", estado: "cerrada", estrellas: 1, intentosUsados: 2 },
    { ...base, id: "m8", titulo: t[7], tipo: "seleccion-multiple", estado: "cerrada" },
  ];
}

// Casos de revisión (harden): con actividades, sin fuente, en preparación y nombres largos.
const CASOS = { normal: "Con actividades", vacio: "Sin actividades", preparacion: "En preparación", largo: "Nombres largos" } as const;
type Caso = keyof typeof CASOS;

const TITULO_LARGO = "Una actividad con un título larguísimo para comprobar que la tarjeta lo recorta en dos líneas sin romperse";

// Vista de revisión: datos ficticios rotulados. Solo fuera de producción.
export default async function MuestraMateria({
  searchParams,
}: {
  searchParams: Promise<{ escena?: string; pagina?: string; caso?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const escena = (ESCENAS as readonly string[]).includes(q.escena ?? "") ? (q.escena as Escena) : "matematicas";
  const caso: Caso = q.caso && q.caso in CASOS ? (q.caso as Caso) : "normal";
  const nombre = caso === "largo" ? `${NOMBRES[escena]}: proyecto transversal de todo el período` : NOMBRES[escena];
  const lista = actividades(escena).map((a, i) => (caso === "largo" && i % 2 === 0 ? { ...a, titulo: TITULO_LARGO } : a));
  const datos: Datos = {
    materia: {
      id: `muestra-${escena}`,
      nombre,
      area: { nombre: "Ejemplo", orden: 1 },
      escena,
      claseHref: "#",
      estrellas: null,
      avance: null,
      sigue: null,
      nuevo: null,
      conMaterial: caso === "preparacion" ? false : null,
    },
    grupo: { id: "muestra", etiqueta: "Ejemplo" },
    actividades: caso === "vacio" || caso === "preparacion" ? null : lista,
  };
  const enlace = (cambios: { escena?: Escena; caso?: Caso; pagina?: number }) => {
    const p = new URLSearchParams({ escena: cambios.escena ?? escena });
    const c = cambios.caso ?? caso;
    if (c !== "normal") p.set("caso", c);
    if (cambios.pagina && cambios.pagina > 1) p.set("pagina", String(cambios.pagina));
    return `/muestras/materia?${p}`;
  };

  return (
    <VistaMateria
      datos={datos}
      pagina={Number(q.pagina ?? 1)}
      hrefPagina={(n) => enlace({ pagina: n })}
      volverHref="/muestras/materia"
      rotulo="Datos de ejemplo"
      extra={
        <details className={s.menu}>
          <summary className={s.resumen}>Cambiar materia</summary>
          <nav className={s.selector} aria-label="Materia y caso de ejemplo">
            {ESCENAS.map((e) => (
              <Link key={e} href={enlace({ escena: e })} aria-current={e === escena ? "page" : undefined} className={s.opcion}>
                {NOMBRES[e]}
              </Link>
            ))}
            <span className={s.separador} aria-hidden="true" />
            {(Object.keys(CASOS) as Caso[]).map((c) => (
              <Link key={c} href={enlace({ caso: c })} aria-current={c === caso ? "page" : undefined} className={s.opcion}>
                {CASOS[c]}
              </Link>
            ))}
          </nav>
        </details>
      }
    />
  );
}
