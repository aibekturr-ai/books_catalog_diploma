CREATE TABLE "ExternalFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ExternalProvider" NOT NULL DEFAULT 'GOOGLE_BOOKS',
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExternalFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExternalFavorite_userId_provider_externalId_key" ON "ExternalFavorite"("userId", "provider", "externalId");
CREATE INDEX "ExternalFavorite_userId_idx" ON "ExternalFavorite"("userId");

ALTER TABLE "ExternalFavorite" ADD CONSTRAINT "ExternalFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
