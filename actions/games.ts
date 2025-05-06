"use server";

import { db } from "../lib/db/db"

export type Game = {
    gameId: number;
    title: string;
    description: string;
}

export async function getGame(gId: number): Promise<Game> {
    const game = await db
        .selectFrom('games')
        .select(['gameId', 'title', 'description'])
        .where('gameId', '=', gId)
        .executeTakeFirstOrThrow();
    return game;
}

export async function updateGame(gId: number, update: Omit<Game, 'gameId'>): Promise <Game | undefined> {
    const updatedGame = await db.transaction().execute(async (trx) => {
        const game = await trx
            .updateTable('games')
            .set({title: update.title, description: update.description})
            .where('gameId', '=' , gId)
            .returning(['gameId', 'title', 'description'])
            .executeTakeFirst();
        return game;
    })
    return updatedGame;
}

export async function deleteGame(gId: number): Promise<Game | undefined> {
    const deletedGame = await db.transaction().execute(async (trx) => {
        const game = await trx
            .deleteFrom('games')
            .where('gameId', '=', gId)
            .returning(['gameId', 'title', 'description'])
            .executeTakeFirst();
        return game;
    })

    return deletedGame;
}

export async function createGame(game: Omit<Game, 'gameId'>): Promise<Game> {
    const createdGame = await db.transaction().execute(async (trx) => {
        const cGame = await trx
            .insertInto('games')
            .columns(['title','description'])
            .values({title: game.title, description: game.description})
            .returning(['gameId', 'title', 'description'])
            .executeTakeFirstOrThrow();
        return cGame;
    })

    return createdGame;
}