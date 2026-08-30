# API Backlog App

Prefijo: `/backlog-app`

Gestor de backlog personal. Un usuario tiene proyectos, cada proyecto tiene features y
cada feature tiene tickets — todo dentro del **mismo documento**.

**Todos los endpoints requieren token.** Las convenciones generales (header `token`,
formato de errores, códigos) están en [README.md](./README.md), y el token se obtiene en
la [API Auth](./auth.md).

## Endpoints

| Método   | Ruta                        | Descripción                                       |
| -------- | --------------------------- | ------------------------------------------------- |
| `GET`    | `/backlog-app/projects`     | Lista los proyectos del usuario (resumen)         |
| `POST`   | `/backlog-app/projects`     | Crea un proyecto                                  |
| `GET`    | `/backlog-app/projects/:id` | Devuelve un proyecto con su árbol completo        |
| `PATCH`  | `/backlog-app/projects/:id` | Actualiza el proyecto, sus features y sus tickets |
| `DELETE` | `/backlog-app/projects/:id` | Da de baja el proyecto                            |

No hay endpoints propios de features ni de tickets: **se editan mandando el árbol completo
en el `PATCH` del proyecto.**

---

## Aislamiento y `404`

Todas las operaciones sobre `/:id` filtran por dueño y por `active: true`. Un id ajeno,
uno dado de baja, uno inexistente y uno mal formado devuelven **todos el mismo `404`**:
un `403` confirmaría que ese proyecto existe.

```json
{ "msg": "project not found" }
```

---

## Modelo de datos

### `Project`

| Campo         | Tipo        | Reglas                                                                     |
| ------------- | ----------- | -------------------------------------------------------------------------- |
| `_id`         | `ObjectId`  | Generado por Mongo                                                         |
| `ownerId`     | `ObjectId`  | Se toma del token, nunca del body                                          |
| `name`        | `string`    | **Requerido**, 1–100 caracteres. Único por usuario entre proyectos activos |
| `description` | `string`    | Opcional, máx. 2000 caracteres. Por defecto `""`                           |
| `features`    | `Feature[]` | Por defecto `[]`                                                           |
| `active`      | `boolean`   | Baja lógica. Un proyecto inactivo no se lista ni se lee                    |
| `createdAt`   | `Date`      | Automático                                                                 |
| `updatedAt`   | `Date`      | Automático                                                                 |
| `__v`         | `number`    | Versión. **Se necesita para actualizar** (ver control de concurrencia)     |

### `Feature`

| Campo         | Tipo       | Reglas                                                                 |
| ------------- | ---------- | ---------------------------------------------------------------------- |
| `_id`         | `ObjectId` | Opcional al enviar: si viene, edita esa feature; si no, crea una nueva |
| `name`        | `string`   | **Requerido**, 1–100 caracteres                                        |
| `description` | `string`   | Opcional, máx. 2000 caracteres                                         |
| `tickets`     | `Ticket[]` | Opcional, por defecto `[]`                                             |

### `Ticket`

| Campo         | Tipo             | Reglas                                                                |
| ------------- | ---------------- | --------------------------------------------------------------------- |
| `_id`         | `ObjectId`       | Opcional al enviar: si viene, edita ese ticket; si no, crea uno nuevo |
| `title`       | `string`         | **Requerido**, 1–200 caracteres                                       |
| `description` | `string`         | Opcional, máx. 2000 caracteres                                        |
| `type`        | `enum`           | **Requerido**                                                         |
| `priority`    | `enum`           | **Requerido**                                                         |
| `status`      | `enum`           | Opcional, por defecto `todo`                                          |
| `estimate`    | `number \| null` | Opcional, entero ≥ 0. `null` significa "sin estimar"                  |
| `closedAt`    | `Date \| null`   | Opcional, fecha ISO 8601 o `null`                                     |
| `createdAt`   | `Date`           | Automático                                                            |
| `updatedAt`   | `Date`           | Automático                                                            |

