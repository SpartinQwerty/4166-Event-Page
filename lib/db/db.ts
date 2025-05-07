import pg from 'pg';
import {Kysely, PostgresDialect } from 'kysely';
import { Database } from './types';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        database: process.env.DB_NAME,
        host: 'localhost',
        user: 'postgres',
        password: 'postgres', 
        port: Number(process.env.DB_PORT),
        max: 10
    })
})

export const db = new Kysely<Database>({
    dialect,
})