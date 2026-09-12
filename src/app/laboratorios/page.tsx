"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Trophy,
  Star,
  ArrowRight,
  Lock,
  Play,
  Lightbulb,
  Compass,
  ChevronDown,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";
import { Marco, Migas } from "@/components/friso/marco";
import {
  IlustracionRobotMaquinas,
  IlustracionCientificaSensores,
  IlustracionPrototipoCohete,
  IlustracionFeriaInventos,
  AvatarBoti,
  AvatarMia,
} from "@/components/laboratorios/ilustraciones";
import {
  IlustracionDetectivesNecesidades,
  IlustracionMercaditoTrueque,
  IlustracionMecanismoRobo,
  IlustracionRobotPresentador,
} from "@/components/laboratorios/ilustraciones-adicionales";
import { cn } from "@/lib/utils";

/*
  DOS MUNDOS INTERACTIVOS (ROBÓTICA Y EMPRENDIMIENTO)
  Diseñado como un juego de aventura educativa para niños de primaria:
  - Vista 1: Mundo Robótica ("El Circuito de los Jóvenes Científicos")
  - Vista 2: Mundo Emprendimiento ("El Sendero de los Pequeños Inventores")
  - Tablero de misiones conectado, guía interactiva con mascotas (Boti y Mía),
    estrellas coleccionables, barras de progreso y CTA directo a la ruta didáctica.
*/

type MundoActivo = "robotica" | "emprendimiento";

interface EstacionJuego {
  id: string;
  nivel: number;
  unidadId: string;
  titulo: string;
  subtitulo: string;
  misionCorta: string;
  sesiones: number;
  duracion: string;
  estado: "completada" | "actual" | "bloqueada";
  estadoEtiqueta: string;
  estrellas: number;
  maxEstrellas: number;
  xp: number;
  tieneRuta: boolean;
  rutaHref: string;
  ctaTexto: string;
  retos: string[];
  insignia: string;
  Ilustracion: React.ComponentType<{ className?: string }>;
}

// 4 Misiones de Robótica (Laboratorio de Ciencias y Máquinas)
const MISIONES_ROBOTICA: EstacionJuego[] = [
  {
    id: "rob-1",
    nivel: 1,
    unidadId: "u3",
    titulo: "Máquinas que ayudan",
    subtitulo: "Poleas, Ruedas y Asistentes",
    misionCorta: "Aprende cómo las palancas y engranajes nos ayudan en el aula a levantar y mover cosas sin cansarnos.",
    sesiones: 3,
    duracion: "3 sesiones · Completado",
    estado: "completada",
    estadoEtiqueta: "¡Nivel Superado!",
    estrellas: 3,
    maxEstrellas: 3,
    xp: 150,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Repasar misión",
    retos: ["Construir una polea simple", "Probar el peso con un libro", "Diseñar un asistente mecánico"],
    insignia: "Engranaje de Oro",
    Ilustracion: IlustracionRobotMaquinas,
  },
  {
    id: "rob-2",
    nivel: 2,
    unidadId: "u7",
    titulo: "Sensores que miden",
    subtitulo: "Los Sentidos Digitales",
    misionCorta: "¡Los robots no adivinan, miden! Usamos sensores reales de temperatura y luz para explorar el salón.",
    sesiones: 3,
    duracion: "3 sesiones · Se libera el 15 de sept",
    estado: "actual",
    estadoEtiqueta: "★ ¡Misión Actual en Curso!",
    estrellas: 2,
    maxEstrellas: 3,
    xp: 200,
    tieneRuta: true,
    rutaHref: "/laboratorios/u7",
    ctaTexto: "¡Iniciar Misión: Ver Ruta Didáctica! →",
    retos: ["Adivinar vs Medir la temperatura", "Sensor en recipientes tibios", "Llenar la tabla de 3 datos"],
    insignia: "Lupa de Explorador",
    Ilustracion: IlustracionCientificaSensores,
  },
  {
    id: "rob-3",
    nivel: 3,
    unidadId: "u10",
    titulo: "Un mecanismo que se mueve",
    subtitulo: "Brazos Robóticos y Cinemática",
    misionCorta: "Unimos motores y piezas articuladas para que nuestro invento realice movimientos precisos por sí mismo.",
    sesiones: 3,
    duracion: "3 sesiones · Próxima estación",
    estado: "bloqueada",
    estadoEtiqueta: "Desbloquea en Semana 4",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 250,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Ver adelanto",
    retos: ["Brazo articulado de cartón", "Giro de 90 grados", "Sostener un lápiz"],
    insignia: "Brazo Articulado",
    Ilustracion: IlustracionMecanismoRobo,
  },
  {
    id: "rob-4",
    nivel: 4,
    unidadId: "u14",
    titulo: "El robot que presenta",
    subtitulo: "Gran Desafío Final",
    misionCorta: "Programamos nuestro robot expositor para que salude a las familias y muestre los inventos del grado 1°.",
    sesiones: 3,
    duracion: "3 sesiones · Gran Final",
    estado: "bloqueada",
    estadoEtiqueta: "Misión Legendaria",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 300,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Misión de cierre",
    retos: ["Saludo y voz del robot", "Luces de feria", "Presentación con familias"],
    insignia: "Maestro Robot",
    Ilustracion: IlustracionRobotPresentador,
  },
];

