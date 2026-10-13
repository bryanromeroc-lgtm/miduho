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

export interface Estacion {
  id: string;
  nivel: number;
  unidadId: string;
  titulo: string;
  subtitulo: string;
  misionCorta: string;
  sesiones: number;
  duracion: string;
  rutaHref: string;
  ctaTexto: string;
  retos: string[];
  insignia: string;
  Ilustracion: React.ComponentType<{ className?: string }>;
}

/*
  Selección curricular propia de MIDUHO. Los temas generales se eligieron
  después de observar la organización de una plataforma de referencia, pero
  los títulos, retos y textos son originales. No se replica material protegido.
*/
export const MISIONES_ROBOTICA: Estacion[] = [
  {
    id: "rob-energia-movimiento",
    nivel: 1,
    unidadId: "rob-energia-movimiento",
    titulo: "Energía para movernos",
    subtitulo: "Fuentes de energía en la vida diaria",
    misionCorta:
      "Exploramos de dónde viene la energía que permite mover objetos y clasificamos ejemplos del colegio según su fuente.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/rob-energia-movimiento",
    ctaTexto: "Abrir ruta didáctica",
    retos: ["Detectar energía", "Clasificar fuentes", "Mover un prototipo"],
    insignia: "Explorador de energía",
    Ilustracion: IlustracionRobotMaquinas,
  },
  {
    id: "rob-transformaciones",
    nivel: 2,
    unidadId: "rob-transformaciones",
    titulo: "Cuando la energía cambia",
    subtitulo: "Transformaciones que podemos observar",
    misionCorta:
      "Seguimos la energía desde una fuente hasta un efecto visible: luz, sonido, calor o movimiento.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/rob-transformaciones",
    ctaTexto: "Abrir ruta didáctica",
    retos: ["Observar cambios", "Trazar una cadena", "Explicar un efecto"],
    insignia: "Rastreador de cambios",
    Ilustracion: IlustracionCientificaSensores,
  },
  {
    id: "rob-circuitos-seguros",
    nivel: 3,
    unidadId: "rob-circuitos-seguros",
    titulo: "Circuitos seguros",
    subtitulo: "Electricidad con cuidado y propósito",
    misionCorta:
      "Construimos un circuito de baja tensión para encender una luz y acordamos prácticas seguras para experimentar.",
    sesiones: 3,
    duracion: "3 sesiones de 45 minutos",
    rutaHref: "/laboratorios/rob-circuitos-seguros",
    ctaTexto: "Abrir ruta didáctica",
    retos: ["Reconocer componentes", "Cerrar el circuito", "Aplicar acuerdos de seguridad"],
    insignia: "Guardián del circuito",
    Ilustracion: IlustracionMecanismoRobo,
  },
  {
    id: "rob-camino-corriente",
    nivel: 4,
    unidadId: "rob-camino-corriente",
    titulo: "El camino de la corriente",
    subtitulo: "Conductores, aislantes y recorridos",
    misionCorta:
      "Probamos materiales del aula para descubrir cuáles permiten completar el recorrido de un circuito de baja tensión.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/rob-camino-corriente",
    ctaTexto: "Abrir ruta didáctica",
    retos: ["Predecir materiales", "Probar sin riesgo", "Registrar resultados"],
    insignia: "Detective conductor",
    Ilustracion: IlustracionRobotPresentador,
  },
  {
    id: "rob-molino-movimiento",
    nivel: 5,
    unidadId: "rob-molino-movimiento",
    titulo: "Molino en movimiento",
    subtitulo: "Diseñar, probar y mejorar",
    misionCorta:
      "Diseñamos aspas que aprovechan una corriente de aire y mejoramos el prototipo a partir de pruebas comparables.",
    sesiones: 3,
    duracion: "3 sesiones de 45 minutos",
    rutaHref: "/laboratorios/rob-molino-movimiento",
    ctaTexto: "Abrir ruta didáctica",
    retos: ["Construir aspas", "Medir giros", "Mejorar el diseño"],
    insignia: "Inventor del viento",
    Ilustracion: IlustracionPrototipoCohete,
  },
];

