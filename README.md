# Book Catalog

Full-stack book catalog: React (Vite, MUI, React Router, Axios, Framer Motion) and Node (Express, Prisma, PostgreSQL) with JWT auth, roles, moderation, genres, Google Books import, favorites, and reviews.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database

Create a database and set `DATABASE_URL` in `server/.env` (copy from `server/.env.example` if present).

Example:

`postgresql://postgres:postgres@localhost:5432/bookcatalog?schema=public`

### 2. Server

```bash
cd server
npm install
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
npm run dev
```

Optional: set `GOOGLE_BOOKS_API_KEY` in `server/.env` for higher Google Books quota.

API: `http://localhost:4000`. Health: `GET /api/health`.

### 3. Client

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`. Vite proxies `/api` to port 4000.

### 4. Run both

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

## Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| `demo@example.com` | `password123` | USER |
| `admin@example.com` | `password123` | ADMIN |

## Main flows

- User adds/imports a book → `PENDING` → admin Approve (`PUBLISHED`) or Reject (`rejectionReason`) → user can edit & resubmit.
- Public catalog shows only `PUBLISHED` books (paginated).
- Favorites and reviews on published books; rating is `AVG(Review.rating)`.

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Books | `GET/POST /api/books`, `GET/PUT/DELETE /api/books/:id`, favorites & reviews nested |
| Genres | `GET /api/genres` |
| Me | `GET /api/me/books`, `GET /api/me/favorites` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/books/pending`, `PATCH .../approve`, `PATCH .../reject` |
| External | `GET /api/external-books?query=` (auth) |

## Project layout

- `server/` — Express MVC + repositories, Prisma, Zod
- `client/` — Vite React SPA
