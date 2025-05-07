import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    // Check if events table exists
    const tableExists = await db.selectFrom('pg_tables')
      .select('tablename')
      .where('tablename', '=', 'events')
      .where('schemaname', '=', 'public')
      .executeTakeFirst();

    // If table doesn't exist, create it
    if (!tableExists) {
      console.log('Events table does not exist, creating it...');
      await db.schema.createTable('events')
        .addColumn('id', 'serial', (col) => col.primaryKey().unique())
        .addColumn('hostId', 'integer', (col) => col.references('accounts.id').onDelete('cascade').notNull())
        .addColumn('gameId', 'integer', (col) => col.references('game.id').onDelete('cascade').notNull())
        .addColumn('locationId', 'integer', (col) => col.references('location.id').onDelete('cascade').notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('date', 'date', (col) => col.notNull())
        .execute();
      
      console.log('Events table created successfully');
    } else {
      console.log('Events table already exists');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  try {
    // Drop the events table if it exists
    await db.schema.dropTable('events')
      .ifExists()
      .execute();
    
    console.log('Events table dropped');
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error;
  }
}
