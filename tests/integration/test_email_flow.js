require('dotenv').config();
const { sequelize, User } = require('../../src/models');
const authService = require('../../src/services/auth.service');

async function runTest() {
  let testUser;
  try {
    console.log('🔄 Sincronizando BD...');
    await sequelize.sync();
    
    console.log('--- 1. Creando usuario de prueba ---');
    const testEmail = `test_recovery_${Date.now()}@example.com`;
    testUser = await User.create({
      name: 'Usuario Prueba Recovery',
      email: testEmail,
      password: 'hashed_password_mock',
      role_id: 1,
      status: 'active'
    });
    console.log('✅ Usuario creado:', testUser.email);

    console.log('\n--- 2. Solicitando recuperación de contraseña ---');
    // Esperar a que el transporter de Ethereal se inicialice (puede tardar un segundo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await authService.forgotPassword(testEmail);
    console.log('✅ Proceso de recuperación disparado (mira la URL de Ethereal arriba)');

    console.log('\n--- 3. Verificando en BD que se guardó el token ---');
    await testUser.reload();
    console.log('Token guardado en BD:', testUser.reset_password_token);
    console.log('Fecha expiración:', testUser.reset_password_expires);

    console.log('\n--- 4. Simulando Reset con el Token ---');
    await authService.resetPassword(testUser.reset_password_token, 'NuevaClave123!');
    console.log('✅ Clave actualizada mediante el token');

    await testUser.reload();
    console.log('Token post-reset:', testUser.reset_password_token); // debe ser null

    console.log('\n🎉 ¡Prueba Completada Exitosamente!');

  } catch (err) {
    console.error('❌ Error en la prueba:', err);
  } finally {
    if (testUser) {
      await testUser.destroy({ force: true });
    }
    await sequelize.close();
  }
}

runTest();
