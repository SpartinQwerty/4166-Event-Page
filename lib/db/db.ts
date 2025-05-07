import pg from 'pg';
import {Kysely, PostgresDialect } from 'kysely';
import { Database } from './types';

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS, 
        port: Number(process.env.DB_PORT),
        max: 10
    })
})

export const db = new Kysely<Database>({
    dialect,
})