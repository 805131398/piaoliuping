/*
  Warnings:

  - A unique constraint covering the columns `[openid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unionid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "openid" TEXT,
ADD COLUMN     "unionid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_openid_key" ON "public"."User"("openid");

-- CreateIndex
CREATE UNIQUE INDEX "User_unionid_key" ON "public"."User"("unionid");
