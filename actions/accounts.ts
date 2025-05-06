"use server";

import { db } from "../lib/db/db"
import { AccountType } from "../lib/db/types";

export type Account = {
    accountId: number;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
}

export async function getAllAccounts(): Promise<Account[]> {
    const accounts = await db
    .selectFrom('accounts')
    .select(['accountId', 'userName','password','firstName', 'lastName'])
    .execute();
    return accounts;
}

export async function getAccount(accountId: number): Promise<Account> {
    const account = await db
    .selectFrom('accounts')
    .select(['accountId', 'userName', 'password', 'firstName', 'lastName'])
    .where('accountId', '=', accountId)
    .executeTakeFirstOrThrow();
    return account;
}

export async function createAccount(user: string, pass: string, fName: string, lName: string): Promise<Account> {
    const createdAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
            .insertInto('accounts')
            .columns(['userName','password', 'firstName','lastName'])
            .values({userName: user, password: pass, firstName: fName, lastName: lName})
            .returning(['accountId', 'userName','password', 'firstName','lastName'])
            .executeTakeFirstOrThrow();
        return account;
    });
    return createdAccount;
}

export async function deleteAccount(aId: number): Promise<Account> {
    const deletedAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
        .deleteFrom('accounts')
        .where('accountId', '=', aId)
        .returning(['accountId', 'userName','password', 'firstName','lastName'])
        .executeTakeFirstOrThrow();
        return account;
    });
    return deletedAccount;
}

export async function updateAccountInfo(aId: number, update: Omit<Account, 'accountId'>): Promise<Omit<Account, 'password'>> {
    const updatedAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
            .updateTable('accounts')
            .set({firstName: update.firstName, lastName: update.lastName, userName: update.userName})
            .where('accountId', '=', aId)
            .returning(['accountId','firstName','lastName', 'userName'])
            .executeTakeFirstOrThrow();
            return account;
    })
    return updatedAccount;
}

export async function updateAccountPass(aId: number, update: Omit<Account, 'firstName' | 'lastName'>): Promise<Omit<Account, 'password'>>{
    const updatedAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
            .updateTable('accounts')
            .set({password: update.password})
            .where('accountId', '=', aId)
            .returning(['accountId','firstName','lastName', 'userName'])
            .executeTakeFirstOrThrow();
            return account;
    })
    return updatedAccount;
}