const { Pool } = require('pg');
const { Kysely, PostgresDialect, sql } = require('kysely');

async function createFavoritesTable() {
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
    console.log('Creating favorites table...');
    
    // Create the favorites table
    await db.schema
      .createTable('favorites')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('eventId', 'integer', (col) => 
        col.references('events.id').onDelete('cascade').notNull()
      )
      .addColumn('userId', 'integer', (col) => 
        col.references('accounts.id').onDelete('cascade').notNull()
      )
      .addColumn('createdAt', 'timestamp', (col) => 
        col.defaultTo(sql`now()`).notNull()
      )
      .execute();

    // Add a unique constraint to prevent duplicate favorites
    await db.schema
      .createIndex('favorites_unique_event_user')
      .on('favorites')
      .columns(['eventId', 'userId'])
      .unique()
      .execute();
    
    console.log('Favorites table created successfully!');
  } catch (error) {
    console.error('Error creating favorites table:', error);
  } finally {
    // Destroy the Kysely instance
    await db.destroy();
    process.exit(0);
  }
}

createFavoritesTable();
