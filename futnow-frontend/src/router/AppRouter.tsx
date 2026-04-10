import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import CreateMatchPage from '../pages/CreateMatchPage';
import MatchDetailPage from '../pages/MatchDetailPage';
import ProfilePage from '../pages/ProfilePage';
import MyMatchesPage from '../pages/MyMatchesPage';
import AdminPage from '../pages/AdminPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AppLayout } from '../components/layout/AppLayout';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Global Protected Ecosystem */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-matches" element={<MyMatchesPage />} />
            <Route path="/matches/new" element={<CreateMatchPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            
            {/* Admin Dedicated Ecosystem */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
