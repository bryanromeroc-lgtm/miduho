import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { BotonSticker, ChipEstado } from "@/components/sticker";
import { HOY, type Clase } from "@/data/demo";
import { SpriteEscenas } from "@/features/materias/escenas/sprite-escenas";
import { escenaDe } from "@/lib/escenas";
import type { Estado } from "@/lib/estados";
import { obtenerDatosShell, obtenerGrupoMaqueta } from "@/server/shell";
import s from "@/app/inicio.module.css";

/*
  INICIO DE LA DOCENTE — conserva su estructura (saludo, clase de ahora,
  franja de estado, friso del día y mundos) con la identidad del escudo. 🔶
  Las clases del día siguen siendo demostrativas (datos de @/data/demo).
*/

function estadoDe(clase: Clase, i: number): Estado {
  if (clase.contenidos.length === 0) return "sin-material";
  return i === 0 ? "ahora" : "programada";
}

const MUNDOS = [
  { href: "/biblioteca", escena: "lectura", titulo: "Literatura", texto: "Historias, audiolibros y guías para tu clase.", accion: "Explorar la Biblioteca" },
  { href: "/laboratorios?mundo=robotica", escena: "robotica", titulo: "Robótica", texto: "Sensores, mecanismos y retos para aprender haciendo.", accion: "Entrar a Robótica" },
  { href: "/laboratorios?mundo=emprendimiento", escena: "emprendimiento", titulo: "Emprendimiento", texto: "Ideas pequeñas que se vuelven proyectos.", accion: "Ver los proyectos" },
] as const;

/** Inicio de la docente: estructura actual (friso del día). 🔶 */
export async function InicioDocente() {
  const [datos, grupo] = await Promise.all([obtenerDatosShell(), obtenerGrupoMaqueta("/")]);
  const nombre = datos?.nombre.split(/\s+/)[0];
  const ahora = HOY[0];
  const escenaAhora = escenaDe(ahora.asignatura);
  const vacias = HOY.filter((c) => c.contenidos.length === 0).length;

  return (
    <Marco>
      <SpriteEscenas />
      <div className={s.inicio}>
        <div className={s.saludo}>
          <p className="tipo-saludo">¡Hola{nombre ? `, ${nombre}` : ""}!</p>
          <p className={s.saludoDato}>{[grupo ? `Grupo ${grupo}` : null, datos?.periodo].filter(Boolean).join(" · ")}</p>
        </div>

        <section className={`${s.ahora} sobre-papel`} data-familia={escenaAhora} aria-labelledby="ahora-titulo">
          <div className={s.ahoraTexto}>
            <ChipEstado estado="ahora" />
            <p className={s.ahoraHora}>
              <Clock3 size={18} strokeWidth={2.6} aria-hidden="true" />
              {ahora.hora} · {ahora.asignatura}
            </p>
            <h1 id="ahora-titulo" className={s.ahoraTitulo}>
              {ahora.tema ?? ahora.asignatura}
            </h1>
            <p className={s.ahoraMaterial}>
              {ahora.contenidos.length} {ahora.contenidos.length === 1 ? "recurso listo" : "recursos listos"} en la clase
            </p>
            <BotonSticker href={`/clases/${ahora.id}`} tono="sol" tamano="grande" className={s.ahoraBoton}>
              Entrar a la clase
              <ArrowRight size={22} strokeWidth={3} aria-hidden="true" />
            </BotonSticker>
          </div>
          <div className={s.ahoraEscena} aria-hidden="true">
            <svg viewBox="-150 -182 300 216" preserveAspectRatio="xMidYMax meet">
              <use href={`#escena-${escenaAhora}`} />
            </svg>
          </div>
        </section>

        <section aria-labelledby="dia-titulo">
          <div className={s.seccionCabecera}>
            <h2 id="dia-titulo">Tu día</h2>
            <p className={s.franja}>
              {HOY.length} clases · {vacias === 0 ? "todas con material" : `${vacias} sin material`}
            </p>
          </div>
          <ol className={s.friso}>
            {HOY.map((c, i) => {
              const escena = escenaDe(c.asignatura);
              return (
                <li key={c.id}>
                  <Link href={c.contenidos.length ? `/clases/${c.id}` : "/biblioteca"} className={s.trecho} data-familia={escena} data-vacio={c.contenidos.length ? undefined : ""}>
                    <span className={s.trechoHora}>{c.hora}</span>
                    <span className={s.trechoNombre}>{c.asignatura}</span>
                    <span className={s.trechoTema}>{c.tema ?? "Sin material todavía"}</span>
                    <ChipEstado estado={estadoDe(c, i)} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="mundos-titulo">
          <div className={s.seccionCabecera}>
            <h2 id="mundos-titulo">Mundos para explorar</h2>
          </div>
          <ul className={s.mundos}>
            {MUNDOS.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={s.mundo} data-familia={m.escena}>
                  <span className={s.mundoEscena} aria-hidden="true">
                    <svg viewBox="-150 -182 300 216" preserveAspectRatio="xMidYMax meet">
                      <use href={`#escena-${m.escena}`} />
                    </svg>
                  </span>
                  <span className={s.mundoCuerpo}>
                    <strong className={`placa tipo-placa texto-sticker ${s.mundoPlaca}`}>{m.titulo}</strong>
                    <span className={s.mundoTexto}>{m.texto}</span>
                    <span className={s.mundoAccion}>
                      {m.accion} <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Marco>
  );
}
