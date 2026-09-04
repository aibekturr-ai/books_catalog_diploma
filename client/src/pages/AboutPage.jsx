import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExploreIcon from "@mui/icons-material/Explore";
import TuneIcon from "@mui/icons-material/Tune";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const features = [
  {
    icon: ExploreIcon,
    title: "Explore titles",
    text: "Browse the catalog and discover books from local shelves and beyond.",
  },
  {
    icon: TuneIcon,
    title: "Filter with ease",
    text: "Narrow by genre, subgenre, and rating to find the right read faster.",
  },
  {
    icon: BookmarkBorderIcon,
    title: "Keep a personal shelf",
    text: "Sign in to save favorites and manage the books you add.",
  },
];

const stack = ["React", "Material UI", "Express", "Prisma", "PostgreSQL"];

export default function AboutPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Stack spacing={4}>
        <motion.div variants={item}>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              p: { xs: 3, md: 5 },
              background: "linear-gradient(145deg, #faf6ef 0%, #efe4d4 55%, #e8d7c0 100%)",
              border: "1px solid",
              borderColor: "rgba(92, 64, 51, 0.12)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -48,
                right: -32,
                width: 180,
                height: 180,
                borderRadius: "50%",
                bgcolor: "rgba(139, 105, 20, 0.1)",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -60,
                left: "30%",
                width: 220,
                height: 220,
                borderRadius: "50%",
                bgcolor: "rgba(92, 64, 51, 0.06)",
                pointerEvents: "none",
              }}
            />
            <Stack spacing={2} sx={{ position: "relative", maxWidth: 640 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <MenuBookIcon />
                </Box>
                <Typography
                  variant="h3"
                  sx={{ fontFamily: "Crimson Pro, Georgia, serif", fontSize: { xs: "2rem", md: "2.5rem" } }}
                >
                  Book Catalog
                </Typography>
              </Stack>
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.45 }}>
                A place to explore titles, filter by genre and rating, and keep a personal shelf when you sign in.
              </Typography>
              <Box>
                <Button component={RouterLink} to="/" variant="contained" size="large">
                  Browse books
                </Button>
              </Box>
            </Stack>
          </Paper>
        </motion.div>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {features.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={item}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: 3,
                  border: "1px solid",
                  borderColor: "rgba(92, 64, 51, 0.1)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(44, 36, 22, 0.1)",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(92, 64, 51, 0.1)",
                      color: "primary.main",
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {text}
                  </Typography>
                </Stack>
              </Paper>
            </motion.div>
          ))}
        </Box>

        <motion.div variants={item}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "rgba(92, 64, 51, 0.1)",
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: "Crimson Pro, Georgia, serif", mb: 1.5 }}>
              Built with
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2 }}>
              A modern stack for a fast, reliable reading catalog.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {stack.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.06, duration: 0.28 }}
                >
                  <Box
                    sx={{
                      px: 1.75,
                      py: 0.85,
                      borderRadius: 2,
                      bgcolor: "rgba(92, 64, 51, 0.08)",
                      color: "primary.main",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {name}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Paper>
        </motion.div>
      </Stack>
    </motion.div>
  );
}
