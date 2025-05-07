import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { db } from '../../lib/db/db';
import { sql } from 'kysely';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetFavorites(req, res, session);
    case 'POST':
      return handleAddFavorite(req, res, session);
    case 'DELETE':
      return handleRemoveFavorite(req, res, session);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// Get all favorites for a user
async function handleGetFavorites(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    // If eventId is provided, get favorites for that event
    // Otherwise, get all favorites for the current user
    const { eventId, userId } = req.query;
    
    if (eventId) {
      // Get all users who favorited this event
      const favorites = await db
        .selectFrom('favorites as f')
        .innerJoin('accounts as a', 'a.id', 'f.userId')
        .select(['f.id as favoriteId', 'f.eventId', 'f.userId', 'f.createdAt', 'a.username', 'a.firstName', 'a.lastName'])
        .where('f.eventId', '=', Number(eventId))
        .execute();
      
      return res.status(200).json({ favorites });
    } else if (userId) {
      // Get all events favorited by this user
      const favorites = await db
        .selectFrom('favorites as f')
        .innerJoin('events as e', 'e.id', 'f.eventId')
        .innerJoin('accounts as a', 'a.id', 'e.hostId')
        .select([
          'f.id as favoriteId', 
          'f.eventId', 
          'f.userId', 
          'f.createdAt', 
          'e.title', 
          'e.description', 
          'e.date', 
          'e.locationId as location',
          'e.hostId',
          'a.username as hostUsername',
          'a.firstName as hostFirstName',
          'a.lastName as hostLastName'
        ])
        .where('f.userId', '=', Number(userId))
        .execute();
      
      return res.status(200).json({ favorites });
    } else if (session) {
      // Get current user's ID from session
      const email = session.user?.email;
      if (!email) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await db
        .selectFrom('accounts')
        .select(['id'])
        .where('username', '=', email)
        .executeTakeFirst();
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get all events favorited by the current user
      const favorites = await db
        .selectFrom('favorites as f')
        .innerJoin('events as e', 'e.id', 'f.eventId')
        .innerJoin('accounts as a', 'a.id', 'e.hostId')
        .select([
          'f.id as favoriteId', 
          'f.eventId', 
          'f.userId', 
          'f.createdAt', 
          'e.title', 
          'e.description', 
          'e.date', 
          'e.locationId as location',
          'e.hostId',
          'a.username as hostUsername',
          'a.firstName as hostFirstName',
          'a.lastName as hostLastName'
        ])
        .where('f.userId', '=', user.id)
        .execute();
      
      return res.status(200).json({ favorites });
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Error getting favorites:', error);
    return res.status(500).json({ message: 'Error getting favorites' });
  }
}

// Add a favorite
async function handleAddFavorite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    
    // Get current user's ID from session
    const email = session.user?.email;
    console.log("User email from session:", email);
    
    const user = await db
      .selectFrom('accounts')
      .select(['id'])
      .where('username', '=', email)
      .executeTakeFirst();
    
    console.log("User found:", user);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the favorite already exists
    const existingFavorite = await db
      .selectFrom('favorites')
      .select(['id'])
      .where('eventId', '=', Number(eventId))
      .where('userId', '=', user.id)
      .executeTakeFirst();
    
    if (existingFavorite) {
      return res.status(409).json({ message: 'Event already favorited' });
    }
    
    // Add the favorite
    const favorite = await db
      .insertInto('favorites')
      .values({ 
        eventId: Number(eventId), 
        userId: user.id, 
        createdAt: sql`now()` 
      })
      .returning(['id', 'eventId', 'userId', 'createdAt'])
      .executeTakeFirst();
    
    return res.status(201).json({ favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ message: 'Error adding favorite' });
  }
}

// Remove a favorite
async function handleRemoveFavorite(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { eventId } = req.query;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    
    // Get current user's ID from session
    const email = session.user?.email;
    const user = await db
      .selectFrom('accounts')
      .select(['id'])
      .where('username', '=', email)
      .executeTakeFirst();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove the favorite
    const result = await db
      .deleteFrom('favorites')
      .where('eventId', '=', Number(eventId))
      .where('userId', '=', user.id)
      .executeTakeFirst();
    
    return res.status(200).json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ message: 'Error removing favorite' });
  }
}
