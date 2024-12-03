import { db } from '../connection.js';

export async function up() {
  try {
    // Crear tabla de agenda
    await db.sql`
      CREATE TABLE IF NOT EXISTS agenda (
        id BIGSERIAL PRIMARY KEY,
        phone_number VARCHAR(20) REFERENCES ws_users(phone_number),
        scheduled_at TIMESTAMP NOT NULL,      -- Momento de la cita
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Momento en que se agendó
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
        zoom_link TEXT,
        email VARCHAR(100),
        name VARCHAR(100),
        CONSTRAINT fk_ws_users 
          FOREIGN KEY (phone_number) 
          REFERENCES ws_users(phone_number) 
          ON DELETE CASCADE
      )
    `;

    // Crear índices para mejorar el rendimiento
    await db.sql`
      CREATE INDEX IF NOT EXISTS idx_agenda_phone_number ON agenda(phone_number)
    `;

    await db.sql`
      CREATE INDEX IF NOT EXISTS idx_agenda_scheduled_at ON agenda(scheduled_at)
    `;

    console.log('Agenda table migration completed successfully');
  } catch (error) {
    console.error('Agenda table migration failed:', error);
    throw error;
  }
}

export async function down() {
  try {
    await db.sql`DROP TABLE IF EXISTS agenda`;
    console.log('Agenda table rollback completed successfully');
  } catch (error) {
    console.error('Agenda table rollback failed:', error);
    throw error;
  }
}
