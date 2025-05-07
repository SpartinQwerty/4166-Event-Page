
import { db } from "../lib/db/db"

export type Location = {
    id: number;
    address: string;
}

export async function getLocation(lId: number): Promise<Location> {
    const location = await db
        .selectFrom('location')
        .select(['id', 'address'])
        .where('id', '=', lId)
        .executeTakeFirstOrThrow();
    return location;
}

export async function getAllLocations(): Promise<Location[]> {
    const locations = await db
        .selectFrom('location')
        .select(['id', 'address'])
        .execute();
    return locations;
}

export async function createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const createdLocation = await db.transaction().execute(async (trx) => {
        const result = await trx
            .insertInto('location')
            .columns(['address'])
            .values({address: location.address})
            .returning(['id', 'address'])
            .executeTakeFirstOrThrow();
        return result;
    });
    
    return createdLocation;
}

export async function updateLocation(lId: number, update: Omit<Location, 'id'>): Promise<Location | undefined>{
    const updatedLocation = await db.transaction().execute(async (trx) => {
        const location = await trx
            .updateTable('location')
            .set({address: update.address})
            .where('id', '=', lId)
            .returning(['id','address'])
            .executeTakeFirst();
        return location;
    });
    return updatedLocation;
}

export async function deleteLocation(lId:number): Promise<Location | undefined> {
    const deletedLocation = await db.transaction().execute(async (trx) => {
        const location = await trx
            .deleteFrom('location')
            .where('id', '=', lId)
            .returning(['id','address'])
            .executeTakeFirst();
        return location;
    });
    return deletedLocation;
}