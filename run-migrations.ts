import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { up as initialSchemaUp, down as initialSchemaDown } from './lib/db/migrations/2025-05-05-initial-schema';
import { up as recreateLocationTableUp, down as recreateLocationTableDown } from './lib/db/migrations/2025-05-07-recreate-location-table';
import { up as createEventsTableUp, down as createEventsTableDown } from './lib/db/migrations/2025-05-07-create-events-table';
import { up as updateEventsDateColumnUp, down as updateEventsDateColumnDown } from './lib/db/migrations/2025-05-07-update-events-date-column';
import { up as createParticipantsTableUp, down as createParticipantsTableDown } from './lib/db/migrations/2025-05-07-create-participants-table';
import { up as createFavoritesTableUp, down as createFavoritesTableDown } from './lib/db/migrations/2025-05-07-create-favorites-table';

async function runMigrations() {
  console.log('Setting up database connection...');
  
  // Create a PostgreSQL connection
  const dialect = new PostgresDialect({
    pool: new Pool({
      database: 'ttrpg',
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      port: 5432
    })
  });

  // Create a Kysely instance
  const db = new Kysely({
    dialect
  });

  try {
    console.log('Running migrations...');
    
    // Run the initial schema migration
    console.log('\nRunning initial schema migration...');
    try {
      await initialSchemaUp(db);
      console.log('Initial schema migration completed successfully');
    } catch (error) {
      console.error('Error running initial schema migration:', error);
      console.log('Continuing with other migrations...');
    }
    
    // Run the recreate location table migration
    console.log('\nRunning recreate location table migration...');
    await recreateLocationTableUp(db);
    console.log('Recreate location table migration completed successfully');
    
    // Run the create events table migration
    console.log('\nRunning create events table migration...');
    await createEventsTableUp(db);
    console.log('Create events table migration completed successfully');
    
    // Run the update events date column migration
    console.log('\nRunning update events date column migration...');
    await updateEventsDateColumnUp(db);
    console.log('Update events date column migration completed successfully');
    
    // Run the create participants table migration
    console.log('\nRunning create participants table migration...');
    try {
      await createParticipantsTableUp(db);
      console.log('Create participants table migration completed successfully');
    } catch (error) {
      console.error('Error running create participants table migration:', error);
      console.log('Continuing with other migrations...');
    }
    
    // Run the create favorites table migration
    console.log('\nRunning create favorites table migration...');
    try {
      await createFavoritesTableUp(db);
      console.log('Create favorites table migration completed successfully');
    } catch (error) {
      console.error('Error running create favorites table migration:', error);
      console.log('Continuing with other migrations...');
    }
    
    console.log('\nAll migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    // Destroy the Kysely instance
    await db.destroy();
    process.exit(0);
  }
}

runMigrations();
