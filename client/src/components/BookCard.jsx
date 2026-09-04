import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

function matchKey(title, author) {
  return `${(title || "").toLowerCase().trim()}|${(author || "").toLowerCase().trim()}`;
}

export { matchKey };

export default function BookCard({ book, variants }) {
  const isGoogle = book.source === "google";
  const genreLabel = book.subgenre?.name
    ? `${book.genre?.name} · ${book.subgenre.name}`
    : book.genre?.name || book.suggestedCategory || "";

  const externalId = book.externalId || book.external?.externalId;
  const linkProps = isGoogle
    ? {
        component: RouterLink,
        to: `/google-books/${externalId}`,
        state: { googleBook: book.external || book },
      }
    : {
        component: RouterLink,
        to: `/books/${book.id}`,
      };

  return (
    <MotionCard
      variants={variants}
      layout
      whileHover={{ y: -6, boxShadow: "0 12px 28px rgba(44,36,22,0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      sx={{ height: "100%", overflow: "hidden" }}
    >
      <CardActionArea {...linkProps} sx={{ height: "100%", alignItems: "stretch" }}>
        <CardMedia
          component="img"
          height="220"
          image={book.coverImage}
          alt={book.title}
          sx={{ objectFit: "cover", bgcolor: "grey.200" }}
        />
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
            {isGoogle ? (
              <Chip label="Google Books" size="small" color="secondary" variant="outlined" />
            ) : (
              <Chip label="In catalog" size="small" color="primary" variant="outlined" />
            )}
            {genreLabel && <Chip label={genreLabel} size="small" variant="outlined" />}
          </Stack>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          {!isGoogle && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Rating value={book.averageRating || 0} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {book.averageRating != null ? `${book.averageRating}` : "—"}
                {book.reviewsCount ? ` · ${book.reviewsCount}` : ""}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </MotionCard>
  );
}
