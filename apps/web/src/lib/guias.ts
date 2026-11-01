import type { Escena } from "./escenas";

/**
 * Guías de cada materia: los exploradores de Mi Dulce Hogar. Personajes
 * originales del proyecto, provisionales 🔶 (no son mascota institucional).
 * Ilustración 2D en `public/images/guias/{escena}.webp`, relación 3:2.
 * Son representaciones narrativas, no láminas para enseñar zoología.
 */
export type Guia = {
  nombre: string;
  especie: string;
  imagen: string;
  /** Retrato cuadrado para listas (Agenda): `public/images/agenda/{escena}.webp`. */
  retrato: string;
  /** Qué hace la guía en su ilustración (texto alternativo donde la imagen informa). */
  accion: string;
};

export const GUIAS: Record<Exclude<Escena, "generica">, Guia> = {
  lectura: {
    nombre: "Bruno",
    especie: "Oso de anteojos",
    imagen: "/images/guias/lectura.webp",
    retrato: "/images/agenda/lectura.webp",
    accion: "Bruno, el oso de anteojos, lee un libro abierto lleno de paisajes y letras.",
  },
  naturales: {
    nombre: "Dora",
    especie: "Rana dorada",
    imagen: "/images/guias/naturales.webp",
    retrato: "/images/agenda/naturales.webp",
    accion: "Dora, la rana dorada, observa con una lupa las raíces de una plantita.",
  },
  robotica: {
    nombre: "Tito",
    especie: "Tití cabeciblanco",
    imagen: "/images/guias/robotica.webp",
    retrato: "/images/agenda/robotica.webp",
    accion: "Tito, el tití cabeciblanco, arma un robot con ruedas y bloques de programación.",
  },
  emprendimiento: {
    nombre: "Dante",
    especie: "Danta",
    imagen: "/images/guias/emprendimiento.webp",
    retrato: "/images/agenda/emprendimiento.webp",
    accion: "Dante, la danta, planea un puesto de frutas con su lista de chequeo.",
  },
  matematicas: {
    nombre: "Armi",
    especie: "Armadillo",
    imagen: "/images/guias/matematicas.webp",
    retrato: "/images/agenda/matematicas.webp",
    accion: "Armi, el armadillo, cuenta con un ábaco junto a figuras geométricas.",
  },
  sociales: {
    nombre: "Andi",
    especie: "Cóndor",
    imagen: "/images/guias/sociales.webp",
    retrato: "/images/agenda/sociales.webp",
    accion: "Andi, el cóndor, explora un mapa desplegado junto a un globo terráqueo.",
  },
  ingles: {
    nombre: "Maca",
    especie: "Guacamaya",
    imagen: "/images/guias/ingles.webp",
    retrato: "/images/agenda/ingles.webp",
    accion: "Maca, la guacamaya, saluda «Hello!» junto a un libro de vocabulario.",
  },
  artistica: {
    nombre: "Iris",
    especie: "Colibrí",
    imagen: "/images/guias/artistica.webp",
    retrato: "/images/agenda/artistica.webp",
    accion: "Iris, el colibrí, pinta formas de colores en un caballete.",
  },
  fisica: {
    nombre: "Jago",
    especie: "Jaguar",
    imagen: "/images/guias/fisica.webp",
    retrato: "/images/agenda/fisica.webp",
    accion: "Jago, el jaguar, conduce un balón entre conos por un camino.",
  },
  etica: {
    nombre: "Ciro",
    especie: "Chigüiro",
    imagen: "/images/guias/etica.webp",
    retrato: "/images/agenda/etica.webp",
    accion: "Ciro, el chigüiro, protege de la lluvia a un pajarito con una hoja.",
  },
};

/** La guía de una escena; la escena genérica no tiene guía propia. */
export function guiaDe(escena: Escena): Guia | null {
  return escena === "generica" ? null : GUIAS[escena];
}
