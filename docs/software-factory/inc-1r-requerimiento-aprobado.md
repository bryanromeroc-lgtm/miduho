# Incremento 1R — Fundación integrada de acceso y administración

**Estado:** requerimiento aprobado para implementación  
**Aprobado:** 2026-10-01  
**Fuente de decisión:** entrevista de requisitos con el responsable del producto mediante `grill-me`  
**Sustituye como criterio de aceptación:** el alcance previo del Incremento 1 que fue marcado como terminado sin integrar la autenticación con la maqueta.

## 1. Objetivo

Entregar una base funcional integrada con la maqueta existente que permita autenticación real, administración de usuarios y estructura académica, asociación de estudiantes con grupos, asignación docente con horarios y experiencias diferenciadas para `ADMIN`, `DOCENTE` y `ESTUDIANTE`.

El incremento se aprueba funcionando en entorno local/LAN, con pruebas reproducibles y código publicado en GitHub. El despliegue público en producción queda fuera.

## 2. Roles y combinaciones válidas

Los únicos roles del Incremento 1R son:

- `ADMIN`
- `DOCENTE`
- `ESTUDIANTE`

Combinaciones permitidas:

- `ADMIN`
- `DOCENTE`
- `ESTUDIANTE`
- `DOCENTE + ADMIN`

No se permiten `ESTUDIANTE + DOCENTE` ni `ESTUDIANTE + ADMIN`.

Se retiran del seed, modelo funcional, rutas e interfaz de este incremento los roles `COORDINACION` y `ACUDIENTE`, incluido `AcudienteEstudiante`. Podrán reintroducirse posteriormente mediante nuevas migraciones.

### 2.1 ADMIN

Puede:

- crear, editar, activar y desactivar usuarios;
- crear un ADMIN puro mediante invitación;
- promover un DOCENTE existente a ADMIN;
- administrar años, períodos, áreas, grados, grupos y asignaturas;
- asociar estudiantes con grupos;
- asignar docentes a asignaturas, grupos, años y horarios;
- asignar un DOCENTE activo como director de grupo;
- reasignar estudiantes y docentes con confirmación;
- generar y restablecer credenciales estudiantiles;
- consultar todos los grupos.

Navegación del contexto ADMIN: Dashboard, Usuarios, Estructura académica, Asignaciones y Cuenta. Si también es DOCENTE, el selector de contexto permite acceder a Mi curso.

Nunca se puede desactivar ni retirar el rol al último ADMIN activo.

### 2.2 DOCENTE

Usa la experiencia general del estudiante y añade la sección **Mi curso**. Puede consultar únicamente grupos donde tenga al menos una asignación activa.

Mi curso muestra:

- grupos asignados;
- asignaturas por grupo;
- bloques de horario;
- estudiantes del grupo: nombre completo, correo y estado.

Puede restablecer las credenciales de uno o varios estudiantes de sus grupos y descargar una sola vez las nuevas credenciales generadas.

No puede editar identidad, correo, rol, estado o grupo de un usuario. El perfil académico detallado, las calificaciones, entregas y observaciones quedan fuera.

Navegación: Hoy, Mis clases, Biblioteca, Laboratorios, Agenda, Mi curso y Cuenta.

### 2.3 ESTUDIANTE

Conserva la maqueta existente como experiencia principal. Ve su nombre y grupo reales; las clases, el calendario, los laboratorios y los contenidos continúan temporalmente con la información demostrativa actual.

Navegación: Hoy, Mis clases, Biblioteca, Laboratorios, Agenda y Cuenta.

No puede cambiar su propia contraseña en este incremento. La restablecen ADMIN o un DOCENTE autorizado.

### 2.4 Cambio de contexto

Una cuenta `DOCENTE + ADMIN` tiene un selector visible para cambiar de contexto. Se recuerda el último contexto usado; en el primer acceso entra como ADMIN.

## 3. Acceso y protección de rutas

Solo son públicas:

- `/login`;
- solicitud de recuperación;
- establecimiento de contraseña mediante invitación o recuperación.

Inicio, clases, biblioteca, laboratorios, agenda, cuenta, Mi curso y administración requieren autenticación. La biblioteca está disponible para todos los roles autenticados.

La autorización se valida en servidor usando la sesión, el estado actual y los roles actuales de la cuenta. La presencia de una cookie no constituye autorización.

Matriz mínima:

