# Modelo de entidades — MIDUHO

**Propósito:** fijar el modelo de datos del Incremento 1 (Fundación) y el eje curricular que el modelo debe soportar desde el primer día.
**Fecha:** 2026-09-26
**Fuente:** [[Modelo-preliminar-entidades]], [[Reglas-de-negocio]], [[Backlog-MVP]], [[Inventario-educativo]] (vault Obsidian), y `AGENTS.md` del repo.
**Nivel de certeza:** Alto en lo derivado del análisis; los campos y cardinalidades marcados 🔶 requieren confirmación del colegio.

> [!important] Regla de datos
> **No existen datos reales de menores.** Toda la información de estudiantes, docentes y acudientes es ficticia y debe leerse como tal. Nunca generar nombres, documentos ni datos personales de menores, ni siquiera "de ejemplo". Solo esquema estructural y redacción propia.

---

## 1. Terminología (referencia → MIDUHO)

El lenguaje interno evita marcas comerciales de la plataforma de referencia y usa vocabulario curricular colombiano (`AGENTS.md`, regla 5).

| Referencia (Trendi) | MIDUHO (entidad) | Nota |
|---|---|---|
| Área | `Area` | Agrupador curricular. Un solo campo `tipo` resuelve la mezcla área/dimensión/enfoque (RN-13) |
| Programa / Nivel | `Nivel` | Ej. "Curious 2", "Kids 2". **No** pertenece a un área (RN-22) |
| Bloque | `Bloque` | Agrupación ordenada de unidades |
| Circuito | `Unidad` | Unidad didáctica mínima. **Aquí vive el área** (RN-22) |
| Ruta didáctica / "Clase" | `Sesion` | La sesión de clase con la plantilla fija de 7 secciones |
| Curso (Moodle) | `Grupo` | Grado + identificador ("01", "02") en un año lectivo |
| Grado | `Grado` | No confundir con `Nivel`: `Grado.nivel` es *preescolar/primaria/bachillerato* |
| Año lectivo | `AnioLectivo` | Solo uno activo (RN-01) |
| Período | `Periodo` | Entidad con fechas, nunca texto libre (RN-04) |
| Asignatura | `Asignatura` | Las 14 reales de 1° (RF-ACAD-4) |
| Asignación docente | `AsignacionDocente` | **Gobierna todo el acceso docente** |

> **Decisión de alcance:** MIDUHO no gestiona matrícula de estudiantes. No existe entidad `Matricula`, flujo de matrícula, importación CSV ni exportación SIMAT. La eventual asociación de estudiantes a grupos queda por definir fuera de este alcance; no debe suponerse una solución sustituta.

**Nota de i18n:** el idioma es un atributo del nombre, no un registro aparte (RN-14). No existen "Matemáticas" y "Math" como registros distintos.

---

## 2. Convenciones transversales

| Convención | Regla | Fuente |
|---|---|---|
| Identificadores | `cuid()` (UUID), **no** autoincrementales secuenciales | RNF-SEG-4 (IDs no adivinables) |
| Desactivar, no borrar | `Usuario.estado` y `AsignacionDocente.estado`; los registros se desactivan, el historial se conserva | RN-49, RF-ADMIN-2 |
| Auditoría | Toda acción sensible (notas, roles, datos personales) escribe en `Auditoria` | RN-50, RN-41, RF-ADMIN-4 |
| Timestamps | `creadoEn` / `actualizadoEn` en todas las entidades | — |
| Nombres técnicos | Sin tildes ni caracteres especiales en identificadores y rutas | RNF-MAN-3 |

---

## 3. Diagrama de relaciones

```
                         ┌────────────┐
                         │   Usuario  │
                         └─────┬──────┘
              roles N:M  │ UsuarioRol │  N:M Rol
                         │            │
   AcudienteEstudiante (N:M autorelación, parentesco + verificado)

Estructura académica:
AnioLectivo 1─N Periodo
AnioLectivo 1─N Grupo
Grado       1─N Grupo
Grado       N─N Asignatura      (AsignaturaGrado)
Area        1─N Asignatura

Docente     N─N Asignatura×Grupo (AsignacionDocente)  ⭐ gobierna permisos

Currículo (eje secuenciado / laboratorios):
Area    1─N Asignatura
Area    1─N Unidad               ⭐ (el área vive en la Unidad, no en el Nivel — RN-22)
Nivel   1─N Bloque 1─N Unidad 1─1 Sesion 1─N SesionSeccion (las 7)
```

---

## 4. Catálogo de entidades

### 4.1 Acceso y personas

