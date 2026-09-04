import { prisma } from "../lib/prisma.js";

export const favoriteRepository = {
  async findByUser(userId, { skip, take }) {
    const where = { userId, book: { status: "PUBLISHED" } };
    const [rows, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          book: {
            include: {
              user: { select: { id: true, email: true, role: true } },
              genre: true,
              subgenre: true,
              _count: { select: { reviews: true, favorites: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where }),
    ]);
    return { rows, total };
  },

  async findOne(userId, bookId) {
    return prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  async create(userId, bookId) {
    return prisma.favorite.create({
      data: { userId, bookId },
    });
  },

  async delete(userId, bookId) {
    await prisma.favorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  },
};
