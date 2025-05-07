// This script sets admin@gmail.com as an admin user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Set the admin email
    const adminEmail = 'admin@gmail.com';
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!user) {
      console.error(`User with email ${adminEmail} not found. Please make sure this user exists in the database.`);
      process.exit(1);
    }
    
    // Update the user to be an admin
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
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
