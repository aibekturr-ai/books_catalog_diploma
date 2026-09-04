import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";
import HomePage from "./pages/HomePage.jsx";
import BookDetailPage from "./pages/BookDetailPage.jsx";
import BookFormPage from "./pages/BookFormPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";

import GoogleBookDetailPage from "./pages/GoogleBookDetailPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="google-books/:externalId" element={<GoogleBookDetailPage />} />
        <Route path="books/new" element={<RequireAuth />}>
          <Route index element={<BookFormPage />} />
        </Route>
        <Route path="books/:id/edit" element={<RequireAuth />}>
          <Route index element={<BookFormPage />} />
        </Route>
        <Route path="books/:id" element={<BookDetailPage />} />
        <Route path="profile" element={<RequireAuth />}>
          <Route index element={<ProfilePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>
        <Route path="admin" element={<RequireAdmin />}>
          <Route index element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
