Antes de escribir nada, el plan. Y arranco por un hallazgo que cambia el diseño.

El problema: no hay GET /auth/me
En auth.md los endpoints son register, login, PATCH /auth/me y DELETE /auth/me. No hay forma de pedir el usuario a partir del token.

Dos consecuencias:

Hay que persistir el objeto user completo, no solo el token. Si guardáramos solo el token, al recargar la página tendríamos sesión pero no sabríamos ni el username para mostrar en el header.
No se puede validar el token al arrancar. Nos enteramos de que venció recién en la primera request real. Así que el arranque es optimista: si hay sesión guardada, entrás; si el token está podrido, el primer 401 te saca.
Si más adelante el backend suma un GET /auth/me, esto se simplifica bastante. Vale la pena pedirlo.

Orden de trabajo
Paso 1 — El cliente HTTP (shared/api/)

Es la base de todo lo demás. Un wrapper de fetch con la URL base desde VITE_API_URL, el header token inyectado solo, parseo de la respuesta y una clase ApiError { status, msg } para que el resto del código no toque Response nunca.

Acá va también el manejo global del 401 / 403: cualquier request que devuelva invalid token o user is inactive dispara logout y rebote a /login. Si eso no está centralizado, termina repetido en cada pantalla.

Paso 2 — authSlice + tipos

Estado: token, user, status, error. Se inicializa leyendo el storage de forma síncrona, así no hay parpadeo de "no logueado" en el primer render ni pantalla de carga al arrancar.

Thunks: login, register, logout. Sugiero createAsyncThunk acá — son dos mutaciones, RTK Query no aporta nada porque no hay nada que cachear. Esto no nos ata para la decisión A del plan, que es donde de verdad importa.

Paso 3 — Las rutas guardianas

<ProtectedRoute>: sin sesión → /login, guardando en location.state.from a dónde querías ir.
<GuestRoute>: con sesión → /projects. Evita que un logueado vea el login.
Después del login te manda a from si venías rebotado, o a /projects por defecto.

Paso 4 — Formularios con React Hook Form

Validación espejando las reglas de la API: username de 3 a 30 con a-z 0-9 . - _, password mínimo 8, y en registro un campo de confirmación que es solo del cliente. El username se normaliza a minúsculas antes de mandarlo — la API igual lo hace, pero si no lo hacemos nosotros el usuario escribe Cito, le rebota duplicate resource y no entiende por qué.

Mapeo de errores:

Respuesta Qué ve el usuario
401 invalid credentials "Usuario o contraseña incorrectos" (ambiguo a propósito, como la API)
403 user is inactive "Esta cuenta fue dada de baja"
409 duplicate resource Error en el campo username, vía setError de RHF
400 validation error Error general del form
Paso 5 — El recoveryCode

El registro no navega a /projects al terminar. Devuelve el código y pasamos a una pantalla dentro de /register que lo muestra, con botón de copiar y un check obligatorio de "ya lo guardé". Recién ahí navegamos.

El código vive en el slice como pendingRecoveryCode y nunca se persiste — se borra al confirmar.

Un detalle honesto: en ese momento el usuario ya tiene token válido, así que si escribe /projects en la barra, entra y pierde el código. Se puede blindar, pero agrega complejidad para un caso raro. Yo lo dejaría así.

Estructura

src/
shared/api/
client.ts wrapper de fetch, header token, 401/403 global
apiError.ts
features/auth/
api/authApi.ts
authSlice.ts
types.ts
hooks/ useLoginForm, useRegisterForm
components/ LoginPage, RegisterPage, RecoveryCodeStep, AuthLayout
routes/ ProtectedRoute, GuestRoute
routes/AppRouter.tsx
Necesito que decidas dos cosas

1. ¿Dónde guardamos la sesión? (la decisión D del plan, que ahora ya no se puede postergar)

localStorage — sobrevive al cierre del navegador. Es lo cómodo y lo esperable para una app así.
sessionStorage — se borra al cerrar la pestaña. Más seguro ante XSS, pero te loguea cada vez.
Me inclino por localStorage: es una herramienta personal, y el token viaja en un header que igual es legible por JS, así que sessionStorage no cambia tanto el panorama.

2. ¿Hago logout automático por token vencido? El token es un JWT, así que se le puede leer el exp sin pedirle nada al servidor y cerrar la sesión antes de que falle una request. Son unas pocas líneas y evita el 401 feo. La alternativa es no hacer nada y dejar que el primer 401 limpie.

Y una cosa que sigo necesitando: la URL base de la API. Puedo escribir todo contra VITE_API_URL y dejarte un .env.example, pero hasta que no la tengamos no se puede probar nada de esto de verdad.
