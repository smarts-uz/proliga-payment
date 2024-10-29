/*
  Warnings:

  - Added the required column `updatedAt` to the `pay_balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pay_balance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
