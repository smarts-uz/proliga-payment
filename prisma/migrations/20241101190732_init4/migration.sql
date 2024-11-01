-- AlterTable
ALTER TABLE "pay_balance" ADD COLUMN     "subs_id" INTEGER;

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribtion" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "subscribtion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usersub" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "subs_id" INTEGER,

    CONSTRAINT "usersub_pkey" PRIMARY KEY ("id")
);
