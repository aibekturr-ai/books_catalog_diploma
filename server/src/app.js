import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import booksRouter from "./routes/books.routes.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import genresRouter from "./routes/genres.routes.js";
import meRouter from "./routes/me.routes.js";
import externalBooksRouter from "./routes/externalBooks.routes.js";
import reviewsRouter from "./routes/reviews.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/books", booksRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/genres", genresRouter);
  app.use("/api/me", meRouter);
  app.use("/api/external-books", externalBooksRouter);
  app.use("/api/reviews", reviewsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
