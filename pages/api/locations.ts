import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { getAllLocations, createLocation } from '../../actions/locations';

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
      return handleGetLocations(req, res);
    case 'POST':
      return handleCreateLocation(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve all locations
async function handleGetLocations(req: NextApiRequest, res: NextApiResponse) {
  try {
    const locations = await getAllLocations();
    
    console.log(`Returning ${locations.length} locations`);
    return res.status(200).json(locations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ 
      message: 'Error fetching locations', 
      error: error.message 
    });
  }
}

// POST - Create a new location
async function handleCreateLocation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { address } = req.body;
    console.log('Received location data:', { address });

    if (!address) {
      return res.status(400).json({ message: 'Location address is required' });
    }

    try {
      const location = await createLocation({
        address
      });

      console.log('Created location:', location);
      return res.status(201).json(location);
    } catch (error: any) {
      console.error('Error creating location:', error);
      return res.status(400).json({ 
        message: 'Error creating location', 
        error: error.message || 'Unknown error' 
      });
    }
  } catch (error: any) {
    console.error('Error creating location:', error);
    return res.status(500).json({ 
      message: 'Error creating location', 
      error: error.message 
    });
  }
}
