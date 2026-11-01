"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  CircleUserRound,
  FlaskConical,
  GraduationCap,
  Home,
  LayoutDashboard,
  School,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Escudo } from "@/components/friso/escudo";
import { MarcoJuego } from "@/components/shell/marco-juego";
import { useShell } from "@/components/shell/contexto";
import { MenuCuenta, SelectorContexto } from "@/components/shell/menu-cuenta";
import { contextoVisible, rutaActiva, rutasPorContexto, textoGrupo, type IdRuta } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

/*
  UN SOLO MENÚ EN EL DOM, adaptado por CSS — corrige el defecto de la
  referencia (menús duplicados que los lectores de pantalla leen dos veces).
  El mismo <nav> sirve escritorio y móvil.

  La barra es tinta sólida, no un color de área: ningún área es dueña del
  encabezado, y así el color de plancha conserva todo su significado.

  Shell autenticado (Inc. 1R §10): identidad, grupo y navegación salen de la
  sesión real (ProveedorShell en la raíz). Las rutas visibles dependen del
  contexto; la autorización real la hacen proxy.ts y el servidor.
*/
const ICONOS: Record<IdRuta, LucideIcon> = {
  hoy: Home,
  clases: School,
  biblioteca: BookOpen,
  laboratorios: FlaskConical,
  agenda: CalendarDays,
  "mi-curso": UsersRound,
  dashboard: LayoutDashboard,
  usuarios: Users,
  estructura: Building2,
  asignaciones: CalendarClock,
  estudiantes: UsersRound,
  cuenta: CircleUserRound,
};

/** Laboratorios conserva su shell (la cabina de .cosmos); el resto, el mundo nuevo. */
function esLaboratorios(pathname: string) {
  return ["/laboratorios", "/emprendimiento"].some((b) => pathname === b || pathname.startsWith(`${b}/`));
}

/** `dia`: la página pide el mundo de día; el marco lo da solo al estudiante (el resto, hoja). */
export function Marco({ dia = false, children }: { dia?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (esLaboratorios(pathname)) return <MarcoLaboratorios>{children}</MarcoLaboratorios>;
  return <MarcoJuego variante={dia ? "dia" : "hoja"}>{children}</MarcoJuego>;
}

/* Shell anterior, intacto: solo lo usa Laboratorios. */
function MarcoLaboratorios({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const datos = useShell();
  const contexto = datos ? contextoVisible(datos.contexto, datos.roles, pathname) : null;
  const rutas = rutasPorContexto(contexto);
  const mixta = !!datos && datos.roles.includes("ADMIN") && datos.roles.includes("DOCENTE");

  return (
    <div className="min-h-screen" data-contexto={contexto ?? undefined}>
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
          <Link href={rutas[0]?.href ?? "/cuenta"} className="school-brand" aria-label="MIDUHO · Inicio">
            <span className="school-brand-mark"><Escudo size={30} /></span>
            <span><strong>MIDUHO <span>Virtual</span></strong><small>Colegio Mi Dulce Hogar</small></span>
          </Link>
          {datos ? (
            <div className="shell-herramientas">
              <ChipGrupo contexto={contexto} grupo={datos.grupo} gruposDocente={datos.gruposDocente} periodo={datos.periodo} />
              {mixta ? (
                <div className="shell-contexto-cabecera">
                  <SelectorContexto actual={contexto === "ADMIN" ? "ADMIN" : "DOCENTE"} guardado={datos.contexto} />
                </div>
              ) : null}
              <MenuCuenta datos={datos} />
            </div>
          ) : null}
        </div>
        <nav id="menu-principal" aria-label="Navegación principal" className="school-nav" data-items={rutas.length}>
          <ul>
            {rutas.map((r) => {
              const activa = rutaActiva(r.href, pathname);
              const Icono = ICONOS[r.id];
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
      </footer>
    </div>
  );
}

/*
  Chip de contexto: ESTUDIANTE ve su grupo real; DOCENTE, los grupos con
  asignación activa; ADMIN, solo su contexto — nunca un grupo ficticio.
*/
function ChipGrupo({
  contexto,
  grupo,
  gruposDocente,
  periodo,
}: {
  contexto: ReturnType<typeof contextoVisible>;
  grupo: string | null;
  gruposDocente: string[];
  periodo: string | null;
}) {
  if (contexto === "ADMIN") {
    return (
      <div className="school-group">
        <ShieldCheck size={20} aria-hidden="true" />
        <span><strong>Administración</strong><small>{periodo ?? "Colegio Mi Dulce Hogar"}</small></span>
      </div>
    );
  }
  const titulo = textoGrupo(contexto, grupo, gruposDocente);
  if (!titulo) return null;
  return (
    <div className="school-group">
      <GraduationCap size={20} aria-hidden="true" />
      <span><strong>{titulo}</strong>{periodo ? <small>{periodo}</small> : null}</span>
    </div>
  );
}

/* Ruta de navegación — siempre presente, corrige la pérdida de contexto en
   jerarquías profundas observada en la referencia. */
export function Migas({ pasos }: { pasos: { etiqueta: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="migas">
      <ol>
        {pasos.map((p, i) => (
          <li key={p.etiqueta} className="flex items-center gap-2">
            {p.href ? (
              <Link href={p.href}>{p.etiqueta}</Link>
            ) : (
              <span aria-current="page">{p.etiqueta}</span>
            )}
            {i < pasos.length - 1 && <span aria-hidden>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Encabezado de página: título grande a la izquierda, nota a la derecha. */
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
    <div className="cabecera-pagina">
      <div>
        <h1>{titulo}</h1>
        <p className="cabecera-pagina-bajada">{kicker}</p>
      </div>
      {nota && <p className="cabecera-pagina-nota">{nota}</p>}
    </div>
  );
}
