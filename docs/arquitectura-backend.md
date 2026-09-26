# Arquitectura del backend — MIDUHO (Incremento 1)

**Propósito:** fijar cómo se construye el backend de MIDUHO sobre Next.js 16, para que los equipos de implementación trabajen sobre decisiones ya tomadas y no las reinventen.
**Fecha:** 2026-09-26
**Fuente:** [[Arquitectura-propuesta]], [[Modelo-preliminar-entidades]], [[Reglas-de-negocio]], [[Requerimientos-no-funcionales]], docs de Next.js 16 (`node_modules/next/dist/docs/`).
**Nivel de certeza:** Decisiones de diseño 🔶 donde requieren confirmación del colegio (hospedaje, SIEE, alcance).

---

## 1. Principios (heredados de [[Arquitectura-propuesta]])

1. **Un solo sistema, no dos.** Contenido + planeación + clase + evaluación en una aplicación. No existe "compartir en mi aula".
2. **Sin multi-tenancy.** Un solo colegio, sin `institucion_id` (RNF-MAN-1).
3. **Monolito modular**, no microservicios. La escala de un colegio no los justifica.
4. **Base de datos relacional** (matrículas, notas, asignaciones exigen integridad).
5. **Autenticación propia** (email + contraseña). SAML/SSO externo añade un punto de fallo sin aportar.
6. **Autorización en el servidor, en cada petición** (RNF-SEG-3). Ocultar un botón no es control de acceso.

---

## 2. Stack

| Capa | Tecnología | Versión / nota |
|---|---|---|
| Framework | Next.js 16 (App Router) | `next@16.3.4` (ya en `package.json`) |
| UI | React 19, Tailwind CSS v4, shadcn | ya instalados |
| Lenguaje | TypeScript (strict) | `strict: true` en `tsconfig.json` |
| ORM | **Prisma** | a instalar |
| Base de datos | SQLite (dev local) → PostgreSQL (producción) 🔶 | vía `DATABASE_URL`; ver §3 |
| Validación | **Zod** | a instalar |
| Autenticación | **Auth.js v5** (`next-auth@beta`) | ver §5 |
| Hash de contraseñas | `bcryptjs` | sin dependencia nativa |
| Envío de correo | Resend / SMTP configurable | para recuperación (HU-02) |
| Pruebas | Vitest | lógica crítica (RNF-MAN-5) |

> 🔶 **Hospedaje pendiente:** la elección SQLite/PostgreSQL en producción se cierra al decidir el hospedaje (servidor del colegio vs nube). El esquema Prisma es el mismo en ambos; solo cambia `datasource.db.provider` y `DATABASE_URL`.

---

## 3. Estructura de carpetas

```
app/
├─ prisma/
│  ├─ schema.prisma        # modelo de datos (ver Anexo A)
│  ├─ migrations/
│  └─ seed.ts              # datos FICTICIOS, nunca datos de menores
├─ src/
│  ├─ app/                 # rutas y Route Handlers
│  │  ├─ (auth)/login/
│  │  ├─ (auth)/recuperar/
│  │  ├─ (admin)/          # paneles Admin/Coordinación
│  │  ├─ (docente)/        # panel Docente
│  │  ├─ (estudiante)/
│  │  ├─ (acudiente)/
│  │  ├─ unauthorized.tsx  # 401 (experimental en Next 16)
│  │  ├─ forbidden.tsx     # 403
│  │  └─ api/              # Route Handlers (REST interno)
│  │     ├─ auth/[...nextauth]/
│  │     ├─ anios-lectivos/… · periodos/… · grados/… · grupos/… · asignaturas/…
│  │     ├─ usuarios/… · roles/… · matriculas/… · asignaciones-docente/…
│  │     └─ niveles/… · bloques/… · unidades/… · sesiones/…
│  ├─ server/              # ⭐ capa de servidor (solo importable desde el servidor)
│  │  ├─ db.ts             # instancia Prisma (singleton)
│  │  ├─ auth/
│  │  │  ├─ config.ts      # Auth.js (credentials + JWT)
│  │  │  ├─ session.ts     # getSession() / requireSession()
│  │  │  └─ permisos.ts    # reglas de autorización (AsignacionDocente)
│  │  ├─ auditoria.ts      # helper escribir Auditoria
│  │  └─ modules/          # un módulo por dominio
│  │     ├─ academico/     # anioLectivo, periodo, grado, grupo, asignatura
│  │     ├─ usuarios/      # usuario, rol, acudienteEstudiante
│  │     ├─ matricula/     # matricula + importación CSV
│  │     └─ curriculo/     # area, nivel, bloque, unidad, sesion
│  ├─ lib/                 # utilidades compartidas (client + server)
│  ├─ types/               # tipos compartidos
│  └─ middleware… (no)     # ver §6: se usa proxy.ts, no middleware.ts
└─ proxy.ts                # checks optimistas (redirección), NO autorización real
```

