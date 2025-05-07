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
        database: 'ttrpg',
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        port: 5432
      });
      
      // Use direct SQL queries to avoid Kysely API compatibility issues
      try {
        // Create a new table with the correct schema
        await pool.query(`
          CREATE TABLE events_new (
            id SERIAL PRIMARY KEY,
            "hostId" INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
            "gameId" INTEGER NOT NULL REFERENCES game(id) ON DELETE CASCADE,
            "locationId" INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TIMESTAMP NOT NULL
          );
        `);
        
        // Copy data from the old table to the new one, converting date to timestamp
        await pool.query(`
          INSERT INTO events_new (id, "hostId", "gameId", "locationId", title, description, date)
          SELECT id, "hostId", "gameId", "locationId", title, description, date::timestamp
          FROM events;
        `);
        
        // Drop the old table
        await pool.query('DROP TABLE events;');
        
        // Rename the new table to the original name
        await pool.query('ALTER TABLE events_new RENAME TO events;');
        
        console.log('Events table recreated with timestamp column successfully');
      } finally {
        // Close the pool
        await pool.end();
      }
    } else {
      console.log('Events table does not exist, skipping migration');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  try {
    // Check if events table exists
    const tableExists = await db.selectFrom('pg_tables')
      .select('tablename')
      .where('tablename', '=', 'events')
      .where('schemaname', '=', 'public')
      .executeTakeFirst();

    if (tableExists) {
      console.log('Reverting events table date column to date type...');
      
      // Get database connection details
      const pool = new Pool({
        database: 'ttrpg',
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        port: 5432
      });
      
      try {
        // Create a new table with date type
        await pool.query(`
          CREATE TABLE events_old (
            id SERIAL PRIMARY KEY,
            "hostId" INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
            "gameId" INTEGER NOT NULL REFERENCES game(id) ON DELETE CASCADE,
            "locationId" INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date DATE NOT NULL
          );
        `);
        
        // Copy data
        await pool.query(`
          INSERT INTO events_old (id, "hostId", "gameId", "locationId", title, description, date)
          SELECT id, "hostId", "gameId", "locationId", title, description, date::date
          FROM events;
        `);
        
        // Drop the timestamp table
        await pool.query('DROP TABLE events;');
        
        // Rename the date table
        await pool.query('ALTER TABLE events_old RENAME TO events;');
        
        console.log('Events table date column reverted successfully');
      } finally {
        await pool.end();
      }
    } else {
      console.log('Events table does not exist, skipping rollback');
    }
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error;
  }
}
