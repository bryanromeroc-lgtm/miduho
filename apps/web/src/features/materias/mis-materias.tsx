"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Hourglass, Sparkles } from "lucide-react";
import { guardarAvatar } from "@/app/acciones/avatar";
import { BotonSticker, Estrellas, textoEstrellas } from "@/components/sticker";
import { AVATARES, NOMBRE_AVATAR, type Avatar } from "@/lib/avatares";
import { DESCRIPCION_ESCENA } from "@/lib/escenas";
import type { MisMaterias as Datos } from "@/lib/materias";
import { POR_PAGINA, posicionAvatar, totalPaginas } from "@/lib/posicion-avatar";
import { Cromo } from "./cromo";
import { FondoSereno } from "./fondo-sereno";
import { SpriteEscenas } from "./escenas/sprite-escenas";
import s from "./materias.module.css";

const COLUMNAS = 5;

/*
  «MIS MATERIAS» — el inicio del estudiante. Un tablero de cromos sobre la
  sabana, el avatar posado sobre el cromo elegido y, al lado, el panel con
  «Mi explorador» y la materia elegida. Una sola pantalla en escritorio y
  tableta; con más de 10 materias, páginas de 10. 🔶
*/
export function MisMaterias({
  datos,
  avatarInicial,
  primeraVez = false,
  materiaInicial,
}: {
  datos: Datos;
  avatarInicial: Avatar;
  /** Aún no ha elegido avatar: «Mi explorador» lo invita, sin bloquear nada. */
  primeraVez?: boolean;
  /** Id de la asignatura que vuelve elegida al regresar de su vista (`?materia=`). */
  materiaInicial?: string;
}) {
  const { grupo, materias } = datos;
  const inicial = Math.max(0, materias.findIndex((m) => m.id === materiaInicial));
  const [elegida, setElegida] = useState(inicial);
  const [pagina, setPagina] = useState(posicionAvatar(inicial, COLUMNAS).pagina);
  const [avatar, setAvatar] = useState<Avatar>(avatarInicial);
  const [aviso, setAviso] = useState<string | null>(null);
  const [invitar, setInvitar] = useState(primeraVez);
  const [confirmado, setConfirmado] = useState<Avatar | null>(null);
  const [, iniciar] = useTransition();

  const paginas = totalPaginas(materias.length);
  const visibles = materias.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
  const actual = materias[elegida] ?? null;
  const pos = posicionAvatar(elegida, COLUMNAS);

  function elegirAvatar(nuevo: Avatar) {
    if (nuevo === avatar && !invitar) return;
    const previo = avatar;
    const eraInvitacion = invitar;
    setInvitar(false);
    setAvatar(nuevo);
    setAviso(null);
    iniciar(async () => {
      const r = await guardarAvatar(nuevo);
      if (!r.ok) {
        setAvatar(previo);
        setInvitar(eraInvitacion);
        setAviso(r.error);
      } else if (eraInvitacion) {
        setConfirmado(nuevo);
      }
    });
  }

  return (
    <div className={s.pagina}>
      <SpriteEscenas />

      <section className={`${s.tablero} sobre-papel`} aria-labelledby="materias-titulo">
        <FondoSereno className={s.fondo} />
        <h1 id="materias-titulo" className={`tipo-display ${s.titulo}`}>
          Mis materias
        </h1>

        {!grupo ? (
          <p className={s.vacio}>Aún no tienes un grupo asignado. Pídele ayuda a tu docente.</p>
        ) : materias.length === 0 ? (
          <p className={s.vacio}>Tu grupo todavía no tiene materias. Cuando tu docente las agregue, aparecerán aquí.</p>
        ) : (
          <>
            <div className={s.cuadricula}>
              {visibles.map((m, i) => {
                const indice = pagina * POR_PAGINA + i;
                return (
                  <Cromo
                    key={m.id}
                    materia={m}
                    indice={indice}
                    elegida={indice === elegida}
                    onElegir={() => setElegida(indice)}
                    avatar={avatar}
                  />
                );
              })}

              {pos.pagina === pagina && (
                <div
                  className={s.capaX}
                  aria-hidden="true"
                  style={{ "--col": pos.columna, "--fila": pos.fila, "--cols": COLUMNAS } as CSSProperties}
                >
                  <div className={s.capaY}>
                    <div className={s.viajero}>
                      <svg className={s.flota} viewBox="0 0 100 112">
                        <use href={`#avatar-${avatar.toLowerCase()}`} />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {paginas > 1 && (
              <nav className={s.paginacion} aria-label="Páginas de materias">
                <BotonSticker tono="papel" onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0}>
                  <ArrowLeft size={20} strokeWidth={2.8} aria-hidden="true" />
                  Anteriores
                </BotonSticker>
                <p className={s.paginaActual} aria-live="polite">
                  Página {pagina + 1} de {paginas}
                </p>
                <BotonSticker tono="papel" onClick={() => setPagina((p) => p + 1)} disabled={pagina >= paginas - 1}>
                  Siguientes
                  <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
                </BotonSticker>
              </nav>
            )}
          </>
        )}
      </section>

      <aside className={s.panel} aria-label="Mi explorador y materia elegida">
        <div className={`sticker-panel ${s.explorador}`} data-invitar={invitar ? "" : undefined}>
          <p className="tipo-saludo">¡Hola{grupo ? `, grupo ${grupo.etiqueta}` : ""}!</p>
          {invitar ? (
            <p className={s.invitar}>
              <Sparkles size={18} strokeWidth={2.6} aria-hidden="true" />
              Elige tu explorador: te acompañará por tus materias.
            </p>
          ) : (
            <p className={s.explicacion} aria-live="polite">
              {confirmado ? `¡Listo! ${NOMBRE_AVATAR[confirmado].completo} te acompaña.` : "Elige tu avatar y toca una materia."}
            </p>
          )}
          <div role="group" aria-label="Elige tu avatar" className={s.avatares}>
            {AVATARES.map((a) => (
              <div key={a} className={s.avatarOpcion}>
                <button
                  type="button"
                  className={s.avatarBoton}
                  aria-pressed={a === avatar}
                  aria-label={`Avatar ${NOMBRE_AVATAR[a].completo}`}
                  onClick={() => elegirAvatar(a)}
                >
                  <svg aria-hidden="true" viewBox="0 0 100 112">
                    <use href={`#avatar-${a.toLowerCase()}`} />
                  </svg>
                </button>
                <span className={s.avatarNombre} aria-hidden="true">
                  {NOMBRE_AVATAR[a].corto}
                </span>
              </div>
            ))}
          </div>
          {aviso && (
            <p role="status" className={s.aviso}>
              {aviso}
            </p>
          )}
        </div>

        {actual && (
          <div className={`sticker-panel ${s.elegida}`} data-familia={actual.escena} aria-live="polite">
            <div className={s.elegidaCabecera}>
              <p className={`tipo-titulo texto-sticker ${s.elegidaNombre}`}>{actual.nombre}</p>
            </div>
            <div className={s.elegidaCuerpo}>
              {actual.conMaterial === false ? (
                <p className={s.elegidaTexto}>
                  <Hourglass size={20} strokeWidth={2.4} aria-hidden="true" className={s.elegidaMarca} />
                  Esta materia aún no tiene material. Tu docente lo agregará pronto.
                </p>
              ) : (
                <p className={s.elegidaTexto}>{DESCRIPCION_ESCENA[actual.escena]}</p>
              )}
              {actual.avance && actual.avance.total > 0 && (
                <p className={s.cifra}>
                  <strong className="tipo-cifra">
                    {actual.avance.hechas}/{actual.avance.total}
                  </strong>
                  <span>actividades hechas</span>
                </p>
              )}
              {actual.estrellas !== null && actual.conMaterial !== false && (
                <p className={s.elegidaEstrellas}>
                  <Estrellas cantidad={actual.estrellas} tamano={24} />
                  <span aria-hidden="true">{textoEstrellas(actual.estrellas)}</span>
                </p>
              )}
              <div className={s.elegidaEscena} aria-hidden="true">
                <svg viewBox="-150 -182 300 216" preserveAspectRatio="xMidYMax meet">
                  <use href={`#escena-${actual.escena}`} />
                </svg>
              </div>
              {actual.conMaterial !== false && (
                <BotonSticker href={actual.claseHref} tono="sol" tamano="grande" className={s.entrar}>
                  Entrar a {actual.nombre}
                  <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
                </BotonSticker>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
