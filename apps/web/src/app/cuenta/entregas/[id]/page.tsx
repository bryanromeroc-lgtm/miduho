import { notFound } from "next/navigation";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { formatoCierre, formatoRetraso } from "@/lib/entregas";
import { SubirArchivo } from "@/features/entregas/subir-archivo";
import { db } from "@/server/db";
import { exigirRolPagina } from "@/server/pagina";
import { estadoEntrega } from "@/lib/entregas";

export default async function PaginaEntregaDocente({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await exigirRolPagina(["DOCENTE"], "/cuenta/entregas");
  const { id } = await params;
  const entrega = await db.entregaDocente.findFirst({ where: { id, docenteId: usuario.id, solicitud: { estado: "ABIERTA" } }, include: { solicitud: true, archivos: { orderBy: { version: "desc" } } } });
  if (!entrega) notFound();
  const calculado = estadoEntrega({ cierraEn: entrega.solicitud.cierraEn, ultimaSubida: entrega.archivos[0]?.subidoEn, ahora: new Date() });
  return <Marco>
    <Migas pasos={[{ etiqueta: "Cuenta", href: "/cuenta" }, { etiqueta: "Entregas", href: "/cuenta/entregas" }, { etiqueta: entrega.solicitud.titulo }]} />
    <Cabecera kicker="Entregas a coordinación" titulo={entrega.solicitud.titulo} nota={`Cierre: ${formatoCierre(entrega.solicitud.cierraEn)}`} />
    {entrega.solicitud.descripcion ? <p className="cuenta-texto">{entrega.solicitud.descripcion}</p> : null}
    <p><strong>Estado:</strong> {calculado.estado}{calculado.retrasoMs ? ` · ${formatoRetraso(calculado.retrasoMs)}` : ""}</p>
    <SubirArchivo entregaId={entrega.id} cierraEn={entrega.solicitud.cierraEn.toISOString()} formatos={entrega.solicitud.formatos} tieneVersionATiempo={entrega.archivos.some((archivo) => archivo.subidoEn <= entrega.solicitud.cierraEn)} tardeInicial={new Date() > entrega.solicitud.cierraEn} />
    <section className="cuenta-panel" aria-labelledby="versiones-titulo"><h2 id="versiones-titulo">Versiones entregadas</h2>
      {entrega.archivos.length ? <ol>{entrega.archivos.map((archivo) => <li key={archivo.id}>Versión {archivo.version} · {formatoCierre(archivo.subidoEn)} · {archivo.nombreOriginal}</li>)}</ol> : <p>Aún no has subido archivos.</p>}
    </section>
  </Marco>;
}