| Función | ADMIN | DOCENTE | ESTUDIANTE |
|---|---:|---:|---:|
| Panel administrativo | Sí | No | No |
| Contexto general de la maqueta | Solo si también es DOCENTE | Sí | Sí |
| Biblioteca | Sí | Sí | Sí |
| Mi curso | Solo si también es DOCENTE | Sí | No |
| Consultar todos los grupos | Sí | No | No |
| Estudiantes de grupos asignados | Sí | Sí | No |
| CRUD académico y usuarios | Sí | No | No |
| Restablecer credenciales estudiantiles | Sí | Solo grupos asignados | No |

## 4. Ciclo de cuenta y autenticación

Estados:

- `PENDIENTE_ACTIVACION`
- `ACTIVO`
- `INACTIVO`

### 4.1 Primer ADMIN

Se crea mediante seed seguro. Los administradores adicionales pueden ser ADMIN puros creados por invitación o DOCENTES promovidos.

Una invitación de ADMIN vence en 24 horas. ADMIN puede reenviarla. En desarrollo, el enlace se imprime en consola; SMTP productivo queda fuera.

### 4.2 DOCENTE

ADMIN crea la cuenta y el sistema genera una contraseña temporal. La cuenta queda ACTIVA, pero debe cambiar la contraseña obligatoriamente en el primer ingreso.

ADMIN y DOCENTE pueden usar “Olvidé mi contraseña”. La respuesta nunca revela si existe la cuenta. En desarrollo, el enlace se imprime en consola.

### 4.3 ESTUDIANTE

El sistema genera una contraseña aleatoria legible de al menos 10 caracteres, combinando palabras cortas y números. La contraseña se muestra o descarga una sola vez y únicamente se almacena su hash.

El estudiante conserva la contraseña hasta que ADMIN o un DOCENTE autorizado la restablezca. No existe recuperación estudiantil por correo.

El restablecimiento puede aplicarse a uno o varios estudiantes seleccionados. Solo se descarga el CSV de las nuevas credenciales; las anteriores se invalidan inmediatamente.

### 4.4 Política general

- mínimo 10 caracteres;
- al menos una letra y un número;
- sesión máxima de 8 horas;
- límite de solicitudes de recuperación;
- token de invitación o recuperación de un solo uso, con vigencia de 24 horas;
- revocación inmediata de sesiones al desactivar una cuenta, retirar un rol, cambiar o restablecer la contraseña;
- las contraseñas nunca se almacenan en texto legible ni con cifrado reversible.

## 5. Gestión de usuarios

Datos mínimos:

- nombres;
- apellidos;
- correo único;
- rol o combinación válida;
- estado;
- grupo cuando sea ESTUDIANTE.

Todos inician sesión con correo. Solo ADMIN modifica identidad, correo, rol, estado y grupo. Cuando una persona deja el colegio, se desactiva y se conserva el historial; no se elimina físicamente.

## 6. Asociación estudiante–grupo

Un estudiante pertenece a un solo grupo activo por año lectivo, conservando historial. No es una matrícula formal.

Un traslado durante el mismo año es exclusivo de ADMIN:

1. cerrar la asociación anterior;
2. crear la nueva;
3. garantizar una sola asociación activa.

## 7. Estructura académica

ADMIN dispone de CRUD para:

- años lectivos;
- períodos;
- áreas;
- grados;
- grupos;
- asignaturas.

Reglas:

- solo puede existir un año ACTIVO;
- no puede cerrarse sin períodos;
- al cerrar, las ponderaciones deben sumar exactamente 100 %;
- el año CERRADO y sus relaciones quedan inmutables;
- ADMIN puede asignar un DOCENTE activo como director de grupo;
- el borrado físico exige confirmación;
- si el registro tiene relaciones o historial, el borrado se bloquea;
- solo se borra físicamente un registro nunca utilizado.

No se implementa auditoría detallada en este incremento. Se conservan fechas de creación y actualización; la ausencia de trazabilidad de actor es un riesgo aceptado.

## 8. Asignación docente y horarios

Una asignación une:

- docente;
- asignatura;
- grupo;
- año lectivo;
- uno o varios bloques horarios.

Cada bloque contiene día de semana, hora inicial y hora final.

Reglas:

