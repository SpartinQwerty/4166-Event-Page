import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      return handlePost(req, res, session.user.id);
    case 'PUT':
      return handlePut(req, res, session.user.id);
    case 'DELETE':
      return handleDelete(req, res, session.user.id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { title, description, date, location } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        userId,
      },
    });

    return res.status(200).json(event);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id, title, description, date, location } = req.body;

    if (!id || !title || !description || !date || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
      },
    });

    return res.status(200).json(updatedEvent);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Missing event ID' });
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
