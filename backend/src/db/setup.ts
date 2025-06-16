import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import { sql } from '../utils/db';

async function setupDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split on semicolons that are not inside dollar-quoted strings
    const statements = schema
      .split(/;(?![^$]*\$\$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
      } catch (error) {
        console.error('Failed to execute statement:', statement);
        throw error;
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase(); 