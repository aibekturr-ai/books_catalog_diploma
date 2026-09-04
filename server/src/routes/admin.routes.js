import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateQuery, validateParams, validateBody } from "../middleware/validate.js";
import {
  paginationQuerySchema,
  bookIdParamsSchema,
  rejectBodySchema,
} from "../validators/schemas.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", asyncHandler(adminController.getStats));

router.get(
  "/books/pending",
  validateQuery(paginationQuerySchema),
  asyncHandler(adminController.listPending)
);

router.patch(
  "/books/:id/approve",
  validateParams(bookIdParamsSchema),
  asyncHandler(adminController.approveBook)
);

router.patch(
  "/books/:id/reject",
  validateParams(bookIdParamsSchema),
  validateBody(rejectBodySchema),
  asyncHandler(adminController.rejectBook)
);

export default router;
