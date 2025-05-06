import pg from 'pg';
import {Kysely, PostgresDialect } from 'kysely';
import { Database } from './types';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        database: 'ttrpg',
        host: 'localhost',
        user: 'postgres',
        password: 'postgres', 
        port: 5432,
        max: 10
    })
})

export const db = new Kysely<Database>({
    dialect,
})