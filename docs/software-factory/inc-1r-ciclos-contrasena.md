# INC1R-03 · Ciclos de contraseña por rol

Tarjeta: t_7e60342c · Rama: `backend/t_7e60342c-contrasenas` · Base: `38d83dc`.
Requerimiento: `inc-1r-requerimiento-aprobado.md` §4.1–4.4.

## Implementado

| Ciclo | Dónde | Comportamiento |
|---|---|---|
| Primer ADMIN | `prisma/seed.ts` | Clave desde `SEED_ADMIN_PASSWORD`; se rechaza si no cumple la política (≥10, letra y número); nunca sobrescribe una cuenta existente ni se imprime. |
| Invitación ADMIN | `cuentas.invitarAdmin`, `POST /api/usuarios/administradores` | Cuenta `PENDIENTE_ACTIVACION` sin hash; token `INVITACION` de 24 h y un solo uso; al aceptarlo la cuenta pasa a `ACTIVO`. |
| Reenvío | `cuentas.reenviarInvitacion`, `POST /api/usuarios/[id]/invitacion` | Solo ADMIN pendiente; emite un enlace nuevo e invalida el anterior. |
| DOCENTE | `cuentas.crearDocente`, `POST /api/usuarios/docentes` | `ACTIVO` + `debeCambiarContrasena`; la temporal (3 palabras + 4 dígitos) se devuelve una sola vez con `Cache-Control: no-store`. |
| Cambio obligatorio | `proxy.ts`, `requerirRol`, `/cuenta/contrasena` | Con la marca activa, toda página redirige a `/cuenta/contrasena` y toda API responde 403 `CAMBIO_CONTRASENA_REQUERIDO`. Tras cambiar, se cierra la sesión (el trigger revoca los JWT). |
| ESTUDIANTE | `cuentas.crearEstudiante`, `POST /api/usuarios/estudiantes` | Contraseña legible `palabra-palabra-NNNN` (≥10, CSPRNG); se devuelve una vez; solo se guarda bcrypt. No cambia su propia contraseña. |
| Restablecimiento estudiantes | `cuentas.restablecerEstudiantes`, `POST /api/usuarios/estudiantes/restablecer-contrasenas` | Uno o varios (≤500). ADMIN: cualquiera. DOCENTE: solo con asociación activa (año ACTIVO) en un grupo donde tiene asignación ACTIVA o es director. Todo o nada; responde CSV `correo,contrasena` (BOM, escape RFC 4180, anti-fórmulas), sin persistencia para nueva descarga. |
| Recuperación por correo | `cuentas.solicitarRecuperacion` | Solo ADMIN/DOCENTE `ACTIVO`. ESTUDIANTE, pendiente, inactivo o inexistente: silencio. En desarrollo sin `SMTP_HOST` el enlace sale por consola (`correo.ts`). |
| Rate limiting | `limite.ts`, acción `pedirRecuperacion` | 3/h por correo y 10/h por IP; excedido se descarta sin cambiar la respuesta (no enumera). El bloqueo de login existente (5 fallos/15 min) se conserva. |

Almacenamiento: contraseñas con bcrypt (costo 12); tokens solo como SHA-256. Migración `20261002020000_inc1r_ciclos_contrasena` agrega `restablecimientos_contrasena.tipo` (`RECUPERACION`|`INVITACION`, validado por trigger).

## Decisiones y pendientes

- 🔶 Los límites en memoria sirven para una sola instancia; varias instancias requieren almacenamiento compartido.
- 🔶 El IP se toma de `x-forwarded-for`; detrás de un proxy no confiable puede falsificarse (el límite por correo sigue aplicando).
- La UI de administración (crear usuarios, invitar, seleccionar estudiantes y descargar CSV) es de INC1R-05; aquí quedan servicio y APIs.
- Restablecer estudiantes no fuerza cambio (§4.3: el estudiante conserva la contraseña).

## Verificación

- `npm run test`: 45/45 (nuevo `src/server/auth/cuentas.test.ts`, integración en SQLite temporal con migraciones reales).
- `npm run lint`: sin errores.
- `npm run build`: OK.
