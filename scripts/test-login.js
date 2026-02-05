// Test script to check database connection and user existence
// Run with: node scripts/test-login.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Check for users
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        status: true,
        userType: true,
      },
    })
    
    console.log(`\nFound ${users.length} user(s):`)
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Full Name: ${user.fullName}`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Type: ${user.userType}`)
    })
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found! Create a user first via /admin/user-management')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
