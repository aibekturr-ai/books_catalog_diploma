import { bookRepository } from "../repositories/bookRepository.js";
import { genreRepository } from "../repositories/genreRepository.js";
import { paginationMeta } from "../lib/pagination.js";

async function assertGenreAndSubgenre(genreId, subgenreId) {
  const genre = await genreRepository.findById(genreId);
  if (!genre) {
    const err = new Error("Genre not found");
    err.statusCode = 400;
    throw err;
  }
  if (subgenreId) {
    const sub = await genreRepository.findSubgenre(subgenreId);
    if (!sub || sub.genreId !== genreId) {
      const err = new Error("Subgenre does not belong to genre");
      err.statusCode = 400;
      throw err;
    }
  }
}

export async function listBooks(query, viewer) {
  const { q, genreId, subgenreId, minRating, sort, page, limit } = query;
  const where = {};

  if (viewer?.id) {
    where.OR = [{ status: "PUBLISHED" }, { userId: viewer.id }];
  } else {
    where.status = "PUBLISHED";
  }

  if (q) {
    const textFilter = {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ],
    };
    where.AND = [...(where.AND || []), textFilter];
  }

  if (genreId) where.genreId = genreId;
  if (subgenreId) where.subgenreId = subgenreId;

  const orderBy = [{ createdAt: "desc" }];
  const needsRatingPostProcess = minRating != null || sort === "rating";

  if (needsRatingPostProcess) {
    let { data } = await bookRepository.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });
    if (minRating != null) {
      data = data.filter(
        (b) => b.averageRating != null && b.averageRating >= minRating
      );
    }
    if (sort === "rating") {
      data = [...data].sort((a, b) => {
        const ar = a.averageRating ?? -1;
        const br = b.averageRating ?? -1;
        if (br !== ar) return br - ar;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    const total = data.length;
    const skip = (page - 1) * limit;
    return {
      data: data.slice(skip, skip + limit),
      pagination: paginationMeta(page, limit, total),
    };
  }

  const skip = (page - 1) * limit;
  const { data, total } = await bookRepository.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  return { data, pagination: paginationMeta(page, limit, total) };
}

export async function getBookById(id, viewer) {
  const book = await bookRepository.findById(id);
  if (!book) return null;

  const isOwner = viewer && book.userId === viewer.id;
  const isAdmin = viewer && viewer.role === "ADMIN";
  if (book.status !== "PUBLISHED" && !isOwner && !isAdmin) {
    return null;
  }
  return book;
}

export async function createBook(userId, data) {
  await assertGenreAndSubgenre(data.genreId, data.subgenreId || null);

  return bookRepository.create({
    title: data.title,
    author: data.author,
    description: data.description,
    coverImage: data.coverImage,
    genreId: data.genreId,
    subgenreId: data.subgenreId || null,
    userId,
    status: "PENDING",
    rejectionReason: null,
  });
}

export async function updateBook(id, userId, data, isAdmin = false) {
  const existing = await bookRepository.findUniqueRaw(id);
  if (!existing) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && existing.userId !== userId) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  await assertGenreAndSubgenre(data.genreId, data.subgenreId || null);

  const payload = {
    title: data.title,
    author: data.author,
    description: data.description,
    coverImage: data.coverImage,
    genreId: data.genreId,
    subgenreId: data.subgenreId || null,
  };

  if (!isAdmin) {
    if (existing.status === "REJECTED" || existing.status === "PENDING") {
      payload.status = "PENDING";
      payload.rejectionReason = null;
    } else if (existing.status === "PUBLISHED") {
      payload.status = "PENDING";
      payload.rejectionReason = null;
    }
  }

  return bookRepository.update(id, payload);
}

export async function deleteBook(id, userId, isAdmin = false) {
  const existing = await bookRepository.findUniqueRaw(id);
  if (!existing) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && existing.userId !== userId) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
  await bookRepository.delete(id);
}

export async function listMyBooks(userId, { page, limit }) {
  const where = { userId };
  const skip = (page - 1) * limit;
  const { data, total } = await bookRepository.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    skip,
    take: limit,
  });
  return { data, pagination: paginationMeta(page, limit, total) };
}
