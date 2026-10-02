# Inc. 1R · Autorización y revocación de sesiones

**Tarjeta:** `t_d3d97223`  
**Estado:** implementado, pendiente de gate de integración  
**Fuente:** [requerimiento aprobado](inc-1r-requerimiento-aprobado.md), secciones 2.4, 3 y 4.4.

## Decisiones

- El JWT identifica la cuenta y conserva la `versionSesion` con la que se emitió, pero no es fuente suficiente de autorización.
- Cada llamada de `auth()` consulta la cuenta: exige estado `ACTIVO`, compara `versionSesion` y vuelve a cargar los roles vigentes.
- SQLite incrementa `versionSesion` y registra `sesionesRevocadasEn` mediante triggers cuando cambia el estado, cambia el hash de contraseña o se agrega/retira un rol. Así, una escritura futura no puede omitir accidentalmente la revocación.
- El proxy protege todas las páginas salvo `/login` y `/recuperar`; excluye recursos estáticos y APIs. Las APIs autorizan de nuevo en servidor mediante `requerirRol`.
- La matriz de navegación permite Biblioteca y Cuenta a cualquier rol autenticado; administración a ADMIN; Mi curso a DOCENTE; y la maqueta general a DOCENTE o ESTUDIANTE. La autorización horizontal de asignaciones conserva el filtro forzado por el usuario de sesión.
- Una cuenta `ADMIN + DOCENTE` entra como ADMIN cuando `ultimoContexto` es `NULL`. `POST /api/sesion/contexto` persiste `ADMIN` o `DOCENTE` solo si el rol continúa vigente. El contexto no concede permisos adicionales.

## Contrato del selector

`POST /api/sesion/contexto`

```json
{ "contexto": "ADMIN" }
```

Responde `200` con el contexto persistido; `401` sin sesión vigente, `403` si el contexto no corresponde a los roles actuales y `400` para un valor inválido. Las mutaciones validan el origen del sitio.

## Evidencia local

- `npm test`: 28/28 pruebas, 4 archivos.
- `npm run lint`: sin errores.
- `npm run build`: compilación Next.js 16 y TypeScript correcta; incluye `/api/sesion/contexto` y Proxy.
- Smoke con `next start`: `/login` responde 200, `/biblioteca` sin sesión redirige 307 a login conservando `desde`, y `POST /api/sesion/contexto` sin sesión responde 401.
- Migraciones reales verificadas desde base vacía y desde el esquema previo.
- Pruebas negativas: DOCENTE→administración, ESTUDIANTE→Mi curso, ADMIN puro→maqueta general y selección de contexto sin rol.
- Prueba de revocación: la versión avanza al cambiar contraseña, retirar rol y desactivar cuenta; un contexto fuera del dominio permitido se rechaza en la base de datos.