### Enums

| Campo      | Valores permitidos                                           |
| ---------- | ------------------------------------------------------------ |
| `type`     | `feature`, `bug`, `task`, `enhancement`, `refactor`, `spike` |
| `priority` | `must`, `should`, `could`, `wont`                            |
| `status`   | `todo`, `in_progress`, `blocked`, `done`, `cancelled`        |

> Un `_id` mal formado en una feature o ticket devuelve `400`: Mongoose lo descartaría en
> silencio y generaría otro, y el cliente nunca se enteraría de que perdió la identidad
> del subdocumento.

---

## Control de concurrencia

El proyecto se edita como un árbol completo, así que dos sesiones editando a la vez se
pisarían. Para evitarlo:

1. El `GET /:id` devuelve el proyecto con su `__v`.
2. El cliente edita sobre ese árbol y **manda el mismo `__v` de vuelta** en el `PATCH`.
3. Si el `__v` no coincide con el de la base, el árbol del cliente está viejo y se
   rechaza con `409`. Hay que recargar y reintentar.

```json
{ "msg": "project was modified by another session, reload it" }
```

La misma respuesta llega si dos peticiones simultáneas pasan la comparación y chocan al
guardar (`VersionError` de Mongoose).

---

## `GET /backlog-app/projects`

Lista los proyectos activos del usuario, ordenados por `updatedAt` descendente.

Es un **resumen**: no incluye `features` ni `__v`. Para editar hay que pedir el proyecto
completo con `GET /:id`.

**`200 OK`**

```json
{
    "projects": [
        {
            "_id": "66f0a1b2c3d4e5f6a7b8c9d0",
            "name": "apiary",
            "description": "API host para proyectos internos"
        }
    ]
}
```

**Errores:** `401` (`token needed` / `invalid token`), `403` (`user is inactive`).

---

## `POST /backlog-app/projects`

Crea un proyecto. `features` es opcional: se puede crear vacío y llenarlo después con
`PATCH`.

**Body**

```json
{
    "name": "apiary",
    "description": "API host para proyectos internos",
    "features": [
        {
            "name": "auth",
            "description": "login y gestión de cuenta",
            "tickets": [
                {
                    "title": "endpoint de recuperación de cuenta",
                    "description": "consumir el recoveryCode",
                    "type": "feature",
                    "priority": "should",
                    "status": "todo",
                    "estimate": 3
                }
            ]
        }
    ]
}
```

**`201 Created`**

```json
{ "project": { "...": "proyecto completo con _id, __v y timestamps" } }
```

**Errores**

| Código | `msg`                            | Motivo                                                               |
| ------ | -------------------------------- | -------------------------------------------------------------------- |
| `400`  | `validation error`               | Falta `name`, excede largos, o hay un enum/tipo inválido en el árbol |
| `401`  | `token needed` / `invalid token` | Falta el header `token` o es inválido                                |
| `403`  | `user is inactive`               | La cuenta fue dada de baja                                           |
| `409`  | `duplicate resource`             | Ya tenés un proyecto activo con ese `name`                           |

---

## `GET /backlog-app/projects/:id`

Devuelve el proyecto con el árbol completo de features y tickets, incluido el `__v` que
hace falta para editarlo.

**`200 OK`**

```json
{
    "project": {
        "_id": "66f0a1b2c3d4e5f6a7b8c9d0",
        "ownerId": "66f0a1b2c3d4e5f6a7b8c9aa",
        "name": "apiary",
        "description": "API host para proyectos internos",
        "features": [
            {
                "_id": "66f0a1b2c3d4e5f6a7b8c9d1",
                "name": "auth",
                "description": "login y gestión de cuenta",
                "tickets": [
                    {
                        "_id": "66f0a1b2c3d4e5f6a7b8c9d2",
                        "title": "endpoint de recuperación de cuenta",
                        "description": "consumir el recoveryCode",
                        "type": "feature",
                        "priority": "should",
                        "status": "todo",
                        "estimate": 3,
                        "closedAt": null,
                        "createdAt": "2026-08-30T12:00:00.000Z",
                        "updatedAt": "2026-08-30T12:00:00.000Z"
                    }
                ]
            }
        ],
        "active": true,
        "createdAt": "2026-08-30T12:00:00.000Z",
        "updatedAt": "2026-08-30T12:00:00.000Z",
        "__v": 0
    }
}
```

