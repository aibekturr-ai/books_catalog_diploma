import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Divider from "@mui/material/Divider";
import {
  fetchBook,
  deleteBook,
  addFavorite,
  removeFavorite,
  fetchReviews,
  createReview,
  deleteReview,
} from "../api/books.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusColor = {
  PENDING: "warning",
  PUBLISHED: "success",
  REJECTED: "error",
};

export default function BookDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  const load = () => {
    setLoading(true);
    return fetchBook(id)
      .then((data) => {
        setBook(data);
        setError("");
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Book not found");
        setBook(null);
      })
      .finally(() => setLoading(false));
  };

  const loadReviews = () => {
    fetchReviews(id, { page: 1, limit: 20 })
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    let cancelled = false;
    load().then(() => {
      if (!cancelled) loadReviews();
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isOwner = book && user && book.userId === user.id;
  const myReview = user && reviews.find((r) => r.userId === user.id);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(id);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete");
    } finally {
      setDeleting(false);
      setOpenDelete(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setFavoriteBusy(true);
    try {
      if (book.isFavorite) {
        await removeFavorite(id);
        setBook((b) => ({ ...b, isFavorite: false }));
      } else {
        await addFavorite(id);
        setBook((b) => ({ ...b, isFavorite: true }));
      }
    } catch (e) {
      setError(e.response?.data?.message || "Favorite failed");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewBusy(true);
    setReviewError("");
    try {
      await createReview(id, { rating: reviewRating, comment: reviewComment || null });
      setReviewComment("");
      loadReviews();
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not save review");
    } finally {
      setReviewBusy(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      loadReviews();
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not delete review");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error || "Book not found"}</Alert>
        <Button component={RouterLink} to="/" variant="contained">
          Back to catalog
        </Button>
      </Stack>
    );
  }

  const genreLabel = book.subgenre?.name
    ? `${book.genre?.name} · ${book.subgenre.name}`
    : book.genre?.name;

  return (
    <Stack spacing={3}>
      <Button component={RouterLink} to="/" color="inherit" sx={{ alignSelf: "flex-start" }}>
        Back to catalog
      </Button>
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
            <Chip label={book.status} color={statusColor[book.status] || "default"} size="small" />
            {genreLabel && <Chip label={genreLabel} size="small" />}
            {book.status === "PUBLISHED" && (
              <IconButton onClick={toggleFavorite} disabled={favoriteBusy} color="primary" aria-label="favorite">
                {book.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            )}
          </Stack>
          <Typography variant="h3" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
            {book.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Rating value={book.averageRating || 0} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {book.averageRating != null ? book.averageRating : "No rating"} · {book.reviewsCount || 0} reviews
            </Typography>
          </Stack>
          {book.status === "REJECTED" && book.rejectionReason && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Rejected: {book.rejectionReason}
            </Alert>
          )}
          {book.status === "PENDING" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Waiting for admin approval.
            </Alert>
          )}
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
            {book.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Added by {book.user?.email} · {new Date(book.createdAt).toLocaleDateString()}
          </Typography>
          {(isOwner || isAdmin) && (
            <Stack direction="row" spacing={2}>
              {(isOwner || isAdmin) && (
                <Button component={RouterLink} to={`/books/${book.id}/edit`} variant="contained">
                  Edit
                </Button>
              )}
              <Button color="error" variant="outlined" onClick={() => setOpenDelete(true)}>
                Delete
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      {book.status === "PUBLISHED" && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
            Reviews
          </Typography>
          {isAuthenticated && !myReview && (
            <Stack component="form" spacing={2} onSubmit={handleReviewSubmit} sx={{ mb: 3 }}>
              {reviewError && <Alert severity="error">{reviewError}</Alert>}
              <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v || 1)} />
              <TextField
                label="Comment"
                multiline
                minRows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={reviewBusy} sx={{ alignSelf: "flex-start" }}>
                Post review
              </Button>
            </Stack>
          )}
          <Divider sx={{ mb: 2 }} />
          {reviews.length === 0 ? (
            <Typography color="text.secondary">No reviews yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {reviews.map((r) => (
                <Box key={r.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={r.rating} size="small" readOnly />
                    <Typography variant="body2">{r.user?.email}</Typography>
                    {(user?.id === r.userId || isAdmin) && (
                      <Button size="small" color="error" onClick={() => handleDeleteReview(r.id)}>
                        Delete
                      </Button>
                    )}
                  </Stack>
                  {r.comment && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {r.comment}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      <Dialog open={openDelete} onClose={() => !deleting && setOpenDelete(false)}>
        <DialogTitle>Delete this book?</DialogTitle>
        <DialogContent>
          <DialogContentText>This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
