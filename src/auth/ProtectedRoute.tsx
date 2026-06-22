import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FullScreenLoader } from '../components/States';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  // Mientras restauramos la sesión NO redirigimos: evita parpadeo a /login al recargar.
  if (status === 'loading') return <FullScreenLoader label="Restaurando sesión" />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
