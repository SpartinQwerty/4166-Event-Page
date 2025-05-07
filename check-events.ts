import { db } from './lib/db/db';

async function checkEvents() {
  try {
    // Check events table
    console.log('Checking events table...');
    const events = await db
      .selectFrom('events')
      .selectAll()
      .execute();
    
    console.log(`Found ${events.length} events:`);
    events.forEach(event => {
      console.log(`Event ID: ${event.id}, Title: ${event.title}, HostID: ${event.hostId}, Type: ${typeof event.hostId}`);
    });

    // Check accounts table
    console.log('\nChecking accounts table...');
    const accounts = await db
      .selectFrom('accounts')
      .selectAll()
      .execute();
    
    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(`Account ID: ${account.id}, Username: ${account.username}, Type: ${typeof account.id}`);
    });

  } catch (error) {
    console.error('Error checking events:', error);
  } finally {
    process.exit(0);
  }
}

checkEvents();
