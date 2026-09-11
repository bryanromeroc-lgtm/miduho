"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, FlaskConical, Home, School, GraduationCap } from "lucide-react";
import { Escudo } from "@/components/friso/escudo";
import { DOCENTE } from "@/lib/datos";
import { cn } from "@/lib/utils";

/*
  UN SOLO MENÚ EN EL DOM, adaptado por CSS — corrige el defecto de la
  referencia (menús duplicados que los lectores de pantalla leen dos veces).
  El mismo <nav> sirve escritorio y móvil.

  La barra es tinta sólida, no un color de área: ningún área es dueña del
  encabezado, y así el color de plancha conserva todo su significado.
*/
const RUTAS = [
  { href: "/", etiqueta: "Hoy", icono: Home },
  { href: "/clases", etiqueta: "Mis clases", icono: School },
  { href: "/biblioteca", etiqueta: "Biblioteca", icono: BookOpen },
  { href: "/laboratorios", etiqueta: "Laboratorios", icono: FlaskConical },
  { href: "/agenda", etiqueta: "Agenda", icono: CalendarDays },
];

export function Marco({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();


  return (
    <div className="min-h-screen">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
      >
        Saltar al contenido
      </a>

      <header className="school-header">
        <div className="portal-sky" aria-hidden="true">
          <Image className="portal-sun" src="/images/portal/2600.svg" alt="" width={52} height={52} />
          <Image className="portal-cloud portal-cloud-a" src="/images/portal/2601.svg" alt="" width={58} height={58} />
          <Image className="portal-cloud portal-cloud-b" src="/images/portal/2601.svg" alt="" width={43} height={43} />
          <Image className="portal-tree portal-tree-a" src="/images/portal/1f333.svg" alt="" width={68} height={68} />
          <Image className="portal-tree portal-tree-b" src="/images/portal/1f332.svg" alt="" width={68} height={68} />
          <Image className="portal-school" src="/images/portal/1f3eb.svg" alt="" width={64} height={64} />
        </div>
        <div className="school-header-inner">
          <Link href="/" className="school-brand" aria-label="MIDUHO · Inicio">
            <span className="school-brand-mark"><Escudo size={30} /></span>
            <span><strong>MIDUHO <span>Virtual</span></strong><small>Colegio Mi Dulce Hogar</small></span>
          </Link>
          <div className="school-group"><GraduationCap size={20} aria-hidden="true" /><span><strong>Grupo {DOCENTE.grupo}</strong><small>{DOCENTE.periodo}</small></span></div>
        </div>
        <nav id="menu-principal" aria-label="Navegación principal" className="school-nav">
          <ul>
            {RUTAS.map((r) => {
              const activa = r.href === "/" ? pathname === "/" : pathname.startsWith(r.href);
              const Icono = r.icono;
              return <li key={r.href}><Link href={r.href} aria-current={activa ? "page" : undefined} className={cn("school-nav-link", activa && "is-active")}><Icono size={20} strokeWidth={2.15} aria-hidden="true" /><span>{r.etiqueta}</span></Link></li>;
            })}
          </ul>
        </nav>
      </header>

      <main id="contenido" className="school-main mx-auto max-w-[1240px] px-4 sm:px-8">
        {children}
      </main>

      <footer className="school-footer">
        <span>Colegio Mi Dulce Hogar · Madrid, Cundinamarca</span>
        <details><summary>Sobre esta maqueta</summary><p>Propuesta visual a validar. Todos los datos son ficticios. No hay datos reales de estudiantes, docentes ni acudientes. Los títulos de literatura son obras de dominio público. Esta propuesta no constituye la identidad oficial del colegio.</p></details>
      </footer>
    </div>
  );
}

/* Ruta de navegación — siempre presente, corrige la pérdida de contexto en
   jerarquías profundas observada en la referencia. */
export function Migas({ pasos }: { pasos: { etiqueta: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-5">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gris">
        {pasos.map((p, i) => (
          <li key={p.etiqueta} className="flex items-center gap-2">
            {p.href ? (
              <Link href={p.href} className="underline underline-offset-2 hover:text-tinta">
                {p.etiqueta}
              </Link>
            ) : (
              <span className="text-tinta">{p.etiqueta}</span>
            )}
            {i < pasos.length - 1 && <span aria-hidden>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Encabezado de página: titular condensado a la izquierda, nota a la derecha. */
export function Cabecera({
  kicker,
  titulo,
  nota,
}: {
  kicker: string;
  titulo: string;
  nota?: string;
}) {
  return (
    <div className="page-heading mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        <h1 className="mt-2.5 font-heading text-[clamp(30px,4vw,44px)] font-bold leading-[1.12] text-tinta">
          {titulo}
        </h1>
        <p className="mt-3 text-[13px] font-semibold text-gris">{kicker}</p>
      </div>
      {nota && (
        <p className="max-w-[40ch] text-[14px] leading-[1.55] text-gris">{nota}</p>
      )}
    </div>
  );
}
