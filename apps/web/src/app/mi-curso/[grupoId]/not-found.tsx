import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";

/**
 * Respuesta única para grupo inexistente o no asignado: el mismo texto en
 * ambos casos, para no revelar qué grupos existen (INC1R-10).
 */
export default function GrupoNoDisponible() {
  return (
    <Marco>
      <Cabecera kicker="Mi curso" titulo="Grupo no disponible" />
      <div className="admin-vacio">
        <p>Este grupo no existe o no tienes una asignación activa en él.</p>
        <Link href="/mi-curso" className="boton-pastilla" data-variante="secundario">
          <ChevronLeft size={18} aria-hidden="true" /> Volver a Mi curso
        </Link>
      </div>
    </Marco>
  );
}
