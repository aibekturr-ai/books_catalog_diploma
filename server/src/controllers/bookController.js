import * as bookService from "../services/bookService.js";
import * as favoriteService from "../services/favoriteService.js";

export async function listBooks(req, res) {
  const result = await bookService.listBooks(req.validatedQuery, req.user);
  res.json(result);
}

export async function getBook(req, res) {
  const book = await bookService.getBookById(req.validatedParams.id, req.user);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  let isFavorite = false;
  if (req.user) {
    isFavorite = await favoriteService.isFavorited(req.user.id, book.id);
  }
  res.json({ ...book, isFavorite });
}

export async function createBook(req, res) {
  const book = await bookService.createBook(req.user.id, req.validatedBody);
  res.status(201).json(book);
}

export async function updateBook(req, res) {
  const book = await bookService.updateBook(
    req.validatedParams.id,
    req.user.id,
    req.validatedBody,
    req.user.role === "ADMIN"
  );
  res.json(book);
}

export async function deleteBook(req, res) {
  await bookService.deleteBook(
    req.validatedParams.id,
    req.user.id,
    req.user.role === "ADMIN"
  );
  res.status(204).send();
}

export async function addFavorite(req, res) {
  const fav = await favoriteService.addFavorite(
    req.user.id,
    req.validatedParams.id
  );
  res.status(201).json(fav);
}

export async function removeFavorite(req, res) {
  await favoriteService.removeFavorite(req.user.id, req.validatedParams.id);
  res.status(204).send();
}
