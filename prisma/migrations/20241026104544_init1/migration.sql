/*
  Warnings:

  - Added the required column `status` to the `pay_balance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CREATED', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "pay_balance" ADD COLUMN     "status" "TransactionStatus" NOT NULL;
