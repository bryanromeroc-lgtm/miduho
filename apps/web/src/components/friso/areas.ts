import type { Area } from "@/data/demo";

/*
  Familias de área del friso con los tokens del mundo nuevo (mismo contrato
  que AREAS de los datos demo, que Laboratorios conserva con sus literales).
*/
export const AREAS: Record<Area, { nombre: string; plancha: string; planchaHonda: string; pale: string; tinta: string; medio: string }> = {
  literatura: {
    nombre: "Comprensión Lectora",
    plancha: "var(--color-lit)",
    planchaHonda: "var(--color-lit-hondo)",
    pale: "var(--color-lit-pale)",
    tinta: "var(--color-lit-tinta)",
    medio: "var(--color-lit-medio)",
  },
  robotica: {
    nombre: "Robótica",
    plancha: "var(--color-rob)",
    planchaHonda: "var(--color-rob-hondo)",
    pale: "var(--color-rob-pale)",
    tinta: "var(--color-rob-tinta)",
    medio: "var(--color-rob-medio)",
  },
  emprendimiento: {
    nombre: "Emprendimiento",
    plancha: "var(--color-emp)",
    planchaHonda: "var(--color-emp-hondo)",
    pale: "var(--color-emp-pale)",
    tinta: "var(--color-emp-tinta)",
    medio: "var(--color-emp-medio)",
  },
};
