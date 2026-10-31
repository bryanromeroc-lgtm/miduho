## Context

- Depende de `preparar-despliegue-produccion`: PostgreSQL 17, con `Json` de Prisma guardado como `jsonb`.
- El modelo académico ya existe (`prisma/schema.prisma`): `AnioLectivo`, `Periodo` (con `ponderacion`), `Grado`, `Grupo`, `Area`, `Asignatura`, `AsignaturaGrado`, `AsignacionDocente` (docente, asignatura, grupo, año; `ACTIVA`/`INACTIVA`) y `AsociacionEstudianteGrupo` (vigente si `finEn` es nulo).
- Convención de módulos: `src/server/modules/<dominio>/{servicio,reglas,esquemas,index}.ts`, con `crearServicioX(db)` para poder inyectar la base en las pruebas, y Route Handlers delgados en `src/app/api/`. El acceso por rol pasa por `src/server/http-acceso.ts`.
- Roles actuales: `ADMIN`, `DOCENTE`, `ESTUDIANTE`. Los estudiantes entran con usuario y contraseña.
- El equipo de desarrollo es el único autor de contenido, y hay un solo colegio. Los dispositivos son tabletas y computadores, con una red escolar que puede cortarse.
- La escala del SIEE aún no está definida (se decide después).

## Goals / Non-Goals

**Goals:**
- Un modelo de datos que no haya que rehacer cuando lleguen los tipos de juego, la escala del SIEE o las salas en vivo.
- Contenido curricular versionado, revisable en PR e inmutable una vez usado.
- Calificación confiable: en el servidor, reproducible y auditable ítem por ítem.
- Analítica por referente curricular posible desde el primer intento.

**Non-Goals:**
- Implementar tipos de juego concretos (solo se define el contrato y el catálogo planeado).
- Interfaces de usuario: pantalla de asignación de la docente, «mis actividades» del estudiante y reproductor. Van con el primer tipo, en el cambio `actividades-primeros-tipos` 🔶.
- Salas en vivo y tiempo real.
- Conversión a la escala del SIEE, ponderación de actividades dentro del período y boletines.
- Editor de actividades para docentes.
- Acceso de acudientes a los resultados.

## Decisions

### D1. Contenido curricular en git, no en la base
Las actividades y los referentes viven en `curriculo/` (raíz del repo) como JSON:

```
curriculo/
├─ referentes/<area>.json              # DBA, Estándares, institucionales
└─ actividades/<asignatura>/<grado>/<slug>.json
```

`scripts/importar-curriculo.ts` (`npm run curriculo:importar`) los valida y los vuelca a la base en una sola transacción. `deploy.sh` lo ejecuta después de `migrate`.
- **Por qué:** el autor es el equipo de desarrollo. Así cada actividad pasa por revisión en un PR, tiene historia en git y se prueba en CI antes de llegar a producción.
- *Alternativa:* un panel de administración para crear actividades. Descartada por ahora: es mucho trabajo de UI para un autor que ya trabaja en el repositorio. Si después las docentes crean actividades, el panel escribirá en las mismas tablas.
- Los medios pesados (imágenes, audio) van en `content/actividades/` (fuera de git), servidos por el proxy en `/medios/actividades/*` igual que los libros. El JSON los referencia por ruta, y la importación verifica que existan.

### D2. Versiones inmutables identificadas por hash
`Actividad` es la identidad estable (`slug`). `VersionActividad` guarda `tipo`, `versionEsquema`, `contenido jsonb`, `puntajeMaximo` y `hash` (SHA-256 del JSON canónico, con llaves ordenadas). La importación crea una versión solo si el hash es nuevo. Las asignaciones apuntan a una versión, nunca a la actividad «en general». Así una corrección no cambia las preguntas de un intento ya respondido ni de una nota ya puesta.
- Un trigger de PostgreSQL rechaza `UPDATE` y `DELETE` sobre `versiones_actividad`, como cinturón de seguridad además del código.

