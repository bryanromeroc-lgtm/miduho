import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { nombreCelda, textoCelda } from "@/lib/contenido";
import { carpetaAsignatura, crearCatalogo, RAIZ_CURRICULO, type ActividadDeCatalogo } from "@/server/modules/curriculo/catalogo";
import { crearServicioContenido, ordenarAreas, ordenDeGrado, type FuenteContenido } from "./servicio";
import { ASIGNATURAS_CURRICULO } from "../../../../prisma/asignaturas-curriculo";

/*
  Dobles: una base en memoria con la forma mínima que el servicio consulta y
  un catálogo de actividades ficticias. Ningún dato de personas.
*/
const GRADOS = [
  { id: "g3", nombre: "3°", orden: 3 },
  { id: "g1", nombre: "1°", orden: 1 },
  { id: "g5", nombre: "5°", orden: 5 },
];
const ASIGNATURAS = [
  { id: "mat", nombre: "Matemáticas", areaId: "a-mat", grados: ["g1", "g5"] },
  { id: "geo", nombre: "Geometría", areaId: "a-mat", grados: ["g5"] },
  { id: "ing", nombre: "Inglés", areaId: "a-hum", grados: ["g5"] },
  { id: "lec", nombre: "Comprensión Lectora", areaId: "a-hum", grados: [] as string[] },
];
const AREAS = [
  { id: "a-sin", nombre: "Zeta sin orden", orden: null },
  { id: "a-mat", nombre: "Matemáticas", orden: 2 },
  { id: "a-hum", nombre: "Humanidades", orden: 1 },
];

function dobleDb() {
  const asignatura = (a: (typeof ASIGNATURAS)[number]) => ({
    id: a.id,
    nombre: a.nombre,
    grados: a.grados.map((gradoId) => ({ gradoId })),
  });
  return {
    grado: {
      findMany: async () => [...GRADOS].sort((a, b) => a.orden - b.orden),
      findUnique: async ({ where }: { where: { orden: number } }) => GRADOS.find((g) => g.orden === where.orden) ?? null,
    },
    area: {
      findMany: async () => AREAS.map((ar) => ({ ...ar, asignaturas: ASIGNATURAS.filter((a) => a.areaId === ar.id).map(asignatura) })),
    },
    asignatura: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        const a = ASIGNATURAS.find((x) => x.id === where.id);
        const area = a && AREAS.find((ar) => ar.id === a.areaId)!;
        return a && area ? { ...asignatura(a), area: { nombre: area.nombre, orden: area.orden } } : null;
      },
    },
  } as unknown as PrismaClient;
}

function actividad(asignatura: string, grado: number, slug: string, titulo: string): ActividadDeCatalogo {
  return { slug, titulo, tipo: "quiz", grado, instruccion: "Responde.", contenido: {}, asignatura: carpetaAsignatura(asignatura) } as unknown as ActividadDeCatalogo;
}

const LISTA = [
  actividad("Matemáticas", 5, "mat-b", "Sumas"),
  actividad("Matemáticas", 5, "mat-a", "Restas"),
  actividad("Matemáticas", 5, "mat-c", "Divisiones"),
  actividad("Inglés", 5, "ing-a", "Colores"),
  // Geometría no se dicta en 1°: aunque haya un archivo, la celda dice «No se dicta».
  actividad("Geometría", 1, "geo-1", "Figuras"),
];
const catalogo: FuenteContenido = {
  de: (asig, grado) => LISTA.filter((a) => a.asignatura === carpetaAsignatura(asig) && a.grado === grado),
  una(asig, grado, slug) {
    return this.de(asig, grado).find((a) => a.slug === slug) ?? null;
  },
  todas: () => LISTA,
};
const S = crearServicioContenido(dobleDb(), catalogo);

describe("lógica pura", () => {
  it("ordena áreas por orden, las que no tienen al final, y luego por nombre", () => {
    const r = ordenarAreas([
      { nombre: "B", orden: 2 },
      { nombre: "Z", orden: null },
      { nombre: "A", orden: 2 },
      { nombre: "C", orden: 1 },
    ]);
    expect(r.map((a) => a.nombre)).toEqual(["C", "A", "B", "Z"]);
  });

  it("solo acepta el orden del grado como entero positivo", () => {
    expect(ordenDeGrado("5")).toBe(5);
    for (const malo of ["", "0", "-1", "5a", "5.0", " 5", "1e3"]) expect(ordenDeGrado(malo)).toBeNull();
  });

  it("textos de celda y nombre accesible completo", () => {
    const con = { estado: "con-contenido", actividades: 8, href: "/x" } as const;
    expect(textoCelda(con)).toBe("8 actividades");
    expect(textoCelda({ ...con, actividades: 1 })).toBe("1 actividad");
    expect(textoCelda({ estado: "sin-contenido", href: "/x" })).toBe("Sin contenido");
    expect(textoCelda({ estado: "no-se-dicta" })).toBe("No se dicta");
    expect(nombreCelda("Matemáticas", "5°", con)).toBe("Matemáticas, 5°: 8 actividades");
  });
});

