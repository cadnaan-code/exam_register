import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixShiftEnum() {
  try {
    console.log('🔧 Fixing Shift enum in database...')
    
    // Step 1: Change column to text temporarily
    console.log('Step 1: Converting shift column to text...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "students" 
      ALTER COLUMN "shift" TYPE text;
    `)
    console.log('✅ Column converted to text')

    // Step 2: Drop the old enum
    console.log('Step 2: Dropping old Shift enum...')
    await prisma.$executeRawUnsafe(`
      DROP TYPE IF EXISTS "Shift" CASCADE;
    `)
    console.log('✅ Old enum dropped')

    // Step 3: Create new enum with correct values
    console.log('Step 3: Creating new Shift enum with FULLTIME and PARTTIME...')
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "Shift" AS ENUM ('FULLTIME', 'PARTTIME');
    `)
    console.log('✅ New enum created')

    // Step 4: Update existing records (if any)
    console.log('Step 4: Updating existing records...')
    await prisma.$executeRawUnsafe(`
      UPDATE "students" 
      SET "shift" = CASE 
        WHEN "shift" = 'MORNING' THEN 'FULLTIME'
        WHEN "shift" IN ('AFTERNOON', 'EVENING') THEN 'PARTTIME'
        ELSE 'FULLTIME'
      END;
    `)
    console.log('✅ Existing records updated')

    // Step 5: Change column back to enum
    console.log('Step 5: Converting column back to enum...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "students" 
      ALTER COLUMN "shift" TYPE "Shift" 
      USING "shift"::"Shift";
    `)
    console.log('✅ Column converted back to enum')

    // Step 6: Set default
    console.log('Step 6: Setting default value...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "students" 
      ALTER COLUMN "shift" SET DEFAULT 'FULLTIME'::"Shift";
    `)
    console.log('✅ Default value set')

    console.log('\n✅✅✅ Database enum fixed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Run: npm run db:generate')
    console.log('2. Restart your dev server')
    
  } catch (error: any) {
    console.error('❌ Error fixing enum:', error.message)
    console.error('\n💡 If this fails, you may need to run the SQL manually:')
    console.log('   See: scripts/fix-shift-enum.sql')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixShiftEnum()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
