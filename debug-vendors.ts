import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const vendors = await prisma.vendorProfile.findMany()
  console.log(JSON.stringify(vendors, null, 2))
}
main()
