/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `pay_balance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pay_balance" ALTER COLUMN "perform_time" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "transaction_id" ON "pay_balance"("transaction_id");
