import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense, lazy } from "react";
import { useAuthStore } from "./store/useAuthStore";
import "./index.css";
import './i18n';

// Lazy load components for code splitting
const Login = lazy(() => import("./pages/auth/login/Login").then(module => ({ default: module.Login })));
const Register = lazy(() => import("./pages/auth/register/Register").then(module => ({ default: module.Register })));
const CinemaLayout = lazy(() => import("./pages/CinemaLayout").then(module => ({ default: module.CinemaLayout })));
const Home = lazy(() => import("./pages/menu/Home").then(module => ({ default: module.default })));
const Movie = lazy(() => import("./pages/menu/movie/Movie").then(module => ({ default: module.Movie })));
const Discover = lazy(() => import("./pages/menu/movie/Discover").then(module => ({ default: module.Discover })));
const Booking = lazy(() => import("./pages/menu/movie/Booking").then(module => ({ default: module.Booking })));
const PaymentHistory = lazy(() => import("./pages/menu/movie/Payment").then(module => ({ default: module.default })));
const Admin = lazy(() => import("./pages/admin/Admin").then(module => ({ default: module.Admin })));
const AddMovie = lazy(() => import("./pages/admin/add-movie").then(module => ({ default: module.AddMovie })));
const MovieList = lazy(() => import("./pages/admin/MovieList").then(module => ({ default: module.default })));
const Users = lazy(() => import("./pages/admin/AllUsersList").then(module => ({ default: module.Users })));
const AddCinema = lazy(() => import("./pages/admin/AddCinema").then(module => ({ default: module.AddCinema })));
const TicketManagement = lazy(() => import("./pages/admin/TicketManagement").then(module => ({ default: module.TicketManagement })));
const MovieCalendar = lazy(() => import("./pages/admin/MovieCalendar").then(module => ({ default: module.default })));
const NotFound = lazy(() => import("./pages/404/NotFound").then(module => ({ default: module.NotFound })));

// Loading component for lazy loaded routes
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

const GOOGLE_CLIENT_ID =
  "709964897187-an6sclll2kfpfm4c3umc3bu4cnv0up4r.apps.googleusercontent.com";

const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<CinemaLayout />}>
                <Route index element={<Home />} />
                <Route path="movie/:id" element={<Movie />} />
                <Route path="movies" element={<Discover />} />
                <Route path="calendar" element={<MovieCalendar />} />
                <Route path="profile/payments" element={<PaymentHistory />} />
                <Route path="cinema/:cinemaId/:id" element={<Booking />} />
                
                {/* Admin routes */}
                <Route path="admin" element={<Admin />}>
                  <Route path="add-cinema" element={<AddCinema />} />
                  <Route path="add-movie" element={<AddMovie />} />
                  <Route path="list" element={<MovieList />} />
                  <Route path="get-users" element={<Users />} />
                  <Route path="tickets" element={<TicketManagement />} />
                </Route>
              </Route>
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
