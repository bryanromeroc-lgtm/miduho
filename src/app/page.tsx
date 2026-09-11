import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, Clock3, Sprout } from "lucide-react";
import { Marco } from "@/components/friso/marco";
import { HOY, DOCENTE } from "@/lib/datos";
import styles from "./inicio.module.css";

export default function Inicio() {
  return (
    <Marco>
      <div className={styles.inicio}>
        <div className="welcome-line">
          <p>¡Hola, grupo {DOCENTE.grupo}!</p>
          <span>Martes 9 de septiembre · Período 3</span>
        </div>

        <section className="learning-hero" aria-labelledby="aventura-titulo">
          <div className="hero-scene-sky" aria-hidden="true">
            <span className="hero-scene-ground" />
            <span className="hero-scene-mountain hero-scene-mountain-a">
              <Image src="/images/portal/26f0.svg" alt="" width={120} height={120} />
            </span>
            <span className="hero-scene-mountain hero-scene-mountain-b">
              <Image src="/images/portal/26f0.svg" alt="" width={90} height={90} />
            </span>
            <Image className="hero-scene-sun" src="/images/portal/2600.svg" alt="" width={50} height={50} />
            <Image className="hero-scene-cloud hero-scene-cloud-a" src="/images/portal/2601.svg" alt="" width={54} height={54} />
            <Image className="hero-scene-cloud hero-scene-cloud-b" src="/images/portal/2601.svg" alt="" width={38} height={38} />
            <Image className="hero-scene-rainbow" src="/images/portal/1f308.svg" alt="" width={72} height={72} />
          </div>
          <div className="learning-hero-scrim" aria-hidden="true" />
          <div className="hero-scene-ground-layer" aria-hidden="true">
            <svg className="hero-scene-path" viewBox="0 0 1200 420" preserveAspectRatio="none" focusable="false">
              <path d="M -40 300 C 180 250, 260 340, 420 300 S 660 220, 820 260 1040 230 1260 180" />
            </svg>
            <Image className="hero-scene-school" src="/images/portal/1f3eb.svg" alt="" width={92} height={92} />
            <Image className="hero-scene-tree hero-scene-tree-a" src="/images/portal/1f333.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-child hero-scene-child-a" src="/images/portal/1f9d2.svg" alt="" width={50} height={50} />
            <Image className="hero-scene-child hero-scene-child-b" src="/images/portal/1f9d2.svg" alt="" width={42} height={42} />
            <Image className="hero-scene-backpack" src="/images/portal/1f392.svg" alt="" width={36} height={36} />
            <Image className="hero-scene-books" src="/images/portal/1f4da.svg" alt="" width={56} height={56} />
            <Image
              className="hero-scene-mascot"
              src="/images/aventura-lectora-mundo.webp"
              alt=""
              width={1000}
              height={667}
              sizes="(max-width: 700px) 80vw, 40vw"
              preload
            />
          </div>
          <div className="learning-hero-copy">
            <span className={styles.heroFlag}>Primera clase · {HOY[0].hora}</span>
            <h1 id="aventura-titulo">
              Un nuevo día.<br />Mil cosas por <span>descubrir.</span>
            </h1>
            <p>Hoy nos encontramos en el círculo de lectura.</p>
            <div className="hero-lesson">
              <BookOpen size={17} aria-hidden="true" />
              <span>{HOY[0].tema}</span>
              <span className="hero-lesson-time">
                <Clock3 size={15} aria-hidden="true" />{HOY[0].hora}
              </span>
            </div>
            <Link href={`/clases/${HOY[0].id}`} className="adventure-button">
              Entrar a la clase <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.exploreSection} aria-labelledby="explorar-titulo">
          <div className="section-heading">
            <h2 id="explorar-titulo">Mundos para explorar</h2>
            <span>Literatura, tecnología y proyectos</span>
          </div>

          <div className={styles.worldsGrid}>
            <WorldCard
              href="/biblioteca"
              area="literatura"
              index={0}
              label="Biblioteca digital"
              title="Literatura"
              description="Historias, audiolibros y guías listas para tu clase."
              action="Explorar biblioteca"
              image="/images/dashboard/literatura.webp"
              imageAlt="Silueta de un niño leyendo un libro al atardecer"
              icon={<BookOpen size={25} aria-hidden="true" />}
              badgeImage="/images/portal/1f4da.svg"
            />
            <WorldCard
              href="/clases/c2"
              area="robotica"
              index={1}
              label="Aprendizaje práctico"
              title="Robótica"
              description="Sensores, mecanismos y retos para aprender haciendo."
              action="Entrar a Robótica"
              image="/images/dashboard/robotica.webp"
              imageAlt="Varios robots educativos construidos con piezas modulares"
              icon={<Bot size={25} aria-hidden="true" />}
              badgeImage="/images/portal/1f916.svg"
            />
            <WorldCard
              href="/clases/c3"
              area="emprendimiento"
              index={2}
              label="Ideas en acción"
              title="Emprendimiento"
              description="Actividades para convertir ideas pequeñas en proyectos."
              action="Ver proyectos"
              image="/images/dashboard/emprendimiento.webp"
              imageAlt="Estudiante creando una composición con papeles de colores"
              icon={<Sprout size={25} aria-hidden="true" />}
              badgeImage="/images/portal/1f331.svg"
            />
          </div>
        </section>
      </div>
    </Marco>
  );
}

function WorldCard({ href, area, index, label, title, description, action, image, imageAlt, icon, badgeImage }: {
  href: string;
  area: "literatura" | "robotica" | "emprendimiento";
  index: number;
  label: string;
  title: string;
  description: string;
  action: string;
  image: string;
  imageAlt: string;
  icon: React.ReactNode;
  badgeImage: string;
}) {
  return (
    <Link
      href={href}
      className={`${styles.worldCard} ${styles[area]}`}
      style={{ "--enter-delay": `${index * 0.09}s` } as React.CSSProperties}
    >
      <span className={styles.worldMedia}>
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 700px) 42vw, 33vw" />
        <span className={styles.worldLabel}>{label}</span>
        <Image className={styles.worldBadge} src={badgeImage} alt="" aria-hidden="true" width={64} height={64} />
      </span>
      <span className={styles.worldBody}>
        <span className={styles.worldTitle}>
          <span className={styles.worldIcon}>{icon}</span>
          <span><strong>{title}</strong><small>{description}</small></span>
        </span>
        <span className={styles.worldAction}>{action} <ArrowRight size={16} aria-hidden="true" /></span>
      </span>
    </Link>
  );
}