**Usuario** — persona que accede al sistema (docente, estudiante, acudiente, administrador).

| Atributo | Tipo | Notas |
|---|---|---|
| `id` | cuid | |
| `nombres`, `apellidos` | texto | |
| `correo` | texto único | identificador de login |
| `hashContrasena` | texto | hash fuerte con salt (RNF-SEG-2); nunca texto plano |
| `fotoUrl` | texto opcional | |
| `estado` | enum `ACTIVO`/`INACTIVO` | desactivar, no borrar (RN-49) |
| `ultimoAcceso`, `creadoEn`, `actualizadoEn` | fecha | |

Relaciones: `roles` (N:M vía `UsuarioRol`), `acudidos`/`acudientes` (autorelación vía `AcudienteEstudiante`), `asignacionesDocente`, `gruposDirigidos`, `auditorias`.

> 🔶 Datos de menores: en el MVP **no** se modelan fecha de nacimiento, documento ni datos sensibles de estudiantes (RNF-DAT-1, minimización). Si el colegio los requiere, se agregan en una tabla `PerfilEstudiante` tras revisión jurídica.

**Rol** — los cinco roles del colegio (semilla, no configurables en el MVP).

| Atributo | Tipo |
|---|---|
| `id` | cuid |
| `codigo` | único: `ADMIN`, `COORDINACION`, `DOCENTE`, `ESTUDIANTE`, `ACUDIENTE` |
| `nombre`, `descripcion` | texto |

**UsuarioRol** — N:M. Un usuario puede tener más de un rol (ej. docente que también es acudiente).

**AcudienteEstudiante** — relación explícita y verificable (RN-48).

| Atributo | Tipo | Notas |
|---|---|---|
| `acudienteId`, `estudianteId` | cuid | ambos son `Usuario` |
| `parentesco` | texto | |
| `verificado` | bool | la institución verifica el vínculo (RN-48) |

### 4.2 Estructura académica

**AnioLectivo**

| Atributo | Tipo | Notas |
|---|---|---|
| `anio` | entero | ej. 2026 |
| `fechaInicio`, `fechaFin` | fecha | |
| `estado` | enum `ACTIVO`/`CERRADO` | solo uno activo (RN-01); al cerrar, solo lectura (RN-52) |

**Periodo**

| Atributo | Tipo | Notas |
|---|---|---|
| `anioLectivoId` | FK | un período pertenece a un año (RN-03) |
| `nombre`, `orden` | texto / entero | único `(anioLectivoId, orden)` |
| `fechaInicio`, `fechaFin` | fecha | no se solapan (RN-02) |
| `ponderacion` | decimal | la suma de un año debe ser 100 % (RN-06) |

**Grado**

| Atributo | Tipo | Notas |
|---|---|---|
| `nombre` | texto | "1°", "2°", … |
| `nivel` | enum `PREESCOLAR`/`PRIMARIA`/`BACHILLERATO` | no confundir con la entidad `Nivel` |
| `orden` | entero | |

**Grupo**

| Atributo | Tipo | Notas |
|---|---|---|
| `gradoId`, `anioLectivoId` | FK | un grupo pertenece a un grado y un año (RN-07) |
| `identificador` | texto | "01", "02" |
| `directorId` | FK opcional → Usuario | director de grupo |

**Asignatura**

| Atributo | Tipo | Notas |
|---|---|---|
| `nombre` | texto | |
| `areaId` | FK → Area | |
| `intensidadHoraria` | entero opcional | 🔶 |

**AsignaturaGrado** — N:M. Una asignatura se dicta en varios grados; en cada grado tiene su propia intensidad (RN-09).

**AsignacionDocente** ⭐ — gobierna el acceso docente.

| Atributo | Tipo | Notas |
|---|---|---|
| `docenteId`, `asignaturaId`, `grupoId`, `anioLectivoId` | FK | |
| `estado` | bool | vigente o no |

Restricción: `unique(docenteId, asignaturaId, grupoId, anioLectivoId)` — no se repite la misma combinación (RN-10). Reglas: cada asignatura+grupo debe tener al menos un docente (RN-11); un docente puede tener varias asignaciones (RN-12).

### 4.3 Currículo (eje secuenciado / laboratorios)

**Area**

| Atributo | Tipo | Notas |
|---|---|---|
| `nombre` | texto | |
| `tipo` | enum `AREA`/`DIMENSION`/`ENFOQUE` | un solo eje taxonómico (RN-13) |
| `idioma` | texto, default `es` | atributo del nombre, no registro nuevo (RN-14) |
| `orden` | entero opcional | |

