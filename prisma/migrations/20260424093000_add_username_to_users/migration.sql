-- Add username support for account/password login
ALTER TABLE "public"."users"
ADD COLUMN "username" TEXT;

CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

COMMENT ON COLUMN "public"."users"."username" IS '用户名';
