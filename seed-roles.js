const db = require('./src/config/db');
const Role = require('./src/models/Role.model');

async function seedRoles() {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida.');

    const roles = [
      { role_name: 'Administrador', description: 'Acceso total al sistema', access: 3 },
      { role_name: 'Gerente', description: 'Manejo de operaciones, ventas, inventario y staff', access: 2 },
      { role_name: 'Ventas', description: 'Manejo de CRM, eventos y ventas', access: 2 },
      { role_name: 'Staff', description: 'Acceso básico para meseros y personal de logística', access: 1 }
    ];

    for (const role of roles) {
      const [r, created] = await Role.findOrCreate({
        where: { role_name: role.role_name },
        defaults: role
      });
      if (created) {
        console.log(`Rol creado: ${r.role_name}`);
      } else {
        await r.update({ description: role.description, access: role.access });
        console.log(`Rol actualizado: ${r.role_name}`);
      }
    }
    
    console.log('Roles listos.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();
