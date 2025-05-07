import { Account, createAccount, deleteAccount, getAccount, getAllAccounts, updateAccountInfo, updateAccountPass } from "../../actions/accounts";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
        req: NextApiRequest, 
        res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const {id} = req.body;
            if (!id ) {
                const accounts = await getAllAccounts();
                res.status(200).json(accounts);
            } else {
                const account = await getAccount(id);
                res.status(200).json(account);
            }
        } catch (e) {
            res.status(500).json({message: 'Failed to fetch accounts'});
        }
    } else if (req.method === 'POST') {
        try {
            const { username, password, firstName, lastName } = req.body;
            if (!username || !password || !firstName || !lastName) {
                res.status(400).json({message: 'Missing required fields'});
            }
            const account = await createAccount(username, password, firstName, lastName);
            res.status(200).json(account);
        } catch (e) {
            res.status(500).json({message: `Failed to create${e}`})
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            if (!id) {
                res.status(400).json({message: 'Missing required fields'})
            }
            const account = await deleteAccount(id);
            res.status(200).json(account);
        } catch (e) {
            res.status(500).json({message: 'Failed to delete account'});
        }
    } else if (req.method === 'PUT') {
        try {
            const { id ,username, password, firstName, lastName } = req.body;
            if (!id) {
                res.status(400).json({message: 'Missing required fields'});
            }
            if (!password) {
                const accnt: Omit<Account, "id">  = {
                    username: username,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                }
                const account = await updateAccountInfo(id, accnt);
                res.status(200).json(account);
            } else {
                const accnt: Omit<Account, "firstName" | "lastName">  = {
                    id: id,
                    username: username,
                    password: password,
                }
                const account = await updateAccountPass(id, accnt);
                res.status(200).json(account);
            }
        } catch (e) {
            res.status(500).json({message: 'failed to update'})
        }
    } else {
        res.status(405).json({message: 'da fuc dewd'})
    }
}