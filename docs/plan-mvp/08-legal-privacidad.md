# Seguridad, privacidad y cumplimiento legal — MIDUHO

**Propósito:** reunir la carpeta legal sin la cual ningún colegio puede cargar datos de menores.
**Fecha:** 2026-09-26
**Fuente:** [auditoría de producto](../auditoria-producto-2026-09-26.md), bóveda Obsidian (HU, RN, RNF), `docs/arquitectura-backend.md`.
**Convenciones:** IDs, prioridades, días y estados según el [índice del plan](README.md#cómo-usar-este-plan).

---

Ningún colegio puede cargar datos de menores sin esta carpeta legal: ~10 días propios más horas de abogado 🔶. El colegio es el responsable del tratamiento y MIDUHO el encargado (Ley 1581 de 2012 y Decreto 1377 de 2013); los controles técnicos de seguridad están en ARQ y QA.

| ID | Tarea | Terminado cuando | Prio. | Días | Depende de | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| LEG-01 | Contratar asesoría jurídica por horas en protección de datos y propiedad intelectual | Abogado contratado con alcance y presupuesto | P0 | 0,5 | — | Pendiente |
| LEG-02 | Política de tratamiento de datos de MIDUHO como encargado y apoyo al colegio con la suya como responsable | Políticas revisadas por el abogado | P0 | 1 | LEG-01 | Pendiente |
| LEG-03 | Contrato de transmisión de datos colegio–proveedor: finalidades, medidas de seguridad, subencargados (hosting, correo), confidencialidad, devolución y borrado | Contrato aprobado por ambas partes | P0 | 1 | LEG-02 | Pendiente |
| LEG-04 | Formato de autorización del acudiente para tratar los datos del estudiante (interés superior del menor y su opinión), con versión y registro en el sistema (RNF-DAT-2) | Formato aprobado y cargado en el primer ingreso (IMP-AUT-07) | P0 | 0,5 | LEG-02 | Pendiente |
| LEG-05 | Aviso de privacidad y términos de uso accesibles desde el sistema (RNF-DAT-4), con una versión en lectura fácil para niños | Publicados y enlazados desde el pie y el primer ingreso | P0 | 1 | LEG-02 | Pendiente |
| LEG-06 | Transferencia internacional: verificar el país del hosting y del correo frente a la lista de países con nivel adecuado de la SIC, o elegir región y proveedor en consecuencia | Decisión documentada con la lista de subencargados | P0 | 0,5 | ARQ-01 | Pendiente |
| LEG-07 | Inventario de datos personales: dato, finalidad, base legal, retención y quién accede (RNF-DAT-1) | Matriz aprobada; ningún campo sin finalidad | P0 | 1 | DSC-12 | Pendiente |
| LEG-08 | Procedimiento de consultas y reclamos del titular con los plazos de la Ley 1581 🔶 confirmar con el abogado | Procedimiento publicado y probado con IMP-ADM-02 | P1 | 0,5 | LEG-02 | Pendiente |
| LEG-09 | Protocolo de incidentes de seguridad: a quién se avisa (colegio, familias, SIC), en qué plazo y con qué plantilla 🔶 | Protocolo aprobado y ensayado en QA-12 | P0 | 0,5 | LEG-01 | Pendiente |
| LEG-10 | Confirmar si el colegio debe inscribir sus bases de datos en el RNBD y apoyarlo | Respuesta documentada | P1 | 0,25 | LEG-01 | Pendiente |
| LEG-11 | Matriz de licencias por obra (fuente, licencia, evidencia, vigencia, atribución) y política de retiro de contenido | Todo el catálogo publicado tiene su fila en la matriz | P0 | 1 | F0-03 | Pendiente |
| LEG-12 | Términos para el material que suben los docentes: derechos, responsabilidad y retiro | Se aceptan al subir el primer archivo | P1 | 0,5 | LEG-02 | Pendiente |
| LEG-13 | Política de uso aceptable y protección infantil: sin mensajería privada adulto–niño, moderación y reporte de contenido | Política publicada y reflejada en IMP-MSG-02 | P0 | 0,5 | LEG-01 | Pendiente |
| LEG-14 | Nombre comercial independiente del colegio si se vende a otros (MIDUHO viene de «Mi Dulce Hogar») y registro de marca 🔶 | Nombre elegido y solicitud radicada | P1 | 1 | F0-16 | Pendiente |
| LEG-15 | Acordar con el colegio la propiedad del software y de los datos: licencia de uso o desarrollo a la medida | Cláusula incluida en el contrato (COM-05) | P0 | 0,5 | F0-16 | Pendiente |

---

[← Anterior](07-calidad-pruebas.md) · [Índice](README.md) · [Siguiente →](09-operacion.md)
