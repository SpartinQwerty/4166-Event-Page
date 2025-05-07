import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    // Check if location table exists
    const tableExists = await db.selectFrom('pg_tables')
      .select('tablename')
      .where('tablename', '=', 'location')
      .where('schemaname', '=', 'public')
      .executeTakeFirst();

    // If table doesn't exist, create it
    if (!tableExists) {
      console.log('Location table does not exist, creating it...');
      await db.schema.createTable('location')
        .addColumn('id', 'serial', (col) => col.primaryKey().unique())
        .addColumn('address', 'text', (col) => col.notNull())
        .execute();
      
      console.log('Location table created successfully');
    } else {
      console.log('Location table already exists');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  try {
    // Drop the location table if it exists
    await db.schema.dropTable('location')
      .ifExists()
      .execute();
    
    console.log('Location table dropped');
  } catch (error) {
    console.error('Error in rollback:', error);
    throw error;
  }
}
