import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { registerBodySchema, loginBodySchema } from "../validators/schemas.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerBodySchema),
  asyncHandler(authController.register)
);
router.post(
  "/login",
  validateBody(loginBodySchema),
  asyncHandler(authController.login)
);

export default router;
