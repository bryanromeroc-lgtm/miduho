"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ChevronDown, CircleUserRound, LogOut } from "lucide-react";
import { cerrarSesion } from "@/app/(auth)/acciones";
import { inicioDeContexto, nombreRol, type ContextoShell } from "@/lib/navegacion";
import type { DatosShell } from "./contexto";

function iniciales(nombre: string) {
  const partes = nombre.split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

/**
 * Control de cuenta: un solo botón que despliega identidad, Cuenta y Cerrar
 * sesión. Disclosure accesible (aria-expanded/controls), Escape y clic fuera
 * lo cierran y el foco vuelve al botón.
 */
export function MenuCuenta({ datos }: { datos: DatosShell }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  const roles = datos.roles.map(nombreRol).join(" · ") || "Sin rol asignado";

  return (
    <div className="shell-cuenta" ref={raiz}>
      <button
        ref={boton}
        type="button"
        className="shell-cuenta-boton"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="shell-avatar" aria-hidden="true">{iniciales(datos.nombre)}</span>
        <span className="shell-cuenta-nombre">
          <strong>{datos.nombre}</strong>
          <small>{roles}</small>
        </span>
        <span className="sr-only">Menú de la cuenta</span>
        <ChevronDown size={16} aria-hidden="true" className="shell-cuenta-flecha" />
      </button>
      <div id={id} className="shell-cuenta-panel" hidden={!abierto}>
        <p className="shell-cuenta-identidad">
          <strong>{datos.nombre}</strong>
          <span>{datos.correo}</span>
          <span>{roles}</span>
        </p>
        <Link href="/cuenta" className="shell-cuenta-accion" onClick={() => setAbierto(false)}>
          <CircleUserRound size={18} aria-hidden="true" /> Cuenta
        </Link>
        <form action={cerrarSesion}>
          <button type="submit" className="shell-cuenta-accion">
            <LogOut size={18} aria-hidden="true" /> Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Selector visible para cuentas DOCENTE + ADMIN (§2.4). Persiste el contexto
 * en servidor (POST /api/sesion/contexto) y lleva al inicio del nuevo contexto.
 * `actual` es el contexto que muestra la página; `guardado`, el persistido.
 * Si coinciden en pantalla pero no en servidor, solo se persiste sin navegar.
 */
export function SelectorContexto({
  actual,
  guardado,
}: {
  actual: ContextoShell | null;
  guardado: ContextoShell | null;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cambiar(destino: "ADMIN" | "DOCENTE") {
    if (pendiente || (destino === actual && destino === guardado)) return;
    setError(null);
    iniciar(async () => {
      const r = await fetch("/api/sesion/contexto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexto: destino }),
      });
      if (!r.ok) {
        setError("No se pudo cambiar de contexto. Intenta de nuevo.");
        return;
      }
      if (destino !== actual) router.push(inicioDeContexto(destino));
      router.refresh();
    });
  }

  return (
    <div className="shell-contexto" role="group" aria-label="Contexto de trabajo">
      {(["ADMIN", "DOCENTE"] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={actual === c}
          disabled={pendiente}
          onClick={() => cambiar(c)}
          className="shell-contexto-opcion"
        >
          {c === "ADMIN" ? "Administración" : "Docente"}
        </button>
      ))}
      {error ? (
        <span role="alert" className="shell-contexto-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
