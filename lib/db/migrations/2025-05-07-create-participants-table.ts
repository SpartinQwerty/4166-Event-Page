import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('participants')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('eventId', 'integer', (col) => 
      col.references('events.id').onDelete('cascade').notNull()
    )
    .addColumn('userId', 'integer', (col) => 
      col.references('accounts.id').onDelete('cascade').notNull()
    )
    .addColumn('joinedAt', 'timestamp', (col) => 
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Add a unique constraint to prevent duplicate participants
  await db.schema
    .createIndex('participants_unique_event_user')
    .on('participants')
    .columns(['eventId', 'userId'])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('participants').execute();
}
