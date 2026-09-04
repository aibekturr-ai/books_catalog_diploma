import { prisma } from "../lib/prisma.js";

export const genreRepository = {
  async findAllWithSubgenres() {
    return prisma.genre.findMany({
      orderBy: { name: "asc" },
      include: {
        subgenres: { orderBy: { name: "asc" } },
      },
    });
  },

  async findById(id) {
    return prisma.genre.findUnique({ where: { id } });
  },

  async findSubgenre(id) {
    return prisma.subgenre.findUnique({ where: { id } });
  },
};
