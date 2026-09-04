import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppBarNav() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            mr: "auto",
          }}
        >
          <MenuBookIcon color="primary" />
          <Typography variant="h6" component="span" sx={{ fontFamily: "Crimson Pro, Georgia, serif" }}>
            Book Catalog
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Button component={RouterLink} to="/" color="inherit">
            Home
          </Button>
          <Button component={RouterLink} to="/about" color="inherit">
            About
          </Button>
          {isAuthenticated && (
            <>
              <Button component={RouterLink} to="/profile" color="inherit">
                Profile
              </Button>
              <Button component={RouterLink} to="/books/new" variant="contained" color="primary">
                Add book
              </Button>
            </>
          )}
          {isAdmin && (
            <Button component={RouterLink} to="/admin" variant="outlined" color="secondary">
              Admin
            </Button>
          )}
          {!isAuthenticated ? (
            <>
              <Button component={RouterLink} to="/login" variant="outlined" color="primary">
                Log in
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary">
                Register
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 160 }} noWrap>
                {user.email}
              </Typography>
              <Button
                color="inherit"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
