import { Router } from "express";
import * as bookController from "../controllers/bookController.js";
import * as reviewController from "../controllers/reviewController.js";
import { validateQuery, validateParams, validateBody } from "../middleware/validate.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  bookListQuerySchema,
  bookIdParamsSchema,
  bookCreateBodySchema,
  bookUpdateBodySchema,
  reviewBodySchema,
  paginationQuerySchema,
} from "../validators/schemas.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  validateQuery(bookListQuerySchema),
  asyncHandler(bookController.listBooks)
);
router.get(
  "/:id",
  optionalAuthenticate,
  validateParams(bookIdParamsSchema),
  asyncHandler(bookController.getBook)
);
router.post(
  "/",
  authenticate,
  validateBody(bookCreateBodySchema),
  asyncHandler(bookController.createBook)
);
router.put(
  "/:id",
  authenticate,
  validateParams(bookIdParamsSchema),
  validateBody(bookUpdateBodySchema),
  asyncHandler(bookController.updateBook)
);
router.delete(
  "/:id",
  authenticate,
  validateParams(bookIdParamsSchema),
  asyncHandler(bookController.deleteBook)
);

router.post(
  "/:id/favorite",
  authenticate,
  validateParams(bookIdParamsSchema),
  asyncHandler(bookController.addFavorite)
);
router.delete(
  "/:id/favorite",
  authenticate,
  validateParams(bookIdParamsSchema),
  asyncHandler(bookController.removeFavorite)
);

router.get(
  "/:id/reviews",
  validateParams(bookIdParamsSchema),
  validateQuery(paginationQuerySchema),
  asyncHandler(reviewController.listReviews)
);
router.post(
  "/:id/reviews",
  authenticate,
  validateParams(bookIdParamsSchema),
  validateBody(reviewBodySchema),
  asyncHandler(reviewController.createReview)
);

export default router;
