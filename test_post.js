const http = require('http');

const data = JSON.stringify({
  salon: 'Ambos',
  horario: '20:00-03:00',
  fecha: '2026-10-15',
  tipo: 'Bodas',
  descripcion: '',
  servicios: {},
  personal: {
    'Mesoneros': 0,
    'Barman': 0,
    'Seguridad': 0
  },
  contacto: {
    nombre: 'Test User',
    telefono: '123456789',
    correo: 'test@example.com'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/events/website',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
