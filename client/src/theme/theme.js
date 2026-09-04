import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5c4033",
      contrastText: "#faf6ef",
    },
    secondary: {
      main: "#8b6914",
    },
    background: {
      default: "#f0e6d8",
      paper: "#faf6ef",
    },
    text: {
      primary: "#2c2416",
      secondary: "#5c4a3a",
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
    h5: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
    h6: { fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 2px 12px rgba(44,36,22,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});
