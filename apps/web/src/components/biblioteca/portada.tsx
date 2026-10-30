import Image from "next/image";
import { Headphones, ListTree } from "lucide-react";
import type { Titulo } from "@/lib/datos";
import type { Libro } from "@/lib/libros";
import styles from "./portada.module.css";

/*
  PORTADA — la cara de cada libro en el estante.

  · Obras digitalizadas: portada real. Si el libro es «compuesto» (ilustración
    + texto real) la portada se compone igual que en el lector: ilustración
    arriba y título tipográfico abajo, porque el original no trae una portada
    rasterizada legible.
  · El resto del catálogo no tiene páginas: la cubierta se compone en código,
    con el título como texto real (seleccionable, buscable) sobre una tela de
    color. Cada tipo de recurso tiene su propia cubierta para leerse a
    distancia: libro (tela), guía (cuaderno docente), audiolibro (auriculares)
    y catálogo (carpeta).
*/

/* Telas del valle: la misma paleta de las casas-libro del hero. Cada tela
   declara su tinta para que el título cumpla AA sobre ella. */
const TELAS: { fondo: string; tinta: string }[] = [
  { fondo: "#3b6fa0", tinta: "#ffffff" },
  { fondo: "#c9453a", tinta: "#ffffff" },
  { fondo: "#4f8a38", tinta: "#ffffff" },
  { fondo: "#f2b134", tinta: "#4a2a0a" },
  { fondo: "#aa461e", tinta: "#ffffff" },
  { fondo: "#2d5680", tinta: "#ffffff" },
  { fondo: "#79370f", tinta: "#ffffff" },
  { fondo: "#b84f2a", tinta: "#ffffff" },
];
/* Tres composiciones y tres alturas: ningún par de libros vecinos es igual. */
const COMPOSICIONES = ["centro", "alto", "bajo"] as const;

function hash(id: string) {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/* Formato físico del ejemplar: ancho y alto relativos al hueco del estante.
   Se deriva del id para que sea estable entre renders y páginas. */
export function formato(titulo: Titulo): React.CSSProperties {
  if (titulo.tipo === "Catálogo") return { "--ancho": "100%", "--alto": "3 / 4.1", "--grosor": "9px" } as React.CSSProperties;
  if (titulo.tipo === "Guía") return { "--ancho": "94%", "--alto": "3 / 4", "--grosor": "4px" } as React.CSSProperties;
  const h = hash(titulo.id + "f");
  const f = [
    { "--ancho": "100%", "--alto": "3 / 4.5", "--grosor": "7px" },
    { "--ancho": "96%", "--alto": "3 / 4.2", "--grosor": "5px" },
    { "--ancho": "92%", "--alto": "3 / 3.9", "--grosor": "6px" },
    { "--ancho": "100%", "--alto": "3 / 4.3", "--grosor": "8px" },
  ][h % 4];
  return f as React.CSSProperties;
}

/* «Caperucita Roja — Guía docente» → título de la obra, sin el sufijo */
function obraDe(titulo: string) {
  return titulo.split(" — ")[0];
}

export function Portada({
  titulo,
  libro,
  prioridad = false,
}: {
  titulo: Titulo;
  libro?: Libro;
  prioridad?: boolean;
}) {
  if (libro && !libro.contenido) {
    return (
      <div data-book-cover className={`${styles.portada} ${styles.real}`}>
        <Image
          src={`/libros/${libro.slug}/p01.webp`}
          alt={`Portada de ${libro.titulo}`}
          fill
          sizes="(max-width: 700px) 40vw, 200px"
          priority={prioridad}
        />
      </div>
    );
  }

  if (libro?.contenido) {
    const cubierta = libro.contenido[0];
    return (
      <div data-book-cover className={`${styles.portada} ${styles.compuesta}`}>
        <span className={styles.ilustracion}>
          {cubierta.ilustracion && (
            <Image
              src={cubierta.ilustracion}
              alt=""
              fill
              sizes="(max-width: 700px) 40vw, 200px"
              priority={prioridad}
            />
          )}
        </span>
        <span className={styles.rotulo}>
          <strong>{libro.titulo}</strong>
          <em>{titulo.autor}</em>
        </span>
      </div>
    );
  }

  if (titulo.tipo === "Guía") {
    return (
      <div className={`${styles.portada} ${styles.guia}`}>
        <span className={styles.anillas} />
        <span className={styles.banda} aria-hidden="true" />
        <strong>{obraDe(titulo.titulo)}</strong>
        <em>{titulo.autor}</em>
      </div>
    );
  }

  if (titulo.tipo === "Audiolibro") {
    return (
      <div className={`${styles.portada} ${styles.audio}`}>
        <span className={styles.lomo} />
        <span className={styles.auricular}>
          <Headphones size={40} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <strong>{titulo.titulo}</strong>
        <em>{titulo.autor}</em>
      </div>
    );
  }

  if (titulo.tipo === "Catálogo") {
    return (
      <div className={`${styles.portada} ${styles.catalogo}`}>
        <span className={styles.pestana} />
        <span className={styles.indice}>
          <ListTree size={30} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <strong>{titulo.titulo}</strong>
        <em>{titulo.autor}</em>
      </div>
    );
  }

  const t = TELAS[hash(titulo.id) % TELAS.length];
  const comp = COMPOSICIONES[hash(titulo.id + "c") % COMPOSICIONES.length];
  const inicial = titulo.titulo.replace(/^[¡¿«"'\s]+/, "").charAt(0).toUpperCase();
  return (
    <div
      className={`${styles.portada} ${styles.tela} ${styles[comp]}`}
      style={{ "--tela": t.fondo, "--tela-tinta": t.tinta } as React.CSSProperties}
    >
      <span className={styles.lomo} />
      <span className={styles.marco} />
      {comp === "bajo" && <span className={styles.inicial} aria-hidden="true">{inicial}</span>}
      {comp === "alto" && <span className={styles.franja} aria-hidden="true" />}
      <span className={styles.ornamento} aria-hidden="true">
        <svg viewBox="0 0 48 12" width="48" height="12" focusable="false">
          <path d="M 2 6 H 16 M 32 6 H 46" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 24 1 L 28 6 L 24 11 L 20 6 Z" fill="currentColor" />
        </svg>
      </span>
      <strong>{titulo.titulo}</strong>
      <em>{titulo.autor}</em>
    </div>
  );
}
