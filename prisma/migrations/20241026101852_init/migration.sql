-- CreateEnum
CREATE TYPE "System" AS ENUM ('Payme', 'Click', 'Uzum');

-- CreateTable
CREATE TABLE "pay_balance" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "system" "System" NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "pay_balance_pkey" PRIMARY KEY ("id")
);
