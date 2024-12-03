import { up as upInitial, down as downInitial } from './001_initial_schema.js';
import { up as upAgenda, down as downAgenda } from './002_agenda_table.js';

async function runMigrations() {
  try {
    // Ejecutar migraciones en orden
    await upInitial();
    await upAgenda();
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('Attempting rollback...');
    try {
      // Rollback en orden inverso
      await downAgenda();
      await downInitial();
      console.log('Rollback completed successfully');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    process.exit(1);
  }
}

runMigrations();
