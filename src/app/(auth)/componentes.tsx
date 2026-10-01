import type { ComponentProps } from "react";

/** Piezas accesibles compartidas por los formularios de acceso (WCAG 2.1 AA). */

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  ...props
}: ComponentProps<"input"> & { id: string; etiqueta: string; error?: string; ayuda?: string }) {
  const descripcion = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-900">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion || undefined}
        className="h-11 rounded-lg border border-neutral-500 bg-white px-3 text-base text-neutral-900 outline-none focus-visible:ring-3 focus-visible:ring-[#00658B] aria-invalid:border-[#B3261E]"
        {...props}
      />
      {ayuda ? (
        <p id={`${id}-ayuda`} className="text-sm text-neutral-700">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-[#B3261E]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Aviso({ tipo, children }: { tipo: "error" | "ok"; children: React.ReactNode }) {
  const estilos =
    tipo === "error"
      ? "border-[#B3261E] bg-[#FDECEA] text-[#7A1A14]"
      : "border-[#2E6B12] bg-[#EEF6E8] text-[#234F0E]";
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm ${estilos}`}>
      {children}
    </div>
  );
}

export function BotonEnviar({ pendiente, children }: { pendiente: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pendiente}
      aria-disabled={pendiente}
      className="h-11 rounded-full bg-[#00658B] px-5 text-base font-semibold text-white outline-none hover:bg-[#004F6D] focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-[#00658B] disabled:opacity-70"
    >
      {pendiente ? "Un momento…" : children}
    </button>
  );
}

export function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-bold text-neutral-900">{titulo}</h1>
        {children}
      </div>
    </main>
  );
}
