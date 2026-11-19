import Link from "next/link";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { formatoCierre } from "@/lib/entregas";
import { entregasDocente } from "@/server/modules/entregas/servicio";
import { exigirRolPagina } from "@/server/pagina";

export default async function PaginaEntregasDocente() {
  const usuario = await exigirRolPagina(["DOCENTE"], "/cuenta/entregas");
  const entregas = await entregasDocente(usuario.id);
  return <Marco>
    <Migas pasos={[{ etiqueta: "Cuenta", href: "/cuenta" }, { etiqueta: "Entregas" }]} />
    <Cabecera kicker="Mi cuenta" titulo="Entregas a coordinación" nota="Consulta lo que te han solicitado y sube cada documento aquí." />
    {entregas.length ? <ul className="admin-columna">{entregas.map((entrega) => <li className="cuenta-panel" key={entrega.id}>
      <h2><Link href={`/cuenta/entregas/${entrega.id}`}>{entrega.solicitud.titulo}</Link></h2>
      <p>{entrega.calculado.estado} · Cierre: {formatoCierre(entrega.solicitud.cierraEn)}</p>
      <p>{entrega.archivos.length} {entrega.archivos.length === 1 ? "versión" : "versiones"}</p>
    </li>)}</ul> : <p>No tienes entregas abiertas por ahora.</p>}
  </Marco>;
}
