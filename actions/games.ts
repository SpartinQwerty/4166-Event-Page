import { db } from "../lib/db/db"

export type Game = {
    id: number;
    title: string;
    description: string;
}

export async function getGame(gId: number): Promise<Game> {
    const game = await db
        .selectFrom('game')
        .select(['id', 'title', 'description'])
        .where('id', '=', gId)
        .executeTakeFirstOrThrow();
    return game;
}

export async function getAllGames(): Promise<Game[]> {
    const games = await db
        .selectFrom('game')
        .selectAll()
        .execute();
    return games;
}

export async function updateGame(gId: number, update: Omit<Game, 'id'>): Promise <Game | undefined> {
    const updatedGame = await db.transaction().execute(async (trx) => {
        const game = await trx
            .updateTable('game')
            .set({title: update.title, description: update.description})
            .where('id', '=' , gId)
            .returning(['id', 'title', 'description'])
            .executeTakeFirst();
        return game;
    })
    return updatedGame;
}

export async function deleteGame(gId: number): Promise<Game | undefined> {
    const deletedGame = await db.transaction().execute(async (trx) => {
        const game = await trx
            .deleteFrom('game')
            .where('id', '=', gId)
            .returning(['id', 'title', 'description'])
            .executeTakeFirst();
        return game;
    })

    return deletedGame;
}

export async function createGame(game: Omit<Game, 'id'>): Promise<Game> {
    const createdGame = await db.transaction().execute(async (trx) => {
        const cGame = await trx
            .insertInto('game')
            .columns(['title','description'])
            .values({title: game.title, description: game.description})
            .returning(['id', 'title', 'description'])
            .executeTakeFirstOrThrow();
        return cGame;
    })

    return createdGame;
}