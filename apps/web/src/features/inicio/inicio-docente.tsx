import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { ChipEstado } from "@/components/sticker";
import { HOY, type Clase } from "@/data/demo";
import { escenaDe } from "@/lib/escenas";
import type { Estado } from "@/lib/estados";
import { guiaDe } from "@/lib/guias";
import { obtenerDatosShell, obtenerGrupoMaqueta } from "@/server/shell";
import s from "@/app/inicio.module.css";

/*
  INICIO DE LA DOCENTE — conserva su estructura (saludo, clase de ahora,
  friso del día y mundos) en el mundo de día del estudiante: papel sobre el
  paisaje y los guías pintados de cada materia. 🔶
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

/** Inicio de la docente: su día en el friso. 🔶 */
export async function InicioDocente() {
  const [datos, grupo] = await Promise.all([obtenerDatosShell(), obtenerGrupoMaqueta("/")]);
  const nombre = datos?.nombre.split(/\s+/)[0];
  const ahora = HOY[0];
  const escenaAhora = escenaDe(ahora.asignatura);
  const guiaAhora = guiaDe(escenaAhora);
  const vacias = HOY.filter((c) => c.contenidos.length === 0).length;

  return (
    <Marco>
      <div className={s.inicio}>
        <div className={s.saludo}>
          <h1 className={s.saludoTitulo}>¡Hola{nombre ? `, ${nombre}` : ""}!</h1>
          <p className={s.saludoDato}>{[grupo ? `Grupo ${grupo}` : null, datos?.periodo].filter(Boolean).join(" · ")}</p>
        </div>

        <section className={s.ahora} data-familia={escenaAhora} aria-labelledby="ahora-titulo">
          <div className={s.ahoraTexto}>
            <p className={s.ahoraHora}>
              <ChipEstado estado="ahora" />
              <span>
                <Clock3 size={17} strokeWidth={2.6} aria-hidden="true" />
                {ahora.hora} · {ahora.asignatura}
              </span>
            </p>
            <h2 id="ahora-titulo" className={s.ahoraTitulo}>
              {ahora.tema ?? ahora.asignatura}
            </h2>
            <p className={s.ahoraMaterial}>
              {ahora.contenidos.length} {ahora.contenidos.length === 1 ? "recurso listo" : "recursos listos"} en la clase
            </p>
            <Link href={`/clases/${ahora.id}`} className={s.boton}>
              Entrar a la clase
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </Link>
          </div>
          {guiaAhora ? (
            <div className={s.ahoraImagen}>
              <Image src={guiaAhora.imagen} alt="" width={960} height={640} sizes="(max-width: 760px) 92vw, 520px" priority />
            </div>
          ) : null}
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
              const guia = guiaDe(escena);
              return (
                <li key={c.id}>
                  <Link href={c.contenidos.length ? `/clases/${c.id}` : "/biblioteca"} className={s.trecho} data-familia={escena} data-vacio={c.contenidos.length ? undefined : ""}>
                    <span className={s.trechoCabeza}>
                      <span className={s.trechoHora}>{c.hora}</span>
                      {guia ? <Image className={s.trechoRetrato} src={guia.retrato} alt="" width={56} height={56} /> : null}
                    </span>
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
            {MUNDOS.map((m) => {
              const guia = guiaDe(m.escena);
              return (
                <li key={m.href}>
                  <Link href={m.href} className={s.mundo} data-familia={m.escena}>
                    {guia ? (
                      <span className={s.mundoImagen}>
                        <Image src={guia.imagen} alt="" width={960} height={640} sizes="(max-width: 760px) 92vw, 400px" />
                      </span>
                    ) : null}
                    <span className={s.mundoCuerpo}>
                      <strong className={s.mundoTitulo}>{m.titulo}</strong>
                      <span className={s.mundoTexto}>{m.texto}</span>
                      <span className={s.mundoAccion}>
                        {m.accion} <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Marco>
  );
}
