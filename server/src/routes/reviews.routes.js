import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateParams, validateBody } from "../middleware/validate.js";
import { reviewIdParamsSchema, reviewBodySchema } from "../validators/schemas.js";

const router = Router();

router.patch(
  "/:id",
  authenticate,
  validateParams(reviewIdParamsSchema),
  validateBody(reviewBodySchema),
  asyncHandler(reviewController.updateReview)
);

router.delete(
  "/:id",
  authenticate,
  validateParams(reviewIdParamsSchema),
  asyncHandler(reviewController.deleteReview)
);

export default router;
