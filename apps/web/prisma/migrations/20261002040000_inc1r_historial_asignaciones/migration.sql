-- El historial exige permitir que una misma combinación docente/asignatura/grupo/año
-- vuelva a crearse después de quedar inactiva. Los conflictos activos se validan
-- transaccionalmente en el servicio de asignaciones.
DROP INDEX "asignaciones_docente_docenteId_asignaturaId_grupoId_anioLectivoId_key";
CREATE INDEX "asignaciones_docente_docenteId_asignaturaId_grupoId_anioLectivoId_idx"
ON "asignaciones_docente"("docenteId", "asignaturaId", "grupoId", "anioLectivoId");
