import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log the request body for debugging
    console.log('Request body:', req.body);

    // Insert directly into the location table
    const result = await db
      .insertInto('location')
      .values({
        address: 'Test Address',
      })
      .execute();

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Test location created successfully',
      result 
    });
  } catch (error: any) {
    console.error('Error in test-location:', error);
    return res.status(500).json({ 
      message: 'Error creating test location', 
      error: error.message || 'Unknown error' 
    });
  }
}
