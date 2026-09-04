import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import AppBarNav from "./AppBarNav.jsx";

export default function MainLayout() {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBarNav />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </Container>
    </Box>
  );
}
