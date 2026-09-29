import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface AuthGuardProps {
  children: ReactNode;
}

/** PersistGate 已保证 rehydrate 完成后再渲染，无需额外延迟 */
const AuthGuard = ({ children }: AuthGuardProps) => {
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!(token && isAuthenticated)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
