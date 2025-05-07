import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getGame, updateGame, deleteGame } from '../../../actions/games';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get game ID from the URL
  const { id } = req.query;
  const gameId = parseInt(id as string);

  if (isNaN(gameId)) {
    return res.status(400).json({ message: 'Invalid game ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetGame(req, res, gameId);
    case 'PUT':
      return handleUpdateGame(req, res, gameId);
    case 'DELETE':
      return handleDeleteGame(req, res, gameId);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific game
async function handleGetGame(req: NextApiRequest, res: NextApiResponse, gameId: number) {
  try {
    const game = await getGame(gameId);
    return res.status(200).json(game);
  } catch (error: any) {
    console.error(`Error fetching game ${gameId}:`, error);
    return res.status(404).json({ 
      message: 'Game not found', 
      error: error.message 
    });
  }
}

// PUT - Update a game
async function handleUpdateGame(req: NextApiRequest, res: NextApiResponse, gameId: number) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Game title is required' });
    }

    const game = await updateGame(gameId, {
      title,
      description: description || ''
    });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    return res.status(200).json(game);
  } catch (error: any) {
    console.error(`Error updating game ${gameId}:`, error);
    return res.status(500).json({ 
      message: 'Error updating game', 
      error: error.message 
    });
  }
}

// DELETE - Delete a game
async function handleDeleteGame(req: NextApiRequest, res: NextApiResponse, gameId: number) {
  try {
    const game = await deleteGame(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    return res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting game ${gameId}:`, error);
    return res.status(500).json({ 
      message: 'Error deleting game', 
      error: error.message 
    });
  }
}
