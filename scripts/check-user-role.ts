import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userId = 'cmih2invf00002zpb6jbp502m'
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User:', user.name, user.email)
  console.log('Roles:', user.roles.map(r => r.role.name))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
