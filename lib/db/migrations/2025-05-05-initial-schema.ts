import { Kysely, sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
    await db.schema.createTable('accounts')
    .addColumn('id', 'serial', (col) => col.primaryKey().unique())
    .addColumn('username', 'text', (col) => col.notNull().unique())
    .addColumn('password', 'text', (col) => col.notNull())
    .addColumn('firstName', 'text', (col) => col.notNull())
    .addColumn('lastName', 'text', (col) => col.notNull())
    .execute();

    await db.schema.createTable('game')
    .addColumn('id', 'serial', (col) => col.primaryKey().unique())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .execute();

    await db.schema.createTable('location')
    .addColumn('id', 'serial', (col) => col.primaryKey().unique())
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('latitude', 'integer', (col) => col.notNull())
    .addColumn('longitude', 'integer', (col) => col.notNull())
    .execute();

    await db.schema.createTable('events')
    .addColumn('id', 'serial', (col) => col.primaryKey().unique())
    .addColumn('hostId', 'integer', (col) => col.references('accounts.id').onDelete('cascade').notNull())
    .addColumn('gameId', 'integer', (col) => col.references('game.id').onDelete('cascade').notNull())
    .addColumn('locationId', 'integer', (col) => col.references('location.id').onDelete('cascade').notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('accounts').execute();
    await db.schema.dropTable('events').execute();
    await db.schema.dropTable('game').execute();
    await db.schema.dropTable('location').execute();
}