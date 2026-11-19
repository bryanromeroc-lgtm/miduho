import { permanentRedirect } from "next/navigation";

type Busqueda = Record<string, string | string[] | undefined>;

/** Ruta anterior: «Estudiantes y grupos» ahora vive en Administración › Usuarios › Estudiantes › Grupos. */
export default async function RedirigirEstudiantes({ searchParams }: { searchParams: Promise<Busqueda> }) {
  const sp = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") p.set(k, v);
  const q = p.toString();
  permanentRedirect(`/admin/usuarios/estudiantes/grupos${q ? `?${q}` : ""}`);
}
