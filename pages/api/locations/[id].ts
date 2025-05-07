import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getLocation, updateLocation, deleteLocation } from '../../../actions/locations';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get location ID from the URL
  const { id } = req.query;
  const locationId = parseInt(id as string);

  if (isNaN(locationId)) {
    return res.status(400).json({ message: 'Invalid location ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetLocation(req, res, locationId);
    case 'PUT':
      return handleUpdateLocation(req, res, locationId);
    case 'DELETE':
      return handleDeleteLocation(req, res, locationId);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Retrieve a specific location
async function handleGetLocation(req: NextApiRequest, res: NextApiResponse, locationId: number) {
  try {
    console.log(`Fetching location with ID: ${locationId}`);
    const location = await getLocation(locationId);
    console.log('Location found:', location);
    return res.status(200).json(location);
  } catch (error: any) {
    console.error(`Error fetching location ${locationId}:`, error);
    return res.status(404).json({ 
      message: 'Location not found', 
      error: error.message 
    });
  }
}

// PUT - Update a location
async function handleUpdateLocation(req: NextApiRequest, res: NextApiResponse, locationId: number) {
  try {
    const { address } = req.body;
    console.log(`Updating location ${locationId} with:`, { address });

    if (!address) {
      return res.status(400).json({ message: 'Location address is required' });
    }

    const location = await updateLocation(locationId, {
      address
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    console.log(`Updated location ${locationId}:`, location);
    return res.status(200).json(location);
  } catch (error: any) {
    console.error(`Error updating location ${locationId}:`, error);
    return res.status(500).json({ 
      message: 'Error updating location', 
      error: error.message 
    });
  }
}

// DELETE - Delete a location
async function handleDeleteLocation(req: NextApiRequest, res: NextApiResponse, locationId: number) {
  try {
    console.log(`Deleting location with ID: ${locationId}`);
    const deletedLocation = await deleteLocation(locationId);
    
    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    console.log('Location deleted successfully:', deletedLocation);
    return res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting location ${locationId}:`, error);
    return res.status(500).json({ 
      message: 'Error deleting location', 
      error: error.message 
    });
  }
}
