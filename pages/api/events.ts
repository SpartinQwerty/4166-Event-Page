import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';
import { deleteEvent, getAllEvents, getOneEvent, updateEvent, Event } from '../../actions/events';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {id} = req.body;
      if (!id) {
        const events = await getAllEvents();
        res.status(200).json({events});
      } else {
        const event = await getOneEvent(id);
        res.status(200).json(event);
      }
    } catch (e) {
      res.status(500).json({message: `Error in GET: ${e}`});
    }
  } else if (req.method === 'POST') {
      try {
        
      } catch (e) {
        res.status(500).json({message: `Error in POST: ${e}`});
      }
  } else if (req.method === 'DELETE') {
      try {
        const {id} = req.body;
        if (!id) {
          res.status(400).json({message: 'missing id to DELETE'})
        }
        const event = await deleteEvent(id);
        res.status(200).json(event);
    } catch (e) {
      res.status(500).json({message: `Error in DELETE: ${e}`});
    }
  } else if (req.method === 'PUT') {
      try {
        const {id, hostId, gameId, locationId, title, description, date} = req.body;
        if(!id) {
          res.status(400).json({message: 'missing id to PUT'})
        }
        const evnt: Event = {
          id: id,
          hostId: hostId,
          gameId: gameId,
          locationId: locationId,
          title: title,
          description: description,
          date: date
        }
        const event = await updateEvent(evnt);
        res.status(200).json(event);
    } catch (e) {
      res.status(500).json({message: `Error in PUT: ${e}`});
    }
  } else {
    res.status(405).json({message: 'da fuc dewd'});
  }
}