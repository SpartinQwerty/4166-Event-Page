"use server";

import { db } from "../lib/db/db"
import { Account } from "./accounts";
import { Game } from "./games";
import { Location } from "./locations";

export type Event = {
    eventId: number;
    hostId: number;
    gameId: number;
    locationId: number;
    title: string;
    description: string;
    date: Date;
}

export type EventInfo = {
    eventId: number;
    locationId: number;
    title: string;
    description: string;
    game: Game;
    location: Location;
    author: Omit<Account, 'password'>;
    date: Date;
}

export type EventDisplay = {
    eventId: number;
    hostId: number;
    gameId: number;
    locationId: number;
    title: string;
    description: string;
    author: string | undefined;
    game: string | undefined;
    address: string | undefined;
    date: Date;
}

export async function getAllEvents(): Promise<EventDisplay[]> {
    const events = await db
        .selectFrom("events")
        .select(['eventId','date', 'hostId', 'gameId', 'locationId', 'title', 'description'])
        .execute()
    const account = await db
        .selectFrom('accounts')
        .select(['accountId', 'firstName', 'lastName', 'userName'])
        .execute();
    const games = await db
        .selectFrom('games')
        .select(['gameId','title', 'description'])
        .execute();
    const locations = await db
        .selectFrom('location')
        .select(['locationId', 'address'])
        .execute();
    const allEvents: EventDisplay[] = [];
    for (const event of events) {
        const locationAddy = locations.find(g => g.locationId === event.locationId);
        const gameTitle = games.find(g => g.gameId === event.gameId);
        const accountName = account.find(g => g.accountId === event.hostId);
        allEvents.push({
            ...event,
            author: accountName?.firstName + " " + accountName?.lastName,
            game: gameTitle?.title,
            address: locationAddy?.address,
        })
    }
    return allEvents;
}

export async function getOneEvent(eId: number): Promise<EventInfo> {
    const events = await db
        .selectFrom("events")
        .select(['eventId', 'date', 'hostId', 'gameId', 'locationId', 'title', 'description'])
        .where('eventId', '=', eId)
        .executeTakeFirstOrThrow();
    const account = await db
        .selectFrom('accounts')
        .select(['accountId', 'firstName', 'lastName', 'userName'])
        .where('accountId', '=', events.hostId)
        .executeTakeFirstOrThrow();
    const games = await db
        .selectFrom('games')
        .select(['gameId','title', 'description'])
        .where('gameId', '=', events.gameId)
        .executeTakeFirstOrThrow();
    const locations = await db
        .selectFrom('location')
        .select(['locationId', 'address', 'latitude', 'longitude'])
        .where('locationId', '=', events.locationId)
        .executeTakeFirstOrThrow();

    const event: EventInfo = {
        ...events,
        author: account,
        game: games,
        location: locations,
    }
    return event;
}

export async function createEvent(event: Omit<Event, 'eventId'>): Promise<Event> {
    const createdEvent = await db.transaction().execute(async (trx) => {
        const cEvent = await trx
            .insertInto('events')
            .columns(['gameId', 'hostId', 'locationId', 'title', 'description'])
            .values({gameId: event.gameId, hostId: event.hostId, locationId: event.locationId, 
                title: event.title, description: event.description, date: event.date})
            .returning(['eventId', 'date', 'hostId', 'locationId', 'gameId', 'title', 'description'])
            .executeTakeFirstOrThrow();
        return cEvent;
    })
    return createdEvent;
}

export async function removeEvent(eId: number): Promise<Event> {
    const deletedEvent = await db.transaction().execute(async (trx) => {
        const event = await trx
        .deleteFrom('events')
        .where('eventId', '=', eId)
        .returning(['eventId', 'hostId', 'date', 'gameId', 'locationId', 'title', 'description'])
        .executeTakeFirstOrThrow();
        return event;
    });
    return deletedEvent;
}