Relaciones: `asignaturas` (1:N), `unidades` (1:N).

**Nivel** — el "programa" (ej. "Curious 2", "Kids 2"). **Sin** `areaId`: un mismo nivel puede mezclar unidades de áreas distintas (RN-22, hallazgo Kids 2).

| Atributo | Tipo | Notas |
|---|---|---|
| `nombre` | texto | |
| `orden` | entero | |
| `gradoSugerido` | texto opcional | 🔶 |

**Bloque** — agrupación ordenada de unidades dentro de un nivel (RN-21).

**Unidad** — la unidad didáctica (ex-"circuito"). ⭐ El área vive aquí.

| Atributo | Tipo | Notas |
|---|---|---|
| `bloqueId` | FK | |
| `nombre`, `orden` | texto / entero | |
| `areaId` | FK → Area | RN-22 |

**Sesion** — la sesión de clase (ex-"ruta didáctica"). Cada unidad tiene **exactamente una** sesión (RN-23).

| Atributo | Tipo | Notas |
|---|---|---|
| `unidadId` | FK único | 1:1 |
| `titulo`, `orden` | texto / entero | |

**SesionSeccion** — las 7 secciones de la plantilla. `unique(sesionId, tipo)` fuerza exactamente las 7, ninguna opcional (RN-24).

Enumerado `SeccionTipo`: `OBJETIVO`, `EVIDENCIAS_APRENDIZAJE`, `TEMAS_PROFUNDIZACION`, `INICIO`, `DESARROLLO`, `EVALUACION`, `QUE_PUEDO_CALIFICAR`.

### 4.4 Transversal

**Auditoria** — registro de acciones sensibles.

| Atributo | Tipo |
|---|---|
| `autorId` | FK → Usuario |
| `entidad`, `registroId` | texto |
| `accion` | texto (CREAR / ACTUALIZAR / ELIMINAR / …) |
| `valorAnterior`, `valorNuevo` | texto opcional (JSON) |
| `fecha` | fecha |

**RestablecimientoContrasena** — token de recuperación de contraseña (HU-02). Ver documento de arquitectura.

---

## 5. Alcance por incremento

| Entidades | Incremento | Child task |
|---|---|---|
| `Usuario`, `Rol`, `UsuarioRol` | Inc. 1 | `t_85913f5b` (auth) + `t_871b9bac` (roles) |
| `RestablecimientoContrasena` | Inc. 1 | `t_85913f5b` (recuperar contraseña) |
| `AnioLectivo`, `Periodo`, `Grado`, `Grupo`, `Asignatura`, `AsignaturaGrado`, `Area` | Inc. 1 | `t_d5cb94b9` (entidades base) |
| `AsignacionDocente`, `AcudienteEstudiante` | Inc. 1 | tarjeta de roles y asignación docente |
| `Nivel`, `Bloque`, `Unidad`, `Sesion`, `SesionSeccion` | Modelo desde Inc. 1; navegación en Inc. 7 | — |
| `Auditoria` | Inc. 1 (transversal) | todos |

### Entidades futuras (reservadas, fuera del Inc. 1)

El modelo del vault las define; **no** se implementan ahora, pero la arquitectura las soporta: `Recurso`, `TipoRecurso`, `RecursoAsignatura`, `VersionRecurso`, `GuiaDocente`, `Estandar`, `DBA`, `Etiqueta`, `Planeacion` (+secciones), `Actividad`, `Entrega`, `Calificacion`, `EscalaValoracion`, `NotaPeriodo`, `Mensaje`, `Comunicado`, `EventoAgenda`.

---

## 6. Reglas de negocio cubiertas (referencia)

| Entidad | Reglas que garantiza |
|---|---|
| `AnioLectivo` | RN-01, RN-52 |
| `Periodo` | RN-02, RN-03, RN-04, RN-06 |
| `Grupo` | RN-07 |
| `Asignatura` / `AsignaturaGrado` | RN-09 |
| `AsignacionDocente` | RN-10, RN-11, RN-12, RN-44, RN-45 |
| `Area` | RN-13, RN-14 |
| `Nivel` / `Bloque` / `Unidad` / `Sesion` | RN-21, RN-22, RN-23, RN-24, RN-25 |
| `AcudienteEstudiante` | RN-46, RN-48 |
| `Usuario` / `UsuarioRol` | RN-49, RN-51 |
| `Auditoria` | RN-41, RN-50 |

## Relacionados

[[Arquitectura-propuesta]] · [[Reglas-de-negocio]] · [[Backlog-MVP]] · `docs/arquitectura-backend.md`