Regla de límite: `src/server/**` **nunca** se importa desde un Componente Cliente. Solo Server Components, Route Handlers y Server Actions. `src/lib/**` puede importarse desde ambos lados.

---

## 4. Capa de datos (Prisma)

- Esquema en `prisma/schema.prisma` (Anexo A). Modelos en español, camelCase, singular; tablas mapeadas a snake_case plural con `@@map`.
- IDs `cuid()` (UUID) — nunca autoincrementales (RNF-SEG-4).
- Migraciones: `prisma migrate dev`. Cada cambio de modelo es una migración revisable.
- Seed (`prisma/seed.ts`): solo datos **ficticios** (un año lectivo, 4 períodos, grados, un grupo piloto 1°, las 14 asignaturas reales como nombres, usuarios ficticios). **Nunca** nombres/documentos de menores.
- `src/server/db.ts`: singleton de `PrismaClient` (evita agotar conexiones en dev hot-reload).

---

## 5. Autenticación (HU-01, HU-02)

- **Auth.js v5** (`next-auth@beta`), proveedor **Credentials** (email + contraseña). Sin Google SSO en el Inc. 1 (arquitectura: "autenticación propia"); se puede añadir un proveedor OAuth después sin tocar el modelo.
- **Sesiones JWT** (`session.strategy = "jwt"`): el token incluye `userId` y los roles (`roles: string[]`). No se guarda la sesión en la base.
- **Contraseñas**: `bcryptjs` con salt (RNF-SEG-2). Nunca texto plano ni reversible.
- **Errores de login genéricos**: "Credenciales inválidas" sin revelar si el usuario existe (HU-01).
- **Bloqueo temporal** tras N intentos fallidos (HU-01, RNF-SEG-6): contador + timestamp en memoria/cache, o tabla `LoginIntentos` si se quiere persistente.
- **Recuperación (HU-02):** al solicitarla se crea un `RestablecimientoContrasena` con el **hash** del token (nunca el token plano) y `expiraEn = ahora + 24 h`; el enlace se envía por correo (Resend/SMTP). Un solo uso: `usadoEn` se marca al consumirlo.

```prisma
model RestablecimientoContrasena {
  id        String   @id @default(cuid())
  usuarioId String
  tokenHash String   @unique
  expiraEn  DateTime
  usadoEn   DateTime?
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  @@map("restablecimientos_contrasena")
}
```

---

## 6. Autorización ⭐ (la regla central)

> **`AsignacionDocente` gobierna todo el acceso docente.** Un docente accede a datos de un grupo **si y solo si** tiene una asignación vigente (asignatura + grupo + año lectivo) que lo incluya. Tener el rol `DOCENTE` no basta.

| Rol | Alcance de datos |
|---|---|
| `ADMIN` | Todo el sistema |
| `COORDINACION` | Lectura amplia; escritura en configuración académica |
| `DOCENTE` | Solo asignaturas+grupos con asignación vigente |
| `ESTUDIANTE` | Solo su información y sus asignaturas |
| `ACUDIENTE` | Solo la información de sus acudidos (vía `AcudienteEstudiante` verificado) |

