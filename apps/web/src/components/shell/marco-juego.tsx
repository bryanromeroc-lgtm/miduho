"use client";

import Image from "next/image";
import Link from "next/link";
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
  LayoutGrid,
  School,
  ShieldCheck,
  Star,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useShell } from "@/components/shell/contexto";
import { MenuCuenta, SelectorContexto } from "@/components/shell/menu-cuenta";
import type { TonoBoton } from "@/components/sticker";
import { contextoVisible, rutaActiva, rutasPorContexto, textoGrupo, type IdRuta } from "@/lib/navegacion";

/*
  SHELL DEL MUNDO NUEVO — una franja de juego sobre la noche: escudo real,
  wordmark MIDUHO en los colores del escudo y menú de botones sticker. Un solo
  <nav> en el DOM; en móvil el mismo menú se fija abajo. Laboratorios sigue
  con el shell anterior (congelado bajo .cosmos).

  Variantes: «tablero» deja que la página ocupe la pantalla (Mis materias);
  «hoja» pone el contenido en una hoja enmarcada, con scroll normal.
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

// Cada mundo con su color; la página activa siempre es blanca.
const TONO: Partial<Record<IdRuta, TonoBoton>> = {
  clases: "naranja",
  biblioteca: "lima",
  laboratorios: "cielo",
  agenda: "sol",
  "mi-curso": "rosa",
};

const LETRAS = ["M", "I", "D", "U", "H", "O"];

// Guiones blandos: solo se ven si la etiqueta parte en dos líneas (móvil).
const PARTIR: Record<string, string> = {
  Biblioteca: "Biblio\u00adteca",
  Laboratorios: "Labora\u00adtorios",
  Asignaciones: "Asigna\u00adciones",
  Estudiantes: "Estu\u00addiantes",
  Estructura: "Estruc\u00adtura",
};

export function MarcoJuego({
  variante = "hoja",
  estrellas,
  children,
}: {
  variante?: "tablero" | "hoja";
  estrellas?: number | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const datos = useShell();
  const contexto = datos ? contextoVisible(datos.contexto, datos.roles, pathname) : null;
  // La cuenta vive en su menú, no como botón del menú principal.
  const rutas = rutasPorContexto(contexto).filter((r) => r.id !== "cuenta");
  const mixta = !!datos && datos.roles.includes("ADMIN") && datos.roles.includes("DOCENTE");
  const grupo = datos && contexto !== "ADMIN" ? textoGrupo(contexto, datos.grupo, datos.gruposDocente) : null;

  return (
    <div className="marco-juego sobre-noche" data-variante={variante} data-contexto={contexto ?? undefined}>
      <a href="#contenido" className="marco-juego-saltar">
        Saltar al contenido
      </a>
      <header className="marco-juego-cabecera">
        <Link href={rutas[0]?.href ?? "/cuenta"} className="marco-juego-marca">
          <span className="marco-juego-escudo">
            <Image src="/images/escudo-colegio.jpg" alt="Escudo del Colegio Mi Dulce Hogar" width={60} height={60} priority />
          </span>
          <span className="marco-juego-nombre">
            <span className="wordmark" role="img" aria-label="MIDUHO">
              {LETRAS.map((l, i) => (
                <span key={i} aria-hidden="true">
                  {l}
                </span>
              ))}
            </span>
            <span className="marco-juego-colegio">Colegio Mi Dulce Hogar</span>
          </span>
        </Link>

        <nav id="menu-principal" aria-label="Navegación principal" className="marco-juego-menu" data-items={rutas.length}>
          <ul>
            {rutas.map((r) => {
              const activa = rutaActiva(r.href, pathname);
              const Icono = r.id === "hoy" && contexto === "ESTUDIANTE" ? LayoutGrid : ICONOS[r.id];
              return (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    aria-current={activa ? "page" : undefined}
                    className="sticker-boton"
                    data-tono={TONO[r.id] ?? "papel"}
                    data-tamano="normal"
                  >
                    <Icono size={22} strokeWidth={2.6} aria-hidden="true" />
                    <span>{PARTIR[r.etiqueta] ?? r.etiqueta}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {datos ? (
          <div className="marco-juego-herramientas">
            {estrellas != null ? (
              <span className="marco-juego-chip">
                <span className="marco-juego-chip-marca" aria-hidden="true">
                  <Star size={18} strokeWidth={0} fill="currentColor" />
                </span>
                <span className="marco-juego-chip-texto">
                  <strong>{estrellas}</strong>
                  <span>mis estrellas</span>
                </span>
              </span>
            ) : null}
            {contexto === "ADMIN" ? (
              <span className="marco-juego-chip" data-chip="grupo">
                <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" className="marco-juego-chip-icono" />
                <span className="marco-juego-chip-texto">
                  <strong>Administración</strong>
                  <span>{datos.periodo ?? "Colegio Mi Dulce Hogar"}</span>
                </span>
              </span>
            ) : grupo ? (
              <span className="marco-juego-chip" data-chip="grupo">
                <GraduationCap size={20} strokeWidth={2.4} aria-hidden="true" className="marco-juego-chip-icono" />
                <span className="marco-juego-chip-texto">
                  <strong>{grupo}</strong>
                  {datos.periodo ? <span>{datos.periodo}</span> : null}
                </span>
              </span>
            ) : null}
            {mixta ? <SelectorContexto actual={contexto === "ADMIN" ? "ADMIN" : "DOCENTE"} guardado={datos.contexto} /> : null}
            <MenuCuenta datos={datos} />
          </div>
        ) : null}
      </header>

      <main id="contenido" className="marco-juego-contenido">
        {variante === "hoja" ? <div className="marco-juego-hoja sobre-papel">{children}</div> : children}
      </main>

      {variante === "hoja" ? (
        <footer className="marco-juego-pie">
          <span>Colegio Mi Dulce Hogar · Madrid, Cundinamarca</span>
          <span>Datos ficticios de demostración · avatares provisionales</span>
        </footer>
      ) : null}
    </div>
  );
}