export const MISIONES_EMPRENDIMIENTO: Estacion[] = [
  {
    id: "emp-problema-oportunidad",
    nivel: 1,
    unidadId: "emp-problema-oportunidad",
    titulo: "De un problema a una oportunidad",
    subtitulo: "Observar antes de proponer",
    misionCorta:
      "Identificamos una situación cotidiana que puede mejorar y formulamos una oportunidad clara sin culpar a nadie.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/emp-problema-oportunidad",
    ctaTexto: "Abrir ejercicio",
    retos: ["Observar el entorno", "Describir una necesidad", "Elegir una oportunidad"],
    insignia: "Mirada curiosa",
    Ilustracion: IlustracionDetectivesNecesidades,
  },
  {
    id: "emp-preguntar-crear",
    nivel: 2,
    unidadId: "emp-preguntar-crear",
    titulo: "Preguntar antes de crear",
    subtitulo: "Escuchar gustos y necesidades",
    misionCorta:
      "Creamos una encuesta breve, recogemos respuestas anónimas del grupo y usamos los resultados para orientar una idea.",
    sesiones: 3,
    duracion: "3 sesiones de 45 minutos",
    rutaHref: "/laboratorios/emp-preguntar-crear",
    ctaTexto: "Abrir ejercicio",
    retos: ["Redactar preguntas", "Contar respuestas", "Tomar una decisión"],
    insignia: "Oído investigador",
    Ilustracion: IlustracionMercaditoTrueque,
  },
  {
    id: "emp-paso-a-paso",
    nivel: 3,
    unidadId: "emp-paso-a-paso",
    titulo: "Diseñar el paso a paso",
    subtitulo: "Una secuencia que otra persona pueda seguir",
    misionCorta:
      "Organizamos materiales y acciones en una secuencia clara, la probamos con otro equipo y corregimos instrucciones confusas.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/emp-paso-a-paso",
    ctaTexto: "Abrir ejercicio",
    retos: ["Ordenar acciones", "Probar instrucciones", "Corregir la secuencia"],
    insignia: "Guía de procesos",
    Ilustracion: IlustracionPrototipoCohete,
  },
  {
    id: "emp-nombre-proyecto",
    nivel: 4,
    unidadId: "emp-nombre-proyecto",
    titulo: "Un nombre que se recuerde",
    subtitulo: "Identidad clara para una idea",
    misionCorta:
      "Proponemos y comparamos nombres respetuosos, fáciles de pronunciar y relacionados con la solución del equipo.",
    sesiones: 2,
    duracion: "2 sesiones de 45 minutos",
    rutaHref: "/laboratorios/emp-nombre-proyecto",
    ctaTexto: "Abrir ejercicio",
    retos: ["Crear opciones", "Aplicar criterios", "Presentar el nombre"],
    insignia: "Creador de identidad",
    Ilustracion: IlustracionRobotPresentador,
  },
  {
    id: "emp-preparar-feria",
    nivel: 5,
    unidadId: "emp-preparar-feria",
    titulo: "Preparar nuestra feria",
    subtitulo: "Planear, comunicar y hacer cuentas",
    misionCorta:
      "Distribuimos responsabilidades, ensayamos la presentación y organizamos un registro sencillo de materiales e intercambios.",
    sesiones: 3,
    duracion: "3 sesiones de 45 minutos",
    rutaHref: "/laboratorios/emp-preparar-feria",
    ctaTexto: "Abrir ejercicio",
    retos: ["Crear un plan", "Ensayar el mensaje", "Registrar recursos"],
    insignia: "Equipo de feria",
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
    lema: "Energía, circuitos y movimiento",
    copiloto: "Boti",
    copilotoRol: "Tu copiloto de a bordo",
    estaciones: MISIONES_ROBOTICA,
    guia:
      "Cinco rutas propias de MIDUHO para explorar energía, transformaciones, circuitos, materiales y diseño de prototipos.",
  },
  emprendimiento: {
    id: "emprendimiento",
    nombre: "Mundo de Emprendimiento",
    area: "Emprendimiento",
    lema: "Problemas, ideas y proyectos",
    copiloto: "Mía",
    copilotoRol: "Tu compañera de expedición",
    estaciones: MISIONES_EMPRENDIMIENTO,
    guia:
      "Cinco ejercicios propios de MIDUHO para observar necesidades, escuchar, organizar procesos, crear identidad y preparar una feria.",
  },
};