**Errores**

| Código | `msg`                            | Motivo                                     |
| ------ | -------------------------------- | ------------------------------------------ |
| `400`  | `validation error`               | `id` no es un ObjectId válido              |
| `401`  | `token needed` / `invalid token` | Falta el header `token` o es inválido      |
| `403`  | `user is inactive`               | La cuenta fue dada de baja                 |
| `404`  | `project not found`              | No existe, no es tuyo, o está dado de baja |

---

## `PATCH /backlog-app/projects/:id`

Actualiza el proyecto. **Es también la única vía para crear, editar y borrar features y
tickets.**

**Body** — `__v` es obligatorio, y hay que mandar **al menos uno** de `name`,
`description` o `features`.

```json
{
    "__v": 0,
    "name": "apiary",
    "features": [
        {
            "_id": "66f0a1b2c3d4e5f6a7b8c9d1",
            "name": "auth",
            "tickets": [
                {
                    "_id": "66f0a1b2c3d4e5f6a7b8c9d2",
                    "title": "endpoint de recuperación de cuenta",
                    "type": "feature",
                    "priority": "should",
                    "status": "done",
                    "closedAt": "2026-08-30T18:00:00.000Z"
                }
            ]
        }
    ]
}
```

### Cómo se aplica `features`

`features` es un **reemplazo completo** del árbol, no un merge:

| Qué mandás                     | Qué pasa                             |
| ------------------------------ | ------------------------------------ |
| Omitir `features`              | El árbol queda intacto               |
| `"features": []`               | Se borra el árbol entero             |
| Un elemento **con** `_id`      | Conserva su identidad y se actualiza |
| Un elemento **sin** `_id`      | Se crea como nuevo                   |
| Omitir un elemento que existía | Se borra                             |

Vale lo mismo para los `tickets` dentro de cada feature.

**`200 OK`**

```json
{ "project": { "...": "proyecto completo con el __v ya incrementado" } }
```

**Errores**

| Código | `msg`                                                | Motivo                                                                                           |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `400`  | `validation error`                                   | `id` inválido, falta `__v`, no se mandó ningún campo a modificar, o el árbol tiene algo inválido |
| `401`  | `token needed` / `invalid token`                     | Falta el header `token` o es inválido                                                            |
| `403`  | `user is inactive`                                   | La cuenta fue dada de baja                                                                       |
| `404`  | `project not found`                                  | No existe, no es tuyo, o está dado de baja                                                       |
| `409`  | `project was modified by another session, reload it` | El `__v` enviado quedó atrás — recargá y reintentá                                               |
| `409`  | `duplicate resource`                                 | El nuevo `name` choca con otro proyecto activo tuyo                                              |

---

## `DELETE /backlog-app/projects/:id`

Da de baja el proyecto. Es una **baja lógica**: el documento no se borra, se marca
`active: false`. Deja de listarse y de poder leerse, y su `name` se libera para un
proyecto nuevo.

**`200 OK`**

```json
{ "msg": "project deleted" }
```

**Errores**

| Código | `msg`                            | Motivo                                        |
| ------ | -------------------------------- | --------------------------------------------- |
| `400`  | `validation error`               | `id` no es un ObjectId válido                 |
| `401`  | `token needed` / `invalid token` | Falta el header `token` o es inválido         |
| `403`  | `user is inactive`               | La cuenta fue dada de baja                    |
| `404`  | `project not found`              | No existe, no es tuyo, o ya está dado de baja |
