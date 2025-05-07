import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user to be an admin
    // Use a type assertion to handle the isAdmin property
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        // @ts-ignore - isAdmin exists in the schema but TypeScript doesn't recognize it
        isAdmin: true 
      }
    });

    // Use type assertion to handle the isAdmin property in the response
    return res.status(200).json({
      message: `User ${email} has been set as admin`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        // @ts-ignore - isAdmin exists in the schema but TypeScript doesn't recognize it
        isAdmin: (updatedUser as any).isAdmin || true
      }
    });
  } catch (error: any) {
    console.error('Error setting admin:', error);
    return res.status(500).json({ 
      message: 'Error setting admin', 
      error: error.message 
    });
  }
}
