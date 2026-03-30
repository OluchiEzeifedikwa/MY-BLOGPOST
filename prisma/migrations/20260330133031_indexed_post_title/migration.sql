-- DropIndex
DROP INDEX "Post_userId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_title_idx" ON "Post"("title");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
