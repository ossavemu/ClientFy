import { db } from '../connection.js';

export async function up() {
  try {
    // Crear tabla de usuarios de WhatsApp
    await db.sql`
      CREATE TABLE IF NOT EXISTS ws_users (
        phone_number VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100),
        last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interaction_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear tabla de histórico de interacciones
    await db.sql`
      CREATE TABLE IF NOT EXISTS historic (
        id BIGSERIAL PRIMARY KEY,
        phone_number VARCHAR(20) REFERENCES ws_users(phone_number),
        message_type VARCHAR(20),
        message_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Crear vista para usuarios "calientes" (más de 3 interacciones)
    await db.sql`
      CREATE OR REPLACE VIEW hot_users AS
      SELECT 
        phone_number,
        name,
        interaction_count,
        last_interaction
      FROM ws_users
      WHERE interaction_count > 3
      ORDER BY last_interaction DESC
    `;

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down() {
  try {
    await db.sql`DROP VIEW IF EXISTS hot_users`;
    await db.sql`DROP TABLE IF EXISTS historic`;
    await db.sql`DROP TABLE IF EXISTS ws_users`;
    console.log('Rollback completed successfully');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}
