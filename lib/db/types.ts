import { Generated } from "kysely";

export type Database = {
    accounts: AccountType;
    events: EventType;
    game: GameType;
    location: LocationType;
}

export type AccountType = {
    id: Generated<number>;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type EventType = {
    id: Generated<number>;
    hostId: number;
    gameId: number;
    locationId: number;
    date: Date;
    title: string;
    description: string;
}

export type GameType = {
    id : Generated<number>;
    title: string;
    description: string;
}

export type LocationType = {
    id: Generated<number>;
    address: string;
    latitude: number;
    longitude: number;
}
