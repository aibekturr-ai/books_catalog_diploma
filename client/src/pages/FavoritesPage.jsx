import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import { motion } from "framer-motion";
import BookCard from "../components/BookCard.jsx";
import { fetchMyFavorites } from "../api/books.js";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function FavoritesPage() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMyFavorites({ page, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setBooks(res.data || []);
          setPagination(res.pagination || { page: 1, totalPages: 1 });
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load favorites");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
          Favorites
        </Typography>
        <Button component={RouterLink} to="/profile">
          My books
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Typography color="text.secondary">No favorites yet.</Typography>
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
                <BookCard
                  key={book.id}
                  book={{ ...book, source: book.source || "local" }}
                  variants={item}
                />
              ))}
            </Box>
          </motion.div>
          {pagination.totalPages > 1 && (
            <Stack alignItems="center">
              <Pagination count={pagination.totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
