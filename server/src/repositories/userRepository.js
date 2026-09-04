import { prisma } from "../lib/prisma.js";

export const userRepository = {
  async count() {
    return prisma.user.count();
  },
};
