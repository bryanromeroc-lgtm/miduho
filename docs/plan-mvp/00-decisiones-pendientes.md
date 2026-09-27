# Decisiones pendientes — MIDUHO

**Propósito:** reunir las decisiones que cambian el alcance, la arquitectura o la fecha del plan, con sus opciones y una recomendación, para decidir antes de que bloqueen tareas.
**Fecha:** 2026-09-26
**Fuente:** tareas de este plan, [auditoría de producto](../auditoria-producto-2026-09-26.md), `08-Decisiones/Preguntas-abiertas.md` de la bóveda.
**Convenciones:** las recomendaciones son [P] propuestas; 🔶 = por confirmar. Estado: Abierta o Tomada.

---

Estas 11 decisiones cambian el plan. D-01, D-02 y D-09 bloquean trabajo de octubre y noviembre de 2026; las demás se cierran en el descubrimiento con el colegio.

| ID | Decisión | Opciones | Recomendación [P] | Qué cambia en el plan | Decide | Antes de | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-01 | ¿Solo Mi Dulce Hogar o varios colegios? (F0-16) | A) Instancia dedicada sin `institucionId`, como dice RNF-MAN-1 · B) Multi-colegio con `institucionId` y Row-Level Security | B si hay cualquier intención de vender a un segundo colegio: ahora cuesta ~3 días (ARQ-04 e IMP-ADM-05 suben a P0); con datos reales cuesta semanas | ARQ-03, ARQ-04, IMP-ADM-05, UX-03, LEG-14 | Tú | ARQ-03 (nov 2026) | Abierta |
| D-02 | Capacidad para el piloto de julio de 2027 | A) Una persona, sin colchón · B) Sumar a alguien al 50 % desde enero de 2027 para diseño y pruebas (~42 días P0) · C) Piloto solo con docentes, sin cuentas de estudiantes: ahorra ~8,5 días (UX-08, IMP-AUT-03, IMP-CLA-08, PIL-07) pero no prueba el acceso infantil · D) Mover el piloto al período 3 (agosto–septiembre de 2027) | B; si no es posible, D | Todo el [cronograma](12-cronograma-riesgos.md) | Tú | dic 2026 | Abierta |
| D-03 | ¿Reemplazar o complementar el sistema de notas del colegio? (DSC-04) | A) Reemplazar: IMP-EVA-02 a IMP-EVA-05 (~9,5 días) · B) Complementar: exportar al sistema actual con IMP-EVA-06 (1,5 días) | Depende de lo que el colegio ya use; B acorta R2 en ~8 días | IMP-EVA, UX-12 | Colegio y tú | DSC-12 | Abierta |
| D-04 | ¿Entran los acudientes desde el piloto? (DSC-03, P2 de la bóveda) | A) Sí, con portal desde R1 · B) No: autorizaciones firmadas en R1 y portal en R2 | B: el plan ya ubica el acceso de acudientes en P1 | IMP-AUT-04, IMP-ACA-07, PIL-03 | Colegio | DSC-03 | Abierta |
| D-05 | ¿Cuántas asignaturas entran al piloto? (P12) | A) Literatura, Robótica y Emprendimiento · B) Las 14 asignaturas de 1.° | Solo las que tengan contenido cargado antes del piloto: una clase vacía repite el fracaso de la referencia | DSC-11, PIL-04 | Colegio | DSC-03 | Abierta |
| D-06 | ¿Cómo entran los estudiantes de 6 a 10 años? (DSC-08) | A) Tarjeta QR · B) PIN de imágenes · C) Ambas | Decidir con las docentes según los dispositivos reales (DSC-05) 🔶 | UX-06, IMP-AUT-03, PIL-07 | Docentes | UX-06 | Abierta |
| D-07 | ¿Qué librería de autenticación? (ARQ-06) | A) Better Auth · B) Auth.js v5 con sesiones en base de datos | A: sesiones revocables, usuario sin correo, límite de intentos y 2FA en la misma librería | ARQ-06, IMP-AUT | Tú | ARQ-06 | Abierta |
| D-08 | ¿Dónde se aloja? (OPS-01) | A) Gestionado: app, PostgreSQL con PITR y almacenamiento de objetos, USD 30–70/mes 🔶 · B) VPS propio, USD 10–30/mes 🔶 · C) Servidor en el colegio | A: respaldos y TLS incluidos. C no se recomienda | OPS-01 a OPS-04, LEG-06 | Tú y el abogado | OPS-01 | Abierta |
| D-09 | ¿Qué pasa con las obras de Maguaré? (F0-03) | A) Esperar la autorización escrita · B) Catálogo solo de dominio público, CC BY y licencias del colegio | B mientras no llegue A; nunca publicar sin autorización | F0-04, IMP-BIB-02, LEG-11 | Tú | R0 (nov 2026) | Abierta |
| D-10 | ¿Quién paga y cuánto? (COM-03, COM-04) | A) Presupuesto propio del colegio · B) Cobro a las familias dentro de los costos del año escolar 🔶 | Confirmarlo con rectoría pronto: B tiene un plazo antes de cada año escolar | COM-03 a COM-05 | Rectoría | dic 2026 🔶 | Abierta |
| D-11 | ¿Nombre comercial propio? (LEG-14) | A) Mantener MIDUHO · B) Nombre independiente del colegio | B si D-01 = varios colegios: MIDUHO viene de «Mi Dulce Hogar» | LEG-14, COM-09 | Tú | COM-09 | Abierta |

Al cerrar una decisión: cambia su estado a «Tomada», escribe la opción elegida y la fecha en la columna de recomendación, ajusta las prioridades de las tareas afectadas y regístrala en `08-Decisiones` de la bóveda (como ADR en `docs/adr/` si es técnica, ARQ-01).

---

[Índice](README.md) · [Siguiente →](01-definicion-mvp.md)
