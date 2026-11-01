"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Hourglass, Sparkles, UsersRound, X } from "lucide-react";
import { Estrellas } from "@/components/sticker";
import { guiaDe, type Guia } from "@/lib/guias";
import { partesDelCromo, type MisMaterias as Datos, type ResumenMateria } from "@/lib/materias";
import { POR_PAGINA, totalPaginas } from "@/lib/posicion-avatar";
import { SpriteEscenas } from "./escenas/sprite-escenas";
import s from "./mis-materias.module.css";

/*
  «MIS MATERIAS» — el inicio del estudiante, en el mundo de día del ingreso:
  cielo y colinas, tarjetas blancas y una guía ilustrada por materia (los
  exploradores de Mi Dulce Hogar). La tarjeta entera lleva a la materia; con
  más de 10 materias, páginas de 10.
*/
export function MisMaterias({ datos, materiaInicial }: { datos: Datos; materiaInicial?: string }) {
  const { grupo, materias } = datos;
  const inicial = Math.max(0, materias.findIndex((m) => m.id === materiaInicial));
  const [pagina, setPagina] = useState(Math.floor(inicial / POR_PAGINA));
  const dialogo = useRef<HTMLDialogElement>(null);

  const paginas = totalPaginas(materias.length);
  const visibles = materias.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);
  // «Sigue con» solo existe cuando la fuente de actividades lo entrega: nunca se inventa.
  const siguiente = materias.find((m) => partesDelCromo(m).sigue) ?? null;
  const conGuia = materias.filter((m) => guiaDe(m.escena));
  const conGenerica = materias.some((m) => m.escena === "generica");

  return (
    <div className={s.pagina}>
      {conGenerica && <SpriteEscenas />}

      <header className={s.cabecera}>
        <h1 id="materias-titulo" className={s.titulo}>
          Mis materias
        </h1>
        <p className={s.bajada}>Aprende con los exploradores de Mi Dulce Hogar.</p>
      </header>

      {siguiente && <Siguiente materia={siguiente} />}

      <section aria-labelledby="materias-titulo" className={s.seccion}>
        {!grupo ? (
          <p className={s.vacio}>Aún no tienes un grupo asignado. Pídele ayuda a tu docente.</p>
        ) : materias.length === 0 ? (
          <p className={s.vacio}>Tu grupo todavía no tiene materias. Cuando tu docente las agregue, aparecerán aquí.</p>
        ) : (
          <ul className={s.cuadricula}>
            {visibles.map((m, i) => (
              <li key={m.id}>
                <Tarjeta materia={m} temprana={pagina === 0 && i < 5} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {(paginas > 1 || conGuia.length > 0) && (
        <div className={s.pie}>
          {paginas > 1 ? (
            <nav className={s.paginacion} aria-label="Páginas de materias">
              <button type="button" className={s.paginar} onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0}>
                <ArrowLeft size={20} strokeWidth={2.6} aria-hidden="true" />
                Anteriores
              </button>
              <p className={s.paginaActual} aria-live="polite">
                Página {pagina + 1} de {paginas}
              </p>
              <button
                type="button"
                className={s.paginar}
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina >= paginas - 1}
              >
                Siguientes
                <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </nav>
          ) : (
            <span />
          )}
          {conGuia.length > 0 && (
            <button
              type="button"
              className={s.conoce}
              aria-haspopup="dialog"
              onClick={() => dialogo.current?.showModal()}
            >
              <UsersRound size={22} strokeWidth={2.4} aria-hidden="true" />
              Conoce a tus guías
            </button>
          )}
        </div>
      )}

      {conGuia.length > 0 && <Guias ref={dialogo} materias={conGuia} />}
    </div>
  );
}

/** Tarjeta de una materia: ilustración de su guía, nombre, guía y «Ver actividades». */
export function Tarjeta({ materia, temprana = false }: { materia: ResumenMateria; temprana?: boolean }) {
  const p = partesDelCromo(materia);
  const guia = guiaDe(materia.escena);
  return (
    <article
      className={s.tarjeta}
      data-familia={materia.escena}
      data-preparacion={p.preparacion ? "" : undefined}
    >
      <div className={s.lamina}>
        {guia ? (
          <Image
            src={guia.imagen}
            alt=""
            width={960}
            height={640}
            sizes="(min-width: 960px) 18vw, (min-width: 700px) 30vw, 46vw"
            loading={temprana ? "eager" : "lazy"}
            className={s.ilustracion}
          />
        ) : (
          <svg aria-hidden="true" className={s.generica} viewBox="-150 -182 300 216" preserveAspectRatio="xMidYMax meet">
            <use href={`#escena-${materia.escena}`} />
          </svg>
        )}
        {p.nuevo && (
          <span className={s.nuevo}>
            <Sparkles aria-hidden="true" size={14} strokeWidth={2.6} />
            ¡Nuevo!
          </span>
        )}
      </div>

      <div className={s.cuerpo}>
        <h2 className={s.nombre}>
          {p.jugar ? (
            <Link href={materia.claseHref} className={s.enlace}>
              {materia.nombre}
            </Link>
          ) : (
            materia.nombre
          )}
        </h2>
        {guia && (
          <p className={s.guia}>
            {guia.nombre} · {guia.especie}
          </p>
        )}
        {(p.estrellas || p.avance) && (
          <p className={s.desempeno}>
            {p.estrellas && materia.estrellas !== null && <Estrellas cantidad={materia.estrellas} tamano={18} />}
            {p.avance && materia.avance && (
              <span>
                {materia.avance.hechas}/{materia.avance.total} hechas
              </span>
            )}
          </p>
        )}
        {p.preparacion ? (
          <p className={s.preparacion}>
            <Hourglass aria-hidden="true" size={18} strokeWidth={2.4} />
            Tu docente está preparando el material
          </p>
        ) : (
          <span className={s.accion} aria-hidden="true">
            Ver actividades
            <ArrowRight size={20} strokeWidth={2.6} className={s.flecha} />
          </span>
        )}
      </div>
    </article>
  );
}

/** La siguiente actividad pendiente, con su guía. Solo aparece con datos reales. */
function Siguiente({ materia }: { materia: ResumenMateria }) {
  const guia = guiaDe(materia.escena);
  return (
    <section className={s.siguiente} aria-labelledby="siguiente-titulo">
      {guia && (
        <Image src={guia.imagen} alt="" width={96} height={64} sizes="96px" className={s.siguienteImagen} />
      )}
      <div className={s.siguienteTexto}>
        <h2 id="siguiente-titulo" className={s.siguienteRotulo}>
          Tu siguiente actividad
        </h2>
        <p className={s.siguienteDetalle}>
          <strong>{materia.nombre}</strong> · {materia.sigue}
        </p>
      </div>
      <Link href={materia.claseHref} className={s.continuar} aria-label={`Continuar con ${materia.nombre}`}>
        Continuar
        <ArrowRight size={22} strokeWidth={2.6} aria-hidden="true" />
      </Link>
    </section>
  );
}

/** Diálogo «Conoce a tus guías»: quién acompaña cada materia del estudiante. */
function Guias({ materias, ref }: { materias: ResumenMateria[]; ref: React.Ref<HTMLDialogElement> }) {
  // Una guía por escena, aunque acompañe a varias materias del grupo.
  const porEscena = new Map<string, { guia: Guia; nombres: string[] }>();
  for (const m of materias) {
    const g = guiaDe(m.escena);
    if (!g) continue;
    const previa = porEscena.get(m.escena);
    if (previa) previa.nombres.push(m.nombre);
    else porEscena.set(m.escena, { guia: g, nombres: [m.nombre] });
  }
  return (
    <dialog
      ref={ref}
      className={s.dialogo}
      aria-labelledby="guias-titulo"
      onClick={(e) => {
        // Un toque fuera de la hoja (sobre el fondo) cierra el diálogo.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className={s.hoja}>
        <div className={s.hojaCabecera}>
          <h2 id="guias-titulo" className={s.hojaTitulo}>
            Tus guías
          </h2>
          <form method="dialog">
            <button type="submit" className={s.cerrar} aria-label="Cerrar">
              <X size={24} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </form>
        </div>
        <p className={s.hojaBajada}>Cada materia tiene un explorador que te acompaña.</p>
        <ul className={s.guias}>
          {[...porEscena].map(([escena, { guia, nombres }]) => (
            <li key={escena} className={s.guiaItem}>
              <Image src={guia.imagen} alt={guia.accion} width={960} height={640} sizes="160px" className={s.guiaImagen} />
              <p>
                <strong>{guia.nombre}</strong>
                <span>{guia.especie}</span>
                <span className={s.guiaMateria}>{nombres.join(" · ")}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className={s.nota}>Personajes ilustrados del proyecto, provisionales.</p>
      </div>
    </dialog>
  );
}
