import { prisma } from "../lib/prisma.js";

const userPublicSelect = { id: true, email: true, role: true };

const bookInclude = {
  user: { select: userPublicSelect },
  genre: true,
  subgenre: true,
  externalSource: true,
  _count: { select: { reviews: true, favorites: true } },
};

export function mapBook(book) {
  if (!book) return null;
  const { _count, ...rest } = book;
  return {
    ...rest,
    averageRating: book.averageRating ?? null,
    reviewsCount: _count?.reviews ?? book.reviewsCount ?? 0,
    favoritesCount: _count?.favorites ?? book.favoritesCount ?? 0,
  };
}

async function attachRatings(books) {
  if (!books.length) return [];
  const ids = books.map((b) => b.id);
  const grouped = await prisma.review.groupBy({
    by: ["bookId"],
    where: { bookId: { in: ids } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const map = new Map(
    grouped.map((g) => [
      g.bookId,
      {
        averageRating: g._avg.rating != null ? Math.round(g._avg.rating * 10) / 10 : null,
        reviewsCount: g._count.rating,
      },
    ])
  );
  return books.map((b) => {
    const stats = map.get(b.id) || { averageRating: null, reviewsCount: 0 };
    const { _count, ...rest } = b;
    return {
      ...rest,
      averageRating: stats.averageRating,
      reviewsCount: stats.reviewsCount || _count?.reviews || 0,
      favoritesCount: _count?.favorites ?? 0,
    };
  });
}

export const bookRepository = {
  async findMany({ where, orderBy, skip, take }) {
    const findArgs = {
      where,
      orderBy,
      include: bookInclude,
    };
    if (skip != null) findArgs.skip = skip;
    if (take != null) findArgs.take = take;
    const [rows, total] = await Promise.all([
      prisma.book.findMany(findArgs),
      prisma.book.count({ where }),
    ]);
    const data = await attachRatings(rows);
    return { data, total };
  },

  async findById(id) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: bookInclude,
    });
    if (!book) return null;
    const [mapped] = await attachRatings([book]);
    return mapped;
  },

  async create(data) {
    const book = await prisma.book.create({
      data,
      include: bookInclude,
    });
    const [mapped] = await attachRatings([book]);
    return mapped;
  },

  async update(id, data) {
    const book = await prisma.book.update({
      where: { id },
      data,
      include: bookInclude,
    });
    const [mapped] = await attachRatings([book]);
    return mapped;
  },

  async delete(id) {
    await prisma.book.delete({ where: { id } });
  },

  async findUniqueRaw(id) {
    return prisma.book.findUnique({ where: { id } });
  },

  async count(where = {}) {
    return prisma.book.count({ where });
  },
};

export { userPublicSelect, bookInclude };
