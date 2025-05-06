"use server";

import { db } from "../lib/db/db"

export type Location = {
    locationId: number;
    address: string;
    latitude: number;
    longitude: number;
}

export async function getLocation(lId: number): Promise<Location> {
    const location = await db
        .selectFrom('location')
        .select(['locationId', 'address', 'latitude', 'longitude'])
        .where('locationId', '=', lId)
        .executeTakeFirstOrThrow();
    return location;
}

export async function createLocation(location: Omit<Location, 'locationId'>): Promise<Location> {
    const createdLocation = await db.transaction().execute(async (trx) => {
        const locale = await trx
            .insertInto('location')
            .columns(['address','latitude','latitude','longitude'])
            .values({address: location.address, latitude: location.latitude, longitude: location.longitude})
            .returning(['locationId', 'address', 'latitude', 'longitude'])
            .executeTakeFirstOrThrow();
        return locale;
    });

    return createdLocation;
}

export async function updateLocation(lId: number, update: Omit<Location, 'locationId'>): Promise<Location | undefined>{
    const updatedLocation = await db.transaction().execute(async (trx) => {
        const locale = await trx
            .updateTable('location')
            .set({address: update.address, latitude: update.latitude, longitude: update.longitude})
            .where('locationId', '=', lId)
            .returning(['locationId','address','latitude','longitude'])
            .executeTakeFirst();
        return locale;
    });
    return updatedLocation;
}

export async function deleteLocation(lId:number): Promise<Location> {
    const deletedLocation = await db.transaction().execute(async (trx) => {
        const locale = await trx
            .deleteFrom('location')
            .where('locationId', '=', lId)
            .returning(['locationId','address','latitude','longitude'])
            .executeTakeFirstOrThrow();
        return locale;
    });
    return deletedLocation;
}