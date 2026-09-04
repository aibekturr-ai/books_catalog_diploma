CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "BookStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');
CREATE TYPE "ExternalProvider" AS ENUM ('GOOGLE_BOOKS');

ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

CREATE TABLE "Subgenre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    CONSTRAINT "Subgenre_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subgenre_genreId_slug_key" ON "Subgenre"("genreId", "slug");

ALTER TABLE "Subgenre" ADD CONSTRAINT "Subgenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Genre" ("id", "name", "slug") VALUES
  ('genre_fantasy', 'Fantasy', 'fantasy'),
  ('genre_scifi', 'Science Fiction', 'science-fiction'),
  ('genre_memoir', 'Memoir', 'memoir'),
  ('genre_mystery', 'Mystery', 'mystery'),
  ('genre_romance', 'Romance', 'romance'),
  ('genre_nonfiction', 'Nonfiction', 'nonfiction');

INSERT INTO "Subgenre" ("id", "name", "slug", "genreId") VALUES
  ('sub_epic', 'Epic Fantasy', 'epic-fantasy', 'genre_fantasy'),
  ('sub_dark', 'Dark Fantasy', 'dark-fantasy', 'genre_fantasy'),
  ('sub_urban', 'Urban Fantasy', 'urban-fantasy', 'genre_fantasy'),
  ('sub_hard_sf', 'Hard SF', 'hard-sf', 'genre_scifi'),
  ('sub_space', 'Space Opera', 'space-opera', 'genre_scifi');

ALTER TABLE "Book" ADD COLUMN "status" "BookStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Book" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Book" ADD COLUMN "genreId" TEXT;
ALTER TABLE "Book" ADD COLUMN "subgenreId" TEXT;

UPDATE "Book" SET "genreId" = CASE
  WHEN lower("genre") LIKE '%science%' OR lower("genre") LIKE '%sci-fi%' OR lower("genre") = 'scifi' THEN 'genre_scifi'
  WHEN lower("genre") LIKE '%memoir%' THEN 'genre_memoir'
  WHEN lower("genre") LIKE '%myster%' THEN 'genre_mystery'
  WHEN lower("genre") LIKE '%romance%' THEN 'genre_romance'
  WHEN lower("genre") LIKE '%nonfiction%' OR lower("genre") LIKE '%non-fiction%' THEN 'genre_nonfiction'
  ELSE 'genre_fantasy'
END;

UPDATE "Book" SET "status" = 'PUBLISHED';

ALTER TABLE "Book" ALTER COLUMN "genreId" SET NOT NULL;

ALTER TABLE "Book" DROP CONSTRAINT IF EXISTS "Book_rating_check";
DROP INDEX IF EXISTS "Book_genre_idx";
DROP INDEX IF EXISTS "Book_rating_idx";
ALTER TABLE "Book" DROP COLUMN "genre";
ALTER TABLE "Book" DROP COLUMN "rating";

ALTER TABLE "Book" ADD CONSTRAINT "Book_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Book" ADD CONSTRAINT "Book_subgenreId_fkey" FOREIGN KEY ("subgenreId") REFERENCES "Subgenre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Book_status_idx" ON "Book"("status");
CREATE INDEX "Book_genreId_idx" ON "Book"("genreId");
CREATE INDEX "Book_subgenreId_idx" ON "Book"("subgenreId");

CREATE TABLE "BookExternalSource" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "provider" "ExternalProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "isbn10" TEXT,
    "isbn13" TEXT,
    CONSTRAINT "BookExternalSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookExternalSource_bookId_key" ON "BookExternalSource"("bookId");

ALTER TABLE "BookExternalSource" ADD CONSTRAINT "BookExternalSource_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Favorite_userId_bookId_key" ON "Favorite"("userId", "bookId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_bookId_idx" ON "Favorite"("bookId");

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Review_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE UNIQUE INDEX "Review_userId_bookId_key" ON "Review"("userId", "bookId");
CREATE INDEX "Review_bookId_idx" ON "Review"("bookId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
