import { z } from "zod";
import { FORMATOS_ENTREGA } from "@/lib/entregas";

const id = z.string().trim().min(1).max(128);
const fechaLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Elige una fecha y hora de cierre válida").transform((valor) => {
  const fecha = new Date(`${valor}:00-05:00`);
  if (Number.isNaN(fecha.getTime())) throw new Error("Fecha de cierre inválida");
  return fecha;
});
export const solicitud = z.object({
  titulo: z.string().trim().min(3, "Escribe al menos 3 caracteres").max(120),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  tipoDocumento: z.enum(["PLANILLA_NOTAS", "PLANEACION", "OBSERVADOR", "INFORME", "OTRO"]),
  formatos: z.array(z.enum(FORMATOS_ENTREGA)).min(1, "Elige al menos un formato").default([".xlsx", ".xls"]),
  cierreLocal: fechaLocal,
  periodoId: id.optional().nullable(),
  todasDocentes: z.boolean().default(false),
  docenteIds: z.array(id).default([]),
  carpetaDriveId: id.min(1, "Elige la carpeta de Drive donde se guardarán los archivos"),
  carpetaDriveNombre: z.string().trim().min(1).max(255),
}).refine((datos) => datos.todasDocentes || datos.docenteIds.length > 0, { path: ["docenteIds"], message: "Elige al menos una docente" });
export const filtroSolicitudes = z.object({ estado: z.enum(["ABIERTA", "ARCHIVADA"]).default("ABIERTA") });
export const filtroTablero = z.object({
  estado: z.enum(["Pendiente", "Sin entregar", "Entregada", "Tardía"]).optional(),
  orden: z.enum(["nombre", "hora"]).default("nombre"),
});
export type DatosSolicitud = z.output<typeof solicitud>;
