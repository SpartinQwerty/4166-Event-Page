import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    // First drop latitude
    await db.schema
      .alterTable('location')
      .dropColumn('latitude')
      .execute();
      
    console.log('Dropped latitude column');
    
    // Then drop longitude in a separate statement
    await db.schema
      .alterTable('location')
      .dropColumn('longitude')
      .execute();
      
    console.log('Dropped longitude column');
    console.log('Migration completed: Dropped latitude and longitude columns from location table');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add latitude and longitude columns back
  await db.schema
    .alterTable('location')
    .addColumn('latitude', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();
    
  await db.schema
    .alterTable('location')
    .addColumn('longitude', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();
  
  console.log('Rollback completed: Added latitude and longitude columns back to location table');
}
