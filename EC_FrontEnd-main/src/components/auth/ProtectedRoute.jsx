import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required, allow access
  if (requiredRoles.length === 0) {
    return children;
  }

  // Check if user has any of the required roles
  const userRoles = user?.roles || []; // Make sure to use the correct property name
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    // Redirect to home page or access denied page
    return <Navigate to="/folders" replace />;
  }

  return children;
};

export default ProtectedRoute;