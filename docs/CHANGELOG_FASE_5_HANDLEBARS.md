# Changelog Fase 5 - Integración de Motor de Plantillas (Handlebars)

## Objetivo
Mejorar la presentación y profesionalismo de los correos electrónicos enviados por el sistema mediante la integración del motor de plantillas **Handlebars**, permitiendo inyectar variables de forma dinámica y separar el código HTML/CSS de la lógica de negocio.

## Cambios Realizados

### 1. Instalación de Dependencias
- Se instaló la librería `handlebars` de forma directa para tener control manual y limpio sobre la compilación de vistas (`npm install handlebars`).

### 2. Creación de Plantillas (`src/templates/`)
Se creó un nuevo directorio dedicado a las vistas de correo electrónico:
- **`base.hbs`**: Es la plantilla maestra (Layout). Contiene la estructura principal del HTML, el bloque `<style>` con el branding (colores, fuentes, responsive design), el header con el Logo/Título de "La Casona" y el footer genérico. Utiliza `{{{body}}}` para inyectar contenido específico.
- **`recover-password.hbs`**: Es la plantilla específica para el flujo de recuperación. Recibe variables dinámicas como `{{name}}` (nombre del usuario) y `{{resetUrl}}` (enlace con el token).

### 3. Modificación del Servicio de Correos (`src/services/email.service.js`)
- Se implementó un nuevo método `compileTemplate(templateName, context)` que se encarga de:
  - Leer el archivo `base.hbs` y el archivo específico (ej. `recover-password.hbs`) usando el módulo `fs` nativo de Node.js.
  - Inyectar las variables del `context` en la plantilla específica.
  - Inyectar el resultado dentro de la etiqueta `{{{body}}}` de la plantilla base.
- Se actualizó el método `sendEmail` para que acepte los parámetros `templateName` y `context`, compilando el HTML final dinámicamente antes de enviarlo por Nodemailer.

### 4. Actualización del Flujo de Auth (`src/services/auth.service.js`)
- El método `recoverPassword` ya no envía un string de HTML quemado (hardcoded). En su lugar, llama a `emailService.sendEmail` indicando `templateName: 'recover-password'` y pasando el `context` requerido.

## Beneficios Obtenidos
- **Clean Architecture:** Separación total de responsabilidades. La lógica de negocio no conoce sobre etiquetas HTML.
- **Mantenibilidad:** Cambiar el color corporativo o el logo ahora solo requiere editar un archivo (`base.hbs`) en lugar de buscar strings HTML repartidos por todo el código.
- **Escalabilidad:** Añadir nuevas notificaciones por correo (bienvenidas, facturas, recibos) ahora solo implica crear un archivo `.hbs` nuevo de pocas líneas.

---

## Archivos Modificados
- `package.json` (Dependencia `handlebars`)
- `src/services/email.service.js` (Lógica de compilación y lectura de archivos `.hbs`)
- `src/services/auth.service.js` (Llamado a `templateName` en vez de enviar HTML estático)
- `src/templates/base.hbs` (NUEVO - Layout maestro)
- `src/templates/recover-password.hbs` (NUEVO - Vista específica)

## Guía de Pruebas
Al estar acoplado al envío de correos, las pruebas son similares a la Fase 4, pero esta vez verás el diseño corporativo.

1. Inicia el servidor: `npm start`
2. Ve a Postman.
3. **URL:** `POST http://localhost:3000/api/auth/recover-password`
   - **Body JSON:** `{ "email": "tu_correo@gmail.com" }`
4. Revisa tu bandeja de entrada de Gmail. Podrás verificar que el correo ahora tiene el logo de La Casona, la tabla gris, un botón estilizado y colores corporativos adaptables al celular.
