const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://neondb_owner:npg_rQwjt7eH8Ouz@ep-round-boat-a4nzinjh-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', { logging: false });

const roles = [
  { id: 1, name: 'Administrador', desc: 'Acceso total', access: 1 },
  { id: 2, name: 'Bartender', desc: 'Bar y licores', access: 2 },
  { id: 3, name: 'Mesero', desc: 'Atención', access: 3 },
  { id: 4, name: 'Gerente', desc: 'Jefe', access: 1 },
  { id: 5, name: 'Seguridad', desc: 'Vigilancia', access: 4 },
  { id: 6, name: 'Cajero', desc: 'Caja y cobros', access: 2 }
];

async function syncRoles() {
  try {
    for (const r of roles) {
      // Intentamos actualizar primero
      const [updated] = await db.query(
        `UPDATE rol SET role_name = ?, description = ?, access = ? WHERE id = ? RETURNING *`,
        { replacements: [r.name, r.desc, r.access, r.id] }
      );
      
      // Si no actualizó nada (no existe), lo insertamos
      if (!updated || updated.length === 0) {
        await db.query(
          `INSERT INTO rol (id, role_name, description, access) VALUES (?, ?, ?, ?)`,
          { replacements: [r.id, r.name, r.desc, r.access] }
        );
        console.log(`✅ Rol insertado: ${r.name}`);
      } else {
        console.log(`✅ Rol actualizado: ${r.name}`);
      }
    }
    
    // Ajustar la secuencia del ID para que futuros inserts no colisionen
    await db.query(`SELECT setval(pg_get_serial_sequence('rol', 'id'), coalesce(max(id), 0) + 1, false) FROM rol;`);
    
    console.log("¡Roles sincronizados correctamente!");
  } catch (err) {
    console.error("Error sincronizando roles:", err);
  } finally {
    process.exit();
  }
}

syncRoles();
