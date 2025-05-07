import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db/db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

// API handler for event participants
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET - Get participants for an event
    if (req.method === 'GET') {
      return handleGetParticipants(req, res);
    }
    
    // For methods requiring authentication, get the session
    const session = await getServerSession(req, res, authOptions);
    
    // Require authentication for POST and DELETE
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // POST - Join an event
    if (req.method === 'POST') {
      return handleJoinEvent(req, res, session);
    }
    
    // DELETE - Leave an event
    if (req.method === 'DELETE') {
      return handleLeaveEvent(req, res, session);
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in participants API:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get participants for an event
async function handleGetParticipants(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { eventId } = req.query;
    
    if (!eventId || Array.isArray(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    // Get participants with account details
    const participants = await db
      .selectFrom('participants as p')
      .innerJoin('accounts as a', 'a.id', 'p.userId')
      .select([
        'p.id as participantId',
        'p.eventId',
        'p.userId',
        'p.joinedAt',
        'a.username',
        'a.firstName',
        'a.lastName'
      ])
      .where('p.eventId', '=', Number(eventId))
      .execute();
    
    return res.status(200).json(participants);
  } catch (error) {
    console.error('Error getting participants:', error);
    return res.status(500).json({ message: 'Error getting participants' });
  }
}

// Join an event
async function handleJoinEvent(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { eventId } = req.body;
    const userEmail = session?.user?.email;
    
    if (!eventId || !userEmail) {
      return res.status(400).json({ message: 'Missing event ID or user email' });
    }
    
    // Get the user's account ID
    console.log('Looking for account with email/username:', userEmail);
    
    const accounts = await db
      .selectFrom('accounts')
      .select(['id', 'username'])
      .execute();
    
    console.log('All accounts:', accounts);
    
    // Find the account with the matching username
    const userAccount = accounts.find(account => account.username === userEmail);
    
    if (!userAccount) {
      // If not found, we'll try to create a new account
      console.log('Account not found for email:', userEmail);
      
      // Get user details from session
      const userName = session.user?.name || 'User';
      
      // Create a new account for the user
      console.log('Creating new account for user:', userName, userEmail);
      
      const newAccount = await db
        .insertInto('accounts')
        .values({
          username: userEmail,
          password: 'temppassword', // This should be properly handled in a real app
          firstName: userName?.split(' ')[0] || 'User',
          lastName: userName?.split(' ')[1] || 'User'
        })
        .returning(['id', 'username'])
        .executeTakeFirst();
      
      console.log('Created new account:', newAccount);
      
      if (!newAccount) {
        return res.status(500).json({ message: 'Failed to create user account' });
      }
      
      var userId = newAccount.id;
    } else {
      var userId = userAccount.id;
    }
    
    // Check if the user is already a participant
    const existingParticipant = await db
      .selectFrom('participants as p')
      .select(['p.id'])
      .where('p.eventId', '=', Number(eventId))
      .where('p.userId', '=', userId)
      .execute();
    
    if (existingParticipant.length > 0) {
      return res.status(409).json({ message: 'Already joined this event' });
    }
    
    // Add the user as a participant
    try {
      console.log('Inserting participant with eventId:', Number(eventId), 'userId:', userId);
      
      const participant = await db
        .insertInto('participants')
        .values({
          eventId: Number(eventId),
          userId: Number(userId), // Ensure userId is a number
          joinedAt: new Date() // Explicitly include joinedAt to satisfy TypeScript
        })
        .returning(['id', 'eventId', 'userId', 'joinedAt'])
        .executeTakeFirst();
      
      console.log('Participant added successfully:', participant);
      return res.status(201).json(participant);
    } catch (insertError: any) {
      console.error('Error inserting participant:', insertError);
      console.error('Error stack:', insertError.stack);
      return res.status(500).json({ 
        message: 'Error inserting participant', 
        error: insertError.message || 'Unknown error' 
      });
    }
    
  } catch (error: any) {
    console.error('Error joining event:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Error joining event', 
      error: error.message || 'Unknown error' 
    });
  }
}

// Leave an event
async function handleLeaveEvent(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { eventId } = req.query;
    const userEmail = session?.user?.email;
    
    if (!eventId || Array.isArray(eventId) || !userEmail) {
      return res.status(400).json({ message: 'Invalid event ID or missing user email' });
    }
    
    // Get the user's account ID
    const accounts = await db
      .selectFrom('accounts')
      .select(['id', 'username'])
      .execute();
    
    // Find the account with the matching username
    const userAccount = accounts.find(account => account.username === userEmail);
    
    if (!userAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    const userId = userAccount.id;
    
    // Delete the participant record
    const result = await db
      .deleteFrom('participants as p')
      .where('p.eventId', '=', Number(eventId))
      .where('p.userId', '=', userId)
      .executeTakeFirst();
    
    return res.status(200).json({ message: 'Left event successfully' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return res.status(500).json({ message: 'Error leaving event' });
  }
}
