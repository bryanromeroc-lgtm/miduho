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
            <Image className="hero-scene-sun" src="/images/portal/2600.svg" alt="" width={50} height={50} />
            <Image className="hero-scene-cloud hero-scene-cloud-a" src="/images/portal/2601.svg" alt="" width={54} height={54} />
            <Image className="hero-scene-cloud hero-scene-cloud-b" src="/images/portal/2601.svg" alt="" width={38} height={38} />
            <Image className="hero-scene-cloud hero-scene-cloud-c" src="/images/portal/2601.svg" alt="" width={46} height={46} />
          </div>
          <div className="learning-hero-scrim" aria-hidden="true" />
          {/* Terreno: un solo sistema de coordenadas (1440×600) para colinas,
              camino y props, así el camino nace en el colegio y entra al libro
              en cualquier ancho. */}
          <div className="hero-scene-ground-layer" aria-hidden="true">
            <svg className="hero-scene-land" viewBox="0 0 1440 600" preserveAspectRatio="none" focusable="false">
              <g className="hero-scene-mountains">
                <path fill="#d5dfef" d="M 420 480 L 500 392 L 556 428 L 620 366 L 706 480 Z" />
                <path fill="#c6d3e8" d="M 640 480 L 722 356 L 772 394 L 852 290 L 934 380 L 992 336 L 1084 480 Z" />
                <path fill="#adbfda" d="M 958 484 L 1062 310 L 1132 372 L 1214 268 L 1304 372 L 1362 340 L 1440 440 L 1440 484 Z" />
                <path fill="#f7faff" opacity=".9" d="M 852 290 L 872 314 L 858 318 L 846 312 L 836 318 L 828 316 Z M 1214 268 L 1236 296 L 1222 300 L 1210 292 L 1198 300 L 1190 296 Z M 1062 310 L 1080 332 L 1066 336 L 1056 330 L 1046 336 L 1040 332 Z" />
              </g>
              <path className="hero-scene-hill hero-scene-hill-far" fill="#cdeaae" d="M 0 470 C 160 440, 300 440, 470 462 S 760 420, 940 446 S 1200 416, 1440 448 V 600 H 0 Z" />
              <path className="hero-scene-hill hero-scene-hill-mid" fill="#b5e18e" d="M 0 512 C 200 480, 380 500, 600 498 S 940 468, 1140 486 S 1360 470, 1440 476 V 600 H 0 Z" />
              <path className="hero-scene-hill hero-scene-hill-near" fill="#98d970" d="M 0 556 C 280 536, 620 548, 900 538 S 1280 526, 1440 532 V 600 H 0 Z" />
              <g className="hero-scene-path">
                <path d="M 60 548 C 130 540, 230 526, 330 520 S 540 536, 660 526 S 850 486, 930 492 S 990 504, 1040 522" />
                <path d="M 60 548 C 130 540, 230 526, 330 520 S 540 536, 660 526 S 850 486, 930 492 S 990 504, 1040 522" />
              </g>
              <g className="hero-scene-path hero-scene-path-mobile">
                <path d="M 150 578 C 300 566, 460 590, 600 578 S 720 556, 790 566" />
                <path d="M 150 578 C 300 566, 460 590, 600 578 S 720 556, 790 566" />
              </g>
            </svg>
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-d" src="/images/portal/1f333.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-c" src="/images/portal/1f332.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-f" src="/images/portal/1f333.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-e" src="/images/portal/1f332.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-b" src="/images/portal/1f332.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-school" src="/images/portal/1f3eb.svg" alt="" width={92} height={92} />
            <Image className="hero-scene-prop hero-scene-tree hero-scene-tree-a" src="/images/portal/1f333.svg" alt="" width={56} height={56} />
            <Image className="hero-scene-prop hero-scene-sprout hero-scene-sprout-a" src="/images/portal/1f331.svg" alt="" width={24} height={24} />
            <Image className="hero-scene-prop hero-scene-sprout hero-scene-sprout-b" src="/images/portal/1f331.svg" alt="" width={24} height={24} />
            <Image
              className="hero-scene-mascot"
              src="/images/aventura-lectora-mundo.webp"
              alt=""
              width={1000}
              height={667}
              sizes="(max-width: 700px) 50vw, 31vw"
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
