import * as adminService from "../services/adminService.js";

export async function getStats(req, res) {
  const stats = await adminService.getStats();
  res.json(stats);
}

export async function listPending(req, res) {
  const result = await adminService.listPendingBooks(req.validatedQuery);
  res.json(result);
}

export async function approveBook(req, res) {
  const book = await adminService.approveBook(req.validatedParams.id);
  res.json(book);
}

export async function rejectBook(req, res) {
  const book = await adminService.rejectBook(
    req.validatedParams.id,
    req.validatedBody.reason
  );
  res.json(book);
}
