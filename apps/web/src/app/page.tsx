import { MarcoJuego } from "@/components/shell/marco-juego";
import { InicioDocente } from "@/features/inicio/inicio-docente";
import { MisMaterias } from "@/features/materias/mis-materias";
import { totalEstrellas } from "@/lib/materias";
import { misMateriasDeSesion } from "@/server/modules/materias";

// El inicio decide por contexto (D2): el estudiante ve «Mis materias»; la docente, su día.
export default async function Inicio({ searchParams }: { searchParams: Promise<{ materia?: string | string[] }> }) {
  const [estudiante, { materia }] = await Promise.all([misMateriasDeSesion(), searchParams]);
  if (!estudiante) return <InicioDocente />;
  return (
    <MarcoJuego variante="tablero" estrellas={totalEstrellas(estudiante.datos.materias)}>
      <MisMaterias
        datos={estudiante.datos}
        avatarInicial={estudiante.avatar}
        primeraVez={!estudiante.avatarElegido}
        materiaInicial={typeof materia === "string" ? materia : undefined}
      />
    </MarcoJuego>
  );
}
