# Plan del Front

Estado: **borrador**. Las decisiones abiertas están al final, sin resolver.

Documentación de la API: [README.md](./README.md) (convenciones generales),
[auth.md](./auth.md) y [backlog-app.md](./backlog-app.md).

---

## 1. Convenciones de la API

Lo que aplica a todas las peticiones, sacado del [README.md](./README.md):

- **Base URL en desarrollo:** `http://localhost:3000`. Del lado del front va en
  `VITE_API_URL`, nunca hardcodeada.
- **El token va en un header propio llamado `token`.** No es `Authorization: Bearer`.
- **Dura 7 días** y solo contiene el id del usuario.
- **El usuario se relee de la base en cada request privada**, así que una baja corta el
  acceso al instante aunque el token siga vigente. El cliente no puede confiar en que un
  token no vencido implique sesión válida.
- **Todos los errores traen `msg`.** El `400` es el único que además trae detalle campo por
  campo:

    ```json
    {
        "msg": "validation error",
        "errors": [{ "field": "username", "msg": "username must be between 3 and 30 characters" }]
    }
    ```

    Ese `errors[]` se mapea directo a `setError` de React Hook Form. Es la diferencia entre
    "algo estuvo mal" y un error debajo del campo correcto.

- **`GET /health`** no pide token y dice si el server y Mongo están vivos. Sirve para un
  cartel de "API caída" en vez de errores sueltos por toda la pantalla.

---

## 2. La restricción dominante

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

## 3. Rutas

| Ruta            | Qué es                                 | Acceso                          |
| --------------- | -------------------------------------- | ------------------------------- |
| `/login`        | Login                                  | Pública, redirige si hay sesión |
| `/register`     | Registro + pantalla del `recoveryCode` | Pública, ídem                   |
| `/projects`     | Lista de proyectos                     | Privada                         |
| `/projects/:id` | Detalle: features y tickets            | Privada                         |
| `/account`      | Cambiar username/password, dar de baja | Privada                         |
| `/`             | Redirect a `/projects`                 | —                               |
| `*`             | 404                                    | —                               |

Un `<ProtectedRoute>` envuelve las privadas y un `<GuestRoute>` las públicas de auth.
Layout compartido con header (usuario + logout).

---

## 4. Estructura de carpetas

```
src/
    store/store.ts
    routes/AppRouter.tsx
    shared/
        api/
            client.ts     axios: baseURL, header token, 401/403 global
            apiError.ts   ApiError { status, msg, errors? }
        components/       ModalLayout, Button, Input, Spinner...
        hooks/
    features/
        auth/            login, register, guards, authSlice
        account/         edición y baja de cuenta
        projects/        lista, creación, borrado, projectsSlice
        project-detail/  árbol, features, tickets, projectSlice
```

Dentro de cada feature: `components/` (solo JSX + Tailwind), `hooks/` (la lógica),
`api/`, `types.ts`.

---

## 5. Estado en Redux

| Slice           | Contenido                                                           |
| --------------- | ------------------------------------------------------------------- |
| `authSlice`     | `token`, `user`, estado de sesión. Lo único que persiste            |
| `projectsSlice` | La lista resumida de `GET /projects`                                |
| `projectSlice`  | El proyecto abierto con su árbol y su `__v`. De acá sale el `PATCH` |

`projectSlice` es el que más trabajo tiene: recibe los cambios locales de features y
tickets, y es la fuente del body del `PATCH`.

---

## 6. Auth

### 6.1 Rehidratación de la sesión

`GET /auth/me` existe, así que la sesión se recupera bien al recargar. El enfoque:

1. Se persisten **token y `user`** en el storage.
2. Al arrancar, el slice se inicializa **leyendo el storage de forma síncrona**. La app
   pinta al instante, sin pantalla de carga ni parpadeo de "no logueado".
3. En paralelo se dispara `GET /auth/me` para **revalidar**. Si responde `401` o `403`, se
   limpia la sesión y rebota a `/login`; si responde `200`, se refresca el `user` por si
   cambió en otra pestaña.

Persistir el `user` es solo para pintar rápido; **la fuente de verdad es `/auth/me`**. Por
eso no hace falta decodificar el `exp` del JWT a mano: la revalidación del arranque más el
manejo global del `401` cubren el token vencido, y encima cubren el caso que el `exp` no ve
— una cuenta dada de baja con el token todavía vigente.

### 6.2 Orden de trabajo

**Paso 1 — El cliente HTTP** (`shared/api/`, con axios). Es la base de todo lo demás: URL base, header
`token` inyectado solo, parseo, y una clase `ApiError { status, msg, errors? }` para que el
resto del código no toque `Response` nunca. Acá va el **manejo global de `401` / `403`**:
cualquier respuesta con `invalid token`, `token needed` o `user is inactive` dispara logout
y rebote a `/login`. Si no está centralizado, termina repetido en cada pantalla.

**Paso 2 — `authSlice` + tipos.** Estado `token`, `user`, `status`, `error`. Thunks:
`login`, `register`, `fetchMe`, `logout`.

