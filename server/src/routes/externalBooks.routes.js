import { Router } from "express";
import * as externalBooksController from "../controllers/externalBooksController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateQuery, validateParams, validateBody } from "../middleware/validate.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import {
  externalBooksQuerySchema,
  externalBookIdParamsSchema,
  externalFavoriteBodySchema,
} from "../validators/schemas.js";

const router = Router();

router.get(
  "/",
  validateQuery(externalBooksQuerySchema),
  asyncHandler(externalBooksController.search)
);

router.post(
  "/favorites",
  authenticate,
  validateBody(externalFavoriteBodySchema),
  asyncHandler(externalBooksController.addFavorite)
);

router.delete(
  "/favorites/:externalId",
  authenticate,
  validateParams(externalBookIdParamsSchema),
  asyncHandler(externalBooksController.removeFavorite)
);

router.get(
  "/:externalId",
  optionalAuthenticate,
  validateParams(externalBookIdParamsSchema),
  asyncHandler(externalBooksController.getById)
);

export default router;
