const db = require('./src/config/db');
const Role = require('./src/models/Role.model');
const User = require('./src/models/User.model');
const { Op } = require('sequelize');

async function cleanOldRoles() {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // We only want to keep the 4 official roles we defined:
    const officialRoleNames = ['Administrador', 'Gerente', 'Ventas', 'Staff'];
    
    const allRoles = await Role.findAll();
    
    // Find the IDs of the official roles
    const adminRole = allRoles.find(r => r.role_name === 'Administrador');
    const staffRole = allRoles.find(r => r.role_name === 'Staff');
    
    if (!adminRole || !staffRole) {
      console.error('Faltan roles oficiales.');
      process.exit(1);
    }

    const officialRoleIds = allRoles
      .filter(r => officialRoleNames.includes(r.role_name))
      .map(r => r.id);

    const oldRoles = allRoles.filter(r => !officialRoleNames.includes(r.role_name));

    for (const role of oldRoles) {
      // Find users with this role
      const users = await User.findAll({ where: { role_id: role.id } });
      const Employee = require('./src/models/Employee.model'); // Import here
      
      const newRoleName = (role.role_name.toLowerCase() === 'admin' || role.access >= 3) ? 'Administrador' : 'Staff';
      const newRoleId = (newRoleName === 'Administrador') ? adminRole.id : staffRole.id;
        
      if (users.length > 0) {
        console.log(`Reasignando ${users.length} usuarios del rol obsoleto "${role.role_name}"...`);
        await User.update({ role_id: newRoleId }, { where: { role_id: role.id } });
      }

      // Reassign employees
      const employees = await Employee.findAll({ where: { rol: role.role_name } });
      if (employees.length > 0) {
         console.log(`Reasignando ${employees.length} empleados del rol obsoleto "${role.role_name}"...`);
         await Employee.update({ rol: newRoleName }, { where: { rol: role.role_name } });
      }

      // Now delete the old role
      await role.destroy();
      console.log(`Rol eliminado: ${role.role_name}`);
    }

    console.log('Limpieza completada.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning roles:', error);
    process.exit(1);
  }
}

cleanOldRoles();
