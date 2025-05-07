import { Kysely } from 'kysely';
import { Pool } from 'pg';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    // Check if events table exists
    const tableExists = await db.selectFrom('pg_tables')
      .select('tablename')
      .where('tablename', '=', 'events')
      .where('schemaname', '=', 'public')
      .executeTakeFirst();

    if (tableExists) {
      console.log('Recreating events table with timestamp column...');
      
      // Get database connection details from the Kysely instance
      const pool = new Pool({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS, 
        port: Number(process.env.DB_PORT),
        max: 10
      });
    }
      
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {

}
