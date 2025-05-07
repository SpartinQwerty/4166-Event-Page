import { db } from './lib/db/db';

async function checkSchema() {
  try {
    // Check if the events table exists
    console.log('Checking if events table exists...');
    try {
      const events = await db.selectFrom('events').selectAll().execute();
      console.log(`Events table exists with ${events.length} events:`, events);
    } catch (error) {
      console.error('Error accessing events table:', error);
    }

    // Check if there are any locations in the database
    console.log('\nChecking for locations in the database...');
    const locations = await db.selectFrom('location').selectAll().execute();
    console.log(`Found ${locations.length} locations:`, locations);

    // Check if there are any games in the database
    console.log('\nChecking for games in the database...');
    const games = await db.selectFrom('game').selectAll().execute();
    console.log(`Found ${games.length} games:`, games);

    // Check if there are any accounts in the database
    console.log('\nChecking for accounts in the database...');
    try {
      const accounts = await db.selectFrom('accounts').selectAll().execute();
      console.log(`Found ${accounts.length} accounts`);
    } catch (error) {
      console.error('Error accessing accounts table:', error);
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
