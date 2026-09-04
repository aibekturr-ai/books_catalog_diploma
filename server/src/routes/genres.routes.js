import { Router } from "express";
import * as genreController from "../controllers/genreController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(genreController.listGenres));

export default router;
