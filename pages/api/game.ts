import { NextApiRequest, NextApiResponse } from "next";
import { createGame, deleteGame, Game, getAllGames, getGame, updateGame } from "../../actions/games";

export default async function handler(
        req: NextApiRequest, 
        res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { id } = req.body;
            if (!id) {
                const games = await getAllGames();
                res.status(200).json(games);
            } else {
                const games = await getGame(id);
                res.status(200).json(games);
            }
        } catch (e) {
            res.status(500).json({message: 'Failed to fetch games'});
        }
    } else if (req.method === 'POST') {
        try {
            const {title , description} = req.body;
            if(!title || !description) {
                res.status(400).json({message: 'Missing required fields'});
            }
            const gme: Omit<Game, 'id'> = {
                title: title,
                description: description
            }
            const game = await createGame(gme);
            res.status(200).json(game);
        } catch (e) {
            res.status(500).json({message: `Failed to create${e}`})
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            if(!id) {
                res.status(400).json({message: 'Missing id to delete'});
            }
            const account = await deleteGame(id);
            res.status(200).json(account);
        } catch (e) {
            res.status(500).json({message: 'Failed to delete account'});
        }
    } else if (req.method === 'PUT') {
        try {
            const {id, title, description} = req.body;
            if (!id) {
                res.status(400).json({message: 'missing id to PUT'});
            }
            const gme: Omit<Game, 'id'> = {
                title: title,
                description: description,
            } 
            const game = await updateGame(id, gme);
            res.status(200).json(game);
        } catch (e) {
            res.status(500).json({message: 'failed to update'})
        }
    } else {
        res.status(405).json({message: 'da fuc dewd'})
    }
}