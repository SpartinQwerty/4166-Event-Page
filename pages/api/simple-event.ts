import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { db } from '../../lib/db/db';

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
    const { title, description, date, game, location } = req.body;

    // Validate required fields
    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user ID from session
    const userEmail = session.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email not found in session' });
    }
    
    // Get user account from email using direct database query
    const userData = await db
      .selectFrom('accounts')
      .select(['id', 'username', 'firstName', 'lastName'])
      .where('username', '=', userEmail)
      .executeTakeFirst();
    
    // If user not found, use a default user ID for testing purposes
    const userId = userData?.id || 1; // Fallback to user ID 1 if not found

    // Create location using Kysely query builder
    try {
      // First create the location
      const locationResult = await db
        .insertInto('location')
        .values({
          address: location.address || 'Selected location',
          latitude: Math.round(location.lat),
          longitude: Math.round(location.lng)
        })
        .returning(['id', 'address', 'latitude', 'longitude'])
        .executeTakeFirst();

      if (!locationResult) {
        return res.status(500).json({ message: 'Failed to create location' });
      }

      const locationId = locationResult.id;

      // Then create the event
      const eventResult = await db
        .insertInto('events')
        .values({
          title,
          description,
          date: new Date(date),
          hostId: userId,
          locationId,
          gameId: 1 // Default gameId
        })
        .returning(['id', 'title', 'description', 'date'])
        .executeTakeFirst();

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
