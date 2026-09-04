import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const bookListQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    genreId: z.string().trim().optional(),
    subgenreId: z.string().trim().optional(),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
    sort: z.enum(["rating", "newest"]).default("newest"),
  })
  .merge(paginationQuerySchema);

export const bookIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const reviewIdParamsSchema = z.object({
  id: z.string().min(1),
});

const bookFields = {
  title: z.string().trim().min(1).max(500),
  author: z.string().trim().min(1).max(300),
  description: z.string().max(20000),
  genreId: z.string().min(1),
  subgenreId: z.string().min(1).optional().nullable(),
  coverImage: z.string().url().max(2000),
};

export const bookCreateBodySchema = z.object(bookFields);

export const bookUpdateBodySchema = z.object(bookFields);

export const rejectBodySchema = z.object({
  reason: z.string().trim().min(1).max(2000),
});

export const registerBodySchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const externalBooksQuerySchema = z.object({
  query: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(1).max(300)),
});

export const externalBookIdParamsSchema = z.object({
  externalId: z.string().min(1).max(200),
});

export const externalFavoriteBodySchema = z.object({
  provider: z.literal("GOOGLE_BOOKS").default("GOOGLE_BOOKS"),
  externalId: z.string().min(1).max(200),
  title: z.string().trim().min(1).max(500),
  author: z.string().trim().min(1).max(300),
  description: z.string().max(20000).optional().default(""),
  coverImage: z.string().url().max(2000),
  isbn10: z.string().optional().nullable(),
  isbn13: z.string().optional().nullable(),
});

export const reviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(5000).optional().nullable(),
});

export const meListQuerySchema = paginationQuerySchema;
