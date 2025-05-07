// Simple script to seed the database with initial data

async function seedData() {
  try {
    console.log('Seeding database with initial data...');
    
    const response = await fetch('http://localhost:3000/api/seed-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Data seeded successfully!');
      console.log(`Added ${data.locations.length} locations and ${data.games.length} games.`);
    } else {
      console.error('❌ Failed to seed data:', data.message);
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seed function
seedData();
