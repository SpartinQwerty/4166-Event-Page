import { createEvent, getAllEvents, getOneEvent, removeEvent } from '../actions/events';
import { createLocation } from '../actions/locations';

// Mock the database operations
jest.mock('../lib/db/db', () => ({
  db: {
    selectFrom: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    executeTakeFirstOrThrow: jest.fn(),
    transaction: jest.fn().mockReturnValue({
      execute: jest.fn().mockImplementation(async (callback) => {
        return await callback({
          insertInto: jest.fn().mockReturnThis(),
          columns: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockReturnThis(),
          executeTakeFirstOrThrow: jest.fn().mockResolvedValue({
            id: 1,
            title: 'Test Event',
            description: 'Test Description',
            date: new Date(),
            hostId: 1,
            gameId: 1,
            locationId: 1,
          }),
          deleteFrom: jest.fn().mockReturnThis(),
        });
      }),
    }),
  },
}));

describe('Events CRUD Operations', () => {
  const mockEvent = {
    title: 'Test Event',
    description: 'Test Description',
    date: new Date(),
    hostId: 1,
    gameId: 1,
    locationId: 1,
  };

  const mockLocation = {
    address: '123 Test St',
    latitude: 35.2271,
    longitude: -80.8431,
  };

  describe('getAllEvents', () => {
    it('should return an array of events', async () => {
      // Mock the execute function to return test data
      require('../lib/db/db').db.execute.mockResolvedValueOnce([
        {
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          date: new Date(),
          hostId: 1,
          gameId: 1,
          locationId: 1,
        },
      ]);

      // Mock account, games, and locations data
      require('../lib/db/db').db.execute
        .mockResolvedValueOnce([{ id: 1, firstName: 'Test', lastName: 'User', username: 'testuser' }])
        .mockResolvedValueOnce([{ id: 1, title: 'Test Game', description: 'Test Game Description' }])
        .mockResolvedValueOnce([{ id: 1, address: '123 Test St' }]);

      const events = await getAllEvents();
      
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('id');
      expect(events[0]).toHaveProperty('title');
      expect(events[0]).toHaveProperty('description');
    });
  });

  describe('getOneEvent', () => {
    it('should return a single event by id', async () => {
      // Mock the executeTakeFirstOrThrow function to return test data
      require('../lib/db/db').db.executeTakeFirstOrThrow
        .mockResolvedValueOnce({
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          date: new Date(),
          hostId: 1,
          gameId: 1,
          locationId: 1,
        })
        .mockResolvedValueOnce({ id: 1, firstName: 'Test', lastName: 'User', username: 'testuser' })
        .mockResolvedValueOnce({ id: 1, title: 'Test Game', description: 'Test Game Description' })
        .mockResolvedValueOnce({ id: 1, address: '123 Test St', latitude: 35.2271, longitude: -80.8431 });

      const event = await getOneEvent(1);
      
      expect(event).toHaveProperty('id', 1);
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('author');
      expect(event).toHaveProperty('game');
      expect(event).toHaveProperty('location');
    });
  });

  describe('createEvent', () => {
    it('should create and return a new event', async () => {
      const event = await createEvent(mockEvent);
      
      expect(event).toHaveProperty('id');
      expect(event.title).toBe(mockEvent.title);
      expect(event.description).toBe(mockEvent.description);
    });
  });

  describe('removeEvent', () => {
    it('should delete and return the deleted event', async () => {
      const deletedEvent = await removeEvent(1);
      
      expect(deletedEvent).toHaveProperty('id');
      expect(deletedEvent).toHaveProperty('title');
      expect(deletedEvent).toHaveProperty('description');
    });
  });
});
