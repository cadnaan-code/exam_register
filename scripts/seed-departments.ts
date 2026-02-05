import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDepartments() {
  try {
    // Create Computer Science department
    const csDept = await prisma.department.upsert({
      where: { name: 'Computer Science' },
      update: {},
      create: {
        name: 'Computer Science',
      },
    })

    // Create Civil Engineering department
    const ceDept = await prisma.department.upsert({
      where: { name: 'Civil Engineering' },
      update: {},
      create: {
        name: 'Civil Engineering',
      },
    })

    console.log('✅ Departments seeded successfully:')
    console.log(`   - ${csDept.name} (ID: ${csDept.id})`)
    console.log(`   - ${ceDept.name} (ID: ${ceDept.id})`)
  } catch (error) {
    console.error('❌ Error seeding departments:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDepartments()
