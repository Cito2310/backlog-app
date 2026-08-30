# Plan del Front

Estado: **borrador**. Las decisiones abiertas están al final, sin resolver.

Documentación de la API: [auth.md](./auth.md) y [backlog-app.md](./backlog-app.md).

---

## 1. La restricción dominante

No hay endpoints de features ni de tickets. Editar el título de **un** ticket significa
mandar el **árbol completo del proyecto** en un `PATCH /backlog-app/projects/:id`, con el
`__v` correcto. Y como `features` es un reemplazo total, **omitir un elemento lo borra**.

Consecuencia directa sobre el diseño: el body del `PATCH` **nunca** se arma desde un
formulario. Siempre sale del árbol completo que vive en Redux, y el form aplica un cambio
quirúrgico sobre esa copia.

> **Regla:** una sola función `buildProjectPatch(project)` es el único lugar del código que
> construye ese body. Todo lo demás edita el árbol en el store.

Si alguna vez se arma el body "a mano" con lo que tenía el form, se borran features enteras
y la API no se queja.

---

## 2. Rutas

| Ruta            | Qué es                                 | Acceso                         |
| --------------- | -------------------------------------- | ------------------------------ |
| `/login`        | Login                                  | Pública, redirige si hay token |
| `/register`     | Registro + pantalla del `recoveryCode` | Pública, ídem                  |
| `/projects`     | Lista de proyectos                     | Privada                        |
| `/projects/:id` | Detalle: features y tickets            | Privada                        |
| `/account`      | Cambiar username/password, dar de baja | Privada                        |
| `/`             | Redirect a `/projects`                 | —                              |
| `*`             | 404                                    | —                              |

Un `<ProtectedRoute>` envuelve las privadas. Layout compartido con header (usuario + logout).

---

## 3. Estructura de carpetas

```
src/
    store/store.ts
    shared/
        api/          cliente fetch + header token + mapeo de errores
        ui/           Button, Input, Modal, Spinner...
        hooks/
    features/
        auth/            login, register, protectedRoute, authSlice
        account/         edición y baja de cuenta
        projects/        lista, creación, borrado, projectsSlice
        project-detail/  árbol, features, tickets, projectSlice
```

Dentro de cada feature: `components/` (solo JSX + Tailwind), `hooks/` (la lógica),
`api/`, `types.ts`.

---

## 4. Estado en Redux

| Slice           | Contenido                                                           |
| --------------- | ------------------------------------------------------------------- |
| `authSlice`     | `token`, `user`, estado de sesión. Lo único que persiste            |
| `projectsSlice` | La lista resumida de `GET /projects`                                |
| `projectSlice`  | El proyecto abierto con su árbol y su `__v`. De acá sale el `PATCH` |

`projectSlice` es el que más trabajo tiene: recibe los cambios locales de features y
tickets, y es la fuente del body del `PATCH`.

---

## 5. Fricciones de la API a tener presentes

### 5.1 La lista no trae progreso

`GET /projects` devuelve solo `_id`, `name` y `description` — sin `features`. En `/projects`
**no se puede** mostrar "8/12 tickets" ni barras de avance sin hacer un `GET /:id` por cada
proyecto. Opciones: aceptar una lista sobria, o pedir que el backend agregue contadores al
resumen.

### 5.2 La lista tampoco trae `__v`

Renombrar un proyecto desde la lista es imposible sin un `GET /:id` previo. Lo más simple es
que el rename viva solo dentro del detalle. El `DELETE` sí funciona desde la lista: no pide
`__v`.

### 5.3 `closedAt` lo maneja el cliente

Por los ejemplos de la doc, la API no lo setea sola. Cuando un ticket pasa a `done` se le
pone la fecha; si sale de `done`, vuelve a `null`.

### 5.4 El `409` de concurrencia necesita UI propia

No es un error que se pueda tragar. Hace falta: aviso de "alguien lo modificó", recarga del
proyecto y avisar que se perdieron los cambios sin guardar.

### 5.5 El `recoveryCode` se muestra una sola vez

El registro debería terminar en una pantalla que obligue a copiarlo, con un check de "ya lo
guardé" antes de dejar entrar. El endpoint que lo consume todavía no existe del lado del
backend, así que por ahora es solo custodia.

### 5.6 Otras notas

- El token va en un header llamado `token`, no en `Authorization: Bearer`.
- Las bajas son lógicas (`active: false`), tanto de usuario como de proyecto.
- `404 project not found` es la respuesta unificada para id ajeno, inexistente, mal formado
  o dado de baja. No se puede distinguir el caso.
- Enums: `type` (`feature`, `bug`, `task`, `enhancement`, `refactor`, `spike`), `priority`
  (`must`, `should`, `could`, `wont`), `status` (`todo`, `in_progress`, `blocked`, `done`,
  `cancelled`).
- `estimate: null` significa "sin estimar".

---

## 6. Decisiones abiertas

> Ninguna está resuelta todavía. Las inclinaciones son sugerencias, no acuerdos.

### A. ¿RTK Query o thunks a mano?

RTK Query viene dentro de Redux Toolkit y da caché, estados de carga y refetch gratis. La
contra acá es que el modelo "editá el árbol y mandalo entero" pelea con su forma de pensar.
Con `createAsyncThunk` hay control total y menos magia, a cambio de escribir más.

_Inclinación: thunks, justamente por el árbol y el `__v`._

### B. ¿Autoguardado o guardado explícito?

- **Autoguardado:** cada cambio dispara su `PATCH`. Nunca se pierde nada, muchas requests.
- **Explícito:** se edita libre y hay un botón "Guardar" con indicador de cambios pendientes.
  Menos requests, pero si te vas perdés todo y hay más chances de chocar con un `409`.

_Inclinación: autoguardado, porque encaja con el `__v` — cada respuesta devuelve el `__v`
nuevo y el cliente siempre queda al día._

### C. ¿Cómo se ve el detalle?

- **Acordeón** de features con sus tickets adentro: respeta la jerarquía real del dato.
- **Kanban** por `status` con columnas `todo / in_progress / blocked / done / cancelled`:
  más lindo y más trabajo.

### D. ¿Dónde se guarda el token?

- `localStorage`: sobrevive al cierre del navegador, cómodo.
- Memoria + `sessionStorage`: más seguro ante XSS, hay que loguearse más seguido.

---

## 7. Pendientes de información

- **URL base de la API.**
- El `README.md` de convenciones generales que referencian [auth.md](./auth.md) y
  [backlog-app.md](./backlog-app.md) — no está en el repo.

El cliente HTTP es lo primero que hay que escribir, y depende de esos dos puntos.