### D3. Contrato de tipos como objeto TypeScript con esquemas Zod
```ts
interface DefinicionTipoActividad<C, R> {
  tipo: string;                       // "seleccion-multiple"
  versionEsquema: number;             // permite evolucionar el formato
  esquemaContenido: z.ZodType<C>;
  esquemaRespuesta: z.ZodType<R>;
  items(contenido: C): { itemId: string; puntajeMaximo: number; referentes?: string[] }[];
  paraEstudiante(contenido: C): unknown;   // sin soluciones
  calificar(contenido: C, itemId: string, respuesta: R):
    { correcta: boolean; puntaje: number; puntosJuego?: number };
}
```
Vive en `src/features/actividades/tipos/contrato.ts`, con el registro en `registro.ts`. Va en `features` y no en `server` porque el mismo módulo de cada tipo exportará después su componente de React. La calificación se importa solo desde el servidor, y `paraEstudiante` es lo único que viaja al cliente.
- `calificar` es pura y por ítem: permite calificar al guardar cada respuesta (retroalimentación inmediata si el tipo la usa) y recalcular un intento completo de forma determinista.
- *Alternativa:* H5P. Descartada: el servidor para Node es GPL-3.0, el formato y los datos quedan atados a H5P, y la accesibilidad y el idioma quedan fuera de nuestro control.

### D4. Catálogo de tipos planeados (definidos, no implementados)

| Tipo | Contenido | Respuesta a un ítem | Calificación |
|---|---|---|---|
| `seleccion-multiple` | Preguntas con enunciado, opciones e índice correcto; V/F es el caso de 2 opciones | Índice elegido | 1 si coincide |
| `emparejar` | Pares izquierda–derecha (texto o imagen) | Mapa `izquierda → derecha` | Proporcional por pares correctos |
| `ordenar` | Elementos con su orden correcto | Lista ordenada de ids | Proporcional por posiciones correctas 🔶 |
| `clasificar` | Categorías y elementos con su categoría | Mapa `elemento → categoría` | Proporcional por elementos bien ubicados |
| `completar` | Texto con huecos y respuestas aceptadas por hueco | Texto por hueco | Comparación sin tildes ni mayúsculas, por hueco |
| `memoria` | Parejas de cartas | Secuencia de volteos | Completar = puntaje máximo. Los errores restan solo puntos de juego |
| `concurso` | Preguntas de selección múltiple con tiempo por pregunta | Índice y milisegundos | Acierto = nota; rapidez = puntos de juego |

Cada ítem tiene un `itemId` estable dentro de la actividad, que la importación verifica que no se repita. Es la llave de `RespuestaItem` y de la analítica.

### D5. Modelo de datos

```
ReferenteCurricular (codigo único, tipo, areaId, gradoDesdeOrden, gradoHastaOrden, enunciado, fuente)
Actividad          (slug único, titulo, asignaturaId, gradoId, periodoSugerido?, estado ACTIVA|RETIRADA)
  ├─ ActividadReferente (actividadId, referenteId)
  └─ VersionActividad   (actividadId, numero, tipo, versionEsquema, contenido jsonb, puntajeMaximo, hash) — inmutable
AsignacionActividad (versionActividadId, asignacionDocenteId, grupoId, periodoId,
                     abreEn, cierraEn, maxIntentos?, cuentaComoNota, estado PUBLICADA|ANULADA, creadoPorId)
IntentoActividad    (asignacionActividadId, estudianteId, numero, estado EN_CURSO|ENVIADO,
                     iniciadoEn, enviadoEn?, cerradoAutomaticamente, puntaje, puntajeMaximo,
                     porcentaje decimal(5,2), puntosJuego, duracionMs)
  └─ RespuestaItem  (intentoId, itemId, respuesta jsonb, correcta, puntaje, puntosJuego,
                     tiempoMs, cambios, respondidaEn)                         — único (intentoId, itemId)
ResultadoActividad  (asignacionActividadId, estudianteId, intentoId, porcentaje, actualizadoEn) — PK compuesta
```

Restricciones en SQL (en la migración):
- Índice único parcial `(asignacionActividadId, estudianteId) WHERE estado = 'EN_CURSO'`: como máximo un intento abierto.
- `CHECK (cierraEn > abreEn)`, `CHECK (maxIntentos IS NULL OR maxIntentos >= 1)` y `CHECK (porcentaje BETWEEN 0 AND 100)`.
- Único `(asignacionActividadId, estudianteId, numero)`.
- Se guarda `asignacionDocenteId`, y no solo el docente, para que los permisos y la nota queden ligados a «esta asignatura en este grupo». Si la asignación docente pasa a `INACTIVA`, las asignaciones de actividades se conservan y la docente nueva las gestiona por la asignatura y el grupo.

### D6. `ResultadoActividad` materializado
El mejor intento se recalcula en la misma transacción del envío o del cierre automático, en vez de calcularse en cada consulta. La consulta de notas de un grupo es la operación más frecuente de la docente, y la tabla deja explícito qué intento sostiene cada nota (auditoría). Desempate: el primer intento enviado.

