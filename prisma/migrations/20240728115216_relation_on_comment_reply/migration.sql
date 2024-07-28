/*
  Warnings:

  - Added the required column `postId` to the `commentReply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `commentReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "commentReply" ADD COLUMN     "postId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "commentReply" ADD CONSTRAINT "commentReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentReply" ADD CONSTRAINT "commentReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
