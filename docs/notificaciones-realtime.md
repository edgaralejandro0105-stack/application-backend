# Sistema de Notificaciones en Tiempo Real

Esta documentación detalla la arquitectura y el funcionamiento del sistema de notificaciones implementado para el panel de administración de La Casona.

## 📌 Resumen de la Arquitectura
El sistema notifica al panel administrativo de forma instantánea cuando un cliente crea una pre-reserva desde el sitio web, y simultáneamente envía un correo electrónico de respaldo al administrador.

Tecnologías clave utilizadas:
- **Socket.io** (Backend) y **Socket.io-client** (Frontend) para la comunicación bidireccional en tiempo real.
- **Nodemailer** para el envío de correos electrónicos.
- **Sonner** y **Lucide React** para la interfaz visual en el Frontend.

---

## ⚙️ 1. Configuración del Backend

### Inicialización de Socket.io
En el archivo principal `src/server.js`, el servidor Express está envuelto en un servidor HTTP estándar de Node.js, lo cual permite adjuntar el servidor de WebSockets:

```javascript
const server = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, { cors: corsOptions });
app.set('io', io); // Se guarda la instancia de manera global en Express
```
Guardar `io` en `app` permite que cualquier controlador en la aplicación pueda emitir eventos a través de `req.app.get('io')`.

### Lógica de Emisión (`eventController.js`)
Cuando se recibe una petición `POST /api/events` para crear una nueva reserva, el controlador hace dos cosas fundamentales de manera asíncrona tras guardar en la base de datos:

1. **Emitir el Evento WebSocket:**
   ```javascript
   const io = req.app.get('io');
   if (io) {
     io.emit('new_reservation', newEvent);
   }
   ```
2. **Enviar el Correo Electrónico:**
   Utiliza el `emailService` para enviar un correo con los detalles básicos de la reserva a la dirección estipulada.

---

## 💻 2. Configuración del Frontend

### Componente `NotificationBell.jsx`
Se ha creado un componente dedicado en `src/components/NotificationBell.jsx`. Este componente es el encargado de establecer y mantener la conexión WebSocket activa con el servidor.

**Flujo de funcionamiento:**
1. Al montarse (`useEffect`), se conecta al backend usando la variable `VITE_API_URL` (o `localhost:3000` por defecto).
2. Se suscribe a la escucha del evento `'new_reservation'`.
3. Al recibir el evento:
   - Incrementa el contador interno, mostrando un "punto rojo" (badge) en el icono de la campana.
   - Ejecuta `toast.success(...)` de la librería `sonner` para desplegar un mensaje emergente en la pantalla, independientemente de en qué vista se encuentre el administrador.

### Integración en la Interfaz (`Home.jsx`)
El componente `<NotificationBell />` fue inyectado dentro de la barra superior (Header) del layout principal de administración, logrando así que esté visible de manera persistente en todo el panel.

---

## 🔐 3. Variables de Entorno (.env)

Para que el sistema funcione correctamente, en el archivo `.env` del **Backend**, debe existir la siguiente variable para el envío de correos de notificación:

```env
ADMIN_EMAIL=tu_correo_real_aqui@ejemplo.com
```

Las variables existentes de SMTP (`SMTP_HOST`, `SMTP_USER`, etc.) deben estar configuradas correctamente para que el `email.service.js` pueda enviar el correo sin problemas.
