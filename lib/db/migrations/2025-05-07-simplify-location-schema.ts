import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the latitude and longitude columns
  await db.schema.alterTable('location')
    .dropColumn('latitude')
    .dropColumn('longitude')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add back the columns if needed
  await db.schema.alterTable('location')
    .addColumn('latitude', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('longitude', 'integer', col => col.notNull().defaultTo(0))
    .execute();
}
