"use client";

import { createContext, useContext } from "react";
import type { ContextoShell } from "@/lib/navegacion";

/**
 * Datos reales de la sesión que pinta el shell autenticado. Los calcula el
 * servidor (src/server/shell.ts) y la raíz los inyecta: así el Marco, que es
 * componente cliente y lo usan páginas cliente, no inventa identidad ni grupo.
 */
export interface DatosShell {
  nombre: string;
  correo: string;
  roles: string[];
  contexto: ContextoShell | null;
  /** Grupo con asociación activa del ESTUDIANTE en el año ACTIVO. */
  grupo: string | null;
  /** Grupos con asignación ACTIVA del DOCENTE en el año ACTIVO. */
  gruposDocente: string[];
  /** Período vigente del año ACTIVO, si la fecha cae dentro de alguno. */
  periodo: string | null;
}

const ContextoShellReact = createContext<DatosShell | null>(null);

export function ProveedorShell({ valor, children }: { valor: DatosShell | null; children: React.ReactNode }) {
  return <ContextoShellReact.Provider value={valor}>{children}</ContextoShellReact.Provider>;
}

export function useShell() {
  return useContext(ContextoShellReact);
}
