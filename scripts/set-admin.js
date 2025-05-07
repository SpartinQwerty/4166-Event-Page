// This script sets a user as admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get user email from command line arguments
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.error('Please provide an email address to set as admin');
      console.error('Usage: node scripts/set-admin.js your-email@example.com');
      process.exit(1);
    }
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }
    
    // Update the user to be an admin
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { isAdmin: true }
    });
    
    console.log(`User ${updatedUser.email} has been set as admin`);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
