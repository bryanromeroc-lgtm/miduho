import type { Metadata } from "next";
import { MarcoJuego } from "@/components/shell/marco-juego";
import { MuestraCromos } from "@/features/actividades/presentacion/muestra-cromos";
import { PantallaResultado } from "@/features/actividades/presentacion/pantalla-resultado";
import { TarjetaActividad } from "@/features/actividades/presentacion/tarjeta-actividad";
import { SpriteEscenas } from "@/features/materias/escenas/sprite-escenas";
import s from "@/features/actividades/presentacion/muestra.module.css";

export const metadata: Metadata = { title: "Ejemplo · Desempeño · MIDUHO", robots: { index: false } };

const base = { area: { nombre: "Ejemplo", orden: 1 }, claseHref: "#", avance: null, sigue: null, nuevo: null, conMaterial: null, estrellas: null };

// Vista de revisión (presentacion-desempeno): todo es ficticio y está rotulado «Ejemplo».
export default function MuestraDesempeno() {
  return (
    <MarcoJuego>
      <SpriteEscenas />
      <div className={s.pagina}>
        <p className={s.aviso}>Vista de ejemplo: datos ficticios para revisar el diseño. No corresponden a ningún estudiante.</p>

        <section className={s.seccion} aria-labelledby="estados">
          <h2 id="estados">Estados del cromo</h2>
          <MuestraCromos
            materias={[
              { ...base, id: "e1", nombre: "Comprensión lectora", escena: "lectura", estado: "Con progreso", sigue: "Caperucita Roja", avance: { hechas: 4, total: 6 }, estrellas: 2 },
              { ...base, id: "e2", nombre: "Matemáticas", escena: "matematicas", estado: "Dominada (3 estrellas)", sigue: "Sumas hasta 20", avance: { hechas: 5, total: 5 }, estrellas: 3 },
              { ...base, id: "e3", nombre: "Ciencias naturales", escena: "naturales", estado: "Con material nuevo", nuevo: true, estrellas: 1, avance: { hechas: 2, total: 5 } },
              { ...base, id: "e4", nombre: "Ciencias sociales", escena: "sociales", estado: "En preparación", conMaterial: false },
              { ...base, id: "e5", nombre: "Educación religiosa", escena: "generica", estado: "Sin datos de progreso" },
            ]}
          />
        </section>

        <section className={s.seccion} aria-labelledby="tarjetas">
          <h2 id="tarjetas">Tarjetas de actividad</h2>
          <div className={s.rejilla}>
            <TarjetaActividad etiqueta="Ejemplo" nombre="Sumas hasta 20" area="Matemáticas" familia="matematicas" mejor={null} usados={0} href="#" />
            <TarjetaActividad etiqueta="Ejemplo" nombre="Las partes de la planta" area="Ciencias naturales" familia="naturales" mejor={2} usados={2} href="#" />
            <TarjetaActividad etiqueta="Ejemplo" nombre="Colors and shapes" area="Inglés" familia="ingles" mejor={3} usados={3} href="#" />
          </div>
        </section>

        <section className={s.seccion} aria-labelledby="resultados">
          <h2 id="resultados">Pantallas de resultado</h2>
          <div className={s.rejilla}>
            <PantallaResultado etiqueta="Ejemplo" actividad="Sumas hasta 20" avatar="SOL" reintentarHref="#" volverHref="#" resultado={{ estrellas: 3, mejorAnterior: 2, usados: 2, materiaDominada: true }} />
            <PantallaResultado etiqueta="Ejemplo" actividad="Colors and shapes" avatar="PINO" reintentarHref="#" volverHref="#" resultado={{ estrellas: 1, mejorAnterior: 2, usados: 3 }} />
          </div>
        </section>
      </div>
    </MarcoJuego>
  );
}
