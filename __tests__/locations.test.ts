import { createLocation, getLocation, updateLocation, deleteLocation } from '../actions/locations';

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
          updateTable: jest.fn().mockReturnThis(),
          deleteFrom: jest.fn().mockReturnThis(),
          columns: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          returning: jest.fn().mockReturnThis(),
          executeTakeFirstOrThrow: jest.fn().mockResolvedValue({
            id: 1,
            address: '123 Test St',
            latitude: 35.2271,
            longitude: -80.8431,
          }),
          executeTakeFirst: jest.fn().mockResolvedValue({
            id: 1,
            address: '123 Test St Updated',
            latitude: 35.2271,
            longitude: -80.8431,
          }),
        });
      }),
    }),
  },
}));

describe('Locations CRUD Operations', () => {
  const mockLocation = {
    address: '123 Test St',
    latitude: 35.2271,
    longitude: -80.8431,
  };

  const updatedMockLocation = {
    address: '123 Test St Updated',
    latitude: 35.2271,
    longitude: -80.8431,
  };

  describe('getLocation', () => {
    it('should return a location by id', async () => {
      // Mock the executeTakeFirstOrThrow function to return test data
      require('../lib/db/db').db.executeTakeFirstOrThrow.mockResolvedValueOnce({
        id: 1,
        address: '123 Test St',
        latitude: 35.2271,
        longitude: -80.8431,
      });

      const location = await getLocation(1);
      
      expect(location).toHaveProperty('id', 1);
      expect(location).toHaveProperty('address', '123 Test St');
      expect(location).toHaveProperty('latitude', 35.2271);
      expect(location).toHaveProperty('longitude', -80.8431);
    });
  });

  describe('createLocation', () => {
    it('should create and return a new location', async () => {
      const location = await createLocation(mockLocation);
      
      expect(location).toHaveProperty('id');
      expect(location.address).toBe(mockLocation.address);
      expect(location.latitude).toBe(mockLocation.latitude);
      expect(location.longitude).toBe(mockLocation.longitude);
    });
  });

  describe('updateLocation', () => {
    it('should update and return the updated location', async () => {
      const updatedLocation = await updateLocation(1, updatedMockLocation);
      
      expect(updatedLocation).toHaveProperty('id');
      expect(updatedLocation?.address).toBe(updatedMockLocation.address);
    });
  });

  describe('deleteLocation', () => {
    it('should delete and return the deleted location', async () => {
      const deletedLocation = await deleteLocation(1);
      
      expect(deletedLocation).toHaveProperty('id');
      expect(deletedLocation).toHaveProperty('address');
      expect(deletedLocation).toHaveProperty('latitude');
      expect(deletedLocation).toHaveProperty('longitude');
    });
  });
});
