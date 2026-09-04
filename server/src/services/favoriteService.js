import { bookRepository } from "../repositories/bookRepository.js";
import { favoriteRepository } from "../repositories/favoriteRepository.js";
import { prisma } from "../lib/prisma.js";
import { paginationMeta } from "../lib/pagination.js";

export async function addFavorite(userId, bookId) {
  const book = await bookRepository.findUniqueRaw(bookId);
  if (!book || book.status !== "PUBLISHED") {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  const existing = await favoriteRepository.findOne(userId, bookId);
  if (existing) {
    return existing;
  }
  return favoriteRepository.create(userId, bookId);
}

export async function removeFavorite(userId, bookId) {
  const existing = await favoriteRepository.findOne(userId, bookId);
  if (!existing) {
    const err = new Error("Favorite not found");
    err.statusCode = 404;
    throw err;
  }
  await favoriteRepository.delete(userId, bookId);
}

export async function listFavorites(userId, { page, limit }) {
  const skip = (page - 1) * limit;
  const { rows, total } = await favoriteRepository.findByUser(userId, {
    skip,
    take: limit,
  });

  const bookIds = rows.map((r) => r.book.id);
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

  const data = rows.map((row) => {
    const { _count, ...bookRest } = row.book;
    const stats = ratingMap.get(row.book.id) || {
      averageRating: null,
      reviewsCount: 0,
    };
    return {
      ...bookRest,
      averageRating: stats.averageRating,
      reviewsCount: stats.reviewsCount,
      favoritesCount: _count?.favorites ?? 0,
      favoritedAt: row.createdAt,
    };
  });

  return { data, pagination: paginationMeta(page, limit, total) };
}

export async function isFavorited(userId, bookId) {
  const fav = await favoriteRepository.findOne(userId, bookId);
  return Boolean(fav);
}