// 4 Estaciones de Emprendimiento (Fábrica de Proyectos e Ideas)
const MISIONES_EMPRENDIMIENTO: EstacionJuego[] = [
  {
    id: "emp-1",
    nivel: 1,
    unidadId: "u1",
    titulo: "Detectives de necesidades",
    subtitulo: "Observar el Colegio y Crear Ideas",
    misionCorta: "Recorremos el salón con ojos curiosos para descubrir problemas reales que podamos resolver con creatividad.",
    sesiones: 4,
    duracion: "4 sesiones · Completado",
    estado: "completada",
    estadoEtiqueta: "¡Nivel Superado!",
    estrellas: 3,
    maxEstrellas: 3,
    xp: 150,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Ver cuaderno de campo",
    retos: ["¿Qué es una necesidad?", "Entrevista a un compañero", "Dibujar 3 ideas mágicas"],
    insignia: "Ojo de Detective",
    Ilustracion: IlustracionDetectivesNecesidades,
  },
  {
    id: "emp-2",
    nivel: 2,
    unidadId: "u5",
    titulo: "El gran trueque y recursos",
    subtitulo: "Intercambio Justo y Presupuesto",
    misionCorta: "¿Cuánto valen las cosas? Aprendemos a compartir, intercambiar y calcular los materiales necesarios sin desperdiciar.",
    sesiones: 4,
    duracion: "4 sesiones · ¡En taller!",
    estado: "actual",
    estadoEtiqueta: "★ ¡Estación Activa!",
    estrellas: 2,
    maxEstrellas: 3,
    xp: 200,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Entrar al mercado escolar",
    retos: ["Juego del trueque del recreo", "Contar lo que tengo", "El precio justo con fichas"],
    insignia: "Balanza de la Amistad",
    Ilustracion: IlustracionMercaditoTrueque,
  },
  {
    id: "emp-3",
    nivel: 3,
    unidadId: "u9",
    titulo: "Taller de prototipos ecológicos",
    subtitulo: "De la Idea a la Maqueta",
    misionCorta: "Armamos prototipos con cajas de cartón, hojas secas y materiales reciclables para probar nuestras soluciones.",
    sesiones: 4,
    duracion: "4 sesiones · Próxima fase",
    estado: "bloqueada",
    estadoEtiqueta: "Desbloquea en Semana 4",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 250,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Ver lista de materiales",
    retos: ["Maqueta del invento", "Prueba de resistencia", "Mejorar lo que falló"],
    insignia: "Cohete Verde",
    Ilustracion: IlustracionPrototipoCohete,
  },
  {
    id: "emp-4",
    nivel: 4,
    unidadId: "u15",
    titulo: "La gran feria del salón",
    subtitulo: "Compartir con las Familias",
    misionCorta: "¡El día de fiesta! Diseñamos nuestro stand, preparamos carteles llamativos y mostramos los inventos a los padres.",
    sesiones: 4,
    duracion: "4 sesiones · Evento Final",
    estado: "bloqueada",
    estadoEtiqueta: "Gran Celebración",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 300,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Ver preparativos",
    retos: ["Cartel del stand", "Explicar el proyecto en 2 minutos", "Diploma de inventor"],
    insignia: "Estrella Emprendedora",
    Ilustracion: IlustracionFeriaInventos,
  },
];

