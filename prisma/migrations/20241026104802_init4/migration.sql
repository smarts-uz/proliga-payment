-- AlterTable
ALTER TABLE "pay_balance" ADD COLUMN     "cancelTime" TIMESTAMP(3),
ADD COLUMN     "performTime" TIMESTAMP(3),
ADD COLUMN     "prepareId" INTEGER;
