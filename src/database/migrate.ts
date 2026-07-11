import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

/**
 * Migration runner to execute the schema definitions against the target database.
 */
export async function runMigrations(dbConnectionUri?: string): Promise<void> {
  const connectionString = dbConnectionUri || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Database connection URI must be provided or set in DATABASE_URL environment variable.');
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Starting Leave Request schema migration...');
    
    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Run the DDL statements
    await pool.query(sql);
    
    console.log('Migration completed successfully. All tables and types created.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
