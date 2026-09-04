import { Router } from "express";
import * as meController from "../controllers/meController.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateQuery } from "../middleware/validate.js";
import { meListQuerySchema } from "../validators/schemas.js";

const router = Router();

router.use(authenticate);

router.get(
  "/books",
  validateQuery(meListQuerySchema),
  asyncHandler(meController.listMyBooks)
);

router.get(
  "/favorites",
  validateQuery(meListQuerySchema),
  asyncHandler(meController.listMyFavorites)
);

export default router;
