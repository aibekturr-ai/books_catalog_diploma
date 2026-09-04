import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import {
  fetchBook,
  createBook,
  updateBook,
  fetchGenres,
  searchExternalBooks,
  addExternalFavorite,
} from "../api/books.js";
import { googleBooksErrorMessage } from "../utils/googleBooksUi.js";

const bookFormSchema = z.object({
  title: z.string().trim().min(1).max(500),
  author: z.string().trim().min(1).max(300),
  description: z.string().max(20000),
  genreId: z.string().min(1),
  subgenreId: z.string().optional().nullable(),
  coverImage: z.string().url().max(2000),
});

export default function BookFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadingBook, setLoadingBook] = useState(isEdit);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [favoriteMsg, setFavoriteMsg] = useState("");
  const [favoriteBusyId, setFavoriteBusyId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genreId: "",
      subgenreId: "",
      coverImage: "",
    },
  });

  const genreId = watch("genreId");
  const selectedGenre = genres.find((g) => g.id === genreId);
  const subgenres = selectedGenre?.subgenres || [];

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
    if (!isEdit) return undefined;
    let cancelled = false;
    setLoadingBook(true);
    fetchBook(id)
      .then((b) => {
        if (!cancelled) {
          reset({
            title: b.title,
            author: b.author,
            description: b.description,
            genreId: b.genreId,
            subgenreId: b.subgenreId || "",
            coverImage: b.coverImage,
          });
          setLoadError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.response?.data?.message || "Could not load book");
      })
      .finally(() => {
        if (!cancelled) setLoadingBook(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, reset]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setFavoriteMsg("");
    try {
      const results = await searchExternalBooks(searchQuery.trim());
      setSearchResults(results);
    } catch (e) {
      setSearchError(googleBooksErrorMessage(e, "Search failed"));
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleFavoriteGoogle = async (item) => {
    setFavoriteBusyId(item.externalId);
    setFavoriteMsg("");
    try {
      await addExternalFavorite({
        provider: "GOOGLE_BOOKS",
        externalId: item.externalId,
        title: item.title,
        author: item.author,
        description: item.description || "",
        coverImage: item.coverImage,
        isbn10: item.isbn10 || null,
        isbn13: item.isbn13 || null,
      });
      setFavoriteMsg(`Added “${item.title}” to favorites.`);
    } catch (e) {
      setSearchError(e.response?.data?.message || "Could not favorite");
    } finally {
      setFavoriteBusyId("");
    }
  };

  const onSubmit = async (values) => {
    setSubmitError("");
    const payload = {
      title: values.title,
      author: values.author,
      description: values.description,
      genreId: values.genreId,
      subgenreId: values.subgenreId || null,
      coverImage: values.coverImage,
    };
    try {
      if (isEdit) {
        const updated = await updateBook(id, payload);
        navigate(`/books/${updated.id}`);
      } else {
        const created = await createBook(payload);
        navigate(`/books/${created.id}`);
      }
    } catch (e) {
      setSubmitError(e.response?.data?.message || "Save failed");
    }
  };

  if (isEdit && loadingBook) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEdit && loadError) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{loadError}</Alert>
        <Button component={RouterLink} to="/" variant="contained">
          Home
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h4" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
        {isEdit ? "Edit book" : "Add a book"}
      </Typography>
      {!isEdit && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Search Google Books first
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            If the book is on Google — add it to favorites. Submit the form below only when Google has no match.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="978... or book title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outlined" onClick={handleSearch} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </Stack>
          {searchError && <Alert severity="warning">{searchError}</Alert>}
          {favoriteMsg && <Alert severity="success">{favoriteMsg}</Alert>}
          {searchResults.length > 0 && (
            <List dense>
              {searchResults.map((r) => (
                <ListItem
                  key={r.externalId}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/google-books/${r.externalId}`}
                        state={{ googleBook: r }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={favoriteBusyId === r.externalId}
                        onClick={() => handleFavoriteGoogle(r)}
                      >
                        Favorite
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={r.title}
                    secondary={`${r.author}${r.isbn13 ? ` · ${r.isbn13}` : ""}`}
                    sx={{ pr: 18 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {searchResults.length === 0 && searchQuery && !searching && !searchError && (
            <Alert severity="info" sx={{ mt: 1 }}>
              No Google results yet — search above, or fill the form to submit a custom book for review.
            </Alert>
          )}
        </Paper>
      )}
      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      )}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {!isEdit && (
          <Typography variant="subtitle1" gutterBottom>
            Custom book (not on Google) — submit for review
          </Typography>
        )}
        <Stack spacing={2}>
          <TextField label="Title" fullWidth {...register("title")} error={Boolean(errors.title)} helperText={errors.title?.message} />
          <TextField label="Author" fullWidth {...register("author")} error={Boolean(errors.author)} helperText={errors.author?.message} />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={4}
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />
          <TextField
            select
            label="Genre"
            fullWidth
            {...register("genreId")}
            value={genreId || ""}
            onChange={(e) => {
              setValue("genreId", e.target.value);
              setValue("subgenreId", "");
            }}
            error={Boolean(errors.genreId)}
            helperText={errors.genreId?.message}
          >
            {genres.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Subgenre"
            fullWidth
            {...register("subgenreId")}
            disabled={subgenres.length === 0}
            error={Boolean(errors.subgenreId)}
            helperText={errors.subgenreId?.message}
          >
            <MenuItem value="">None</MenuItem>
            {subgenres.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cover image URL"
            fullWidth
            {...register("coverImage")}
            error={Boolean(errors.coverImage)}
            helperText={errors.coverImage?.message}
          />
          <Divider />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button component={RouterLink} to={isEdit ? `/books/${id}` : "/"} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEdit ? "Submit again" : "Submit for review"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
