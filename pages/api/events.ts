import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { createEvent, getAllEvents, getOneEvent, removeEvent } from '../../actions/events';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow public access for GET requests
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  
  // Require authentication for all other methods
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    switch (req.method) {
      case 'POST':
        return handlePost(req, res, session);
      case 'DELETE':
        return handleDelete(req, res, session);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (id && typeof id === 'string') {
      // Get a single event
      const event = await getOneEvent(parseInt(id));
      return res.status(200).json(event);
    } else {
      // Get all events
      const events = await getAllEvents();
      return res.status(200).json(events);
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'An error occurred' });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    const { title, description, date, gameId, locationId } = req.body;

    if (!title || !description || !date || !gameId || !locationId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get user ID from session
    const userEmail = session.user.email;
    
    // Get user account from email
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/accounts?email=${userEmail}`);
    const userData = await response.json();
    
    if (!userData || !userData.id) {
      return res.status(404).json({ message: 'User account not found' });
    }
    
    const event = await createEvent({
      title,
      description,
      date: new Date(date),
      gameId,
      locationId,
      hostId: userData.id,
    });

    return res.status(200).json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(500).json({ message: error.message || 'An error occurred while creating the event' });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Missing event ID' });
    }
    
    // Get the event to check ownership
    const event = await getOneEvent(parseInt(id));
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get user ID from session
    const userEmail = session.user.email;
    
    // Get user account from email
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/accounts?email=${userEmail}`);
    const userData = await response.json();
    
    if (!userData || !userData.id) {
      return res.status(404).json({ message: 'User account not found' });
    }
    
    // Check if user is an admin
    const isAdmin = session.user.isAdmin || session.user.email === 'admin@gmail.com';
    console.log('Delete request from user:', userEmail, 'isAdmin:', isAdmin);
    
    // Check if user is the host of the event or an admin
    if (event.author.id !== userData.id && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await removeEvent(parseInt(id));

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'An error occurred while deleting the event' });
  }
}
