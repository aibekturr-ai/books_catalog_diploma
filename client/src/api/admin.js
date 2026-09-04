import api from "./client.js";

export async function fetchAdminStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function fetchPendingBooks(params) {
  const { data } = await api.get("/admin/books/pending", { params });
  return data;
}

export async function approveBook(id) {
  const { data } = await api.patch(`/admin/books/${id}/approve`);
  return data;
}

export async function rejectBook(id, reason) {
  const { data } = await api.patch(`/admin/books/${id}/reject`, { reason });
  return data;
}
