// This script adds the isAdmin field to the User table and sets a specific user as admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if the isAdmin column already exists
    let hasColumn = false;
    try {
      // Try to query a user with the isAdmin field
      await prisma.$queryRaw`SELECT isAdmin FROM User LIMIT 1`;
      hasColumn = true;
      console.log('isAdmin column already exists');
    } catch (error) {
      console.log('isAdmin column does not exist yet, will create it');
    }

    // Add the isAdmin column if it doesn't exist
    if (!hasColumn) {
      console.log('Adding isAdmin column to User table...');
      await prisma.$executeRaw`ALTER TABLE User ADD COLUMN isAdmin BOOLEAN DEFAULT false NOT NULL`;
      console.log('Successfully added isAdmin column');
    }

    // Get the email from command line arguments
    const email = process.argv[2];
    if (!email) {
      console.error('Please provide an email address to set as admin');
      console.error('Usage: node scripts/add-admin-field.js your-email@example.com');
      process.exit(1);
    }

    // Set the specified user as admin
    console.log(`Setting user ${email} as admin...`);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log(`Successfully set user ${updatedUser.email} as admin`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
