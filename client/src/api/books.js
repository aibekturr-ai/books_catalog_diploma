import api from "./client.js";

export async function fetchBooks(params) {
  const { data } = await api.get("/books", { params });
  return data;
}

export async function fetchGenres() {
  const { data } = await api.get("/genres");
  return data;
}

export async function fetchBook(id) {
  const { data } = await api.get(`/books/${id}`);
  return data;
}

export async function createBook(body) {
  const { data } = await api.post("/books", body);
  return data;
}

export async function updateBook(id, body) {
  const { data } = await api.put(`/books/${id}`, body);
  return data;
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}`);
}

export async function register(body) {
  const { data } = await api.post("/auth/register", body);
  return data;
}

export async function login(body) {
  const { data } = await api.post("/auth/login", body);
  return data;
}

export async function searchExternalBooks(query) {
  const normalized = String(query || "")
    .trim()
    .replace(/\s+/g, " ");
  const { data } = await api.get(
    `/external-books?query=${encodeURIComponent(normalized)}`
  );
  return data;
}

export async function fetchExternalBook(externalId) {
  const { data } = await api.get(
    `/external-books/${encodeURIComponent(externalId)}`
  );
  return data;
}

export async function addExternalFavorite(body) {
  const { data } = await api.post("/external-books/favorites", body);
  return data;
}

export async function removeExternalFavorite(externalId) {
  await api.delete(
    `/external-books/favorites/${encodeURIComponent(externalId)}`
  );
}

export async function addFavorite(id) {
  const { data } = await api.post(`/books/${id}/favorite`);
  return data;
}

export async function removeFavorite(id) {
  await api.delete(`/books/${id}/favorite`);
}

export async function fetchMyBooks(params) {
  const { data } = await api.get("/me/books", { params });
  return data;
}

export async function fetchMyFavorites(params) {
  const { data } = await api.get("/me/favorites", { params });
  return data;
}

export async function fetchReviews(bookId, params) {
  const { data } = await api.get(`/books/${bookId}/reviews`, { params });
  return data;
}

export async function createReview(bookId, body) {
  const { data } = await api.post(`/books/${bookId}/reviews`, body);
  return data;
}

export async function updateReview(id, body) {
  const { data } = await api.patch(`/reviews/${id}`, body);
  return data;
}

export async function deleteReview(id) {
  await api.delete(`/reviews/${id}`);
}
