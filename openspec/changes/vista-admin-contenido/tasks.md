> **Regla de ejecución:** todo trabajo de interfaz se hace con impeccable. Cada sesión empieza con `impeccable context`, y cada grupo nombra su comando. Los grupos sin UI lo dicen. Antes de crear rutas dinámicas leer `apps/web/node_modules/next/dist/docs/` (Next.js 16: `params` es asíncrono). Nada se commitea sin pedirlo.

## 1. Contexto y contrato (`impeccable context`, `impeccable surface-brief write`)

- [x] 1.1 Ejecutar `impeccable context` y leer en `node_modules/next/dist/docs/` la guía de rutas dinámicas y `notFound`
- [x] 1.2 Escribir con `impeccable surface-brief write` el contrato de `/admin/contenido` (matriz por área, tres estados de celda, D7) y de la franja «Vista previa»; releerlo

## 2. Servicio de consulta (sin UI)

- [x] 2.1 Crear `src/server/modules/contenido/` (`servicio.ts`, `index.ts`) con `crearServicioContenido(db, catalogo)` e `import "server-only"`, según la convención de `academico` (design D2)
- [x] 2.2 `indice()`: áreas por `orden` y nombre, asignaturas por nombre, todos los grados por `orden`, y cada celda `no-se-dicta` / `sin-contenido` / `con-contenido` con el conteo real del catálogo
- [x] 2.3 `materia(asignaturaId, gradoOrden)` y `actividad(asignaturaId, gradoOrden, slug)`: `null` si no existe, si no se dicta en ese grado o si el slug no es de esa asignatura y grado; tarjetas sin estrellas, intentos ni fechas y con `href` bajo `/admin/contenido`
- [x] 2.4 Pruebas unitarias del servicio con dobles: orden, los tres estados de celda, grado sin `AsignaturaGrado`, 404 de materia y de actividad
- [x] 2.5 Prueba de coherencia: cada carpeta de `curriculo/actividades/` corresponde a una asignatura del seed (riesgo de nombres que no normalizan igual)

## 3. Permisos y navegación (sin UI nueva)

- [x] 3.1 `FamiliaRuta` `LABORATORIOS` en `src/server/auth/sesion.ts` (admite `ADMIN`, `DOCENTE`, `ESTUDIANTE`) y asignarla a `/laboratorios/**` en `proxy.ts` (D5)
- [x] 3.2 `src/lib/navegacion.ts`: ruta `contenido → /admin/contenido`, menú `ADMIN` en el orden del spec (D6), y `/laboratorios` fuera de `esRutaMaqueta` para que conserve el contexto guardado
- [x] 3.3 Pruebas: `puedeAccederRuta` para `LABORATORIOS` por rol; menú `ADMIN`; `contextoVisible` en `/laboratorios` para `ADMIN`, `DOCENTE`, `ESTUDIANTE` y `DOCENTE + ADMIN` en ambos contextos; el resto de rutas de maqueta sin cambios
- [x] 3.4 Prueba de que el contexto `ADMIN` ve en la Biblioteca los títulos `soloDocente`

## 4. Índice por área (`/impeccable craft`)

- [x] 4.1 `src/app/admin/contenido/page.tsx` delgada: `exigirRolPagina(["ADMIN"])` y el servicio; componentes en `src/features/contenido-coordinacion/`
- [x] 4.2 Matriz por área como `<table>` con `caption`, `th scope` de fila y columna, enlaces con nombre accesible completo, «Sin contenido» y «No se dicta» como texto sin enlace en «No se dicta», y contenedor desplazable enfocable en pantallas angostas (D7)
- [x] 4.3 Acceso «Contenido pedagógico» en el Dashboard de `/admin`

## 5. Vista previa de la materia y de la actividad (`/impeccable craft`)

- [x] 5.1 Prop `modo` en `VistaMateria` (por defecto `estudiante`): franja «Vista previa · {grado}», «Volver a Contenido», tarjetas sin estrellas, intentos ni fechas, y estado vacío «Aún no hay actividades para {grado}» (D3)
- [x] 5.2 `src/app/admin/contenido/[asignatura]/[grado]/page.tsx`: `exigirRolPagina(["ADMIN"])`, servicio, `notFound()` si devuelve `null`
- [x] 5.3 Modo `vista-previa` del `Reproductor`: aviso «Vista previa: este resultado no se guarda» y vuelta a la vista previa de la materia (D4); 🔶 alinear el nombre de la prop con `actividades-en-clase` si ese cambio ya lo definió
- [x] 5.4 `src/app/admin/contenido/[asignatura]/[grado]/actividades/[id]/page.tsx` con la misma escena y encabezado que la del estudiante
- [x] 5.5 Pruebas de los componentes en ambos modos: la vista del estudiante sigue sin franja y con «Volver a Mis materias»

## 6. Pulido y verificación (`/impeccable critique`, `/impeccable polish`, `a11y-audit`)

- [x] 6.1 `/impeccable critique` y `/impeccable polish` sobre la matriz y la franja de vista previa
- [x] 6.2 Verificar en el navegador como `ADMIN` (con datos ficticios del seed): matriz con todos los grados, una celda de cada estado, vista previa sin scroll a 1440×900, 1280×800 y 1024×768, jugar una actividad, Laboratorios completo, Biblioteca con guías, y 375 px sin scroll horizontal de página
- [x] 6.3 Verificar como `ESTUDIANTE` y `DOCENTE` que su menú, `/materias/**` y `/laboratorios` siguen igual, y que `/admin/contenido` los redirige
- [x] 6.4 `a11y-audit` de `/admin/contenido` y de la vista previa (WCAG 2.1 AA): teclado, foco visible, contraste ≥ 4.5:1, lector de pantalla en la matriz
- [x] 6.5 `npm run build`, `npm run lint` y `npm test` en verde
