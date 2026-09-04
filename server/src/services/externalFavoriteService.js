import { externalFavoriteRepository } from "../repositories/externalFavoriteRepository.js";
import { favoriteRepository } from "../repositories/favoriteRepository.js";
import { prisma } from "../lib/prisma.js";
import { paginationMeta } from "../lib/pagination.js";

export async function addExternalFavorite(userId, data) {
  const provider = data.provider || "GOOGLE_BOOKS";
  const existing = await externalFavoriteRepository.findOne(
    userId,
    provider,
    data.externalId
  );
  if (existing) {
    return mapExternalFavorite(existing);
  }
  const created = await externalFavoriteRepository.create({
    userId,
    provider,
    externalId: data.externalId,
    title: data.title,
    author: data.author,
    description: data.description || "",
    coverImage: data.coverImage,
    isbn10: data.isbn10 || null,
    isbn13: data.isbn13 || null,
  });
  return mapExternalFavorite(created);
}

export async function removeExternalFavorite(userId, provider, externalId) {
  const existing = await externalFavoriteRepository.findOne(
    userId,
    provider,
    externalId
  );
  if (!existing) {
    const err = new Error("Favorite not found");
    err.statusCode = 404;
    throw err;
  }
  await externalFavoriteRepository.delete(userId, provider, externalId);
}

export async function isExternalFavorited(userId, provider, externalId) {
  const fav = await externalFavoriteRepository.findOne(userId, provider, externalId);
  return Boolean(fav);
}

function mapExternalFavorite(row) {
  return {
    id: `ext-${row.provider}-${row.externalId}`,
    source: "google",
    provider: row.provider,
    externalId: row.externalId,
    title: row.title,
    author: row.author,
    description: row.description,
    coverImage: row.coverImage,
    isbn10: row.isbn10,
    isbn13: row.isbn13,
    favoritedAt: row.createdAt,
    isFavorite: true,
    external: {
      externalId: row.externalId,
      title: row.title,
      author: row.author,
      description: row.description,
      coverImage: row.coverImage,
      isbn10: row.isbn10,
      isbn13: row.isbn13,
    },
  };
}

export async function listAllFavorites(userId, { page, limit }) {
  const [catalogRows, externalRows] = await Promise.all([
    favoriteRepository.findByUser(userId, { skip: 0, take: 500 }),
    externalFavoriteRepository.findByUser(userId),
  ]);

  const bookIds = catalogRows.rows.map((r) => r.book.id);
  const grouped =
    bookIds.length === 0
      ? []
      : await prisma.review.groupBy({
          by: ["bookId"],
          where: { bookId: { in: bookIds } },
          _avg: { rating: true },
          _count: { rating: true },
        });
  const ratingMap = new Map(
    grouped.map((g) => [
      g.bookId,
      {
        averageRating:
          g._avg.rating != null ? Math.round(g._avg.rating * 10) / 10 : null,
        reviewsCount: g._count.rating,
      },
    ])
  );

  const catalogItems = catalogRows.rows.map((row) => {
    const { _count, ...bookRest } = row.book;
    const stats = ratingMap.get(row.book.id) || {
      averageRating: null,
      reviewsCount: 0,
    };
    return {
      ...bookRest,
      source: "local",
      averageRating: stats.averageRating,
      reviewsCount: stats.reviewsCount,
      favoritesCount: _count?.favorites ?? 0,
      favoritedAt: row.createdAt,
      isFavorite: true,
    };
  });

  const externalItems = externalRows.map(mapExternalFavorite);

  const merged = [...catalogItems, ...externalItems].sort(
    (a, b) => new Date(b.favoritedAt) - new Date(a.favoritedAt)
  );

  const total = merged.length;
  const skip = (page - 1) * limit;
  const data = merged.slice(skip, skip + limit);

  return { data, pagination: paginationMeta(page, limit, total) };
}
