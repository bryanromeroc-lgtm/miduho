## Context

`fundacion-actividades` (sin implementar) define tipos, currículo y el modelo de intentos. Este cambio adelanta lo que no necesita base de datos: tipos, reproductor y contenido.

## Decisions

### D1. Práctica libre hasta que existan las asignaciones
El puerto `PuertoActividadesDeMateria` recibe un adaptador `actividadesDeCatalogo` que lee el currículo por nombre de asignatura y grado del grupo. Cada actividad sale `disponible`, sin fechas y con `intentosMax: null`. No se guarda nada; el reproductor lo dice («Tu resultado todavía no se guarda»).
- *Alternativa:* guardar el mejor resultado en `localStorage`. Descartada: la vista se renderiza en el servidor y no lo vería, y crearía una «nota» que no es auditable.

### D2. Calificación en el cliente, con la misma función pura
En práctica libre el contenido completo (con soluciones) viaja al navegador y se califica con `calificarIntento` del tipo. 🔶 Cuando las actividades cuenten como nota, el servidor enviará `paraEstudiante` (sin soluciones) y calificará por ítem (D8 de `fundacion-actividades`); los tipos ya separan `calificar` y `esquemaRespuesta` para eso.

### D3. El currículo se lee del disco
`apps/web/curriculo/actividades/<asignatura>/<grado>/<slug>.json`, leído y validado por `crearCatalogo` (en producción una vez; en desarrollo en cada consulta). Va dentro de `apps/web` (no en la raíz, como dice D1 de `fundacion-actividades`) porque la imagen Docker solo copia `apps/web`. 🔶 La importación a la base (3.3) lo reemplazará.

### D4. Tipos nuevos: sopa de letras y palabra secreta
De la investigación (`docs/actividades/tipos.md`). La sopa se arma de forma determinista a partir de las palabras, para que el servidor pueda verificar una línea marcada. La palabra secreta es el ahorcado sin el ahorcado.

### D5. Accesibilidad
Nada exige arrastrar; aciertos y errores con ícono y texto, anunciados en una región `status`; el foco pasa al enunciado al cambiar de pregunta y al botón de avance al responder; el reloj del concurso nunca corta.

## Risks / Trade-offs

- [Las soluciones están en el HTML] → Aceptable en práctica libre, sin nota. Se corrige con D2 antes de contar como nota.
- [55 archivos escritos a mano pueden tener errores de contenido] → La prueba valida forma, no verdad: requieren revisión docente 🔶.
- [`ordenar` puntúa por posición exacta] → Regla abierta en D4 🔶.
