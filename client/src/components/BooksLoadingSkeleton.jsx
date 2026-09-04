import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";

export default function BooksLoadingSkeleton({ count = 8 }) {
  return (
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
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={220} />
          <Skeleton sx={{ m: 2 }} height={28} />
          <Skeleton sx={{ mx: 2, mb: 2 }} height={20} width="60%" />
        </Card>
      ))}
    </Box>
  );
}
