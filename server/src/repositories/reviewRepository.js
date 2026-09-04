import { prisma } from "../lib/prisma.js";

export const reviewRepository = {
  async count() {
    return prisma.review.count();
  },

  async findByBook(bookId, { skip, take }) {
    const where = { bookId };
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          user: { select: { id: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);
    return { data, total };
  },

  async findById(id) {
    return prisma.review.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
  },

  async findByUserAndBook(userId, bookId) {
    return prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  },

  async create(data) {
    return prisma.review.create({
      data,
      include: { user: { select: { id: true, email: true } } },
    });
  },

  async update(id, data) {
    return prisma.review.update({
      where: { id },
      data,
      include: { user: { select: { id: true, email: true } } },
    });
  },

  async delete(id) {
    await prisma.review.delete({ where: { id } });
  },
};
