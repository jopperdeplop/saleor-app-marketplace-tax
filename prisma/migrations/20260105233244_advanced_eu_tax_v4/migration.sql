-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "destinationCountry" TEXT,
ADD COLUMN     "isOss" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderVatRate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "ossThreshold" DECIMAL(12,2) NOT NULL DEFAULT 10000.00;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "companyType" "CompanyType" NOT NULL DEFAULT 'BUSINESS',
ADD COLUMN     "vatVerifiedAt" TIMESTAMP(3);
