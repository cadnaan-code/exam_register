import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDepartments() {
  try {
    // Delete all departments except Computer Science and Civil Engineering
    const departmentsToKeep = ['Computer Science', 'Civil Engineering']
    
    const allDepartments = await prisma.department.findMany()
    
    for (const dept of allDepartments) {
      if (!departmentsToKeep.includes(dept.name)) {
        console.log(`Deleting department: ${dept.name}`)
        await prisma.department.delete({
          where: { id: dept.id },
        })
      }
    }
    
    // Ensure Computer Science and Civil Engineering exist
    const csDept = await prisma.department.upsert({
      where: { name: 'Computer Science' },
      update: {},
      create: {
        name: 'Computer Science',
      },
    })

    const ceDept = await prisma.department.upsert({
      where: { name: 'Civil Engineering' },
      update: {},
      create: {
        name: 'Civil Engineering',
      },
    })

    console.log('✅ Departments cleaned up successfully:')
    console.log(`   - ${csDept.name} (ID: ${csDept.id})`)
    console.log(`   - ${ceDept.name} (ID: ${ceDept.id})`)
    
    const remaining = await prisma.department.findMany()
    console.log(`\nTotal departments: ${remaining.length}`)
  } catch (error) {
    console.error('❌ Error cleaning up departments:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDepartments()
