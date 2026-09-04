import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { motion } from "framer-motion";
import FiltersToolbar from "../components/FiltersToolbar.jsx";
import BookCard, { matchKey } from "../components/BookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BooksLoadingSkeleton from "../components/BooksLoadingSkeleton.jsx";
import { fetchBooks, fetchGenres, searchExternalBooks } from "../api/books.js";
import { googleBooksErrorMessage } from "../utils/googleBooksUi.js";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function mapGoogleToCard(g) {
  return {
    id: `google-${g.externalId}`,
    source: "google",
    title: g.title,
    author: g.author,
    coverImage: g.coverImage,
    suggestedCategory: g.suggestedCategory,
    averageRating: null,
    reviewsCount: 0,
    external: g,
  };
}

function mapLocalToCard(b) {
  return { ...b, source: "local" };
}

export default function HomePage() {
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [includeAddedBooks, setIncludeAddedBooks] = useState(true);
  const [genreId, setGenreId] = useState("");
  const [subgenreId, setSubgenreId] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [googleWarning, setGoogleWarning] = useState("");

  const searchMode = Boolean(q.trim());

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    let cancelled = false;
    fetchGenres()
      .then((g) => {
        if (!cancelled) setGenres(g);
      })
      .catch(() => {
        if (!cancelled) setGenres([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        if (!searchMode) {
          const params = { sort, page, limit: 20 };
          if (genreId) params.genreId = genreId;
          if (subgenreId) params.subgenreId = subgenreId;
          if (minRating) params.minRating = minRating;
          const res = await fetchBooks(params);
          if (cancelled) return;
          setBooks((res.data || []).map(mapLocalToCard));
          setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
          setError("");
          setGoogleWarning("");
          return;
        }

        const normalizedQ = q.trim().replace(/\s+/g, " ");
        let googleFailed = false;
        const googlePromise = searchExternalBooks(normalizedQ).catch((e) => {
          googleFailed = true;
          if (!cancelled) {
            setGoogleWarning(googleBooksErrorMessage(e));
          }
          return [];
        });
        const localPromise = includeAddedBooks
          ? fetchBooks({ q: normalizedQ, page: 1, limit: 50, sort: "newest" })
          : Promise.resolve({ data: [] });

        const [googleRaw, localRes] = await Promise.all([googlePromise, localPromise]);
        if (cancelled) return;

        const localCards = (localRes.data || []).map(mapLocalToCard);
        const localKeys = new Set(localCards.map((b) => matchKey(b.title, b.author)));
        const googleCards = (googleRaw || [])
          .map(mapGoogleToCard)
          .filter((g) => !localKeys.has(matchKey(g.title, g.author)));

        const merged = includeAddedBooks
          ? [...localCards, ...googleCards]
          : googleCards;

        setBooks(merged);
        setPagination({
          page: 1,
          limit: merged.length || 20,
          total: merged.length,
          totalPages: 1,
        });
        setError("");
        if (!googleFailed) {
          setGoogleWarning("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || "Failed to load books");
          setBooks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q, searchMode, includeAddedBooks, genreId, subgenreId, minRating, sort, page]);

  const clearFilters = () => {
    setQInput("");
    setQ("");
    setGenreId("");
    setSubgenreId("");
    setMinRating("");
    setSort("newest");
    setPage(1);
  };

  return (
    <>
      <Typography variant="h3" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif", mb: 2 }}>
        Browse books
      </Typography>
      <FiltersToolbar
        q={qInput}
        onQChange={setQInput}
        includeAddedBooks={includeAddedBooks}
        onIncludeAddedBooksChange={setIncludeAddedBooks}
        searchMode={searchMode}
        genreId={genreId}
        onGenreIdChange={(v) => {
          setGenreId(v);
          setPage(1);
        }}
        genres={genres}
        subgenreId={subgenreId}
        onSubgenreIdChange={(v) => {
          setSubgenreId(v);
          setPage(1);
        }}
        minRating={minRating}
        onMinRatingChange={(v) => {
          setMinRating(v);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(v) => {
          setSort(v);
          setPage(1);
        }}
      />
      {googleWarning && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setGoogleWarning("")}>
          {googleWarning}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <BooksLoadingSkeleton />
      ) : books.length === 0 ? (
        <EmptyState onReset={clearFilters} />
      ) : (
        <>
          <motion.div variants={container} initial="hidden" animate="show">
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
              }}
            >
              {books.map((book) => (
                <BookCard key={book.id} book={book} variants={item} />
              ))}
            </Box>
          </motion.div>
          {!searchMode && pagination.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </>
  );
}
