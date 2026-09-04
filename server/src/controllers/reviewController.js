import * as reviewService from "../services/reviewService.js";

export async function listReviews(req, res) {
  const result = await reviewService.listReviews(
    req.validatedParams.id,
    req.validatedQuery
  );
  res.json(result);
}

export async function createReview(req, res) {
  const review = await reviewService.createReview(
    req.user.id,
    req.validatedParams.id,
    req.validatedBody
  );
  res.status(201).json(review);
}

export async function updateReview(req, res) {
  const review = await reviewService.updateReview(
    req.validatedParams.id,
    req.user.id,
    req.validatedBody,
    req.user.role === "ADMIN"
  );
  res.json(review);
}

export async function deleteReview(req, res) {
  await reviewService.deleteReview(
    req.validatedParams.id,
    req.user.id,
    req.user.role === "ADMIN"
  );
  res.status(204).send();
}
