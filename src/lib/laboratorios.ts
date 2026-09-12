import type React from "react";
import {
  IlustracionRobotMaquinas,
  IlustracionCientificaSensores,
  IlustracionPrototipoCohete,
  IlustracionFeriaInventos,
} from "@/components/laboratorios/ilustraciones";
import {
  IlustracionDetectivesNecesidades,
  IlustracionMercaditoTrueque,
  IlustracionMecanismoRobo,
  IlustracionRobotPresentador,
} from "@/components/laboratorios/ilustraciones-adicionales";

export type MundoId = "robotica" | "emprendimiento";
export type EstadoEstacion = "completada" | "actual" | "bloqueada";

export interface Estacion {
  id: string;
  nivel: number;
  unidadId: string;
  titulo: string;
  subtitulo: string;
  misionCorta: string;
  sesiones: number;
  duracion: string;
  estado: EstadoEstacion;
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

export const MISIONES_ROBOTICA: Estacion[] = [
  {
    id: "rob-1",
    nivel: 1,
    unidadId: "u3",
    titulo: "Máquinas que ayudan",
    subtitulo: "Poleas, Ruedas y Asistentes",
    misionCorta:
      "Aprende cómo las palancas y engranajes nos ayudan en el aula a levantar y mover cosas sin cansarnos.",
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
    misionCorta:
      "¡Los robots no adivinan, miden! Usamos sensores reales de temperatura y luz para explorar el salón.",
    sesiones: 3,
    duracion: "3 sesiones · Se libera el 15 de sept",
    estado: "actual",
    estadoEtiqueta: "Misión en curso",
    estrellas: 2,
    maxEstrellas: 3,
    xp: 200,
    tieneRuta: true,
    rutaHref: "/laboratorios/u7",
    ctaTexto: "¡Iniciar misión!",
    retos: ["Adivinar vs Medir", "Sensor en recipientes", "Llenar la tabla de 3 datos"],
    insignia: "Lupa de Explorador",
    Ilustracion: IlustracionCientificaSensores,
  },
  {
    id: "rob-3",
    nivel: 3,
    unidadId: "u10",
    titulo: "Un mecanismo que se mueve",
    subtitulo: "Brazos Robóticos y Cinemática",
    misionCorta:
      "Unimos motores y piezas articuladas para que nuestro invento realice movimientos precisos por sí mismo.",
    sesiones: 3,
    duracion: "3 sesiones · Próxima estación",
    estado: "bloqueada",
    estadoEtiqueta: "Se abre en la semana 4",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 250,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Aún no disponible",
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
    misionCorta:
      "Programamos nuestro robot expositor para que salude a las familias y muestre los inventos del grado 1°.",
    sesiones: 3,
    duracion: "3 sesiones · Gran final",
    estado: "bloqueada",
    estadoEtiqueta: "Misión de cierre",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 300,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Aún no disponible",
    retos: ["Saludo y voz del robot", "Luces de feria", "Presentación con familias"],
    insignia: "Maestro Robot",
    Ilustracion: IlustracionRobotPresentador,
  },
];

export const MISIONES_EMPRENDIMIENTO: Estacion[] = [
  {
    id: "emp-1",
    nivel: 1,
    unidadId: "u1",
    titulo: "Detectives de necesidades",
    subtitulo: "Observar el Colegio y Crear Ideas",
    misionCorta:
      "Recorremos el salón con ojos curiosos para descubrir problemas reales que podamos resolver con creatividad.",
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
    misionCorta:
      "¿Cuánto valen las cosas? Aprendemos a compartir, intercambiar y calcular los materiales necesarios.",
    sesiones: 4,
    duracion: "4 sesiones · ¡En taller!",
    estado: "actual",
    estadoEtiqueta: "Estación activa",
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
    titulo: "Taller de prototipos",
    subtitulo: "De la Idea a la Maqueta",
    misionCorta:
      "Armamos prototipos con cajas de cartón, hojas secas y materiales reciclables para probar nuestras soluciones.",
    sesiones: 4,
    duracion: "4 sesiones · Próxima fase",
    estado: "bloqueada",
    estadoEtiqueta: "Se abre en la semana 4",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 250,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Aún no disponible",
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
    misionCorta:
      "¡El día de fiesta! Diseñamos nuestro stand, preparamos carteles y mostramos los inventos a los padres.",
    sesiones: 4,
    duracion: "4 sesiones · Evento final",
    estado: "bloqueada",
    estadoEtiqueta: "Gran celebración",
    estrellas: 0,
    maxEstrellas: 3,
    xp: 300,
    tieneRuta: false,
    rutaHref: "#",
    ctaTexto: "Aún no disponible",
    retos: ["Cartel del stand", "Explicar el proyecto", "Diploma de inventor"],
    insignia: "Estrella Emprendedora",
    Ilustracion: IlustracionFeriaInventos,
  },
];

export interface Mundo {
  id: MundoId;
  nombre: string;
  area: string;
  lema: string;
  copiloto: string;
  copilotoRol: string;
  frase: React.ReactNode;
  estaciones: Estacion[];
  guia: string;
}

export const MUNDOS: Record<MundoId, Omit<Mundo, "frase">> = {
  robotica: {
    id: "robotica",
    nombre: "Mundo de Robótica",
    area: "Robótica",
    lema: "Máquinas, sensores y descubrimientos",
    copiloto: "Boti",
    copilotoRol: "Tu copiloto de a bordo",
    estaciones: MISIONES_ROBOTICA,
    guia: "Este mundo agrupa las 4 unidades troncales de Robótica (U3, U7, U10, U14) del programa Kids 2. Se enfoca en alfabetización tecnológica, pensamiento computacional y experimentación física anclada a los DBA 3 y 4 de Ciencias Naturales.",
  },
  emprendimiento: {
    id: "emprendimiento",
    nombre: "Mundo de Emprendimiento",
    area: "Emprendimiento",
    lema: "Ideas, trueques y grandes inventos",
    copiloto: "Mía",
    copilotoRol: "Tu compañera de expedición",
    estaciones: MISIONES_EMPRENDIMIENTO,
    guia: "Este mundo agrupa las 12 unidades de Emprendimiento organizadas en 4 fases del proyecto escolar: detección de necesidades, gestión de recursos, prototipado iterativo y socialización en la feria escolar.",
  },
};
