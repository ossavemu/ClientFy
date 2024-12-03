import { neon } from '@neondatabase/serverless';
import { config } from '../config/index.js';

const sql = neon(config.DATABASE_URL);

export const db = {
  sql,
  async testConnection() {
    try {
      const result = await sql`SELECT version()`;
      console.log('Database connected successfully:', result[0].version);
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  },
};