### D7. Cierre automático perezoso
No hay cola de trabajos todavía. Toda lectura de una asignación o de un intento (estudiante o docente) llama primero a `cerrarVencidos(asignacionId)`, que pasa a `ENVIADO` los intentos `EN_CURSO` de asignaciones con `cierraEn < ahora`, los califica y actualiza los resultados. Es idempotente y corre en transacción.
- *Alternativa:* un trabajo programado con pg-boss. Queda para cuando exista la cola (ARQ-09). La función será la misma.

### D8. Guardado por ítem e idempotencia
`PUT /api/actividades/intentos/:id/respuestas/:itemId` hace un upsert sobre `(intentoId, itemId)`: repetirlo no duplica nada, lo que protege contra los reintentos de una red escolar inestable. Responde en una sola transacción corta: validar la respuesta con el esquema del tipo, calificar y guardar. Así el intento se reanuda en cualquier dispositivo sin estado en el cliente.

### D9. API

| Método y ruta | Rol | Uso |
|---|---|---|
| `GET /api/actividades/catalogo` | DOCENTE | Actividades de sus asignaturas y grados (filtros: período, referente) |
| `POST /api/actividades/asignaciones` · `PATCH`/`DELETE …/:id` | DOCENTE | Asignar, editar, anular |
| `GET /api/actividades/asignaciones?grupoId&periodoId` | DOCENTE | Sus asignaciones |
| `GET /api/actividades/asignaciones/:id/resultados` | DOCENTE | Resultados por estudiante |
| `GET /api/actividades/resumen-referentes?grupoId&periodoId` | DOCENTE | Desempeño por DBA o estándar |
| `GET /api/actividades/mias` | ESTUDIANTE | Asignaciones visibles con su estado |
| `POST /api/actividades/asignaciones/:id/intentos` | ESTUDIANTE | Iniciar o reanudar (devuelve la vista segura) |
| `PUT /api/actividades/intentos/:id/respuestas/:itemId` | ESTUDIANTE | Guardar la respuesta a un ítem |
| `POST /api/actividades/intentos/:id/envio` | ESTUDIANTE | Enviar |

Los recursos de otro estudiante o de otro grupo responden `404` en lugar de `403`, para no revelar que existen.

## Risks / Trade-offs

- [Un error en una función `calificar` afecta notas ya puestas] → `calificar` es pura y se prueba con casos por tipo, y las respuestas crudas siempre se guardan. Un comando de recalificación de una versión (auditable, con fecha y motivo) queda como tarea del primer tipo implementado 🔶.
- [El autor único se vuelve cuello de botella del contenido] → Es una decisión consciente (R4). El formato JSON y la validación permiten que más adelante otra persona escriba actividades sin tocar código.
- [Enunciados de DBA y Estándares: derechos y exactitud] → Son documentos públicos del MEN. Se transcriben con su fuente y la importación exige el campo `fuente`. No se parafrasean como si fueran propios.
- [Contar como nota sin escala del SIEE] → El porcentaje es neutral y convertible. La conversión llega con el cambio del SIEE, sin migrar datos.
- [Cierre perezoso: un intento vencido sigue `EN_CURSO` en la base hasta que alguien lea] → Ninguna consulta de nota lo ve así, porque toda lectura cierra primero. Se documenta y se sustituye por el trabajo programado cuando exista la cola.
- [Crecimiento de `RespuestaItem`] → 250 estudiantes × ~4 actividades por semana × ~10 ítems × 40 semanas son unas 400 mil filas por año. PostgreSQL lo maneja con los índices `(intentoId)` y `(itemId)` sin particionar.

## Migration Plan

1. Migración con las tablas nuevas, sin tocar las existentes.
2. Importar referentes y actividades. En producción el registro está vacío, así que solo se cargan referentes hasta que exista el primer tipo.
3. Desplegar la API. Sin UI, nada cambia para los usuarios.
4. Para volver atrás: retirar las rutas. Las tablas nuevas no afectan nada existente.

## Open Questions

- 🔶 ¿Las docentes podrán poner o corregir una nota manual (ausencia justificada, falla técnica)? Hoy no está previsto; el modelo admite añadir `ajusteDocente` a `ResultadoActividad` sin migrar datos.
- 🔶 ¿Habrá retroalimentación inmediata por ítem (acierto o error al responder) o solo al enviar? La define cada tipo. Mostrarla con intentos ilimitados facilita adivinar.
- 🔶 ¿Se muestra una tabla de posiciones del grupo con los puntos de juego? Tiene implicaciones pedagógicas con niños de 6 a 10 años. Se recomienda decidirlo con las docentes.
- 🔶 Regla de puntaje parcial de `ordenar` (por posición exacta o por pares adyacentes): se decide al implementar el tipo.
