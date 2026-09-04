import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import SearchIcon from "@mui/icons-material/Search";

export default function FiltersToolbar({
  q,
  onQChange,
  includeAddedBooks,
  onIncludeAddedBooksChange,
  genreId,
  onGenreIdChange,
  genres,
  subgenreId,
  onSubgenreIdChange,
  minRating,
  onMinRatingChange,
  sort,
  onSortChange,
  searchMode,
}) {
  const selectedGenre = genres.find((g) => g.id === genreId);
  const subgenres = selectedGenre?.subgenres || [];

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <TextField
          fullWidth
          placeholder="Search title or author"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          sx={{ whiteSpace: "nowrap", mr: 0 }}
          control={
            <Checkbox
              checked={includeAddedBooks}
              onChange={(e) => onIncludeAddedBooksChange(e.target.checked)}
            />
          }
          label="Added Books"
        />
      </Stack>
      {!searchMode && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            select
            label="Genre"
            value={genreId}
            onChange={(e) => {
              onGenreIdChange(e.target.value);
              onSubgenreIdChange("");
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All genres</MenuItem>
            {genres.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Subgenre"
            value={subgenreId}
            onChange={(e) => onSubgenreIdChange(e.target.value)}
            sx={{ minWidth: 160 }}
            disabled={!genreId || subgenres.length === 0}
          >
            <MenuItem value="">All subgenres</MenuItem>
            {subgenres.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Min rating"
            value={minRating}
            onChange={(e) => onMinRatingChange(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Any</MenuItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}+
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="rating">Highest rating</MenuItem>
          </TextField>
        </Stack>
      )}
    </Stack>
  );
}