Implementación en **tres capas**, todas en el servidor:

1. **`src/server/auth/permisos.ts`** — funciones puras y testables: `puedeVerGrupo(usuario, grupoId)`, `requiereRol(usuario, 'ADMIN')`, `requiereAsignacion(usuario, asignaturaId, grupoId, anioLectivoId)`, `alcanceEstudiante(usuario)`, `alcanceAcudiente(usuario)`.
2. **Capa de datos (`src/server/modules/**`)** — cada consulta filtra por el alcance devuelto por `permisos.ts`. **Nunca** se confía en IDs que llegan por query/params sin verificar alcance.
3. **Route Handlers / Server Actions** — invocan `requireSession()` y la regla de permiso correspondiente al inicio; devuelven 401/403 si no aplica.

Apoyos de Next.js 16:

- `proxy.ts` (antes `middleware.ts`) **solo** para checks optimistas (redirigir a `/login` si no hay sesión). **No** es la autorización real: la doc de Next lo desaconseja para "full session management or authorization".
- `unauthorized.tsx` (401) y `forbidden.tsx` (403) + funciones `unauthorized()` / `forbidden()` para renderizar respuestas de acceso (experimental en Next 16).

---

## 7. API y convenciones

**Route Handlers** (`route.ts`) como API interna REST; **Server Actions** para mutaciones de formularios. La autorización vive en la capa de datos, no en el handler.

Convenciones:

- Rutas en plural, kebab-case: `/api/grupos/[id]/matriculas`, etc.
- **Validación de entrada con Zod** en cada handler: `schema.parse(...)`; error 400 con mensajes legibles (RNF-USA-5), nunca trazas técnicas.
- **Paginación en servidor** para todo listado (RNF-PER-2): `?page=1&pageSize=20`, respuesta `{ data, page, pageSize, total }`. Nunca cargar listas completas.
- **IDs no adivinables** en toda respuesta y ruta (RNF-SEG-4).
- **Errores**: envelope `{ error: { code, message } }`; códigos estables, mensajes en español sin detalles internos.
- **CSRF**: tokens en formularios (los Server Actions y Auth.js lo cubren); para Route Handlers de mutación, validar `Origin`/CSRF token.
- **Consultas parametrizadas** vía Prisma (anti inyección SQL), escape de salida en el cliente (anti XSS) — RNF-SEG-5.

### Mapa de endpoints (Inc. 1)

```
POST /api/auth/...                 # Auth.js (login, logout, recuperación)
GET/POST /api/anios-lectivos
GET/POST/PATCH /api/periodos
GET/POST/PATCH /api/grados
GET/POST/PATCH /api/grupos
GET/POST/PATCH /api/asignaturas
GET/POST /api/usuarios            # (admin) crear/editar/desactivar
GET/POST /api/roles
POST /api/matriculas/importar     # CSV con reporte de errores por fila (HU-07)
GET/POST/PATCH /api/matriculas
GET/POST/PATCH /api/asignaciones-docente
GET/POST/PATCH /api/areas /api/niveles /api/bloques /api/unidades /api/sesiones
```

Cada entidad expone su CRUD con la autorización correspondiente: académico → `ADMIN`/`COORDINACION`; matrícula/asignaciones → `ADMIN`; consulta de datos propios → `ESTUDIANTE`/`ACUDIENTE`.

---

## 8. Auditoría

`src/server/auditoria.ts` expone `auditar(autorId, { entidad, registroId, accion, valorAnterior, valorNuevo })`. Se llama desde la capa de datos en: cambios de rol, cambios de nota, accesos administrativos, modificaciones de matrícula y asignaciones (RF-ADMIN-4, RN-50). Es transversal desde el Inc. 1.

---

## 9. Almacenamiento de archivos

Los archivos (entregas, recursos, fotos) **no** van en la base: se guardan en disco (`uploads/`, ignorado en git) o en S3-compatible, referenciados por id desde la entidad. En el Inc. 1 aplica a `Usuario.fotoUrl` y futuras entregas.

