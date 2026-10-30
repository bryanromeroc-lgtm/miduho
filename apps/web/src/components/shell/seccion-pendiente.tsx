import { Cabecera, Marco } from "@/components/friso/marco";

/**
 * Página del shell cuya funcionalidad entrega otra tarjeta del Incremento 1R.
 * Mantiene la navegación por rol funcionando sin inventar datos.
 */
export function SeccionPendiente({
  titulo,
  kicker,
  descripcion,
}: {
  titulo: string;
  kicker: string;
  descripcion: string;
}) {
  return (
    <Marco>
      <Cabecera kicker={kicker} titulo={titulo} />
      <section className="seccion-pendiente" aria-label={`${titulo}: en construcción`}>
        <p>{descripcion}</p>
        <p>🔶 Sección en construcción dentro del Incremento 1R.</p>
      </section>
    </Marco>
  );
}
