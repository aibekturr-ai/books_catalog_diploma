import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Record not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Unique constraint violation" });
    }
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  if (status >= 500) {
    console.error(err);
  }
  return res.status(status).json({ message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Not found" });
}
