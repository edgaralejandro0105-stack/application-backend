# Changelog: Flujo Inseguro de Recuperación de Contraseña

## 1. Archivos Modificados

- **`src/models/User.model.js`**
  - Se modificaron los nombres de los campos a `reset_password_token` (String) y `reset_password_expires` (Date) para almacenar el token de recuperación y su expiración, alineándose con las mejores prácticas.

- **`src/schemas/auth.schema.js`**
  - Se reemplazó `recoverPasswordSchema` por `forgotPasswordSchema` para el nuevo endpoint.
  - El esquema `forgotPasswordSchema` valida que solo se reciba un `email`.
  - El esquema `resetPasswordSchema` valida la presencia de `token` y `newPassword` (con un mínimo de 6 caracteres).

- **`src/routes/auth.routes.js`**
  - Se eliminó el endpoint inseguro `POST /recover-password`.
  - Se crearon dos nuevos endpoints públicos (sin token JWT requerido):
    - `POST /forgot-password`
    - `POST /reset-password`

- **`src/controllers/authController.js`**
  - Se implementó `forgotPassword` para responder siempre con el mensaje genérico: *"Si el correo está registrado, se enviará un enlace de recuperación."*, evitando ataques de enumeración de usuarios.
  - Se mantuvo y adaptó `resetPassword` para interactuar con los nuevos campos de la base de datos.

- **`src/services/auth.service.js`**
  - **`forgotPassword(email)`**: Busca al usuario; si existe, genera un token seguro (`crypto.randomBytes(32)`), lo guarda junto a su expiración (15 minutos a partir de su generación) y envía un correo electrónico. Si no existe, no lanza un error, devolviendo simplemente un estado exitoso silencioso para la seguridad.
  - **`resetPassword(token, newPassword)`**: Verifica si existe un usuario con el token proporcionado y si la fecha actual es menor a `reset_password_expires`. Si el token es inválido o expiró, arroja un error 400. Si es válido, hashea la nueva contraseña, la guarda, y limpia los campos del token (fijándolos en `null`) para evitar su reutilización.

- **`La_Casona_API.postman_collection.json`**
  - Se actualizó el endpoint antiguo de recuperación de contraseña para incluir los dos endpoints correspondientes al flujo `forgot` y `reset`, añadiendo sus respectivos tests automáticos en Postman para validar los códigos de estado HTTP y los mensajes de respuesta.

---

## 2. Estructura de Peticiones y Respuestas (JSON)

### Endpoint 1: Solicitar Recuperación
`POST /api/auth/forgot-password` (Público)

**Cuerpo de la Petición (Request Body):**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Si el correo está registrado, se enviará un enlace de recuperación."
}
```
*(Nota: Responde lo mismo independientemente de si el correo existe o no).*

---

### Endpoint 2: Restablecer Contraseña
`POST /api/auth/reset-password` (Público)

**Cuerpo de la Petición (Request Body):**
```json
{
  "token": "TOKEN_ALEATORIO_RECIBIDO_EN_EL_CORREO",
  "newPassword": "nuevaContrasena123"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente."
}
```

**Respuesta de Error (400 Bad Request):**
*(Ocurre si el token no existe, ya fue usado, o si pasaron más de 15 minutos desde su generación).*
```json
{
  "status": "fail",
  "message": "Token inválido o expirado"
}
```
