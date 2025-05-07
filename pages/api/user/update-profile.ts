import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, password, firstName, lastName } = req.body;
    
    // Prepare update data
    const updateData: any = {};
    
    // Update name if provided
    if (firstName && lastName) {
      updateData.name = `${firstName} ${lastName}`;
    }
    
    // Update email if provided and different from current
    if (email && email !== session.user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      updateData.email = email;
    }
    
    // Update password if provided
    if (password && password.length >= 8) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    
    // If no updates, return early
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
}
