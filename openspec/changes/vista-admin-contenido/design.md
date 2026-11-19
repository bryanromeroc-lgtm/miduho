## Context

El rol `ADMIN` lo ejerce la coordinadora del colegio (DC-09). Su contexto tiene hoy Dashboard, Usuarios, Estudiantes, Estructura, Asignaciones y Cuenta (Incremento 1R). El contenido pedagógico existe en tres lugares, y ninguno está pensado para ella:

| Contenido | Dónde vive | Cómo se arma | ¿ADMIN entra hoy? |
|---|---|---|---|
| Actividades de una materia | `curriculo/actividades/<asignatura>/<grado>/*.json`, leídas por `catalogoActividades` | `vistaMateriaDeSesion`: sesión `ESTUDIANTE` → grupo → grado → catálogo | No: familia `GENERAL` y servicio exclusivo del estudiante |
| Biblioteca | `@/data/demo` (`TITULOS`) + `content/libros` | Igual para todos; el estudiante no ve `soloDocente` | Sí (familia `BIBLIOTECA`), pero no está en su menú |
| Laboratorios | `features/laboratorios` (programas, bloques, unidades) | Igual para todos, sin progreso ni bloqueos | No: familia `GENERAL` |

Estructura académica disponible: `Area` (tipo, orden) → `Asignatura` (`areaId`) → `AsignaturaGrado` (en qué grados se dicta) → `Grado` (`orden`, todos los del colegio). El catálogo se indexa por nombre normalizado de la asignatura (`carpetaAsignatura`) y orden del grado.

Restricciones: reglas duras de AGENTS.md (sin datos de menores, WCAG 2.1 AA, marcar lo no confirmado 🔶, español de Colombia); Next.js 16 (leer `node_modules/next/dist/docs/` antes de escribir rutas); `src/server/**` nunca se importa desde un Componente Cliente.

## Goals / Non-Goals

**Goals:**
- Que la coordinadora vea **todo** el contenido pedagógico del colegio por área, asignatura y grado, incluidos los grados sin material.
- Que vea cada materia **como la verá el estudiante** y pueda jugar sus actividades, sin que nada se guarde.
- Biblioteca y Laboratorios en su menú, con Laboratorios completo.
- Cero cambios en lo que ve el estudiante y la docente.

**Non-Goals:**
- Editar actividades, malla, referentes o mapa de cobertura (cambio posterior, después de `actividades-en-clase`).
- Asignar actividades, ver intentos o resultados de estudiantes.
- Auditoría de accesos (RF-ADMIN-4), rol `COORDINACION` separado.
- Leer el catálogo desde la base: eso lo trae `actividades-en-clase`.

## Decisions

### D1. Rutas propias bajo `/admin/contenido`, no `/materias?grado=`

```
/admin/contenido                                   índice por área (matriz)
/admin/contenido/[asignatura]/[grado]              vista previa de la materia
/admin/contenido/[asignatura]/[grado]/actividades/[id]   actividad en vista previa
```

`[grado]` es el `orden` del grado (p. ej. `5`), estable y legible.

- **Por qué:** `/materias/**` tiene un contrato propio (spec `vista-materia`: 404 fuera del contexto `ESTUDIANTE`). Mezclar ahí a la coordinadora obligaría a ramificar cada servicio por rol. Bajo `/admin`, `proxy.ts` ya aplica la familia `ADMIN` y `contextoVisible` ya pinta la navegación `ADMIN`.
- **Alternativa descartada:** abrir `/materias/[asignatura]?grado=5` a `ADMIN`. Más corto, pero rompe un requisito vigente y acopla dos audiencias en el mismo servicio.

### D2. Un servicio de consulta para la coordinadora: `src/server/modules/contenido/`

`crearServicioContenido(db, catalogo)`, con la convención de `academico` y `materias` (fábrica con dependencias, pruebas con dobles):

- `indice()`: áreas ordenadas (`orden`, luego nombre), cada una con sus asignaturas, y la lista de **todos** los grados por `orden`. Cada celda asignatura × grado es una de:
  - `{ estado: "no-se-dicta" }` si no hay `AsignaturaGrado`;
  - `{ estado: "sin-contenido" }` si se dicta y el catálogo devuelve 0 actividades;
  - `{ estado: "con-contenido", actividades: n }`.
- `materia(asignaturaId, gradoOrden)`: datos de la vista previa, o `null` (→ 404) si la asignatura o el grado no existen. Una asignatura que no se dicta en ese grado también responde `null`.
- `actividad(asignaturaId, gradoOrden, slug)`: la actividad del catálogo, o `null`.

Solo lecturas. Cada función de página llama primero `exigirRolPagina(["ADMIN"], …)`; el servicio no confía en que la ruta ya lo haya hecho.

- **Por qué un módulo nuevo y no ampliar `materias`:** `materias` es el estudiante (grupo, avatar, desempeño). La coordinadora no tiene grupo; mezclar ambos casos ensucia las dos lógicas.

### D3. Reutilizar `VistaMateria` con un modo vista previa

`VistaMateria` ya recibe datos y enlace de volver por props. Se le agrega una prop de modo:

```ts
modo?: { tipo: "estudiante" } | { tipo: "vista-previa"; grado: string }  // por defecto estudiante
```

