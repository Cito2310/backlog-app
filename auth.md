# API Auth

Prefijo: `/auth`

API transversal del apiario: el token que emite sirve para todas las demás APIs.
Las convenciones generales (header `token`, formato de errores, códigos) están en
[README.md](./README.md).

## Endpoints

| Método   | Ruta             | Token | Descripción                      |
| -------- | ---------------- | ----- | -------------------------------- |
| `POST`   | `/auth/register` | No    | Crea una cuenta y devuelve token |
| `POST`   | `/auth/login`    | No    | Autentica y devuelve token       |
| `PATCH`  | `/auth/me`       | Sí    | Edita el usuario del token       |
| `DELETE` | `/auth/me`       | Sí    | Da de baja el usuario del token  |

Las rutas privadas operan **siempre sobre el usuario del token**, nunca sobre un id de la
URL, y exigen `currentPassword`: un token robado no alcanza para cambiar credenciales ni
dar de baja la cuenta.

---

## Objeto `user`

Es lo que devuelven todos los endpoints que responden un usuario. `passwordHash` y
`recoveryCodeHash` se eliminan al serializar, nunca salen de la API.

```json
{
    "_id": "66f0a1b2c3d4e5f6a7b8c9d0",
    "username": "cito",
    "recoveryCodeUsedAt": null,
    "active": true,
    "createdAt": "2026-08-30T12:00:00.000Z",
    "updatedAt": "2026-08-30T12:00:00.000Z",
    "__v": 0
}
```

| Campo                | Tipo           | Notas                                                |
| -------------------- | -------------- | ---------------------------------------------------- |
| `username`           | `string`       | Único, siempre en minúsculas y sin espacios al borde |
| `recoveryCodeUsedAt` | `Date \| null` | `null` mientras el código de recuperación no se usó  |
| `active`             | `boolean`      | `false` tras un `DELETE /auth/me` (baja lógica)      |

---

## Reglas de los campos

| Campo             | Reglas                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `username`        | String, entre **3 y 30** caracteres. Solo `a-z`, `0-9`, `.`, `-`, `_`. Se normaliza a minúsculas y se recorta |
| `password`        | String, mínimo **8** caracteres                                                                               |
| `currentPassword` | String, mínimo **8** caracteres. Contraseña actual del usuario                                                |

---

## `POST /auth/register`

Crea una cuenta. **Pública.**

**Body**

```json
{
    "username": "cito",
    "password": "unaClaveSegura"
}
```

**`201 Created`**

```json
{
    "user": { "...": "objeto user" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "recoveryCode": "9f3c1a7e5b2d8046af1c3e5d7b9a0246"
}
```

> **`recoveryCode` se muestra una única vez.** En la base solo queda su hash; si el
> cliente no lo guarda, no hay forma de recuperarlo. (El endpoint que lo consume todavía
> no está implementado.)

**Errores**

| Código | `msg`                | Motivo                        |
| ------ | -------------------- | ----------------------------- |
| `400`  | `validation error`   | Username o password inválidos |
| `409`  | `duplicate resource` | El username ya existe         |

---

## `POST /auth/login`

Autentica y emite un token nuevo. **Pública.**

**Body**

```json
{
    "username": "cito",
    "password": "unaClaveSegura"
}
```

**`200 OK`**

```json
{
    "user": { "...": "objeto user" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores**

| Código | `msg`                 | Motivo                                                                              |
| ------ | --------------------- | ----------------------------------------------------------------------------------- |
| `400`  | `validation error`    | Falta `username` o `password`                                                       |
| `401`  | `invalid credentials` | Usuario inexistente o contraseña incorrecta (mismo mensaje para ambos, a propósito) |
| `403`  | `user is inactive`    | La cuenta fue dada de baja                                                          |

---

## `PATCH /auth/me`

Cambia el username y/o la contraseña del usuario del token. **Requiere token.**

**Body** — `currentPassword` es obligatoria, y hay que mandar **al menos uno** de
`username` o `password`.

```json
{
    "currentPassword": "unaClaveSegura",
    "username": "cito.dev",
    "password": "otraClaveSegura"
}
```

**`200 OK`**

```json
{ "user": { "...": "objeto user" } }
```

**Errores**

| Código | `msg`                            | Motivo                                                      |
| ------ | -------------------------------- | ----------------------------------------------------------- |
| `400`  | `validation error`               | Campos inválidos, o no se mandó ni `username` ni `password` |
| `401`  | `token needed` / `invalid token` | Falta el header `token` o es inválido/expirado              |
| `401`  | `invalid credentials`            | `currentPassword` incorrecta                                |
| `403`  | `user is inactive`               | La cuenta fue dada de baja                                  |
| `409`  | `duplicate resource`             | El nuevo username ya existe                                 |

---

## `DELETE /auth/me`

Da de baja el usuario del token. **Requiere token.**

Es una **baja lógica**: el documento no se borra, se marca `active: false`. El token deja
de funcionar en el acto (todas las rutas privadas devuelven `403`) y el login pasa a
responder `403`. El username sigue ocupado.

**Body**

```json
{ "currentPassword": "unaClaveSegura" }
```

**`200 OK`**

```json
{ "msg": "user deactivated" }
```

**Errores**

| Código | `msg`                            | Motivo                                         |
| ------ | -------------------------------- | ---------------------------------------------- |
| `400`  | `validation error`               | Falta `currentPassword` o es muy corta         |
| `401`  | `token needed` / `invalid token` | Falta el header `token` o es inválido/expirado |
| `401`  | `invalid credentials`            | `currentPassword` incorrecta                   |
| `403`  | `user is inactive`               | La cuenta ya estaba dada de baja               |
