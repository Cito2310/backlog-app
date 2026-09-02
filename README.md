# API de Apiary

Apiary es un único host Express que expone varias APIs internas. Cada API vive bajo su
propio prefijo, y `auth` es transversal: el mismo token sirve para todas.

| API         | Prefijo        | Documentación                      |
| ----------- | -------------- | ---------------------------------- |
| Auth        | `/auth`        | [auth.md](./auth.md)               |
| Backlog App | `/backlog-app` | [backlog-app.md](./backlog-app.md) |

- **Base URL en desarrollo:** `http://localhost:3000` (configurable con `PORT`)
- **Formato:** JSON en request y response (`Content-Type: application/json`)

---

## Autenticación

Las rutas privadas esperan el JWT en un header propio llamado `token`. **No** se usa
`Authorization: Bearer`.

```http
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El token se obtiene en `POST /auth/register` o `POST /auth/login`, dura **7 días** y solo
contiene el id del usuario. En cada petición privada se relee el usuario de la base, así
que una baja o desactivación corta el acceso de inmediato aunque el token siga vigente.

---

## Formato de errores

Todos los errores salen por un único manejador central, siempre con la clave `msg`.

**Error de validación (400)** — es el único que además trae el detalle campo por campo:

```json
{
    "msg": "validation error",
    "errors": [
        { "field": "username", "msg": "username must be between 3 and 30 characters" },
        { "field": "password", "msg": "password must be at least 8 characters" }
    ]
}
```

**Cualquier otro error:**

```json
{ "msg": "invalid credentials" }
```

### Códigos usados

| Código | Cuándo aparece                                                                        |
| ------ | ------------------------------------------------------------------------------------- |
| `400`  | El body o los params no pasaron las validaciones                                      |
| `401`  | Falta el token, el token es inválido, o la `currentPassword` no coincide              |
| `403`  | El usuario está desactivado (`active: false`)                                         |
| `404`  | El recurso no existe, no es tuyo, o la ruta no existe                                 |
| `409`  | Conflicto: recurso duplicado, o edición concurrente detectada por `__v`               |
| `500`  | Error no contemplado. La respuesta es genérica; el detalle queda en el log del server |

### Rutas inexistentes

Cualquier ruta que no matchee devuelve `404` indicando método y URL:

```json
{ "msg": "route not found: GET /backlog-app/tickets" }
```

---

## `GET /health`

Estado del servidor completo, no de una API en particular. **No requiere token.**

Responde `200` si Mongo está conectado, o `503` si no lo está. El body es el mismo en
ambos casos, solo cambian `status` y `database`.

```json
{
    "status": "ok",
    "database": "connected",
    "uptime": 12.34,
    "timestamp": "2026-08-30T12:00:00.000Z"
}
```

| Campo       | Valores                        |
| ----------- | ------------------------------ |
| `status`    | `ok` \| `degraded`             |
| `database`  | `connected` \| `disconnected`  |
| `uptime`    | Segundos desde que arrancó     |
| `timestamp` | Fecha ISO 8601 de la respuesta |
