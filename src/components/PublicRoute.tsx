import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  redirectPath?: string;
}

const PublicRoute = ({ redirectPath = '/dashboard' }: PublicRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  // User is not authenticated, show public page
  return <Outlet />;
};

export default PublicRoute;