- el docente debe estar ACTIVO y tener rol DOCENTE;
- la asignatura debe estar habilitada para el grado del grupo;
- el grupo debe pertenecer al año indicado;
- no se permiten cruces del mismo docente;
- no se permiten cruces del mismo grupo;
- no se modifica un año cerrado;
- una asignación inactiva puede reactivarse si no produce conflictos.

Al reasignar carga docente, ADMIN confirma la operación, se desactiva la asignación anterior, se crea la nueva y se conserva el historial.

## 9. Importación CSV

Máximo 500 filas por archivo. Se entregan plantillas descargables con encabezados exactos y valores legibles, nunca IDs internos.

### 9.1 Estudiantes

```csv
nombres,apellidos,correo,año,grado,grupo
```

### 9.2 Docentes

```csv
nombres,apellidos,correo
```

Reglas:

- CSV no crea administradores;
- se valida el archivo completo antes de escribir;
- los errores se reportan por fila;
- si existe un error, no se crea ninguna cuenta;
- los correos ya existentes se omiten sin bloquear y aparecen en el resumen;
- DOCENTE y ESTUDIANTE quedan ACTIVOS;
- DOCENTE debe cambiar la contraseña temporal en el primer ingreso;
- tras una importación correcta se descarga una sola vez un CSV con correo y contraseña inicial;
- el sistema no permite volver a descargar esas contraseñas.

## 10. Experiencia e integración visual

Las pantallas de login, recuperación, establecimiento de contraseña y Cuenta deben integrarse con la identidad visual existente de MIDUHO.

Se conserva la maqueta actual y sus contenidos. Se reemplazan dinámicamente:

- nombre del usuario;
- rol y contexto;
- grupo del estudiante;
- navegación autorizada;
- información de Mi curso.

La personalización de clases, calendario, contenidos y laboratorios por curso queda fuera.

La interfaz debe funcionar en escritorio y móvil responsive en navegadores modernos. El cumplimiento formal WCAG 2.1 AA queda pospuesto y no bloquea este incremento.

## 11. Listados administrativos

Usuarios, grupos, asignaciones y asociaciones incluyen:

- búsqueda;
- filtros;
- paginación;
- estados vacíos;
- errores visibles;
- confirmación para operaciones sensibles.

## 12. Datos de prueba

Solo se usan datos ficticios. El seed incluye:

- ADMIN;
- DOCENTE;
- ESTUDIANTE;
- año, períodos, áreas, grados, grupos, asignaturas;
- asociación estudiante–grupo;
- asignación docente y horario.

No se usan nombres, documentos, correos ni demás datos reales de menores o personal del colegio.

## 13. Criterios de aceptación y gates

Deben verificarse, como mínimo:

1. Login y destino correcto para cada rol.
2. Cambio obligatorio de contraseña del DOCENTE.
3. Selector y persistencia de contexto ADMIN/DOCENTE.
4. Protección de todas las rutas no públicas.
5. Revocación inmediata de sesiones.
6. CRUD administrativo con permisos negativos.
7. CSV válido, inválido, duplicados y límite de filas.
8. Asociación y traslado de estudiantes con historial.
9. Asignación, reactivación, reasignación y conflictos de horario.
10. Aislamiento horizontal de DOCENTE por grupo.
11. Generación y restablecimiento seguro de credenciales estudiantiles.
12. Cierre de año con suma 100 % e inmutabilidad posterior.
13. Ejecución en escritorio y móvil.
14. Migraciones desde base vacía y desde el esquema previo.
15. `npm test`, `npm run lint` y `npm run build` sin errores bloqueantes.
16. Smoke real en `next start` sobre red local.
17. Integración en `main`, árbol limpio y commit publicado en GitHub.
18. Revisión final independiente con veredicto explícito APROBADO o BLOQUEADO.

## 14. Fuera de alcance

- producción pública;
- matrícula formal;
- roles COORDINACION y ACUDIENTE;
- perfil académico detallado;
- calificaciones, actividades, entregas y observaciones;
- contenido dinámico de clases y calendario;
- personalización de laboratorios por curso;
- auditoría detallada de actores;
- cumplimiento formal WCAG 2.1 AA;
- datos reales del colegio.

## 15. Regla de cierre

El Incremento 1R no se considera terminado por compilar o pasar pruebas unitarias. Solo se cierra cuando todos los gates anteriores se ejecutan sobre `main`, la experiencia de login está integrada visual y funcionalmente, y una revisión independiente emite veredicto APROBADO.
