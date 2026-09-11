import Link from "next/link";
import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { RotuloArea, Estado } from "@/components/friso/piezas";
import { PROGRAMAS, AREAS, RUTAS } from "@/lib/datos";

/*
  ROBÓTICA Y EMPRENDIMIENTO — currículo secuenciado.

  El bloque es una fila del friso; cada unidad es un trecho, y la plancha
  de color de cada trecho es su área. Así se ve de un vistazo que el
  programa INTERCALA las dos áreas dentro de un mismo bloque: el área es
  atributo de la unidad, no del programa.

  Es la lectura que la banda hace posible y una lista no: cuatro planchas
  seguidas donde la tercera cambia de color dicen «aquí entra Robótica»
  sin una sola palabra.
*/

export default function Laboratorios() {
  const programa = PROGRAMAS[0];
  const todas = programa.bloques.flatMap((b) => b.unidades);
  const porArea = {
    emprendimiento: todas.filter((u) => u.area === "emprendimiento").length,
    robotica: todas.filter((u) => u.area === "robotica").length,
  };

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Laboratorios" }]} />

      <Cabecera
        kicker={`${programa.nombre} · ${todas.length} unidades en ${programa.bloques.length} bloques`}
        titulo="Laboratorios"
        nota="A diferencia de la biblioteca, aquí hay secuencia: bloque, unidad y ruta didáctica. La plancha de color dice el área — así se ve que un mismo bloque intercala las dos."
      />

      <section className="mb-6 rounded-[15px] bg-papel p-5">
        <p className="max-w-[80ch] text-[14px] leading-[1.6] text-gris">
          {programa.descripcion}
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <RotuloArea area="emprendimiento" />
          <span className="self-center text-[13px] text-gris">
            {porArea.emprendimiento} unidades
          </span>
          <RotuloArea area="robotica" />
          <span className="self-center text-[13px] text-gris">
            {porArea.robotica} unidades
          </span>
        </div>
      </section>

      <div className="flex flex-col gap-7">
        {programa.bloques.map((bloque) => {
          const empr = bloque.unidades.filter((u) => u.area === "emprendimiento").length;
          const robo = bloque.unidades.filter((u) => u.area === "robotica").length;

          return (
            <section key={bloque.id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="font-heading text-[19px] font-bold uppercase tracking-[0.06em] text-tinta">
                  {bloque.nombre}
                </h2>
                <p className="text-[12.5px] text-gris">
                  {empr} de Emprendimiento · {robo} de Robótica
                </p>
              </div>

              {/* La fila del friso: la secuencia es la lectura de izquierda a
                  derecha, y envuelve cuando se acaba el ancho. */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(238px,1fr))] items-stretch gap-2.5">
                {bloque.unidades.map((u) => {
                  const a = AREAS[u.area];
                  const tieneRuta = Boolean(RUTAS[u.id]);

                  return (
                    <article
                      key={u.id}
                      className="plancha trecho-entra h-full"
                      style={{ background: a.plancha }}
                    >
                      <header className="px-5 pb-3 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                          Unidad {u.orden} · {a.nombre}
                        </p>
                        <h3 className="mt-1.5 font-heading text-[21px] font-bold leading-[1.05] text-white">
                          {u.titulo}
                        </h3>
                      </header>

                      <div className="plancha-estante">
                        <p className="text-[12.5px] text-gris">
                          {u.sesiones} {u.sesiones === 1 ? "sesión" : "sesiones"}
                          {u.liberacion && ` · ${u.liberacion}`}
                        </p>
                        <div className="mt-auto pt-2">
                          <Estado estado={u.estado} area={u.area} />
                          {tieneRuta && (
                            <Link
                              href={`/laboratorios/${u.id}`}
                              className="mt-2.5 block rounded-[9px] px-3 py-2.5 text-center text-[12.5px] font-bold text-white"
                              style={{ background: a.plancha }}
                            >
                              Ver ruta didáctica →
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 max-w-[80ch] text-[13px] leading-[1.6] text-gris">
        La maqueta trae la ruta didáctica completa de la Unidad 7, «Sensores que
        miden». Todo el contenido pedagógico es redacción propia: de la plataforma de
        referencia se reutiliza únicamente el esquema estructural (bloque → unidad →
        ruta de 7 secciones), nunca su contenido.
      </p>
    </Marco>
  );
}
