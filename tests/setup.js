/**
 * tests/setup.js
 *
 * Setup global de Jest (setupFilesAfterEnv): se ejecuta en cada test suite
 * ANTES de que corran sus tests, después de que Jest ya instaló su entorno.
 *
 * Propósito: aplicar las migraciones de columnas que el modelo Sequelize define
 * pero que pueden no existir aún en la base de datos real.
 *
 * Todos los ALTER TABLE usan "IF NOT EXISTS" → idempotentes, nunca rompen.
 */

// Mock global del servicio de email para todos los tests
jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));

const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.authenticate();

  const migrations = [
    // ─── Tabla: users ─────────────────────────────────────────────
    // El hash SHA-256 produce 64 caracteres hex, pero la columna puede ser VARCHAR(40).
    `ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);`,
    // Columnas para el flujo de recuperación de contraseña
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: products ──────────────────────────────────────────
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0;`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0;`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: clients ───────────────────────────────────────────
    `ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: employees ─────────────────────────────────────────
    // El modelo usa created_at / updated_at (con 'd')
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: venues ────────────────────────────────────────────
    // El modelo usa created_at / updated_at (con 'd')
    `ALTER TABLE venues ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    `ALTER TABLE venues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();`,
    `ALTER TABLE venues ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: sales ─────────────────────────────────────────────
    `ALTER TABLE sales ADD COLUMN IF NOT EXISTS update_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE sales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`,

    // ─── Tabla: sale_details ──────────────────────────────────────
    // Decisión A5: Agregar product_id
    `ALTER TABLE sale_details ADD COLUMN IF NOT EXISTS product_id INTEGER;`,
  ];

  for (const sql of migrations) {
    await sequelize.query(sql).catch((err) => {
      console.warn(`[setup] Migration warning: "${sql.trim().slice(0, 80)}..." → ${err.message}`);
    });
  }
});
