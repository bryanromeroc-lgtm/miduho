## Why

«Mis materias» ya lleva al estudiante hasta la puerta de cada asignatura, pero el botón «Entrar a…» aún cae en pantallas provisionales (Laboratorios, Biblioteca, «Mis clases» con datos demo). Falta **el lugar propio de cada materia**: una pantalla completa donde el estudiante vea las actividades que su docente le asignó y las abra para hacerlas.

La imagen de referencia que aportó el operador (2026-10-31) es solo un ejemplo del tipo de vista: encabezado de la materia y cuadrícula de tarjetas de actividad. No se copia su ilustración, su mascota ni su texto (regla dura 2); se toma únicamente el esquema (título + cuadrícula centrada de tarjetas + botón de entrada por tarjeta).

El operador fijó además una dirección visual para estas vistas, **igual para todas las materias**:
- **2D flat moderno y lúdico**: sin 3D, sin relieves, sin texturas realistas y sin contornos negros gruesos.
- **Layout centrado y amplio** con cuadrícula de tarjetas interactivas, **sin panel lateral**.
- **Temática estricta**: bordes de tarjetas, cabecera, utilería escolar (clips, cintas, chinches) y elementos sueltos representan conceptos de *esa* materia. Prohibida la decoración genérica (bosques, madera) sin relación con el tema.
- **Fondo** pastel neutro y claro, solo con marcas de agua muy sutiles y desaturadas de símbolos de la materia.
- El desarrollo se hace con **impeccable**, en cada fase.

**Corte con `identidad-visual` (decidido 2026-10-31):** «Mis materias» conserva su estilo sticker; la vista de materia es **toda flat**, incluido su encabezado propio (no usa `MarcoJuego`).

## What Changes

- **Nueva ruta `/materias/[asignatura]`** (contexto ESTUDIANTE): vista a pantalla completa de una asignatura de su grupo, con cabecera temática, cuadrícula de tarjetas de actividad y botón «Volver a Mis materias».
- **Tarjeta de actividad** reutilizable, con estados reales: pendiente, en curso, hecha (estrellas, mejor intento), con intentos agotados, por abrir (aún no empieza) y cerrada. Cada tarjeta lleva al reproductor de la actividad.
- **Kit temático por materia** para las 10 materias ya definidas (lectura, matemáticas, naturales, inglés, robótica, emprendimiento, ética, artística, física, sociales) más una genérica escolar para materias sin coincidencia: paleta pastel, marcas de agua, cabecera, utilería y marcos de tarjeta, todo en SVG vectorial plano de autoría propia.
- **Fondo de la materia**: tono pastel neutro por materia + patrón de marcas de agua desaturadas.
- **Paginación** de la cuadrícula (6 tarjetas por página en escritorio, en una pantalla sin scroll) y estados vacío, «en preparación» y sin intentos.
- **Conexión de «Mis materias»**: `claseHref` de cada cromo pasa a `/materias/[asignatura]`.
- **Contrato de datos** `VistaMateria` con actividades opcionales: hoy `fundacion-actividades` no tiene API, así que la vista real muestra el estado «Aún no hay actividades» y nunca actividades inventadas. Una ruta de muestra con datos ficticios rotulados permite revisar el diseño.

## Capabilities

### New Capabilities

- `vista-materia`: pantalla completa de una asignatura del estudiante. Cubre ruta y permisos, composición sin sidebar, cuadrícula y paginación, estados vacíos y adaptación a pantallas.
- `tarjeta-actividad-materia`: tarjeta interactiva de actividad de la vista de materia. Cubre anatomía, estados, estrellas e intentos, y acceso al reproductor.
- `decoracion-tematica-materia`: kit visual por materia en estilo flat. Cubre reglas de estilo, temática estricta por materia, fondo pastel con marcas de agua, accesibilidad y no copia de referentes.

### Modified Capabilities

(Ninguna: `openspec/specs/` aún no tiene especificaciones. El cambio de `claseHref` en «Mis materias» se declara en `design.md` y en las tareas; si `rediseno-identidad-juvenil` se archiva antes, pasará a ser un delta de `tablero-materias`.)

## Impact

- **Rutas:** `src/app/materias/[asignatura]/page.tsx` (delgada) y `src/app/muestras/materia/page.tsx` (datos ficticios rotulados).
- **UI nueva:** `src/features/materias/vista/` (vista, tarjeta, paginación, estados) y `src/features/materias/tematica/` (kits SVG, fondo, tokens por materia).
- **Backend:** `src/server/modules/materias/` agrega `vistaMateria(usuario, asignaturaId)`: valida que la asignatura sea del grupo activo del estudiante y arma el contrato; un puerto `ActividadesDeMateria` (vacío hoy) se conecta cuando exista `fundacion-actividades`.
- **Compartido:** `src/lib/materias.ts` (tipo `VistaMateria`, `ActividadResumen`), `src/lib/escenas.ts` (reutiliza `escenaDe`), `src/lib/estrellas.ts` y `src/lib/desempeno.ts` (reutilizados).
- **Estilos:** módulos CSS propios; los tokens de color por materia se amplían, sin tocar `.cosmos` ni Laboratorios.
- **Sin cambios:** Laboratorios, Biblioteca, inicio docente, esquema de base de datos.
- **Relación con otros cambios:** depende de `rediseno-identidad-juvenil` (shell, cromos, escenas, desempeño) y, para datos reales de actividades, de `fundacion-actividades`. El **reproductor de actividades** (jugar de verdad) queda fuera: este cambio entrega la vista y la entrada. 🔶
- **Reglas duras:** sin datos de menores (muestras ficticias sin nombres de personas), sin contenido protegido, WCAG 2.1 AA con decoración `aria-hidden`/`alt=""`, español de Colombia.
