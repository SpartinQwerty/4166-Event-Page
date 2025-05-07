
import { db } from "../lib/db/db"
import { AccountType } from "../lib/db/types";

export type Account = {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

export async function getAllAccounts(): Promise<Account[]> {
    const accounts = await db
        .selectFrom('accounts')
        .select(['id', 'username','password','firstName', 'lastName'])
        .execute();
    return accounts;
}

export async function getAccount(id: number): Promise<Account> {
    const account = await db
        .selectFrom('accounts')
        .select(['id', 'username', 'password', 'firstName', 'lastName', 'email'])
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
    return account;
}

export async function createAccount(user: string, pass: string, fName: string, lName: string): Promise<Account> {
    console.log('Creating account with data:', { username: user, firstName: fName, lastName: lName });
    
    try {
        const createdAccount = await db.transaction().execute(async (trx) => {
            try {
                // Include email field with the same value as username
                const account = await trx
                    .insertInto('accounts')
                    .columns(['username', 'password', 'firstName', 'lastName', 'email'])
                    .values({
                        username: user, 
                        password: pass, 
                        firstName: fName, 
                        lastName: lName,
                        email: user // Use username as email
                    })
                    .returning(['id', 'username', 'password', 'firstName', 'lastName', 'email'])
                    .executeTakeFirstOrThrow();
                
                console.log('Account created successfully:', account);
                return account;
            } catch (innerError) {
                console.error('Error in account creation transaction:', innerError);
                throw innerError;
            }
        });
        return createdAccount;
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
}

export async function deleteAccount(aId: number): Promise<Account> {
    const deletedAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
        .deleteFrom('accounts')
        .where('id', '=', aId)
        .returning(['id', 'username','password', 'firstName','lastName'])
        .executeTakeFirstOrThrow();
        return account;
    });
    return deletedAccount;
}

export async function updateAccountInfo(aId: number, update: Omit<Account, 'id'>): Promise<Omit<Account, 'password'>> {
    const updatedAccount = await db.transaction().execute(async (trx) => {
        const account = await trx
            .updateTable('accounts')
            .set({firstName: update.firstName, lastName: update.lastName, username: update.username})
            .where('id', '=', aId)
            .returning(['id','firstName','lastName', 'username'])
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
            .where('id', '=', aId)
            .returning(['id','firstName','lastName', 'username'])
            .executeTakeFirstOrThrow();
            return account;
    })
    return updatedAccount;
}