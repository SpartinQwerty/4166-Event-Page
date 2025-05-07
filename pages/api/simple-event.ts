import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { db } from '../../lib/db/db';
import { prisma } from '../../lib/prisma';
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
      // Use the original description without adding host information
      const enhancedDescription = description;
      
      // Declare accountId variable
      let accountId: number;
      
      // Get user account from email using the db utility
      try {
        // First, try to find the account directly from the database
        const accounts = await db
          .selectFrom('accounts')
          .select(['id', 'username', 'firstName', 'lastName'])
          .where('username', '=', userEmail)
          .execute();
        
        let account = accounts.length > 0 ? accounts[0] : null;
        console.log('Account lookup result:', account);
        
        if (!account) {
          console.log('No account found with email:', userEmail);
          console.log('Creating new account for user:', userName, userEmail);
          
          // Split the name into first and last name
          const nameParts = userName?.split(' ') || ['User'];
          const firstName = nameParts[0] || 'User';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
          
          // Create a new account directly using db
          const newAccounts = await db
            .insertInto('accounts')
            .values({
              username: userEmail,
              email: userEmail,
              password: 'temppassword', // This should be properly handled in a real app
              firstName: firstName,
              lastName: lastName
            })
            .returning(['id', 'username', 'firstName', 'lastName'])
            .execute();
          
          account = newAccounts[0];
          console.log('Created new account:', account);
          
          if (!account || !account.id) {
            return res.status(500).json({ message: 'Failed to create user account' });
          }
        }
        
        accountId = Number(account.id);
        console.log('Using account ID:', accountId);
      } catch (accountError: any) {
        console.error('Error handling account:', accountError);
        return res.status(500).json({ message: 'Error handling user account: ' + accountError.message });
      }
      
      console.log('Using account ID for event creation:', accountId);
      console.log('Game ID:', Number(gameId), 'Location ID:', Number(locationId));
      
      // Log the data we're about to send to the database
      console.log('Creating event with data:', {
        title,
        description: enhancedDescription,
        date: new Date(date),
        hostId: accountId,
        locationId: Number(locationId),
        gameId: Number(gameId)
      });
      
      try {
        // Format the date properly for the database
        console.log('Original date string:', date);
        let formattedDate;
        try {
          // Ensure we have a valid date object
          formattedDate = new Date(date);
          console.log('Parsed date object:', formattedDate);
          
          // Check if the date is valid
          if (isNaN(formattedDate.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (dateError) {
          console.error('Error parsing date:', dateError);
          return res.status(400).json({ message: 'Invalid date format' });
        }
        
        // Use the dynamic account ID from earlier in the code
        console.log('Using dynamic account ID:', accountId, 'Type:', typeof accountId);
        
        // Log all the data we're about to send to createEvent
        const eventData = {
          title,
          description: enhancedDescription,
          date: formattedDate,
          hostId: Number(accountId),
          locationId: Number(locationId),
          gameId: Number(gameId)
        };
        
        console.log('Event data being sent to createEvent:', JSON.stringify(eventData));
        
        try {
          // Create the event using the action function with the selected gameId and locationId
          const eventResult = await createEvent(eventData);
          console.log('Event created successfully:', eventResult);
          
          return res.status(200).json({
            success: true,
            message: 'Event created successfully',
            event: eventResult
          });
        } catch (error: any) {
          console.error('Detailed event creation error:', error);
          console.error('Error name:', error.name || 'Unknown error');
          console.error('Error message:', error.message || 'No error message');
          console.error('Error stack:', error.stack || 'No stack trace');
          
          // Check if this is a database constraint error
          if (error.message && error.message.includes('violates')) {
            console.error('Database constraint violation detected');
            
            // Try to extract the constraint name
            const constraintMatch = error.message.match(/constraint "([^"]+)"/i);
            if (constraintMatch && constraintMatch[1]) {
              console.error('Constraint name:', constraintMatch[1]);
            }
          }
          
          return res.status(500).json({ 
            message: 'Error creating event', 
            error: error.message || 'Unknown error creating event' 
          });
        }
      } catch (createError: any) {
        console.error('Error creating event:', createError);
        console.error('Error stack:', createError.stack);
        return res.status(500).json({ 
          message: 'Error creating event', 
          error: createError.message || 'Unknown error creating event' 
        });
      }

      // Code moved to try/catch block above
    } catch (innerError: any) {
      console.error('Error in database operations:', innerError);
      console.error('Error stack:', innerError.stack);
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
