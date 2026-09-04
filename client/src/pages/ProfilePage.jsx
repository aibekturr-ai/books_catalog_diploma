import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { fetchMyBooks } from "../api/books.js";

const statusColor = {
  PENDING: "warning",
  PUBLISHED: "success",
  REJECTED: "error",
};

export default function ProfilePage() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMyBooks({ page, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setBooks(res.data || []);
          setPagination(res.pagination || { page: 1, totalPages: 1 });
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load");
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
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
        <Typography variant="h3" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
          My books
        </Typography>
        <Button component={RouterLink} to="/profile/favorites" variant="outlined">
          Favorites
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary" gutterBottom>
            You have not submitted any books yet.
          </Typography>
          <Button component={RouterLink} to="/books/new" variant="contained">
            Add a book
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {books.map((book) => (
            <Paper key={book.id} sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
                      {book.title}
                    </Typography>
                    <Chip size="small" label={book.status} color={statusColor[book.status] || "default"} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {book.author}
                  </Typography>
                  {book.status === "REJECTED" && book.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {book.rejectionReason}
                    </Alert>
                  )}
                </Box>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Button component={RouterLink} to={`/books/${book.id}`} size="small">
                    View
                  </Button>
                  {(book.status === "REJECTED" || book.status === "PENDING") && (
                    <Button component={RouterLink} to={`/books/${book.id}/edit`} size="small" variant="contained">
                      Edit & resubmit
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
          {pagination.totalPages > 1 && (
            <Stack alignItems="center">
              <Pagination count={pagination.totalPages} page={page} onChange={(_, p) => setPage(p)} />
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
