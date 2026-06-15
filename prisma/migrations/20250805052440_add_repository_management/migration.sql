-- CreateTable
CREATE TABLE "public"."Note" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "lastSynced" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NoteRepository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repoUrl" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "username" TEXT,
    "accessToken" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_repositoryId_path_key" ON "public"."Note"("repositoryId", "path");

-- CreateIndex
CREATE INDEX "NoteRepository_userId_isDefault_idx" ON "public"."NoteRepository"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "NoteRepository_userId_repoUrl_key" ON "public"."NoteRepository"("userId", "repoUrl");

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "public"."NoteRepository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoteRepository" ADD CONSTRAINT "NoteRepository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
