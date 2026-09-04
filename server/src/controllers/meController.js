import * as bookService from "../services/bookService.js";
import * as externalFavoriteService from "../services/externalFavoriteService.js";

export async function listMyBooks(req, res) {
  const result = await bookService.listMyBooks(req.user.id, req.validatedQuery);
  res.json(result);
}

export async function listMyFavorites(req, res) {
  const result = await externalFavoriteService.listAllFavorites(
    req.user.id,
    req.validatedQuery
  );
  res.json(result);
}
