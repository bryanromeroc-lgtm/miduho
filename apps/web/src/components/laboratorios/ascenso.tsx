"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/*
  EL ASCENSO · el viaje entre el aula y el universo

  EL PROBLEMA: pasar de cualquier vista a Laboratorios era un corte seco
  de #fffcf7 (papel cálido, colinas verdes, cielo azul) a #070c22 (noche
  profunda). Dos mundos sin nada en medio: el salto se leía como un
  error de carga, no como un destino.

  LA TESIS: la app YA tiene un cielo. El sol, las nubes, las colinas y el
  colegio viven en el encabezado de todas las vistas. Laboratorios no es
  otro sitio: es ESE MISMO CIELO, más arriba. Así que el tránsito no es
  una pantalla intermedia con un girador — es la cámara soltando el
  suelo y subiendo.

  Nada aquí es un asset nuevo: el sol, las nubes, los árboles y el
  colegio son los mismos SVG del portal (/images/portal/*). Por eso la
  continuidad es literal y no una imitación: el punto de partida del
  viaje es el paisaje que la persona tenía delante hace un instante.

  LA CURVA DEL CIELO, en un solo gradiente que viaja:
    día #bfe8fb → atardecer #f0a35e → crepúsculo #4a3a86 → noche #070c22
  El azul no se apaga: pasa por el atardecer, que es como se oscurece un
  cielo de verdad. Las estrellas emergen justo cuando el azul se rinde.

  IDA (1.1s) y VUELTA (0.72s). Salir nunca cuesta más que entrar: el
  descenso es más corto porque volver al trabajo no debe sentirse como
  un trámite.

  MOVIMIENTO REDUCIDO: no hay viaje, hay disolvencia. El cielo cruza de
  día a noche sin desplazamiento y sin estrellas en movimiento; el
  cambio de lugar sigue siendo legible por color, que es lo que porta el
  significado. La navegación ocurre igual y a la misma velocidad.
*/

type Sentido = "subida" | "bajada";

const DURACION: Record<Sentido, number> = { subida: 1100, bajada: 720 };

/* El punto en que la ruta cambia bajo el telón: al final del ascenso el
   cielo ya es noche, así que la vista nueva aparece sobre su propio
   fondo y no hay parpadeo de color en la costura. */
const RELEVO = 0.82;

export function Ascenso() {
  const router = useRouter();
  const pathname = usePathname();
  const [viaje, setViaje] = useState<{ sentido: Sentido; destino: string } | null>(null);
  const enCurso = useRef(false);

  const volar = useCallback(
    (destino: string, sentido: Sentido) => {
      if (enCurso.current) return;
      enCurso.current = true;

      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setViaje({ sentido, destino });

      /* La navegación ocurre con el telón arriba. Con movimiento
         reducido el telón es una disolvencia corta, pero el relevo
         sigue ocurriendo detrás de él: nunca se ve el corte. */
      const total = reducido ? 420 : DURACION[sentido];
      const t1 = window.setTimeout(() => router.push(destino), total * RELEVO);
      /* El telón se retira cuando la vista nueva ya está pintada. */
      const t2 = window.setTimeout(
        () => {
          setViaje(null);
          enCurso.current = false;
        },
        total + (reducido ? 120 : 380),
      );

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    },
    [router],
  );

  /*
    La intercepción vive aquí y no en cada enlace: el Marco monta un solo
    <nav> para toda la app, así que un único listener en captura cubre
    cada entrada y cada salida de Laboratorios, incluidas las que aún no
    existen. Ningún enlace necesita saber del ascenso.
  */
  useEffect(() => {
    const enLabs = pathname.startsWith("/laboratorios");

    const alPulsar = (e: MouseEvent) => {
      /* Respeta las formas de abrir en otra pestaña: si la persona pidió
         una ventana nueva, no hay viaje que animar. */
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;

      const destinoEsLabs = href.startsWith("/laboratorios") || href.startsWith("/emprendimiento");

      /* Sube quien entra al universo desde tierra; baja quien lo deja.
         Moverse dentro de Laboratorios no despega otra vez. */
      const sentido: Sentido | null =
        !enLabs && destinoEsLabs ? "subida" : enLabs && !destinoEsLabs ? "bajada" : null;
      if (!sentido) return;

      e.preventDefault();
      volar(href, sentido);
    };

    document.addEventListener("click", alPulsar, true);
    return () => document.removeEventListener("click", alPulsar, true);
  }, [pathname, volar]);

  if (!viaje) return null;

  return (
    <div
      className="asc"
      data-sentido={viaje.sentido}
      role="status"
      aria-live="polite"
      style={{ "--asc-dur": `${DURACION[viaje.sentido]}ms` } as React.CSSProperties}
    >
      {/* El cielo que viaja: un solo gradiente alto que se desplaza, de
          modo que el color nunca salta de un valor a otro. */}
      <div className="asc-cielo" aria-hidden="true" />

      {/* Las estrellas no aparecen: emergen cuando el azul se rinde. */}
      <div className="asc-estrellas" aria-hidden="true" />
      <div className="asc-estrellas asc-estrellas-lejos" aria-hidden="true" />

      {/* El suelo que se suelta: las mismas colinas y el mismo colegio
          del encabezado. Es el punto de partida literal del viaje. */}
      <div className="asc-suelo" aria-hidden="true">
        <div className="asc-colina asc-colina-lejos" />
        <div className="asc-colina asc-colina-cerca" />
        {/* Eager: el viaje ya empezó cuando estas piezas entran en cuadro.
            Una carga diferida las haría aparecer a mitad del ascenso. */}
        <Image className="asc-prop asc-arbol-a" src="/images/portal/1f333.svg" alt="" width={72} height={72} loading="eager" />
        <Image className="asc-prop asc-colegio" src="/images/portal/1f3eb.svg" alt="" width={96} height={96} loading="eager" />
        <Image className="asc-prop asc-arbol-b" src="/images/portal/1f332.svg" alt="" width={72} height={72} loading="eager" />
      </div>

      {/* Las nubes se cruzan de paso: son la lectura de velocidad del
          tramo bajo, donde todavía hay atmósfera. */}
      <Image className="asc-nube asc-nube-a" src="/images/portal/2601.svg" alt="" width={92} height={92} loading="eager" aria-hidden="true" />
      <Image className="asc-nube asc-nube-b" src="/images/portal/2601.svg" alt="" width={64} height={64} loading="eager" aria-hidden="true" />
      <Image className="asc-nube asc-nube-c" src="/images/portal/2601.svg" alt="" width={110} height={110} loading="eager" aria-hidden="true" />
      <Image className="asc-sol" src="/images/portal/2600.svg" alt="" width={64} height={64} loading="eager" aria-hidden="true" />

      <span className="sr-only">
        {viaje.sentido === "subida" ? "Subiendo a los laboratorios" : "Volviendo al colegio"}
      </span>
    </div>
  );
}
