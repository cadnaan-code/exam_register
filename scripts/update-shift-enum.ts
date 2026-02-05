import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateShiftEnum() {
  try {
    console.log('Updating Shift enum in database...')
    
    // First, update existing records to use new enum values
    // Map old values to new values
    const updates = await prisma.$executeRaw`
      UPDATE students 
      SET shift = 'FULLTIME'::text::"Shift"
      WHERE shift::text = 'MORNING'
    `.catch(() => {
      // If the enum doesn't exist yet, we'll handle it differently
      console.log('Note: Enum might need to be recreated')
    })

    const updates2 = await prisma.$executeRaw`
      UPDATE students 
      SET shift = 'PARTTIME'::text::"Shift"
      WHERE shift::text IN ('AFTERNOON', 'EVENING')
    `.catch(() => {
      console.log('Note: Could not update existing records')
    })

    console.log('✅ Shift enum update completed')
    console.log('⚠️  If errors occurred, you may need to run: npx prisma db push')
    
  } catch (error) {
    console.error('Error updating enum:', error)
    console.log('\n⚠️  Manual steps required:')
    console.log('1. Run: npx prisma db push')
    console.log('2. Or manually update the enum in your PostgreSQL database')
  } finally {
    await prisma.$disconnect()
  }
}

updateShiftEnum()