---

## 10. Entornos y configuración

| Variable | Uso |
|---|---|
| `DATABASE_URL` | SQLite dev / PostgreSQL prod |
| `AUTH_SECRET` | firma de sesiones Auth.js (generar con `npx auth secret`) |
| `AUTH_TRUST_HOST=true` | necesario para Auth.js en entornos locales |
| `SMTP_*` o `RESEND_API_KEY` | envío del correo de recuperación |
| `NEXTAUTH_URL` | URL base pública |

- Nunca secretos en el código ni en el repo (RNF-SEG-7); `.env` en `.gitignore`.
- Entornos: **Desarrollo** (datos ficticios), **Pruebas** (validación con el colegio, sin datos reales de menores), **Producción** (acceso restringido). Nunca datos reales de menores fuera de producción.

---

## 11. Seguridad (mapeo RNF-SEG)

| Requisito | Cómo se cumple |
|---|---|
| HTTPS obligatorio | reverse proxy / hosting con TLS |
| Hash fuerte + salt | `bcryptjs` |
| Autorización en servidor | §6 |
| IDs no adivinables | `cuid()` |
| Inyección / XSS / CSRF | Prisma parametrizado, escape de salida, tokens de formulario |
| Límite de intentos | bloqueo temporal de login |
| Sin secretos en el repo | variables de entorno |
| Copias de seguridad | backup del DB + restauración probada (op: del hosting 🔶) |

---

## 12. Verificación y pruebas

Antes de dar por hecho cualquier cambio (regla de `AGENTS.md`):

```bash
npm run build   # debe compilar sin errores
npm run lint    # eslint debe pasar
```

Pruebas unitarias (Vitest) sobre la lógica crítica desde el Inc. 1: `permisos.ts` (reglas de AsignacionDocente/acudiente/estudiante), unicidad de matrícula por año (RN-08), unicidad de asignación docente (RN-10), suma de ponderaciones (RN-06), importación CSV con reporte de errores.

---

## 13. Decisiones pendientes 🔶

Hospedaje (nube vs servidor del colegio), SIEE del colegio (bloquea Inc. 5), alcance real (3 vs 14 asignaturas), grado piloto, migración de contenido existente, revisión jurídica de datos de menores (Ley 1581 de 2012). Ninguna bloquea el Incremento 1.

---

## 14. Mapa para los equipos de implementación

| Child task | Módulos y entidades | Autenticación/permisos |
|---|---|---|
| `t_d5cb94b9` (entidades base) | `academico`: `AnioLectivo`, `Periodo`, `Grado`, `Grupo`, `Asignatura`, `AsignaturaGrado`, `Area` | ADMIN/COORDINACION |
| `t_85913f5b` (auth) | `usuarios` (login) + `RestablecimientoContrasena` | Auth.js v5 credentials + JWT |
| `t_871b9bac` (roles + matrícula) | `Rol`, `UsuarioRol`, `AsignacionDocente`, `Matricula`, `AcudienteEstudiante`, importación CSV | AsignacionDocente como llave de acceso |

Orden sugerido: primero `t_d5cb94b9` (el modelo base), luego `t_85913f5b` (auth) y `t_871b9bac` (roles/asignaciones/matrícula), que dependen del modelo y de la sesión.

---

## Anexo A — Esquema Prisma (punto de partida)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"      // desarrollo; producción: "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Acceso ----------
enum EstadoUsuario { ACTIVO INACTIVO }

model Usuario {
  id             String        @id @default(cuid())
  nombres        String
  apellidos      String
  correo         String        @unique
  hashContrasena String
  fotoUrl        String?
  estado         EstadoUsuario @default(ACTIVO)
  ultimoAcceso   DateTime?
  creadoEn       DateTime      @default(now())
  actualizadoEn  DateTime      @updatedAt

  roles               UsuarioRol[]
  matriculas          Matricula[]           @relation("EstudianteMatricula")
  acudidos            AcudienteEstudiante[] @relation("Acudiente")
  acudientes          AcudienteEstudiante[] @relation("Estudiante")
  asignacionesDocente AsignacionDocente[]
  gruposDirigidos     Grupo[]               @relation("Director")
  auditorias          Auditoria[]           @relation("AutorAuditoria")

  @@map("usuarios")
}

