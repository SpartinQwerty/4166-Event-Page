import { Generated } from "kysely";

export type Database = {
    account: AccountType;
    event: EventType;
    game: GameType;
    location: LocationType;
}

export type AccountType = {
    accountId: Generated<number>;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type EventType = {
    eventId: Generated<number>;
    hostId: number;
    gameId: number;
    locationId: number;
    title: string;
    description: string;
}

export type GameType = {
    gameId : Generated<number>;
    gameTitle: string;
    description: string;
}

export type LocationType = {
    locationId: Generated<number>;
    address: string;
    latitude: number;
    longitude: number;
}
