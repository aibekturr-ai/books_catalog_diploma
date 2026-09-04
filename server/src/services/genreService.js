import { genreRepository } from "../repositories/genreRepository.js";

export async function listGenres() {
  return genreRepository.findAllWithSubgenres();
}