**Paso 3 — Los guardianes de ruta.** `<ProtectedRoute>` manda a `/login` guardando en
`location.state.from` a dónde querías ir; `<GuestRoute>` manda a `/projects` si ya hay
sesión. Después del login se vuelve a `from`, o a `/projects` por defecto.

**Paso 4 — Formularios con React Hook Form.**

**Paso 5 — La pantalla del `recoveryCode`.**

### 6.3 Validación de los formularios

Espeja las reglas de la API: username de 3 a 30 caracteres con solo `a-z`, `0-9`, `.`, `-`,
`_`; password de mínimo 8. En registro se suma un campo de confirmación que es solo del
cliente.

El username **se normaliza a minúsculas y se recorta antes de mandarlo**. La API igual lo
hace, pero si no lo hacemos nosotros el usuario escribe `Cito`, le vuelve
`duplicate resource` y no entiende por qué.

### 6.4 Mapeo de errores a la UI

| Respuesta                 | Qué ve el usuario                                         |
| ------------------------- | --------------------------------------------------------- |
| `400 validation error`    | Cada `errors[].field` va a su campo con `setError` de RHF |
| `401 invalid credentials` | "Usuario o contraseña incorrectos" (ambiguo a propósito)  |
| `403 user is inactive`    | "Esta cuenta fue dada de baja"                            |
| `409 duplicate resource`  | Error en el campo `username`                              |

### 6.5 El `recoveryCode`

El registro **no** navega a `/projects` al terminar. Devuelve el código y se pasa a una
pantalla dentro de `/register` que lo muestra, con botón de copiar y un check obligatorio de
"ya lo guardé". Recién ahí se navega.

Vive en el slice como `pendingRecoveryCode` y **nunca se persiste**: se borra al confirmar.

> En ese momento el usuario ya tiene token válido, así que si escribe `/projects` en la barra
> entra y pierde el código. Se puede blindar, pero agrega complejidad para un caso raro.

### 6.6 Logout

No hay endpoint de logout: el token no se puede revocar del lado del servidor. Es solo
limpiar el slice y el storage y navegar a `/login`. El token sigue técnicamente vivo hasta
que vence, cosa que no podemos evitar desde el front.

---

## 7. Fricciones de la API a tener presentes

### 7.1 La lista de proyectos no trae progreso

`GET /projects` devuelve solo `_id`, `name` y `description` — sin `features`. En `/projects`
**no se puede** mostrar "8/12 tickets" ni barras de avance sin hacer un `GET /:id` por cada
proyecto. Opciones: aceptar una lista sobria, o pedir que el backend agregue contadores al
resumen.

### 7.2 La lista tampoco trae `__v`

Renombrar un proyecto desde la lista es imposible sin un `GET /:id` previo. Lo más simple es
que el rename viva solo dentro del detalle. El `DELETE` sí funciona desde la lista: no pide
`__v`.

### 7.3 `closedAt` lo maneja el cliente

Por los ejemplos de la doc, la API no lo setea sola. Cuando un ticket pasa a `done` se le
pone la fecha; si sale de `done`, vuelve a `null`.

### 7.4 El `409` de concurrencia necesita UI propia

No es un error que se pueda tragar. Hace falta: aviso de "alguien lo modificó", recarga del
proyecto y avisar que se perdieron los cambios sin guardar.

### 7.5 Otras notas

- Las bajas son lógicas (`active: false`), tanto de usuario como de proyecto.
- `404 project not found` es la respuesta unificada para id ajeno, inexistente, mal formado
  o dado de baja. No se puede distinguir el caso.
- Enums: `type` (`feature`, `bug`, `task`, `enhancement`, `refactor`, `spike`), `priority`
  (`must`, `should`, `could`, `wont`), `status` (`todo`, `in_progress`, `blocked`, `done`,
  `cancelled`).
- `estimate: null` significa "sin estimar".

---

## 8. Decisiones abiertas

> Ninguna está resuelta todavía. Las inclinaciones son sugerencias, no acuerdos.

### A. ¿RTK Query o thunks a mano?

RTK Query viene dentro de Redux Toolkit y da caché, estados de carga y refetch gratis. La
contra acá es que el modelo "editá el árbol y mandalo entero" pelea con su forma de pensar.
Con `createAsyncThunk` hay control total y menos magia, a cambio de escribir más.

_Inclinación: thunks, justamente por el árbol y el `__v`. Para auth la decisión casi no pesa
— son tres llamadas y no hay nada que cachear._

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

### D. ¿Dónde se guarda la sesión?

- **`localStorage`**: sobrevive al cierre del navegador. Cómodo y esperable para una app así.
- **`sessionStorage`**: se borra al cerrar la pestaña. Más seguro ante XSS, pero hay que
  loguearse más seguido.

_Inclinación: `localStorage`. Es una herramienta personal, y el token viaja en un header que
igual es legible por JS, así que `sessionStorage` no cambia tanto el panorama._

---

## 9. Pedidos al backend

Nada de esto bloquea, pero simplificaría el front:

- **Contadores en `GET /projects`** (tickets totales y cerrados por proyecto), para mostrar
  avance en la lista sin pedir cada proyecto entero. Ver 7.1.
- **`__v` en `GET /projects`**, para poder renombrar desde la lista. Ver 7.2.
