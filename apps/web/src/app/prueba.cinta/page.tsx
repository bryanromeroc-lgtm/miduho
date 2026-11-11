import { Reproductor } from "@/features/actividades/reproductor/reproductor";
import actividad from "../../../curriculo/actividades/ciencias-sociales/1/rutinas-del-dia.json";

// Página TEMPORAL de verificación (se borra antes del build final).
export default function Prueba() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
      <Reproductor actividad={{ ...actividad, contenido: actividad.contenido }} materia="Ciencias sociales" volverHref="/" />
    </main>
  );
}
