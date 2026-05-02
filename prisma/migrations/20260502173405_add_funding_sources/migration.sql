-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'Банковские карты';

-- CreateTable
CREATE TABLE "FundingSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FundingSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundingSource_userId_name_key" ON "FundingSource"("userId", "name");

-- AddForeignKey
ALTER TABLE "FundingSource" ADD CONSTRAINT "FundingSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
