import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cerrarSesion } from "../(auth)/acciones";
import { Tarjeta } from "../(auth)/componentes";

export const metadata: Metadata = { title: "Mi cuenta · MIDUHO" };

/** Página mínima protegida: verifica la sesión en el servidor (no confía en proxy.ts). */
export default async function PaginaCuenta() {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta");
  return (
    <Tarjeta titulo="Mi cuenta">
      <dl className="mb-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-neutral-900">
        <dt className="font-semibold">Nombre</dt>
        <dd>{sesion.user.name}</dd>
        <dt className="font-semibold">Correo</dt>
        <dd>{sesion.user.email}</dd>
        <dt className="font-semibold">Roles</dt>
        <dd>{sesion.user.roles.length ? sesion.user.roles.join(", ") : "Sin rol asignado"}</dd>
      </dl>
      <form action={cerrarSesion}>
        <button
          type="submit"
          className="h-11 rounded-full border border-neutral-700 px-5 text-base font-semibold text-neutral-900 outline-none hover:bg-neutral-100 focus-visible:ring-3 focus-visible:ring-[#00658B]"
        >
          Cerrar sesión
        </button>
      </form>
    </Tarjeta>
  );
}
