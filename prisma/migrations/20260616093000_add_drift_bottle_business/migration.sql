-- CreateEnum
CREATE TYPE "public"."DriftContentType" AS ENUM ('TEXT', 'VOICE', 'IMAGE');

-- CreateEnum
CREATE TYPE "public"."DriftBottleMood" AS ENUM ('HAPPY', 'LONELY', 'CURIOUS', 'CALM', 'SAD');

-- CreateEnum
CREATE TYPE "public"."DriftBottleStatus" AS ENUM ('DRAFT', 'FLOATING', 'RETURNED', 'ARCHIVED', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."DriftDiscoverySource" AS ENUM ('RANDOM', 'TAG', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "public"."DriftDiscoveryAction" AS ENUM ('OPENED', 'RETURNED', 'REPLIED', 'DISMISSED', 'REPORTED', 'COLLECTED');

-- CreateEnum
CREATE TYPE "public"."DriftConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."DriftCollectionType" AS ENUM ('FAVORITE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "public"."DriftReportReason" AS ENUM ('INAPPROPRIATE', 'HARASSMENT', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DriftReviewStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DriftDailyActionType" AS ENUM ('DISCOVER', 'THROW', 'REPLY', 'REPORT');

-- CreateEnum
CREATE TYPE "public"."DriftSkinRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LIMITED');

-- CreateTable
CREATE TABLE "public"."drift_bottles" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT,
    "contentType" "public"."DriftContentType" NOT NULL,
    "textContent" TEXT,
    "mediaUrl" TEXT,
    "mediaObjectKey" TEXT,
    "mediaDurationSec" INTEGER,
    "mood" "public"."DriftBottleMood",
    "status" "public"."DriftBottleStatus" NOT NULL DEFAULT 'FLOATING',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "originLat" DECIMAL(10,7),
    "originLng" DECIMAL(10,7),
    "originGeohash" TEXT,
    "originLabel" TEXT,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "discoveryCount" INTEGER NOT NULL DEFAULT 0,
    "lastDriftedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "drift_bottles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_tags" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "drift_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_bottle_tags" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "drift_bottle_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_discoveries" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "finderId" TEXT NOT NULL,
    "source" "public"."DriftDiscoverySource" NOT NULL DEFAULT 'RANDOM',
    "sourceTagId" TEXT,
    "distanceKm" DECIMAL(10,2),
    "action" "public"."DriftDiscoveryAction" NOT NULL DEFAULT 'OPENED',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actedAt" TIMESTAMP(3),

    CONSTRAINT "drift_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_conversations" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "finderId" TEXT NOT NULL,
    "status" "public"."DriftConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMessageId" TEXT,
    "lastMessagePreview" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drift_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "contentType" "public"."DriftContentType" NOT NULL DEFAULT 'TEXT',
    "body" TEXT,
    "mediaUrl" TEXT,
    "mediaObjectKey" TEXT,
    "mediaDurationSec" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "drift_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_collections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "collectionType" "public"."DriftCollectionType" NOT NULL DEFAULT 'FAVORITE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drift_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "bottleId" TEXT,
    "conversationId" TEXT,
    "messageId" TEXT,
    "reason" "public"."DriftReportReason" NOT NULL,
    "description" TEXT,
    "status" "public"."DriftReviewStatus" NOT NULL DEFAULT 'PENDING',
    "handledBy" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drift_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bottleCount" INTEGER NOT NULL DEFAULT 0,
    "discoveryCount" INTEGER NOT NULL DEFAULT 0,
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "companionDays" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drift_user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_user_daily_counters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "counterDate" DATE NOT NULL,
    "actionType" "public"."DriftDailyActionType" NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "limitCount" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drift_user_daily_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_bottle_skins" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rarity" "public"."DriftSkinRarity" NOT NULL DEFAULT 'COMMON',
    "previewUrl" TEXT,
    "themeTokens" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "drift_bottle_skins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_user_skins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinId" TEXT NOT NULL,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drift_user_skins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drift_user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowLocation" BOOLEAN NOT NULL DEFAULT false,
    "allowReplies" BOOLEAN NOT NULL DEFAULT true,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoFilterSensitive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drift_user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drift_bottles_authorId_createdAt_idx" ON "public"."drift_bottles"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "drift_bottles_status_lastDriftedAt_idx" ON "public"."drift_bottles"("status", "lastDriftedAt");

-- CreateIndex
CREATE INDEX "drift_bottles_originGeohash_idx" ON "public"."drift_bottles"("originGeohash");

-- CreateIndex
CREATE UNIQUE INDEX "drift_tags_code_key" ON "public"."drift_tags"("code");

-- CreateIndex
CREATE INDEX "drift_tags_sortOrder_idx" ON "public"."drift_tags"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "drift_bottle_tags_bottleId_tagId_key" ON "public"."drift_bottle_tags"("bottleId", "tagId");

-- CreateIndex
CREATE INDEX "drift_bottle_tags_tagId_idx" ON "public"."drift_bottle_tags"("tagId");

-- CreateIndex
CREATE INDEX "drift_discoveries_finderId_openedAt_idx" ON "public"."drift_discoveries"("finderId", "openedAt");

-- CreateIndex
CREATE INDEX "drift_discoveries_bottleId_openedAt_idx" ON "public"."drift_discoveries"("bottleId", "openedAt");

-- CreateIndex
CREATE INDEX "drift_discoveries_sourceTagId_idx" ON "public"."drift_discoveries"("sourceTagId");

-- CreateIndex
CREATE UNIQUE INDEX "drift_conversations_bottleId_authorId_finderId_key" ON "public"."drift_conversations"("bottleId", "authorId", "finderId");

-- CreateIndex
CREATE INDEX "drift_conversations_authorId_lastMessageAt_idx" ON "public"."drift_conversations"("authorId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "drift_conversations_finderId_lastMessageAt_idx" ON "public"."drift_conversations"("finderId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "drift_messages_conversationId_createdAt_idx" ON "public"."drift_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "drift_messages_senderId_createdAt_idx" ON "public"."drift_messages"("senderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "drift_collections_userId_bottleId_collectionType_key" ON "public"."drift_collections"("userId", "bottleId", "collectionType");

-- CreateIndex
CREATE INDEX "drift_collections_bottleId_idx" ON "public"."drift_collections"("bottleId");

-- CreateIndex
CREATE INDEX "drift_reports_status_createdAt_idx" ON "public"."drift_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "drift_reports_reporterId_createdAt_idx" ON "public"."drift_reports"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "drift_reports_bottleId_idx" ON "public"."drift_reports"("bottleId");

-- CreateIndex
CREATE INDEX "drift_reports_conversationId_idx" ON "public"."drift_reports"("conversationId");

-- CreateIndex
CREATE INDEX "drift_reports_messageId_idx" ON "public"."drift_reports"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "drift_user_stats_userId_key" ON "public"."drift_user_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drift_user_daily_counters_userId_counterDate_actionType_key" ON "public"."drift_user_daily_counters"("userId", "counterDate", "actionType");

-- CreateIndex
CREATE INDEX "drift_user_daily_counters_counterDate_actionType_idx" ON "public"."drift_user_daily_counters"("counterDate", "actionType");

-- CreateIndex
CREATE UNIQUE INDEX "drift_bottle_skins_code_key" ON "public"."drift_bottle_skins"("code");

-- CreateIndex
CREATE INDEX "drift_bottle_skins_rarity_idx" ON "public"."drift_bottle_skins"("rarity");

-- CreateIndex
CREATE UNIQUE INDEX "drift_user_skins_userId_skinId_key" ON "public"."drift_user_skins"("userId", "skinId");

-- CreateIndex
CREATE INDEX "drift_user_skins_skinId_idx" ON "public"."drift_user_skins"("skinId");

-- CreateIndex
CREATE UNIQUE INDEX "drift_user_settings_userId_key" ON "public"."drift_user_settings"("userId");

-- AddForeignKey
ALTER TABLE "public"."drift_bottles" ADD CONSTRAINT "drift_bottles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_bottle_tags" ADD CONSTRAINT "drift_bottle_tags_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "public"."drift_bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_bottle_tags" ADD CONSTRAINT "drift_bottle_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."drift_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_discoveries" ADD CONSTRAINT "drift_discoveries_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "public"."drift_bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_discoveries" ADD CONSTRAINT "drift_discoveries_finderId_fkey" FOREIGN KEY ("finderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_discoveries" ADD CONSTRAINT "drift_discoveries_sourceTagId_fkey" FOREIGN KEY ("sourceTagId") REFERENCES "public"."drift_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_conversations" ADD CONSTRAINT "drift_conversations_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "public"."drift_bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_conversations" ADD CONSTRAINT "drift_conversations_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_conversations" ADD CONSTRAINT "drift_conversations_finderId_fkey" FOREIGN KEY ("finderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_messages" ADD CONSTRAINT "drift_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."drift_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_messages" ADD CONSTRAINT "drift_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_collections" ADD CONSTRAINT "drift_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_collections" ADD CONSTRAINT "drift_collections_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "public"."drift_bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_reports" ADD CONSTRAINT "drift_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_reports" ADD CONSTRAINT "drift_reports_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_reports" ADD CONSTRAINT "drift_reports_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "public"."drift_bottles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_reports" ADD CONSTRAINT "drift_reports_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."drift_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_reports" ADD CONSTRAINT "drift_reports_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."drift_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_user_stats" ADD CONSTRAINT "drift_user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_user_daily_counters" ADD CONSTRAINT "drift_user_daily_counters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_user_skins" ADD CONSTRAINT "drift_user_skins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_user_skins" ADD CONSTRAINT "drift_user_skins_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "public"."drift_bottle_skins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drift_user_settings" ADD CONSTRAINT "drift_user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
