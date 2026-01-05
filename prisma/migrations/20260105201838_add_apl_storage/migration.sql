-- CreateTable
CREATE TABLE "SaleorApp" (
    "id" TEXT NOT NULL,
    "saleorApiUrl" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "jwks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleorApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleorApp_saleorApiUrl_key" ON "SaleorApp"("saleorApiUrl");
