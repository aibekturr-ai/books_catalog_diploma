import * as googleBooksService from "../services/googleBooksService.js";
import * as externalFavoriteService from "../services/externalFavoriteService.js";

export async function search(req, res) {
  const results = await googleBooksService.searchExternalBooks(
    req.validatedQuery.query
  );
  res.json(results);
}

export async function getById(req, res) {
  const book = await googleBooksService.getExternalBookById(
    req.validatedParams.externalId
  );
  let isFavorite = false;
  if (req.user) {
    isFavorite = await externalFavoriteService.isExternalFavorited(
      req.user.id,
      "GOOGLE_BOOKS",
      book.externalId
    );
  }
  res.json({ ...book, isFavorite });
}

export async function addFavorite(req, res) {
  const fav = await externalFavoriteService.addExternalFavorite(
    req.user.id,
    req.validatedBody
  );
  res.status(201).json(fav);
}

export async function removeFavorite(req, res) {
  await externalFavoriteService.removeExternalFavorite(
    req.user.id,
    "GOOGLE_BOOKS",
    req.validatedParams.externalId
  );
  res.status(204).send();
}
