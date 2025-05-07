import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getAllGames, createGame } from '../../actions/games';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetGames(req, res);
    case 'POST':
      return handleCreateGame(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve all games
async function handleGetGames(req: NextApiRequest, res: NextApiResponse) {
  try {
    const games = await getAllGames();
    return res.status(200).json(games);
  } catch (error: any) {
    console.error('Error fetching games:', error);
    return res.status(500).json({ 
      message: 'Error fetching games', 
      error: error.message 
    });
  }
}

// POST - Create a new game
async function handleCreateGame(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Game title is required' });
    }

    const game = await createGame({
      title,
      description: description || ''
    });

    return res.status(201).json(game);
  } catch (error: any) {
    console.error('Error creating game:', error);
    return res.status(500).json({ 
      message: 'Error creating game', 
      error: error.message 
    });
  }
}
