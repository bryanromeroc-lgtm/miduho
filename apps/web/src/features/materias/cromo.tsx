import { Hourglass, Sparkles } from "lucide-react";
import { BarraAvance, BotonJugar, Estrellas, Placa } from "@/components/sticker";
import type { Avatar } from "@/lib/avatares";
import { etiquetaElegir, partesDelCromo, type ResumenMateria } from "@/lib/materias";
import { partirSilabas } from "@/lib/silabas";
import s from "./materias.module.css";

/*
  CROMO DE MATERIA — de arriba abajo: marco con bisel, ventana con rayos y
  suelo, personaje que se sale del marco, placa con el nombre, bloque de
  información según los datos que existan y botón redondo de jugar.
  Dos controles reales y separados: el botón que elige el cromo (lo cubre
  entero) y el enlace de jugar. Recibe todo por props: no importa del servidor.
*/
export function Cromo({
  materia,
  indice,
  elegida,
  onElegir,
  avatar,
}: {
  materia: ResumenMateria;
  indice: number;
  elegida: boolean;
  onElegir: () => void;
  /** En pantallas angostas el avatar se posa fijo sobre el cromo elegido. */
  avatar?: Avatar;
}) {
  const p = partesDelCromo(materia);
  return (
    <article
      className={s.cromo}
      data-familia={materia.escena}
      data-elegida={elegida ? "" : undefined}
      data-preparacion={p.preparacion ? "" : undefined}
    >
      <button
        type="button"
        className={s.elegir}
        aria-pressed={elegida}
        aria-label={etiquetaElegir(materia)}
        onClick={onElegir}
      />
      <span className={s.bisel} aria-hidden="true" />

      <div className={s.escena} aria-hidden="true">
        <div className={s.ventana}>
          <svg className={s.rayos} viewBox="-100 -100 200 140" preserveAspectRatio="xMidYMax slice">
            <g>
              <path d="M0 40 L-14 -120 L14 -120 Z" />
              <path d="M0 40 L-110 -96 L-86 -116 Z" />
              <path d="M0 40 L110 -96 L86 -116 Z" />
              <path d="M0 40 L-150 -30 L-140 -58 Z" />
              <path d="M0 40 L150 -30 L140 -58 Z" />
              <path d="M0 40 L-62 -130 L-34 -132 Z" />
              <path d="M0 40 L62 -130 L34 -132 Z" />
            </g>
            <circle cx="0" cy="-10" r="46" className={s.resplandor} />
          </svg>
          <svg className={s.suelo} viewBox="0 0 200 60" preserveAspectRatio="none">
            <path d="M0 22 C 50 6, 120 30, 200 14 L200 60 L0 60 Z" />
            <path d="M0 22 C 50 6, 120 30, 200 14" className={s.sueloBorde} />
          </svg>
          {p.dominada && <span className={s.brillo} />}
        </div>
        <svg className={s.personaje} viewBox="-150 -182 300 216" preserveAspectRatio="xMidYMax meet">
          <use href={`#escena-${materia.escena}`} />
        </svg>
      </div>
      {elegida && avatar && (
        <svg className={s.avatarFijo} aria-hidden="true" viewBox="0 0 100 112">
          <use href={`#avatar-${avatar.toLowerCase()}`} />
        </svg>
      )}
      {p.nuevo && (
        <span className={s.nuevo}>
          <Sparkles aria-hidden="true" size={13} strokeWidth={2.8} />
          ¡Nuevo!
        </span>
      )}

      <Placa as="h2" giro={indice % 2 === 0 ? -1.5 : 1.5} className={s.placa}>
        <span className={s.placaTexto} data-largo={materia.nombre.length > 22 ? "" : undefined} title={materia.nombre}>
          {partirSilabas(materia.nombre)}
        </span>
      </Placa>

      <div className={s.info} data-con-jugar={p.jugar ? "" : undefined}>
        {p.preparacion && (
          <p className={s.preparacion}>
            <Hourglass aria-hidden="true" size={20} strokeWidth={2.4} />
            Tu docente está preparando el material
          </p>
        )}
        {p.sigue && (
          <p className={s.sigue} title={materia.sigue ?? undefined}>
            Sigue con
            <strong>{materia.sigue}</strong>
          </p>
        )}
        {p.avance && materia.avance && <BarraAvance hechas={materia.avance.hechas} total={materia.avance.total} />}
        {p.estrellas && materia.estrellas !== null && <Estrellas cantidad={materia.estrellas} />}
        {p.invitacion && (
          <p className={s.invitacion}>
            Toca jugar para entrar
          </p>
        )}
      </div>

      {p.jugar && <BotonJugar href={materia.claseHref} asignatura={materia.nombre} className={s.jugar} />}
    </article>
  );
}
