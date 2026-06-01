const crypto = require('crypto');
const db = require('./src/config/db');
const { User, Role } = require('./src/models');

async function fixPasswords() {
  try {
    await db.authenticate();
    
    // Hash we want to set
    const password = 'password123';
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    // Update all users or just admin
    await User.update({ password: hashedPassword }, { where: {} });
    
    console.log(`All users' passwords have been reset to: ${password}`);

    // Let's also output all emails so the user knows who they can log in as
    const users = await User.findAll({ attributes: ['email', 'name', 'role_id'] });
    console.log('Available users:');
    users.forEach(u => {
      console.log(`- Email: ${u.email} | Name: ${u.name} | Role_ID: ${u.role_id}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error in seeder:', err);
    process.exit(1);
  }
}

fixPasswords();
