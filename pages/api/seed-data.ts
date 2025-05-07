import { NextApiRequest, NextApiResponse } from 'next';
import { createLocation } from '../../actions/locations';
import { createGame } from '../../actions/games';

// Predefined locations
const locations = [
  {
    address: "Game Haven - Charlotte",
    latitude: 35.2271,
    longitude: -80.8431
  },
  {
    address: "Boardwalk Games - Raleigh",
    latitude: 35.7796,
    longitude: -78.6382
  },
  {
    address: "Dice & Dragons - Greensboro",
    latitude: 36.0726,
    longitude: -79.7920
  },
  {
    address: "Card Kingdom - Durham",
    latitude: 35.9940,
    longitude: -78.8986
  },
  {
    address: "Tabletop Tavern - Winston-Salem",
    latitude: 36.0999,
    longitude: -80.2442
  }
];

// Predefined games
const games = [
  {
    title: "Dungeons & Dragons",
    description: "The world's greatest roleplaying game"
  },
  {
    title: "Magic: The Gathering",
    description: "The original collectible card game"
  },
  {
    title: "Warhammer 40K",
    description: "Tabletop miniature wargame set in a dystopian sci-fi universe"
  },
  {
    title: "Pathfinder",
    description: "Fantasy roleplaying game derived from D&D 3.5"
  },
  {
    title: "Catan",
    description: "Popular resource management and trading board game"
  },
  {
    title: "Pokemon TCG",
    description: "Collectible card game based on the Pokemon franchise"
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Seed locations
    const createdLocations = [];
    for (const location of locations) {
      try {
        const result = await createLocation(location);
        createdLocations.push(result);
      } catch (error) {
        console.error('Error creating location:', error);
        // Continue with next location even if one fails
      }
    }

    // Seed games
    const createdGames = [];
    for (const game of games) {
      try {
        const result = await createGame(game);
        createdGames.push(result);
      } catch (error) {
        console.error('Error creating game:', error);
        // Continue with next game even if one fails
      }
    }

    return res.status(200).json({
      message: 'Data seeded successfully',
      locations: createdLocations,
      games: createdGames
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return res.status(500).json({ 
      message: 'Error seeding data', 
      error: error.message 
    });
  }
}
