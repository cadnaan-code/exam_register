// Database cleanup script - Removes all test data
// Run with: npx tsx scripts/cleanup-database.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n')

    // Delete all special exam registrations
    const deletedRegistrations = await prisma.specialExamRegistration.deleteMany({})
    console.log(`✅ Deleted ${deletedRegistrations.count} special exam registrations`)

    // Delete all registration forms
    const deletedForms = await prisma.registrationForm.deleteMany({})
    console.log(`✅ Deleted ${deletedForms.count} registration forms`)

    // Delete all students
    const deletedStudents = await prisma.student.deleteMany({})
    console.log(`✅ Deleted ${deletedStudents.count} students`)

    // Keep admin users but show count
    const adminUsers = await prisma.adminUser.findMany({
      select: { id: true, username: true, fullName: true },
    })
    console.log(`ℹ️  Keeping ${adminUsers.count || adminUsers.length} admin user(s):`)
    adminUsers.forEach((user) => {
      console.log(`   - ${user.username} (${user.fullName})`)
    })

    console.log('\n✨ Database cleanup completed!')
    console.log('⚠️  Admin users were kept for login purposes.')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n✅ Cleanup script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup script failed:', error)
    process.exit(1)
  })
