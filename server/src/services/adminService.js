import { bookRepository } from "../repositories/bookRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { reviewRepository } from "../repositories/reviewRepository.js";
import { paginationMeta } from "../lib/pagination.js";

export async function getStats() {
  const [totalBooks, pendingBooks, totalUsers, totalReviews] = await Promise.all([
    bookRepository.count(),
    bookRepository.count({ status: "PENDING" }),
    userRepository.count(),
    reviewRepository.count(),
  ]);
  return { totalBooks, pendingBooks, totalUsers, totalReviews };
}

export async function listPendingBooks({ page, limit }) {
  const where = { status: "PENDING" };
  const skip = (page - 1) * limit;
  const { data, total } = await bookRepository.findMany({
    where,
    orderBy: [{ createdAt: "asc" }],
    skip,
    take: limit,
  });
  return { data, pagination: paginationMeta(page, limit, total) };
}

export async function approveBook(id) {
  const existing = await bookRepository.findUniqueRaw(id);
  if (!existing) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  if (existing.status !== "PENDING") {
    const err = new Error("Only pending books can be approved");
    err.statusCode = 400;
    throw err;
  }
  return bookRepository.update(id, {
    status: "PUBLISHED",
    rejectionReason: null,
  });
}

export async function rejectBook(id, reason) {
  const existing = await bookRepository.findUniqueRaw(id);
  if (!existing) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  if (existing.status !== "PENDING") {
    const err = new Error("Only pending books can be rejected");
    err.statusCode = 400;
    throw err;
  }
  return bookRepository.update(id, {
    status: "REJECTED",
    rejectionReason: reason,
  });
}
