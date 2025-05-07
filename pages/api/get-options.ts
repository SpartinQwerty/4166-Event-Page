import { NextApiRequest, NextApiResponse } from 'next';
import { getAllGames } from '../../actions/games';
import { getAllLocations } from '../../actions/locations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all games and locations
    const games = await getAllGames();
    const locations = await getAllLocations();

    return res.status(200).json({
      games,
      locations
    });
  } catch (error: any) {
    console.error('Error fetching options:', error);
    return res.status(500).json({ 
      message: 'Error fetching options', 
      error: error.message 
    });
  }
}