En vista previa: franja visible «Vista previa · 5.°» (texto real, no imagen), encabezado con «Volver a Contenido», tarjetas en estado `disponible` sin estrellas, intentos ni fechas, y `href` hacia `/admin/contenido/...`. La escena temática, la decoración y la paginación son las mismas.

El tipo de datos de la vista hoy incluye el grupo del estudiante; la vista previa usa una variante sin grupo (el servicio de D2 la arma). Lo que pinta la cabecera sale de `materia`, no del grupo.

- **Alternativa descartada:** una ficha sobria de catálogo. La coordinadora pidió ver lo que ven los niños (decisión del responsable del producto, 2026-11-10).

### D4. `Reproductor` en vista previa

Se le agrega `modo="vista-previa"`: la pantalla de resultado dice «Vista previa: este resultado no se guarda» en lugar del aviso de práctica libre. Hoy el reproductor tampoco guarda nada, así que el cambio es de texto y de enlaces de vuelta.

`actividades-en-clase` planea el mismo modo para que la docente pruebe sus quizzes. Si ese cambio llega primero, se usa el suyo; si llega después, adopta este. 🔶 Coordinar el nombre de la prop al implementar el que vaya segundo.

### D5. Laboratorios abierto a `ADMIN`

- `FamiliaRuta` gana `LABORATORIOS`, que admite `ADMIN`, `DOCENTE` y `ESTUDIANTE`. `proxy.ts` la asigna a `/laboratorios/**`.
- `contextoVisible` trata `/laboratorios` como hoy trata Biblioteca: conserva el contexto guardado. Así una cuenta `DOCENTE + ADMIN` en contexto `ADMIN` sigue viendo su menú de coordinadora, y en contexto `DOCENTE` el suyo. Hoy `/laboratorios` está en `esRutaMaqueta` y fuerza el menú `DOCENTE`; hay que sacarla de ahí sin cambiar el resto de rutas de maqueta.
- Laboratorios no tiene bloqueos hoy. Se fija como requisito que la coordinadora vea todas las unidades disponibles, para que una progresión futura no la bloquee.

### D6. Menú del contexto `ADMIN`

`POR_CONTEXTO.ADMIN = ["dashboard", "contenido", "biblioteca", "laboratorios", "usuarios", "estudiantes", "estructura", "asignaciones", "cuenta"]`, con la ruta nueva `contenido → /admin/contenido`, etiqueta «Contenido». El Dashboard agrega la tarjeta de acceso «Contenido pedagógico».

### D7. Matriz accesible

La matriz es una `<table>` por área, con `<caption>` (nombre del área), `<th scope="col">` por grado y `<th scope="row">` por asignatura. Cada celda con contenido es un enlace con nombre completo («Matemáticas, 5.°: 8 actividades»). «Sin contenido» y «No se dicta» son texto, se distinguen por palabra y no solo por color, y no son enlaces. En pantallas angostas la tabla se desplaza horizontalmente dentro de su propio contenedor (con `tabindex="0"` y nombre accesible), nunca la página.

## Risks / Trade-offs

- [El catálogo se indexa por nombre de carpeta; si el nombre de una `Asignatura` en la base no normaliza igual, su celda dirá «Sin contenido» aunque haya archivos] → prueba que recorre las carpetas de `curriculo/actividades/` y exige que cada una corresponda a una asignatura del seed; el servicio registra en desarrollo las carpetas sin asignatura.
- [Reutilizar `VistaMateria` puede romper la vista del estudiante] → el modo por defecto es `estudiante`; las pruebas existentes de la vista y el chequeo sin scroll a 1440×900, 1280×800 y 1024×768 se repiten en ambos modos.
- [Sacar `/laboratorios` de `esRutaMaqueta` cambia qué menú ve una cuenta `DOCENTE + ADMIN`] → prueba de `contextoVisible` para las cuatro combinaciones de rol y contexto en `/laboratorios`.
- [La Biblioteca del estudiante oculta `soloDocente` según el contexto en el cliente] → la coordinadora ve la versión docente; no cambia nada, pero se añade una prueba de que el contexto `ADMIN` ve las guías.
- [Muchos grados vacíos hoy (casi todo el catálogo es de 5.°)] → es lo pedido: la matriz muestra lo que falta. 🔶 El conteo por grado sale del catálogo en git hasta que exista la base de `actividades-en-clase`.

## Migration Plan

Sin migración de base: no hay tablas nuevas ni cambios de esquema. Se despliega como cualquier cambio de código. Para revertir basta con quitar las rutas y el ítem del menú; ningún dato depende de esto.

## Open Questions

- 🔶 ¿La matriz debe mostrar también los títulos de la Biblioteca por área o grado? Hoy los libros no tienen asignatura ni grado en el catálogo demo (solo rango de edad), así que esta versión los deja en su propia sección.
- 🔶 Robótica y Emprendimiento aparecen en la matriz con sus actividades de `curriculo/actividades/`, pero las unidades de Laboratorios (`features/laboratorios`) no se cuentan ahí: viven en su propia sección. ¿Conviene enlazar la fila de Robótica o Emprendimiento con su mundo en Laboratorios?
