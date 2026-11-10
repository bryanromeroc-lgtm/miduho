import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ActividadResumen, ResumenMateria } from "@/lib/materias";
import { TarjetaPlana } from "./tarjeta-plana";
import { kitDe } from "../tematica";
import { VistaMateria } from "./vista-materia";

// El menú de cuenta arrastra la acción de cerrar sesión (Auth.js); sin sesión no se pinta.
vi.mock("@/app/(auth)/acciones", () => ({ cerrarSesion: async () => {} }));

/* Datos ficticios: una materia y actividades sin personas. */
const materia: ResumenMateria = {
  id: "m1",
  nombre: "Matemáticas",
  area: { nombre: "Matemáticas", orden: 1 },
  escena: "matematicas",
  claseHref: "/materias/m1",
  estrellas: null,
  avance: null,
  sigue: null,
  nuevo: null,
  conMaterial: null,
};
const actividad = (n: number, extra: Partial<ActividadResumen> = {}): ActividadResumen => ({
  id: `a${n}`,
  titulo: `Reto ${n}`,
  tipo: "memoria",
  estado: "disponible",
  estrellas: null,
  intentosUsados: 0,
  intentosMax: null,
  abre: null,
  cierra: null,
  href: `/x/a${n}`,
  ...extra,
});

const vista = (actividades: ActividadResumen[] | null, previa: boolean) =>
  renderToStaticMarkup(
    <VistaMateria
      datos={{ materia, actividades }}
      pagina={1}
      hrefPagina={(n) => `?pagina=${n}`}
      volverHref={previa ? "/admin/contenido" : "/?materia=m1"}
      modo={previa ? { tipo: "vista-previa", grado: "5°" } : undefined}
    />,
  );

describe("vista de materia: modo estudiante (por defecto)", () => {
  it("sin franja de vista previa y con «Volver a Mis materias»", () => {
    const h = vista([actividad(1)], false);
    expect(h).not.toContain("Vista previa");
    expect(h).toContain("Volver a Mis materias");
    expect(h).toContain('href="/?materia=m1"');
  });

  it("su estado vacío sigue siendo el del estudiante", () => {
    const h = vista(null, false);
    expect(h).toContain("Aún no hay actividades");
    expect(h).toContain("Cuando tu docente asigne actividades");
    expect(h).not.toContain("para 5°");
  });
});

describe("vista de materia: modo vista previa", () => {
  it("franja visible «Vista previa · 5°» y «Volver a Contenido»", () => {
    const h = vista([actividad(1)], true);
    expect(h).toContain("Vista previa · 5°");
    expect(h).toContain("Volver a Contenido");
    expect(h).toContain('href="/admin/contenido"');
    expect(h).not.toContain("Volver a Mis materias");
  });

  it("pagina de 6 en 6 igual que la del estudiante", () => {
    const h = vista(Array.from({ length: 8 }, (_, i) => actividad(i + 1)), true);
    expect(h.match(/<li /g)).toHaveLength(6);
    expect(h).toContain("Página 1 de 2");
  });

  it("estado vacío «Aún no hay actividades para 5°», sin tarjetas ni paginador", () => {
    const h = vista([], true);
    expect(h).toContain("Aún no hay actividades para 5°");
    expect(h).not.toContain("Páginas de actividades");
    expect(h).toContain("Volver a Contenido");
  });
});

describe("tarjeta en vista previa", () => {
  it("sin estrellas, intentos ni fechas: solo el tipo de juego", () => {
    const a = actividad(1, { estrellas: 2, intentosMax: 3, intentosUsados: 1, cierra: "2026-11-06T22:00:00Z" });
    const h = renderToStaticMarkup(<TarjetaPlana actividad={a} kit={kitDe("matematicas")} indice={0} previa />);
    expect(h).not.toContain("data-llena");
    expect(h).not.toContain("data-queda");
    // Texto visible y nombre accesible, sin las clases CSS.
    const texto = h.replace(/class="[^"]*"/g, "");
    expect(texto).not.toMatch(/Quedan|intento|Hasta el|estrellas|Práctica libre/);
    expect(h).toContain("Memoria");
    expect(h).toContain("Jugar");
  });
});
