/*
  Warnings:

  - You are about to drop the column `amount` on the `Commission` table. All the data in the column will be lost.
  - Added the required column `commissionAmount` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderGrossTotal` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "amount",
ADD COLUMN     "commissionAmount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "commissionNet" DECIMAL(12,2),
ADD COLUMN     "commissionVat" DECIMAL(12,2),
ADD COLUMN     "orderGrossTotal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "orderNetTotal" DECIMAL(12,2),
ADD COLUMN     "orderVatTotal" DECIMAL(12,2),
ADD COLUMN     "rate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "InvoiceLog" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'NL',
ADD COLUMN     "isVatVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "temporaryCommissionEndsAt" TIMESTAMP(3),
ADD COLUMN     "temporaryCommissionRate" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "defaultCommissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "companyName" TEXT DEFAULT 'Saleor Marketplace NL',
    "vatNumber" TEXT DEFAULT 'NL812345678B01',
    "addressLine1" TEXT DEFAULT 'Keizersgracht 123',
    "addressCity" TEXT DEFAULT 'Amsterdam',
    "addressZip" TEXT DEFAULT '1016 CJ',
    "addressCountry" TEXT DEFAULT 'NL',
    "ossEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "standardRate" DOUBLE PRECISION NOT NULL,
    "reducedRate" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_countryCode_key" ON "TaxRate"("countryCode");
