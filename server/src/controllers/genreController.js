import * as genreService from "../services/genreService.js";

export async function listGenres(req, res) {
  const genres = await genreService.listGenres();
  res.json(genres);
}
