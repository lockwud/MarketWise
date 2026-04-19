-- CreateEnum
CREATE TYPE "Commodity" AS ENUM ('DIESEL', 'PETROL', 'CEMENT');

-- CreateTable
CREATE TABLE "WorldMarketPrice" (
    "id" TEXT NOT NULL,
    "commodity" "Commodity" NOT NULL,
    "worldPriceUSD" DOUBLE PRECISION NOT NULL,
    "previousPriceUSD" DOUBLE PRECISION NOT NULL,
    "percentageChange" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 15.5,
    "cediEquivalent" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorldMarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorldMarketPriceHistory" (
    "id" TEXT NOT NULL,
    "commodity" "Commodity" NOT NULL,
    "worldPriceUSD" DOUBLE PRECISION NOT NULL,
    "percentageChange" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "cediEquivalent" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "worldMarketPriceId" TEXT NOT NULL,

    CONSTRAINT "WorldMarketPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorldMarketPrice_commodity_key" ON "WorldMarketPrice"("commodity");

-- AddForeignKey
ALTER TABLE "WorldMarketPriceHistory" ADD CONSTRAINT "WorldMarketPriceHistory_worldMarketPriceId_fkey" FOREIGN KEY ("worldMarketPriceId") REFERENCES "WorldMarketPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