model Rol {
  id          String  @id @default(cuid())
  codigo      String  @unique   // ADMIN | COORDINACION | DOCENTE | ESTUDIANTE | ACUDIENTE
  nombre      String
  descripcion String?
  usuarios    UsuarioRol[]
  @@map("roles")
}

model UsuarioRol {
  usuarioId String
  rolId     String
  usuario   Usuario @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  rol       Rol     @relation(fields: [rolId], references: [id], onDelete: Cascade)
  @@id([usuarioId, rolId])
  @@map("usuarios_roles")
}

model AcudienteEstudiante {
  acudienteId  String
  estudianteId String
  parentesco   String
  verificado   Boolean @default(false) // RN-48
  acudiente    Usuario @relation("Acudiente", fields: [acudienteId], references: [id], onDelete: Cascade)
  estudiante   Usuario @relation("Estudiante", fields: [estudianteId], references: [id], onDelete: Cascade)
  @@id([acudienteId, estudianteId])
  @@map("acudientes_estudiantes")
}

model RestablecimientoContrasena {
  id        String   @id @default(cuid())
  usuarioId String
  tokenHash String   @unique
  expiraEn  DateTime
  usadoEn   DateTime?
  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  @@map("restablecimientos_contrasena")
}

// ---------- Estructura académica ----------
enum EstadoAnioLectivo { ACTIVO CERRADO }

model AnioLectivo {
  id           String           @id @default(cuid())
  anio         Int
  fechaInicio  DateTime
  fechaFin     DateTime
  estado       EstadoAnioLectivo @default(ACTIVO)
  periodos     Periodo[]
  grupos       Grupo[]
  matriculas   Matricula[]
  asignaciones AsignacionDocente[]
  @@map("anios_lectivos")
}

model Periodo {
  id            String      @id @default(cuid())
  anioLectivoId String
  nombre        String
  orden         Int
  fechaInicio   DateTime
  fechaFin      DateTime
  ponderacion   Decimal     // suma anual = 100 (RN-06)
  anioLectivo   AnioLectivo @relation(fields: [anioLectivoId], references: [id])
  @@unique([anioLectivoId, orden])
  @@map("periodos")
}

enum NivelEducativo { PREESCOLAR PRIMARIA BACHILLERATO }

model Grado {
  id          String          @id @default(cuid())
  nombre      String
  nivel       NivelEducativo
  orden       Int
  grupos      Grupo[]
  asignaturas AsignaturaGrado[]
  @@map("grados")
}

model Grupo {
  id            String      @id @default(cuid())
  gradoId       String
  anioLectivoId String
  identificador String      // "01", "02"
  directorId    String?
  grado         Grado       @relation(fields: [gradoId], references: [id])
  anioLectivo   AnioLectivo @relation(fields: [anioLectivoId], references: [id])
  director      Usuario?    @relation("Director", fields: [directorId], references: [id])
  matriculas    Matricula[]
  asignaciones  AsignacionDocente[]
  @@unique([gradoId, anioLectivoId, identificador])
  @@map("grupos")
}

model Asignatura {
  id                String            @id @default(cuid())
  nombre            String
  areaId            String
  intensidadHoraria Int?
  area              Area              @relation(fields: [areaId], references: [id])
  grados            AsignaturaGrado[]
  asignaciones      AsignacionDocente[]
  @@map("asignaturas")
}

model AsignaturaGrado {
  asignaturaId String
  gradoId      String
  intensidad   Int?
  asignatura   Asignatura @relation(fields: [asignaturaId], references: [id], onDelete: Cascade)
  grado        Grado      @relation(fields: [gradoId], references: [id], onDelete: Cascade)
  @@id([asignaturaId, gradoId])
  @@map("asignaturas_grados")
}

