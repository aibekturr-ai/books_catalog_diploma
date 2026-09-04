import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

export default function EmptyState({ onReset }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
      <LibraryBooksIcon sx={{ fontSize: 56, color: "text.secondary", opacity: 0.6 }} />
      <Typography variant="h6" color="text.secondary">
        No books match your filters
      </Typography>
      {onReset && (
        <Button variant="outlined" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </Stack>
  );
}