function ContenidoLaboratorios() {
  const searchParams = useSearchParams();
  const qMundo = searchParams.get("mundo");
  const [mundoSeleccionado, setMundoSeleccionado] = useState<MundoActivo | null>(null);
  const [mostrarDocenteInfo, setMostrarDocenteInfo] = useState<boolean>(false);

  // Derivar mundo activo sin causar render en cascada
  const mundo: MundoActivo =
    mundoSeleccionado ?? (qMundo === "emprendimiento" ? "emprendimiento" : "robotica");
  const setMundo = (m: MundoActivo) => setMundoSeleccionado(m);

  const esRobotica = mundo === "robotica";
  const estaciones = esRobotica ? MISIONES_ROBOTICA : MISIONES_EMPRENDIMIENTO;

  // Cálculo de progreso para niños
  const totalEstrellas = estaciones.reduce((acc, e) => acc + e.estrellas, 0);
  const maxEstrellas = estaciones.reduce((acc, e) => acc + e.maxEstrellas, 0);
  const totalXP = estaciones.filter((e) => e.estado !== "bloqueada").reduce((acc, e) => acc + e.xp, 0);

  return (
    <Marco>
      {/* Migas de navegación oficiales de MIDUHO */}
      <Migas
        pasos={[
          { etiqueta: "Hoy", href: "/" },
          { etiqueta: esRobotica ? "Laboratorios de Robótica" : "Fábrica de Emprendimiento" },
        ]}
      />

      {/* SELECTOR DE LOS DOS MUNDOS (PORTALES DE JUEGO) */}
      <section className="mb-6" aria-label="Selector de Mundos Educativos">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* BOTÓN MUNDO 1: ROBÓTICA */}
          <button
            type="button"
            onClick={() => setMundo("robotica")}
            className={cn(
              "group relative flex items-center justify-between p-4 sm:p-5 rounded-[22px] border-2 transition-all duration-300 text-left",
              esRobotica
                ? "bg-gradient-to-r from-[#e9f3f9] to-white border-[#24617f] shadow-[0_8px_24px_rgba(36,97,127,0.18)] scale-[1.01]"
                : "bg-white/80 border-slate-200 hover:border-sky-300 hover:bg-[#f0f9ff]/60 opacity-80 hover:opacity-100"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  esRobotica ? "bg-[#24617f] text-white shadow-md" : "bg-sky-100 text-[#24617f]"
                )}
              >
                <Bot size={26} />
              </div>
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#24617f]">
                  Vista 1 · Ciencias
                </span>
                <h2 className="font-heading text-[18px] sm:text-[20px] font-black text-tinta leading-tight">
                  Laboratorio de Robótica
                </h2>
                <p className="text-[12px] text-gris mt-0.5">
                  Máquinas, sensores y experimentos científicos
                </p>
              </div>
            </div>

            {esRobotica && (
              <span className="shrink-0 hidden md:inline-flex items-center gap-1 rounded-full bg-[#24617f] text-white px-3 py-1 text-[11px] font-extrabold shadow-sm animate-pulse">
                <Sparkles size={12} /> Mundo Activo
              </span>
            )}
          </button>

          {/* BOTÓN MUNDO 2: EMPRENDIMIENTO */}
          <button
            type="button"
            onClick={() => setMundo("emprendimiento")}
            className={cn(
              "group relative flex items-center justify-between p-4 sm:p-5 rounded-[22px] border-2 transition-all duration-300 text-left",
              !esRobotica
                ? "bg-gradient-to-r from-[#edf3e6] to-white border-[#466232] shadow-[0_8px_24px_rgba(70,98,50,0.18)] scale-[1.01]"
                : "bg-white/80 border-slate-200 hover:border-emerald-300 hover:bg-[#f0fdf4]/60 opacity-80 hover:opacity-100"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                  !esRobotica ? "bg-[#466232] text-white shadow-md" : "bg-emerald-100 text-[#466232]"
                )}
              >
                <Lightbulb size={26} />
              </div>
              <div>
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#466232]">
                  Vista 2 · Proyectos
                </span>
                <h2 className="font-heading text-[18px] sm:text-[20px] font-black text-tinta leading-tight">
                  Fábrica de Emprendimiento
                </h2>
                <p className="text-[12px] text-gris mt-0.5">
                  Ideas, prototipos, trueque y feria del salón
                </p>
              </div>
            </div>

            {!esRobotica && (
              <span className="shrink-0 hidden md:inline-flex items-center gap-1 rounded-full bg-[#466232] text-white px-3 py-1 text-[11px] font-extrabold shadow-sm animate-pulse">
                <Sparkles size={12} /> Mundo Activo
              </span>
            )}
          </button>
        </div>
      </section>

      {/* CABECERA TEMÁTICA DE JUEGO & DIÁLOGO DEL PERSONAJE GUÍA */}
      <section
        className={cn(
          "relative mb-8 overflow-hidden rounded-[26px] p-6 md:p-8 border shadow-sm transition-all duration-500",
          esRobotica
            ? "bg-gradient-to-br from-[#e0f2fe] via-[#f0f9ff] to-[#e6f4ea] border-[#bae6fd]"
            : "bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-[#fef9c3] border-[#bbf7d0]"
        )}
      >
        {/* Barra superior de logros de juego para el niño */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-white/60">
          {/* Medidor de nivel y XP */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[12px] font-extrabold text-tinta shadow-sm">
              <Trophy size={14} className="text-amber-500" />
              <span>Nivel 2 de Explorador</span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-bold text-amber-700 shadow-sm">
              <Star size={13} className="fill-amber-400 text-amber-500" />
              <span>{totalEstrellas} / {maxEstrellas} Estrellas</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-bold text-sky-700 shadow-sm">
              <Zap size={13} className="text-sky-500" />
              <span>{totalXP} XP Ganados</span>
            </div>
          </div>

          {/* Acceso para docentes */}
          <button
            type="button"
            onClick={() => setMostrarDocenteInfo(!mostrarDocenteInfo)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold transition-colors bg-white/90 shadow-sm",
              esRobotica ? "text-[#24617f] hover:bg-white" : "text-[#466232] hover:bg-white"
            )}
          >
            <BookOpen size={13} />
            <span>{mostrarDocenteInfo ? "Ocultar guía curricular" : "Guía docente (MEN & DBA)"}</span>
            <ChevronDown size={13} className={cn("transition-transform duration-200", mostrarDocenteInfo && "rotate-180")} />
          </button>
        </div>

        {/* DIÁLOGO DEL PERSONAJE GUÍA CON EL NIÑO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
          {/* Avatar animado */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md bg-white border-2 border-white transition-transform hover:scale-105">
              {esRobotica ? (
                <AvatarBoti className="w-full h-full" />
              ) : (
                <AvatarMia className="w-full h-full" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 text-white p-1 shadow-sm">
              <Sparkles size={10} />
            </span>
          </div>

          {/* Bocadillo de texto estilo cómic/juego */}
          <div className="relative flex-1 rounded-[18px] bg-white/95 p-4 sm:p-5 shadow-sm border border-white/80">
            {/* Flechita del bocadillo */}
            <div className="hidden sm:block absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white/95" />

            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-[15px] font-black text-tinta flex items-center gap-1.5">
                {esRobotica ? "Boti dice:" : "Mía la inventora dice:"}
                <span className="text-[12px] font-normal text-gris">
                  {esRobotica ? "¡Tu copiloto de laboratorio!" : "¡Tu compañera de taller!"}
                </span>
              </h3>
              <span className="text-[11px] font-extrabold uppercase tracking-wider rounded-full px-2 py-0.5 bg-slate-100 text-slate-700">
                Paso 2 activo
              </span>
            </div>

            <p className="mt-1.5 text-[14px] leading-relaxed text-gris">
              {esRobotica ? (
                <>
                  «¡Hola, pequeño científico! Ya completaste las máquinas mecánicas y ahora estamos en la{" "}
                  <strong className="text-[#0284c7]">Misión 2: Sensores que miden</strong>. Vamos a descubrir cómo siente
                  la temperatura y la luz nuestro robot. ¡Sigue la ruta en el mapa!»
                </>
              ) : (
                <>
                  «¡Hola, creador! Ya identificamos qué necesita nuestro salón y ahora estamos en el{" "}
                  <strong className="text-[#15803d]">Paso 2: El Gran Trueque</strong> aprendiendo el valor de los recursos.
                  ¡Avanza en tu camino para construir la maqueta!»
                </>
              )}
            </p>
          </div>
        </div>

        {/* Panel curricular desplegable para la docente */}
        {mostrarDocenteInfo && (
          <div className="mt-5 rounded-[16px] bg-white p-5 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="font-heading text-[14px] font-bold text-tinta flex items-center gap-2">
              <Compass size={16} className={esRobotica ? "text-[#24617f]" : "text-[#466232]"} />
              Estructura Curricular Institucional · Colegio Mi Dulce Hogar
            </h4>
            <p className="mt-1 text-[13px] text-gris leading-relaxed">
              {esRobotica
                ? "Este mundo agrupa las 4 unidades troncales de Robótica (U3, U7, U10, U14) del programa Kids 2. Se enfoca en alfabetización tecnológica, pensamiento computacional y experimentación física anclada a los DBA 3 y 4 de Ciencias Naturales (medición de propiedades y ampliación sensorial)."
                : "Este mundo agrupa las 12 unidades de Emprendimiento (U1-U2, U4-U6, U8-U9, U11-U13, U15-U16) organizadas en 4 fases del proyecto escolar: Detección de necesidades, Gestión de recursos/trueque, Prototipado iterativo y Socialización en feria escolar (MEN Estándares de Tecnología y Sociedad)."}
            </p>
          </div>
        )}
      </section>

      {/* EL TABLERO DE AVENTURA: MAPA INTERACTIVO DE MISIONES */}
      <section aria-label="Ruta de estaciones educativas">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-[22px] sm:text-[26px] font-black text-tinta tracking-tight">
              {esRobotica ? "El Circuito de los Jóvenes Científicos" : "El Sendero de los Pequeños Inventores"}
            </h2>
            <p className="text-[13px] text-gris">
              Completa cada misión en orden para desbloquear nuevas herramientas y trofeos
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[12px] font-bold text-gris bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={14} /> Superada
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#0284c7]">
              <Play size={14} /> En curso
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Lock size={14} /> Bloqueada
            </span>
          </div>
        </div>

        {/* CAMINO DE ESTACIONES (GRID CON CONECTORES LÚDICOS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 relative">
          {estaciones.map((estacion) => {
            const { Ilustracion } = estacion;
            const esActual = estacion.estado === "actual";
            const esCompletada = estacion.estado === "completada";
            const esBloqueada = estacion.estado === "bloqueada";

            return (
              <article
                key={estacion.id}
                className={cn(
                  "group relative flex flex-col rounded-[26px] bg-white border-3 transition-all duration-300 overflow-hidden",
                  esActual &&
                    "border-[#00adef] shadow-[0_16px_36px_rgba(0,173,239,0.18)] ring-4 ring-[#00adef]/20 -translate-y-1",
                  esCompletada &&
                    "border-[#86efac] shadow-[0_8px_24px_rgba(34,197,94,0.08)] hover:-translate-y-1",
                  esBloqueada &&
                    "border-slate-200/80 opacity-85 hover:opacity-95"
                )}
              >
                {/* CABECERA VISUAL: ILUSTRACIÓN INFANTIL AMIGABLE */}
                <div className="relative h-[210px] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Ilustracion className="transition-transform duration-500 group-hover:scale-[1.03]" />

                  {/* Insignia de nivel flotante estilo videojuego */}
                  <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm",
                        esActual && "bg-[#0284c7] text-white animate-pulse",
                        esCompletada && "bg-emerald-600 text-white",
                        esBloqueada && "bg-slate-700 text-white"
                      )}
                    >
                      {esCompletada && <CheckCircle2 size={13} />}
                      {esActual && <Sparkles size={13} />}
                      {esBloqueada && <Lock size={13} />}
                      Nivel 0{estacion.nivel}
                    </span>

                    {/* XP Tag */}
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm border border-amber-200">
                      +{estacion.xp} XP
                    </span>
                  </div>

                  {/* Estrellas ganadas en la esquina derecha */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 shadow-sm border border-slate-100">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={14}
                        className={cn(
                          starIdx <= estacion.estrellas
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300"
                        )}
                      />
                    ))}
                  </div>

                  {/* Banner inferior de estado */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm backdrop-blur-md",
                        esActual && "bg-[#0284c7] text-white",
                        esCompletada && "bg-emerald-100 text-emerald-800",
                        esBloqueada && "bg-slate-100 text-slate-600"
                      )}
                    >
                      {estacion.estadoEtiqueta}
                    </span>

                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 shadow-xs">
                      🏅 {estacion.insignia}
                    </span>
                  </div>
                </div>

                {/* CUERPO DE LA TARJETA DE ESTACIÓN */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-gris mb-1">
                    <span className="uppercase tracking-wider">
                      {esRobotica ? "Misión de Robótica" : "Fase de Emprendimiento"}
                    </span>
                    <span>{estacion.duracion}</span>
                  </div>

                  {/* Título Principal */}
                  <h3 className="font-heading text-[22px] font-black text-tinta group-hover:text-[#24617f] transition-colors leading-tight">
                    {estacion.titulo}
                  </h3>
                  <p className="text-[12px] font-bold text-[#bc461c] mt-0.5">
                    {estacion.subtitulo}
                  </p>

                  {/* Breve descripción lúdica */}
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-gris">
                    {estacion.misionCorta}
                  </p>

                  {/* RETOS / PASOS DE LA MISIÓN */}
                  <div className="mt-4 rounded-[16px] bg-slate-50 p-3.5 border border-slate-100">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      Retos del nivel:
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {estacion.retos.map((reto, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-2 text-[12.5px] text-tinta">
                          <span
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                              esCompletada
                                ? "bg-emerald-200 text-emerald-800"
                                : esActual && rIdx === 0
                                  ? "bg-sky-200 text-sky-800"
                                  : "bg-slate-200 text-slate-600"
                            )}
                          >
                            {esCompletada ? "✓" : rIdx + 1}
                          </span>
                          <span>{reto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Y BOTÓN DE ACCIÓN TÁCTIL */}
                  <div className="mt-auto pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-[12px] text-gris">
                      <strong>{estacion.sesiones} sesiones</strong> escolares
                    </div>

                    {estacion.tieneRuta ? (
                      <Link
                        href={estacion.rutaHref}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13.5px] font-black text-white shadow-lg transition-all duration-200",
                          "bg-[#0284c7] hover:bg-[#0369a1] hover:scale-[1.03] active:scale-[0.97] active:shadow-sm focus-visible:ring-4 focus-visible:ring-sky-300"
                        )}
                      >
                        <Play size={15} className="fill-white" />
                        <span>{estacion.ctaTexto}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={esBloqueada}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-all duration-200",
                          esCompletada
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200"
                        )}
                      >
                        {esBloqueada && <Lock size={13} />}
                        {esCompletada && <Award size={13} />}
                        <span>{estacion.ctaTexto}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PIE DE PÁGINA PEDAGÓGICO */}
      <footer className="mt-10 rounded-[22px] bg-white p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "rounded-2xl p-2.5 text-white shrink-0 mt-0.5 shadow-xs",
              esRobotica ? "bg-[#24617f]" : "bg-[#466232]"
            )}
          >
            <Compass size={22} />
          </div>
          <div>
            <h4 className="font-heading text-[15px] font-bold text-tinta">
              {esRobotica
                ? "Ruta Didáctica Abierta: Unidad 7 («Sensores que miden»)"
                : "Plan de Trabajo: Proyecto de Emprendimiento Escolar 1°"}
            </h4>
            <p className="mt-1 text-[13px] leading-relaxed text-gris max-w-[70ch]">
              {esRobotica
                ? "La maqueta interactiva conecta directamente con la planeación de clase completa de 7 secciones (Objetivo, Evidencias, Profundización, Inicio, Desarrollo, Evaluación y Calificación)."
                : "Las 4 estaciones cubren el ciclo del emprendimiento según la guía del MEN: desde la observación del problema hasta la socialización con las familias en la feria escolar."}
            </p>
          </div>
        </div>

        {esRobotica ? (
          <Link
            href="/laboratorios/u7"
            className="shrink-0 rounded-full border-2 border-[#24617f] px-5 py-2.5 text-[13px] font-bold text-[#24617f] hover:bg-[#24617f] hover:text-white transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Ver Ruta Unidad 7</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setMundo("robotica")}
            className="shrink-0 rounded-full border-2 border-[#466232] px-5 py-2.5 text-[13px] font-bold text-[#466232] hover:bg-[#466232] hover:text-white transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Ir a Robótica</span>
            <ArrowRight size={14} />
          </button>
        )}
      </footer>
    </Marco>
  );
}

export default function LaboratoriosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gris">Cargando mundos de exploración...</div>}>
      <ContenidoLaboratorios />
    </Suspense>
  );
}
