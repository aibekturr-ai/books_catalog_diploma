import { prisma } from "../lib/prisma.js";

export const externalFavoriteRepository = {
  async findOne(userId, provider, externalId) {
    return prisma.externalFavorite.findUnique({
      where: {
        userId_provider_externalId: { userId, provider, externalId },
      },
    });
  },

  async create(data) {
    return prisma.externalFavorite.create({ data });
  },

  async delete(userId, provider, externalId) {
    await prisma.externalFavorite.delete({
      where: {
        userId_provider_externalId: { userId, provider, externalId },
      },
    });
  },

  async findByUser(userId) {
    return prisma.externalFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async countByUser(userId) {
    return prisma.externalFavorite.count({ where: { userId } });
  },
};
