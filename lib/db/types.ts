import { Generated } from "kysely";

export type Database = {
    accounts: AccountType;
    events: EventType;
    game: GameType;
    location: LocationType;
    participants: ParticipantType;
    favorites: FavoriteType;
}

export type AccountType = {
    id: Generated<number>;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
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
}

export type ParticipantType = {
    id: Generated<number>;
    eventId: number;
    userId: number;
    joinedAt: Date;
}

export type FavoriteType = {
    id: Generated<number>;
    eventId: number;
    userId: number;
    createdAt: Date;
}
