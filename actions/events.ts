import { db } from "../lib/db/db"
import { Account } from "./accounts";
import { Game } from "./games";
import { Location } from "./locations";

export type Event = {
    id: number;
    hostId: number;
    gameId: number;
    locationId: number;
    title: string;
    description: string;
    date: Date;
}

export type EventInfo = {
    id: number;
    locationId: number;
    title: string;
    description: string;
    game: Game;
    location: Location;
    author: Omit<Account, 'password'>;
    date: Date;
}

export type EventDisplay = {
    id: number;
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
        .selectAll()
        .execute();
    const account = await db
        .selectFrom('accounts')
        .select(['id', 'firstName', 'lastName', 'username'])
        .execute();
    const games = await db
        .selectFrom('games')
        .select(['id','title', 'description'])
        .execute();
    const locations = await db
        .selectFrom('location')
        .select(['id', 'address'])
        .execute();
    const allEvents: EventDisplay[] = [];
    for (const event of events) {
        const locationAddy = locations.find(g => g.id === event.locationId);
        const gameTitle = games.find(g => g.id === event.gameId);
        const accountName = account.find(g => g.id === event.hostId);
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
        .select(['id', 'date', 'hostId', 'gameId', 'locationId', 'title', 'description'])
        .where('id', '=', eId)
        .executeTakeFirstOrThrow();
    const account = await db
        .selectFrom('accounts')
        .select(['id', 'firstName', 'lastName', 'username'])
        .where('id', '=', events.hostId)
        .executeTakeFirstOrThrow();
    const games = await db
        .selectFrom('games')
        .select(['id','title', 'description'])
        .where('id', '=', events.gameId)
        .executeTakeFirstOrThrow();
    const locations = await db
        .selectFrom('location')
        .select(['id', 'address', 'latitude', 'longitude'])
        .where('id', '=', events.locationId)
        .executeTakeFirstOrThrow();

    const event: EventInfo = {
        ...events,
        author: account,
        game: games,
        location: locations,
    }
    return event;
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const createdEvent = await db.transaction().execute(async (trx) => {
        const cEvent = await trx
            .insertInto('events')
            .columns(['gameId', 'hostId', 'locationId', 'title', 'description'])
            .values({gameId: event.gameId, hostId: event.hostId, locationId: event.locationId, 
                title: event.title, description: event.description, date: event.date})
            .returning(['id', 'date', 'hostId', 'locationId', 'gameId', 'title', 'description'])
            .executeTakeFirstOrThrow();
        return cEvent;
    })
    return createdEvent;
}

export async function removeEvent(eId: number): Promise<Event> {
    const deletedEvent = await db.transaction().execute(async (trx) => {
        const event = await trx
        .deleteFrom('events')
        .where('id', '=', eId)
        .returning(['id', 'hostId', 'date', 'gameId', 'locationId', 'title', 'description'])
        .executeTakeFirstOrThrow();
        return event;
    });
    return deletedEvent;
}