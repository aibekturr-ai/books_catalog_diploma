import { bookRepository } from "../repositories/bookRepository.js";
import { reviewRepository } from "../repositories/reviewRepository.js";
import { paginationMeta } from "../lib/pagination.js";

export async function listReviews(bookId, { page, limit }) {
  const book = await bookRepository.findUniqueRaw(bookId);
  if (!book || book.status !== "PUBLISHED") {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  const skip = (page - 1) * limit;
  const { data, total } = await reviewRepository.findByBook(bookId, {
    skip,
    take: limit,
  });
  return { data, pagination: paginationMeta(page, limit, total) };
}

export async function createReview(userId, bookId, { rating, comment }) {
  const book = await bookRepository.findUniqueRaw(bookId);
  if (!book || book.status !== "PUBLISHED") {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  const existing = await reviewRepository.findByUserAndBook(userId, bookId);
  if (existing) {
    const err = new Error("You already reviewed this book");
    err.statusCode = 409;
    throw err;
  }
  return reviewRepository.create({
    userId,
    bookId,
    rating,
    comment: comment || null,
  });
}

export async function updateReview(id, userId, data, isAdmin = false) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && review.userId !== userId) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
  return reviewRepository.update(id, {
    rating: data.rating,
    comment: data.comment !== undefined ? data.comment : review.comment,
  });
}

export async function deleteReview(id, userId, isAdmin = false) {
  const review = await reviewRepository.findById(id);
  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    throw err;
  }
  if (!isAdmin && review.userId !== userId) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
  await reviewRepository.delete(id);
}