describe("indice()", () => {
  it("áreas por orden y nombre, asignaturas por nombre y todos los grados por orden", async () => {
    const { grados, areas } = await S.indice();
    expect(grados.map((g) => g.nombre)).toEqual(["1°", "3°", "5°"]);
    expect(areas.map((a) => a.nombre)).toEqual(["Humanidades", "Matemáticas", "Zeta sin orden"]);
    expect(areas[0].asignaturas.map((a) => a.nombre)).toEqual(["Comprensión Lectora", "Inglés"]);
    expect(areas[1].asignaturas.map((a) => a.nombre)).toEqual(["Geometría", "Matemáticas"]);
    expect(areas[2].asignaturas).toEqual([]);
    for (const area of areas) for (const fila of area.asignaturas) expect(fila.celdas).toHaveLength(3);
  });

  it("cada celda es exactamente uno de los tres estados, con el conteo real", async () => {
    const { areas } = await S.indice();
    const fila = (nombre: string) => areas.flatMap((a) => a.asignaturas).find((f) => f.nombre === nombre)!;
    // Matemáticas: 1° se dicta sin material, 3° no se dicta, 5° con tres actividades.
    expect(fila("Matemáticas").celdas).toEqual([
      { estado: "sin-contenido", href: "/admin/contenido/mat/1" },
      { estado: "no-se-dicta" },
      { estado: "con-contenido", actividades: 3, href: "/admin/contenido/mat/5" },
    ]);
    // Sin ningún AsignaturaGrado: toda la fila «No se dicta».
    expect(fila("Comprensión Lectora").celdas.every((c) => c.estado === "no-se-dicta")).toBe(true);
    // Un archivo del catálogo en un grado sin AsignaturaGrado no se cuenta.
    expect(fila("Geometría").celdas[0]).toEqual({ estado: "no-se-dicta" });
    expect(fila("Geometría").celdas[2]).toEqual({ estado: "sin-contenido", href: "/admin/contenido/geo/5" });
  });
});

describe("materia()", () => {
  it("arma la vista previa con tarjetas disponibles, sin estrellas, intentos ni fechas", async () => {
    const v = await S.materia("mat", "5");
    expect(v?.grado).toEqual({ id: "g5", nombre: "5°", orden: 5 });
    expect(v?.materia).toMatchObject({ id: "mat", nombre: "Matemáticas", escena: "matematicas", estrellas: null, avance: null, conMaterial: null });
    expect(v?.actividades.map((a) => a.titulo)).toEqual(["Divisiones", "Restas", "Sumas"]);
    for (const a of v!.actividades) {
      expect(a).toMatchObject({ estado: "disponible", estrellas: null, intentosUsados: 0, intentosMax: null, abre: null, cierra: null });
      expect(a.href).toBe(`/admin/contenido/mat/5/actividades/${a.id}`);
    }
  });

  it("se dicta sin material: vista con lista vacía", async () => {
    expect((await S.materia("mat", "1"))?.actividades).toEqual([]);
  });

  it("null (404) si la asignatura o el grado no existen, o si no se dicta en ese grado", async () => {
    expect(await S.materia("nada", "5")).toBeNull();
    expect(await S.materia("mat", "9")).toBeNull();
    expect(await S.materia("mat", "3")).toBeNull();
    expect(await S.materia("mat", "cinco")).toBeNull();
    expect(await S.materia("lec", "1")).toBeNull();
  });
});

describe("actividad()", () => {
  it("devuelve la actividad del currículo de esa asignatura y grado", async () => {
    const r = await S.actividad("mat", "5", "mat-a");
    expect(r?.actividad.titulo).toBe("Restas");
    expect(r?.vista.materia.id).toBe("mat");
  });

  it("null (404) si el slug es de otra asignatura o de un grado donde no se dicta", async () => {
    expect(await S.actividad("mat", "5", "ing-a")).toBeNull();
    expect(await S.actividad("mat", "5", "no-existe")).toBeNull();
    expect(await S.actividad("geo", "1", "geo-1")).toBeNull();
    expect(await S.actividad("mat", "3", "mat-a")).toBeNull();
  });
});

describe("coherencia del currículo con las asignaturas de demostración", () => {
  // Riesgo del design: el catálogo se indexa por nombre normalizado; si no coincide, la celda dice «Sin contenido».
  it("cada carpeta de curriculo/actividades/ corresponde a una asignatura", () => {
    const carpetas = readdirSync(RAIZ_CURRICULO, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    const conocidas = new Set(ASIGNATURAS_CURRICULO.map((a) => carpetaAsignatura(a.nombre)));
    expect(carpetas.filter((c) => !conocidas.has(c))).toEqual([]);
  });

  it("el catálogo real encuentra actividades por el nombre de cada asignatura", () => {
    const real = crearCatalogo(RAIZ_CURRICULO);
    const conActividades = new Set(real.todas().map((a) => a.asignatura));
    for (const carpeta of conActividades) {
      const asignatura = ASIGNATURAS_CURRICULO.find((a) => carpetaAsignatura(a.nombre) === carpeta)!;
      const grados = [...new Set(real.todas().filter((a) => a.asignatura === carpeta).map((a) => a.grado))];
      expect(grados.some((g) => real.de(asignatura.nombre, g).length > 0)).toBe(true);
    }
  });
});
