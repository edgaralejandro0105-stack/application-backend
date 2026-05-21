# Changelog Fase 4 - Envío de Correos (Nodemailer)

## Objetivo
Integrar el envío de correos transaccionales en la plataforma, específicamente para permitir a los usuarios recuperar sus contraseñas a través de un enlace seguro con un token temporal, siguiendo las mejores prácticas de seguridad de API Rest.

## Cambios Realizados

### 1. Instalación y Configuración
- Se instaló la dependencia `nodemailer` (`npm install nodemailer`).
- Se añadieron variables de entorno al archivo `.env` simulando la conexión a un servicio SMTP estándar (por defecto, preparado para herramientas como Mailtrap en desarrollo):
  ```env
  SMTP_HOST=smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_USER=test_user
  SMTP_PASS=test_password
  FRONTEND_URL=http://localhost:5173
  ```

### 2. Servicio de Correo Genérico (`src/services/email.service.js`)
- Se creó una clase `EmailService` reutilizable que instancia el transportador (`transporter`) de Nodemailer usando las variables de entorno.
- Posee un método `sendEmail({ to, subject, html })` preparado para ser importado y ejecutado desde cualquier otro servicio de la aplicación.

### 3. Modelo de Autenticación (`src/models/User.model.js`)
- En lugar de crear una tabla extra, se optó por una aproximación ligera añadiendo dos nuevas columnas al modelo `User`:
  - `reset_token` (STRING): Almacena el token único (hash hexadecimal) generado cuando el usuario solicita la recuperación.
  - `reset_token_expires` (DATE): Define el tiempo límite en el que el token es válido (1 hora).

### 4. Flujo de Recuperación en Auth
Se actualizaron los esquemas, controladores y rutas de autenticación:
- **`POST /api/auth/recover-password`**: 
  - Recibe el `email` del usuario.
  - Genera un token aleatorio con `crypto` y lo guarda en el usuario junto a su fecha de expiración.
  - Utiliza `email.service.js` para enviar un correo HTML con un enlace de prueba simulado hacia el frontend (`FRONTEND_URL/reset-password?token=XYZ`).
- **`POST /api/auth/reset-password`**:
  - Recibe `token` y `newPassword`.
  - Verifica que el token exista en la base de datos y no haya expirado (`reset_token_expires > Date.now()`).
  - Hashea la nueva contraseña, la actualiza y vacía (anula) los campos del token para evitar re-utilizaciones.

---

## Archivos Modificados
- `package.json` (Dependencia `nodemailer`)
- `.env` (Variables SMTP)
- `src/models/User.model.js` (Campos `reset_token`, `reset_token_expires`)
- `src/schemas/auth.schema.js` (Nuevos esquemas de validación)
- `src/services/auth.service.js` (Lógica de recuperación)
- `src/controllers/authController.js` (Nuevos endpoints)
- `src/routes/auth.routes.js` (Rutas expuestas)
- `src/services/email.service.js` (NUEVO - Servicio de correo)
- `test_email_flow.js` (NUEVO - Script de pruebas automatizadas)

## Guía de Pruebas
Existen dos formas principales de probar la funcionalidad:

**Opción A (Script Automático End-to-End)**
Ejecuta en tu terminal:
```bash
node test_email_flow.js
```
Este script creará un usuario falso, enviará el correo, te imprimirá en consola el token y lo verificará.

**Opción B (Manual vía Postman)**
1. Inicia el servidor: `npm start`
2. **URL de Recuperación:** `POST http://localhost:3000/api/auth/recover-password`
   - **Body JSON:** `{ "email": "tu_correo@gmail.com" }`
3. Copia el token que llega a tu bandeja de entrada.
4. **URL de Reset:** `POST http://localhost:3000/api/auth/reset-password`
   - **Body JSON:** `{ "token": "EL_TOKEN_AQUÍ", "newPassword": "NuevaClave123" }`