enum EstadoMatricula { ACTIVA RETIRADA }

model Matricula {
  id            String         @id @default(cuid())
  estudianteId  String
  grupoId       String
  anioLectivoId String
  estado        EstadoMatricula @default(ACTIVA)
  fecha         DateTime        @default(now())
  estudiante    Usuario         @relation("EstudianteMatricula", fields: [estudianteId], references: [id])
  grupo         Grupo           @relation(fields: [grupoId], references: [id])
  anioLectivo   AnioLectivo     @relation(fields: [anioLectivoId], references: [id])
  @@unique([estudianteId, anioLectivoId]) // RN-08
  @@map("matriculas")
}

model AsignacionDocente {
  id            String     @id @default(cuid())
  docenteId     String
  asignaturaId  String
  grupoId       String
  anioLectivoId String
  estado        Boolean    @default(true)
  docente       Usuario    @relation(fields: [docenteId], references: [id])
  asignatura    Asignatura @relation(fields: [asignaturaId], references: [id])
  grupo         Grupo      @relation(fields: [grupoId], references: [id])
  anioLectivo   AnioLectivo @relation(fields: [anioLectivoId], references: [id])
  @@unique([docenteId, asignaturaId, grupoId, anioLectivoId]) // RN-10
  @@map("asignaciones_docente")
}

// ---------- Currículo ----------
enum TipoArea { AREA DIMENSION ENFOQUE }

model Area {
  id          String       @id @default(cuid())
  nombre      String
  tipo        TipoArea     @default(AREA)
  idioma      String       @default("es")
  orden       Int?
  asignaturas Asignatura[]
  unidades    Unidad[]
  @@map("areas")
}

model Nivel {
  id            String   @id @default(cuid())
  nombre        String
  orden         Int
  gradoSugerido String?
  bloques       Bloque[]
  // sin areaId: el área vive en la Unidad (RN-22)
  @@map("niveles")
}

model Bloque {
  id       String   @id @default(cuid())
  nivelId  String
  nombre   String
  orden    Int
  nivel    Nivel    @relation(fields: [nivelId], references: [id])
  unidades Unidad[]
  @@map("bloques")
}

model Unidad {
  id       String  @id @default(cuid())
  bloqueId String
  nombre   String
  orden    Int
  areaId   String  // ⭐ RN-22
  bloque   Bloque  @relation(fields: [bloqueId], references: [id])
  area     Area    @relation(fields: [areaId], references: [id])
  sesion   Sesion?
  @@map("unidades")
}

model Sesion {
  id        String          @id @default(cuid())
  unidadId  String          @unique // RN-23 (1:1)
  titulo    String
  orden     Int
  unidad    Unidad          @relation(fields: [unidadId], references: [id])
  secciones SesionSeccion[]
  @@map("sesiones")
}

enum SeccionTipo {
  OBJETIVO
  EVIDENCIAS_APRENDIZAJE
  TEMAS_PROFUNDIZACION
  INICIO
  DESARROLLO
  EVALUACION
  QUE_PUEDO_CALIFICAR
}

model SesionSeccion {
  id        String      @id @default(cuid())
  sesionId  String
  tipo      SeccionTipo
  contenido String
  sesion    Sesion      @relation(fields: [sesionId], references: [id], onDelete: Cascade)
  @@unique([sesionId, tipo]) // exactamente las 7 (RN-24)
  @@map("sesiones_secciones")
}

// ---------- Transversal ----------
model Auditoria {
  id            String   @id @default(cuid())
  autorId       String
  entidad       String
  registroId    String
  accion        String
  valorAnterior String?
  valorNuevo    String?
  fecha         DateTime @default(now())
  autor         Usuario  @relation("AutorAuditoria", fields: [autorId], references: [id])
  @@map("auditorias")
}
```

## Relacionados

[[Arquitectura-propuesta]] · [[Requerimientos-no-funcionales]] · [[Matriz-roles-permisos]] · `docs/modelo-de-entidades.md`
