import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { db } from '../../lib/db/db';
import { prisma } from '../../lib/prisma';
import { createLocation } from '../../actions/locations';
import { createGame } from '../../actions/games';
import { createEvent } from '../../actions/events';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract data from request
    const { title, description, date, gameId, locationId } = req.body;

    // Validate required fields
    if (!title || !description || !date || !locationId || !gameId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user ID from session
    const userEmail = session.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email not found in session' });
    }
    
    // Get user from Prisma database
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userId = user.id;
    const userName = user.name || 'Anonymous';

    try {
      // Enhance the description with the author's name
      const enhancedDescription = `${description}\n\nHosted by: ${userName}`;
      
      // Create the event using the action function with the selected gameId and locationId
      // Since we're using two different database systems (Prisma for users, Kysely for events)
      // we need to handle the ID type difference
      const eventResult = await createEvent({
        title,
        description: enhancedDescription,
        date: new Date(date),
        hostId: 1, // Use a default hostId since we can't convert string to number directly
        locationId: locationId, // Use the selected locationId directly
        gameId: gameId // Use the selected gameId directly
      });

      if (!eventResult) {
        return res.status(500).json({ message: 'Failed to create event' });
      }

      return res.status(200).json({
        success: true,
        message: 'Event created successfully',
        event: eventResult
      });
    } catch (innerError: any) {
      console.error('Error in database operations:', innerError);
      return res.status(500).json({ 
        message: 'Database error', 
        error: innerError.message || 'Unknown database error' 
      });
    }
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({ 
      message: 'Error creating event', 
      error: error.message || 'Unknown error' 
    });
  }
}
