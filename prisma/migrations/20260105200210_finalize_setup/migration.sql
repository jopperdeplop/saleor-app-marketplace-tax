-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('CUSTOMER', 'COMMISSION');

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" TEXT NOT NULL,
    "brandAttributeValue" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "vatNumber" TEXT,
    "address" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "selfBillingAgreed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_brandAttributeValue_key" ON "VendorProfile"("brandAttributeValue");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_orderId_key" ON "Commission"("orderId");

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
