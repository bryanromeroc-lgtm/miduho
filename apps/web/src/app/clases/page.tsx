import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { Friso, TrechoConRegla } from "@/components/friso/friso";
import { Plancha, Ficha, RanuraLibre } from "@/components/friso/plancha";
import { Boton } from "@/components/friso/piezas";
import { HOY, DOCENTE } from "@/lib/datos";
import { obtenerGrupoMaqueta } from "@/server/shell";

/*
  MIS CLASES — el mismo friso del día, sin la marca de «ahora».
  Aquí la lectura no es temporal sino de inventario: qué clase tiene
  material y cuál no.
*/

export default async function MisClases() {
  // Grupo real de la sesión (INC1R-11); las clases y el período siguen siendo demostrativos.
  const grupo = await obtenerGrupoMaqueta("/clases");
  const vacias = HOY.filter((c) => c.contenidos.length === 0).length;

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Mis clases" }]} />

      <Cabecera
        kicker={grupo ? `${grupo} · ${DOCENTE.periodo}` : DOCENTE.periodo}
        titulo="Mis clases"
        nota={`${DOCENTE.clasesACargo} clases a cargo. La maqueta desarrolla ${HOY.length}; ${vacias} está sin material y se ve así en la banda. El plan de estudios completo queda abierto.`}
      />

      <Friso>
        {HOY.map((clase) => {
          const libres = Math.max(0, clase.ranuras - clase.contenidos.length);
          return (
            <TrechoConRegla key={clase.id} hora={clase.hora} area={clase.area}>
              <Plancha
                transicion={`plancha-${clase.id}`}
                area={clase.area}
                hora={clase.hora}
                rotulo={clase.asignatura}
                titulo={clase.tema ?? "Sin material todavía"}
                pie={
                  <div className="px-[22px] pb-5 pt-1">
                    <Boton
                      href={
                        clase.contenidos.length > 0
                          ? `/clases/${clase.id}`
                          : "/biblioteca"
                      }
                      tono={clase.area ? "tinta" : "area"}
                      area={clase.area ? undefined : "robotica"}
                      className="w-full justify-center !rounded-[9px] !px-4 !py-3 !text-[13px]"
                    >
                      {clase.contenidos.length > 0
                        ? "Entrar a la clase"
                        : "Buscar en biblioteca"}
                    </Boton>
                  </div>
                }
              >
                {clase.contenidos.length > 0 ? (
                  <>
                    {clase.contenidos.map((t) => {
                      const [tipo, ...resto] = t.pie.split(" · ");
                      const meta = resto.join(" · ").replace(/^(\d+-\d+)$/, "$1 años");
                      return (
                        <Ficha
                          key={t.id}
                          area={t.area}
                          tipo={tipo}
                          titulo={t.titulo}
                          meta={meta || undefined}
                        />
                      );
                    })}
                    {libres > 0 && <RanuraLibre />}
                    <p className="mt-auto border-t border-linea pt-2.5 text-[12px] text-gris">
                      {clase.contenidos.length} de {clase.ranuras} puestos ocupados
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] leading-[1.5] text-gris">
                      Esta banda está vacía. El material no llega solo a la clase: es
                      exactamente el problema que la plataforma existe para resolver.
                    </p>
                    <div className="mt-auto">
                      <RanuraLibre />
                    </div>
                  </>
                )}
              </Plancha>
            </TrechoConRegla>
          );
        })}
      </Friso>
    </Marco>
  );
}
