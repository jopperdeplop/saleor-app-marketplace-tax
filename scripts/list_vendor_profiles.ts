import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const vendors = await prisma.vendorProfile.findMany()
  console.log('Vendors:', JSON.stringify(vendors, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
