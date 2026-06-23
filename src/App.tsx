import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TropelsPage } from './pages/TropelsPage';
import { SignalsPage } from './pages/SignalsPage';
import { SectorsListPage } from './pages/SectorsListPage';
import { SectorStoryPage } from './pages/SectorStoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Todo lo de adentro requiere sesión y vive en el layout compartido */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tropels" element={<TropelsPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/sectors" element={<SectorsListPage />} />
            <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
