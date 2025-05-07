
import { db } from "../lib/db/db"

export type Location = {
    id: number;
    address: string;
    latitude: number;
    longitude: number;
}

export async function getLocation(lId: number): Promise<Location> {
    const location = await db
        .selectFrom('location')
        .select(['id', 'address', 'latitude', 'longitude'])
        .where('id', '=', lId)
        .executeTakeFirstOrThrow();
    return location;
}

export async function getAllLocations(): Promise<Location[]> {
    const locations = await db
        .selectFrom('location')
        .select(['id', 'address', 'latitude', 'longitude'])
        .execute();
    return locations;
}

export async function createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    try {
        // Simplified direct query
        const result = await db
            .insertInto('location')
            .values({
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude
            })
            .returning(['id', 'address', 'latitude', 'longitude'])
            .executeTakeFirst();
        
        if (!result) {
            throw new Error('Failed to create location');
        }
        
        return result;
    } catch (error) {
        console.error('Error creating location:', error);
        throw error;
    }
}

export async function updateLocation(lId: number, update: Omit<Location, 'id'>): Promise<Location | undefined>{
    const updatedLocation = await db.transaction().execute(async (trx) => {
        const locale = await trx
            .updateTable('location')
            .set({address: update.address, latitude: update.latitude, longitude: update.longitude})
            .where('id', '=', lId)
            .returning(['id','address','latitude','longitude'])
            .executeTakeFirst();
        return locale;
    });
    return updatedLocation;
}

export async function deleteLocation(lId:number): Promise<Location> {
    const deletedLocation = await db.transaction().execute(async (trx) => {
        const locale = await trx
            .deleteFrom('location')
            .where('id', '=', lId)
            .returning(['id','address','latitude','longitude'])
            .executeTakeFirstOrThrow();
        return locale;
    });
    return deletedLocation;
}