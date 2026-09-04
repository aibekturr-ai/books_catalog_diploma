import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  fetchExternalBook,
  addExternalFavorite,
  removeExternalFavorite,
} from "../api/books.js";
import { useAuth } from "../context/AuthContext.jsx";
import { googleBooksErrorMessage, stripHtmlClient } from "../utils/googleBooksUi.js";

export default function GoogleBookDetailPage() {
  const { externalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(location.state?.googleBook || null);
  const [loading, setLoading] = useState(!location.state?.googleBook);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchExternalBook(externalId)
      .then((data) => {
        if (!cancelled) {
          setBook(data);
          setIsFavorite(Boolean(data.isFavorite));
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          if (location.state?.googleBook) {
            setBook(location.state.googleBook);
            setError("");
          } else {
            setError(googleBooksErrorMessage(e, "Book not found"));
            setBook(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [externalId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/google-books/${externalId}` } });
      return;
    }
    if (!book) return;
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await removeExternalFavorite(book.externalId);
        setIsFavorite(false);
      } else {
        await addExternalFavorite({
          provider: "GOOGLE_BOOKS",
          externalId: book.externalId,
          title: book.title,
          author: book.author,
          description: book.description || "",
          coverImage: book.coverImage,
          isbn10: book.isbn10 || null,
          isbn13: book.isbn13 || null,
        });
        setIsFavorite(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Favorite failed");
    } finally {
      setFavoriteBusy(false);
    }
  };

  if (loading && !book) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !book) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to="/" variant="contained">
          Back to catalog
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button component={RouterLink} to="/" color="inherit" sx={{ alignSelf: "flex-start" }}>
        Back to catalog
      </Button>
      {error && (
        <Alert severity="warning" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          src={book.coverImage}
          alt={book.title}
          sx={{ width: "100%", borderRadius: 2, objectFit: "cover", maxHeight: 420, bgcolor: "grey.200" }}
        />
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
            <Chip label="Google Books" size="small" color="secondary" variant="outlined" />
            {book.suggestedCategory && <Chip label={book.suggestedCategory} size="small" />}
            <IconButton onClick={toggleFavorite} disabled={favoriteBusy} color="primary" aria-label="favorite">
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Stack>
          <Typography variant="h3" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
            {book.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          {(book.isbn13 || book.isbn10) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {book.isbn13 ? `ISBN-13: ${book.isbn13}` : null}
              {book.isbn13 && book.isbn10 ? " · " : null}
              {book.isbn10 ? `ISBN-10: ${book.isbn10}` : null}
            </Typography>
          )}
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
            {stripHtmlClient(book.description) || "No description."}
          </Typography>
          <Alert severity="info">
            Google Books stay outside the catalog. Favorite them here — no moderation needed. Use Add book only for titles you could not find on Google.
          </Alert>
        </Box>
      </Paper>
    </Stack>
  );
}
